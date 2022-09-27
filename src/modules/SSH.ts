import { Client, ClientErrorExtensions, SFTPWrapper } from "ssh2";
import { readFileSync } from "fs";

interface ISSHConfig {
  host: string;
  port: number | 22;
  username: string;
  password?: string;
  privateKey?: Buffer;
}

interface ISSH {
  _client: Array<IClient> | null;
  closeAllConnections: Function;
}

interface IClient {
  connection: Client | null;
  sftp: SFTPWrapper | null;
}

let _connectionPool : undefined | ISSH;

const SSH = function (this: any, configList: Array<ISSHConfig>) {

  if (_connectionPool) return _connectionPool;

  return new Promise<ISSH>((resolve, reject) => {
    this._client = configList.map((config) => {
      const conn = new Client();
      const tmpClient: IClient = {
        connection: null,
        sftp: null,
      };

      conn
        .once("ready", (err: Error & ClientErrorExtensions) => {
          if (err) {
            this._client = null;
            return reject(err);
          }

          conn.sftp((err, sftp) => {
            if (err) {
              this._client = null;
              return reject(err);
            }
            tmpClient.sftp = sftp;
          });

          console.log(`${config.host}:${config.port} is connect`);
        })
        .once("close", () => {
          console.log(`${config.host}:${config.port} is closed`);
        })
        .once("error", (err: Error) => {
          console.log(`${config.host}:${config.port} cannot connected`);
          this._client = null;
          return reject(err);
        })
        .connect(config);

      tmpClient.connection = conn;

      return tmpClient;
    });

    _connectionPool = this;
    resolve(this);
  });
};

SSH.prototype.closeAllConnections = function () {
  return Promise.all(
    this._client.map((c: IClient) => {
      c.connection?.end();
    }),
  );
};

const getRemoteServerConnection = async ({ module }: { module: boolean }) => {
  const initFile = `${process.cwd()}/easy-deploy.json`;
  /**
   * TODO 
   * 
   * 예외처리 추가할것
   * 
   * 1. easy-deploy.json 파일이 없을 경우
   * 2. easy-deploy.json 파일이 있지만 내용이 없을 경우
   * 3. easy-deploy.json 파일이 있지만 내용이 잘못되었을 경우 ( JSON 포멧이 아닌 경우 )
   * 
   */
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

  if (module) {
    const client: ISSH = await new (SSH as any)(sshConfig);

    setTimeout(async () => {
      await client.closeAllConnections();
    }, 3000);
  }
};

export { SSH, getRemoteServerConnection };
