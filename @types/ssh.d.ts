import { Client, SFTPWrapper } from "ssh2";

export {};

declare global {
  interface IPutFileOptions {
    onProgress?: Function;
  }

  interface ISSHConfig {
    host: string;
    port: number | 22;
    username: string;
    password?: string;
    privateKey?: Buffer;
  }

  interface IClient {
    connection: Client;
    sftp: SFTPWrapper;
  }

  interface ISSHExecResult {
    stdout: string;
    stderr: string;
    code?: number;
    // signal: any;
  }

  interface ISSH {
    _client: Array<IClient>;
    _sftp: any;
    exec : (command: string, callback?: Function) => Promise<ISSHExecResult>;
    exists: (path: string) => Promise<boolean[]>;
    mkdir: (path: string) => Promise<void>;
    closeAllConnections: Function;
    putFile: Function;
  }

  interface IUpload {
    path    : string
    dest    : string
    title?  : string
  }
}
