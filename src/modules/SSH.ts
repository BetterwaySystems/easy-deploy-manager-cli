import { Client, ClientErrorExtensions, SFTPWrapper } from "ssh2";
import { readFileSync } from "fs";
import { parse } from 'node:path/posix'

interface ISSHConfig {
  host: string;
  port: number | 22;
  username: string;
  password?: string;
  privateKey?: Buffer;
}

interface ISSH {
  _client: Array<IClient>;
  closeAllConnections: Function;
  exec : (command: string) => Promise<[{stdout : string, stderr: string}]>;
  exists: (path: string) => Promise<boolean[]>;
  mkdir: (path: string) => Promise<void>;
}

interface IClient {
  connection: Client;
  sftp: SFTPWrapper;
}

let connectinPool: ISSH | null = null;

const SSH = function (this: ISSH, configList: Array<ISSHConfig>) {
  return new Promise<ISSH>(async (res) => {

    // Single Connection Pool
    if (connectinPool) {
      return res(connectinPool);
    };

    this._client = await Promise.all(configList.map((config) => {
      return new Promise<IClient>((resolve, reject)=>{
        const conn = new Client();

        conn
          .once("ready", (err: Error & ClientErrorExtensions) => {
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
              
              console.log(`${config.host}:${config.port} is connect`);
              resolve(remoteClient);
            });

          })
          .once("close", () => {
            console.log(`${config.host}:${config.port} is closed`);
          })
          .once("error", (err: Error) => {
            console.log(`${config.host}:${config.port} cannot connected`);
            return reject(err);
          })
          .connect(config);

      });
    }));

    connectinPool = this;
    res(this);
  });
};

// Remote Server Execute Command
SSH.prototype.exec = function(this: ISSH, command: string){

  return Promise.all(this._client.map((server)=>{
    return new Promise((resolve, reject)=>{
      server.connection?.exec(command, function (err, stream) {
        if(err) {
          reject(err);
        } else {
          var context : any = {stdout: "", stderr: ""};
          stream.on('close', function(code : string, signal : any) {
            context.code = code;
            context.signal = signal;
            resolve(context);
          }).on('data', function(data:any) {
            data = data.toString();
            context.stdout += data;
          }).stderr.on('data', function(data:any) {
            data = data.toString();
            context.stderr += data;
          });
        }
      });
    });
  }));
}

SSH.prototype.exists = function(this: ISSH, path: string) {

  let {dir, base} = parse(path);

  return Promise.all(this._client.map((server)=>{
    return new Promise((resolve, reject)=>{
      server.sftp?.readdir(path, (err:any, list) => {
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
            resolve(type);
          } else {
            resolve(true);
          }
        }
      });
    });
  }));
};

SSH.prototype.mkdir = function(this: ISSH, path: string){

  const self = this;

  return new Promise(async (resolve)=>{
    const result = await this.exists(path);
    const isEmpty = !result.every((item)=> item);
    
    if (isEmpty){
      const result = await Promise.all(this._client.map((server)=>{
        return new Promise((resolve, reject)=>{
          server.sftp?.mkdir(path, (err:any)=>{
            if (err) {
              reject(err);
            } else {
              resolve(true);
            }
          });
        });
      }));

      resolve(result);
    }
    
  });
}

SSH.prototype.closeAllConnections = function () {
  return Promise.all(
    this._client.map((c: IClient) => {
      c.connection?.end();
    }),
  );
};

const connection = async ({ module }: { module: boolean }) => {
  const initFile = `${process.cwd()}/easy-deploy.json`;
  const config: any = JSON.parse(readFileSync(initFile, "utf-8"));

  const sshConfig: Array<ISSHConfig> = config.server.map((s: any) => {
    return {
      host: s.host,
      port: s.port,
      username: s.username,
      password: s.password,
      privateKey: readFileSync(s.pemLocation),
    };
  });

  const client: ISSH = await new (SSH as any)(sshConfig);

  if (module) {
    setTimeout(async () => {
      await client.closeAllConnections();
    }, 3000);
  }

  return client;
};

export { SSH, connection };
export { ISSH }
