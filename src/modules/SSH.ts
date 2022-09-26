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

const SSH = function (this: any, configList: Array<ISSHConfig>) {
  if (this._client != null) return this._client;

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

const connection = async ({ module }: { module: boolean }) => {
  const configList: Array<ISSHConfig> = [
    {
      host: "13.125.105.220",
      port: 22,
      username: "ec2-user",
      privateKey: readFileSync(
        "/Users/a220403/Documents/Key/dev-platformteam-server-key.pem",
      ),
    },
  ];

  if (module) {
    const client: ISSH = await new (SSH as any)(configList);

    setTimeout(async () => {
      await client.closeAllConnections();
    }, 3000);
  }
};

export { SSH, connection };
