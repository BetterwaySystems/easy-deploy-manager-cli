import { Client, SFTPWrapper } from "ssh2";

export {};

declare global {
  interface IPutFileOptions {
    onProgress?: Function;
  }

  interface ISSHConfig {
    alias? : string;
    host: string;
    port?: number | 22;
    username: string;
    password?: string;
    privateKey?: Buffer;
    pemLocation?: string;
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

  interface ISSHExecError {
    code: number;
    stderr: string;
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

  interface IExecOptions {
    onStdout?: (content : string)=> void;
  }

  interface IPutFileOptions {
    onProgress? : (completedPercentage : number, transfered : number, totalTransferSize : number)=> void
  }

  interface IRevertAppOptions {
    disableLog? : boolean
    onStep? : (message : string)=> void
  }
}
