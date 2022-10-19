import { Client, ClientErrorExtensions } from "ssh2";
import { parse } from 'node:path/posix'
import { readFileSync } from "node:fs";
import { getConfig } from "./common/parseJsonFile";

const connectionPool : Partial<Record<string, RemoteServer>> = {};
const BACKUP_FOLDER = 'backup';

function readyEventHandler(conn : Client, resolve : (value : IClient)=> void, reject : (reason? : any)=> void) {
  return (err: Error & ClientErrorExtensions)=>{
    if (err) {
      return reject(err);
    }
  
    conn.sftp((err, sftp) => {
      if (err) {
        return reject(err);
      }
  
      const remoteClient: IClient = {
        connection: conn,
        sftp: sftp,
      };
      
      resolve(remoteClient);
    });
  }
}

function errorEventHandler(reject : (reason? : any) => void) {
  return (err: Error)=>{
    reject(err.message);
  }
}

function getConnection(config: ISSHConfig) {
  
  return new Promise<IClient>((resolve, reject)=>{
    const conn = new Client();
    conn
      .once("ready", readyEventHandler(conn, resolve, reject))
      .once("error", errorEventHandler(reject))
      .connect(config);
  });

}

class RemoteServer {
  _raw;
  name;

  constructor(client : IClient, name: string){
    this._raw = client;
    this.name = name;
  }

  exec(command: string, options?: IExecOptions){
    return new Promise((resolve, reject)=>{
      this._raw.connection.exec(command, function (err, stream) {
        if(err) {
          reject(err);
        } else {
          var context : any = {stdout: "", stderr: ""};
          stream.on('close', function(code : number, signal : any) {
            context.code = code;
            context.signal = signal;
            if (code !== 0) { reject(context.stderr) }
            else resolve(true);
          }).on('data', function(data:any) {
            data = data.toString();
            if (options?.onStdout) options.onStdout(data);
            context.stdout += data;
          }).stderr.on('data', function(data:any) {
            data = data.toString();
            context.stderr += data;
          });
        }
      });
    });
  }

  exists(path: string){
    return new Promise<Boolean>((resolve, reject) => {

      let {dir, base} = parse(path);
  
      this._raw.sftp.readdir(dir, (err:any, list:any) => {
        if (err) {
          if (err.code === 2) {
            resolve(false);
          } else {
            reject(
              new Error(`Error listing ${dir}: code: ${err.code} ${err.message}`)
            );
          }
        } else {
          let [type] = list
            .filter((item:any) => item.filename === base)
            .map((item:any) => item.longname.substr(0, 1));
          if (type) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
  
    });
  }

  async mkdir(path: string, originPath?: string): Promise<Boolean> {

    const haveDir = await this.exists(path);
    if(haveDir) return true;

    let doMkdir = (p:string) => {
      return new Promise<Boolean>((resolve, reject) => {
        this._raw.sftp.mkdir(p, (err) => {
          if (err) {
            reject(new Error(`Failed to create directory ${p}: ${err.message}`));
          }
          resolve(true);
        });
      });
    };

    const { dir } = parse(path);

    const havePreviousDir = await this.exists(dir);
    if (havePreviousDir){
      const result = await doMkdir(path)
      if (originPath) {
        if (path === originPath) return true;
        else return await this.mkdir(originPath);
      };
      return result;
    };
    return await this.mkdir(dir, originPath || path);
  }

  putFile(path:string, dest:string, options?: any){
    
    return new Promise(async (resolve, reject)=>{
      let totalTransfered = 0;
  
      function sendProgressInfo(_tt : any, chunk : any, total : any) {
        totalTransfered += chunk;
        let completedPercentage = (totalTransfered/total) * 100;
        if(options?.onProgress) {
          options.onProgress(completedPercentage, totalTransfered, total);
        }
      }
  
      let fastPutOptions = {
        step: sendProgressInfo
      };
  
      let { dir } = parse(dest)
      await this.mkdir(dir);
      this._raw.sftp.fastPut(path, dest, fastPutOptions, (err)=>{
        if (err) reject(err)
        else resolve(true)
      })
  
    })
  }

  async extractTarBall(path:string, dest?:string){
    const { dir, base } = parse(path)

    let command = `cd ${dir} && tar -xvf ${base}`;

    if (dest){
      await this.mkdir(dest);
      command += ` -C ${dest}`;
    }

    try {
      return await this.exec(command)
    }catch (err){
      throw err
    }
  }

  async installNode() {
    const { nodeVersion } = getConfig()
  
    const exec = async (command: string, callback?: (content: string) => void): Promise<boolean> => {
      try {
        await this.exec(command, { onStdout: callback });
        return true;
      } catch (error) {
        const err = error as ISSHExecError
        if (err.stderr) console.log(`\x1b[31m%s${err.stderr}\x1b[0m`);
        return false;
      }
    };
  
    console.log('check nvm has installed');
    const nvmInstalled = await exec(`nvm -v`);
  
    if (nvmInstalled) {
      console.log('nvm is already installed');
      const hasNodeVersion = await exec(`nvm ls ${nodeVersion}`);

      if (hasNodeVersion) await exec(`nvm use ${nodeVersion}`, console.log);
      else await exec(`nvm install ${nodeVersion}`, console.log);
    } else {
      console.log('nvm is not yet installed, starting nvm installing...');
      const installNVM = `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash && source $HOME/.nvm/nvm.sh && nvm install ${nodeVersion}`;
      await exec(installNVM, console.log);
    }
  }

  close(){
    return new Promise((resolve)=>{
      this._raw.connection.end();
      resolve(void 0); 
    });
  }

  /**
   * Generate backup folder for rollback at any time
   * @param {string} appName - is name for pm2 manage 
   * @param {string} dir - is root path of remote server 
   */
  async backup(appName: string, dir: string) {
    let path = '';
    let command = '';

    try { 
      // Check if you already have a running deploy folder
      path = `${dir}/${appName}`;
      const hasBundle = await this.exists(path);
      if(!hasBundle) return false;

      // After checking if the backup folder exists, create it if it doesn't exist.
      path = `${dir}/${BACKUP_FOLDER}`;
      const hasBackup = await this.exists(path); 
      if(!hasBackup) {
        command = `cd ${dir} && mkdir ${BACKUP_FOLDER}`;
        await this.exec(command);
      }

      // Move the existing deploy folder to the backup folder
      command = `mv ${dir}/${appName}/* ${dir}/${BACKUP_FOLDER}`;
      return await this.exec(command);
    } catch(err) {
      throw err;
    }
  }

  /**
   * Use Existing node_modules folder
   * @param {string} appName - is name for pm2 manage
   * @param {string} dir - is root path of remote server
   */
  async useExistingNodeModules(appName: string, dir: string) {
    const command = `cp -r ${dir}/${BACKUP_FOLDER}/node_modules ${dir}/${appName}`;
    try {
      return await this.exec(command);
    } catch(err) {
      throw err;
    }
  }
}

async function getRemoteServer(config : ISSHConfig){

  const uuid = config.alias || config.host;
  // Single Connection Pool
  if (connectionPool[uuid]) {
    console.log('싱글톤 패턴 객체 돌려줌!')
    return connectionPool[uuid] as RemoteServer;
  }

  try {

    if (config.pemLocation){
      config.privateKey = readFileSync(config.pemLocation);
    }

    const client = await getConnection(config);
    connectionPool[uuid] = new RemoteServer(client, uuid);
    return connectionPool[uuid] as RemoteServer;
  }catch (error){
    throw Error();
  }

}

export default getRemoteServer;
