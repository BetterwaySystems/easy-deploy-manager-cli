import { Client, ClientErrorExtensions } from "ssh2";
import { parse } from 'node:path/posix'
import { readFileSync } from "node:fs";
import log from "./Log";
import Log from "./Log";

const connectionPool : Partial<Record<string, RemoteServer>> = {};
const PM2_VERSION: string = '5.2.0';
const COMMAND_NOT_FOUND_CODE = 127;
const BACKUP_FOLDER = 'backup';
const BUNDLE_FOLDER = 'bundle'

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
            if (code !== 0) { reject({ code, stderr: context.stderr }) }
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

  async installPM2() {
    let pm2Version, nodeVersion, uninstalledPM2;

    try {
      await this.exec('pm2 --version', { onStdout: (content: string) => {
        pm2Version = content;
      }});
    } catch(err) {
      const error = err as {code: number, stderr: string}
      if (error.code === COMMAND_NOT_FOUND_CODE) uninstalledPM2 = true;
      else throw err;
    }

    const differentVersion = !uninstalledPM2 && pm2Version !== PM2_VERSION;

    if (uninstalledPM2 || differentVersion) {
      try {
        await this.exec('node --version', { onStdout: (content: string) => {
          if (content !== '\n') nodeVersion = content;
        }});
      } catch(err) {
        throw err;
      }

      const installCommand = `npm install -g pm2@${PM2_VERSION} && sudo ln -s -f ~/.nvm/versions/node/${nodeVersion}/bin/pm2 /usr/local/bin`;
      try {
        return await this.exec(installCommand);
      } catch(err) {
        throw err;
      }
    }

    return true;
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

  async revertApp(appName: string, dir: string, options?: IRevertAppOptions) {

    let log = new Log(appName);

    let logger = (type : 'info' | 'warn' | 'error', msg:string )=>{
      if (options?.disableLog !== true ) log[type](msg)
      
      if (options?.onStep?.constructor === Function) {
        options.onStep(msg);
      }
    }

    try {
      
      const appDir = `${dir}/${appName}`;
      const bundleDir = `${appDir}/${BUNDLE_FOLDER}`;
      const backupDir = `${appDir}/${BACKUP_FOLDER}`;
      const backupEcosystemPath = `${backupDir}/ecosystem.config.js`;
      const revertTempDir = `${appDir}/temp`;
      
      // Check application directory
      logger('info', `Check application`)
      await this.exists(appDir);

      // Check backup directory
      logger('info', `Check backup`)
      await this.exists(backupDir);

      // Check backup pm2 ecosystem file
      logger('info', `Check previous ecosystem`)
      await this.exists(backupEcosystemPath);

      // Move current application to temp folder
      logger('info', `Move current application to temp`);
      let command1 = `mv ${bundleDir} ${revertTempDir}`;
      await this.exec(command1);

      // Move backup to bundle folder
      logger('info', `Copy backup to current application`)
      let command2 = `cp -r ${backupDir} ${bundleDir}`;
      await this.exec(command2);

      // Move node_modules from temp to bundle folder
      let command3 = `mv ${revertTempDir}/node_modules ${bundleDir}`;
      await this.exec(command3);

      // npm install 
      logger('info', `Packages install`);
      let command4 = `cd ${bundleDir} && npm install`;
      await this.exec(command4, { onStdout : (stdout)=>{
        if (options?.disableLog !== true) console.log(`[ NPM ] : ${stdout.trim()}`);
      }});

      // Start previous application
      logger('info', `Start previous application`);
      let command5 = `cd ${bundleDir} && pm2 start ecosystem.config.js`;
      await this.exec(command5);

      // Remove temp folder
      logger('info', `Clear temp`);
      let command6 = `rm -rf ${revertTempDir}`;
      await this.exec(command6);

      logger('info', `Revert Application Done!`);
      return true;

    } catch (err){
      console.log('[][][][][[]][][][ 에러낫스마아어ㅓ')
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
