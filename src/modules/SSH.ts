import { Client, ClientErrorExtensions } from 'ssh2';
import { parse } from 'node:path/posix';
import { readFileSync } from 'node:fs';
import { getConfig } from './common/parseJsonFile';
import Log from './Log';

const connectionPool: Partial<Record<string, RemoteServer>> = {};
const PM2_VERSION: string = '5.2.0';
const COMMAND_NOT_FOUND_CODE = 127;
const BACKUP_FOLDER = 'backup';
const BUNDLE_FOLDER = 'bundle';

function readyEventHandler(
  conn: Client,
  resolve: (value: IClient) => void,
  reject: (reason?: any) => void
) {
  return (err: Error & ClientErrorExtensions) => {
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
  };
}

function errorEventHandler(reject: (reason?: any) => void) {
  return (err: Error) => {
    reject(err.message);
  };
}

function getConnection(config: ISSHConfig) {
  return new Promise<IClient>((resolve, reject) => {
    const conn = new Client();
    conn
      .once('ready', readyEventHandler(conn, resolve, reject))
      .once('error', errorEventHandler(reject))
      .connect(config);
  });
}

class RemoteServer {
  _raw;
  name;

  constructor(client: IClient, name: string) {
    this._raw = client;
    this.name = name;
  }

  exec(command: string, options?: IExecOptions) {
    return new Promise((resolve, reject) => {
      this._raw.connection.exec(command, function (err, stream) {
        if (err) {
          reject(err);
        } else {
          var context: any = { stdout: '', stderr: '' };
          stream
            .on('close', function (code: number, signal: any) {
              context.code = code;
              context.signal = signal;
              if (code !== 0) {
                reject({ code, stderr: context.stderr });
              } else resolve(true);
            })
            .on('data', function (data: any) {
              data = data.toString();
              if (options?.onStdout) options.onStdout(data);
              context.stdout += data;
            })
            .stderr.on('data', function (data: any) {
              data = data.toString();
              context.stderr += data;
            });
        }
      });
    });
  }

  exists(path: string) {
    return new Promise<Boolean>((resolve, reject) => {
      let { dir, base } = parse(path);

      this._raw.sftp.readdir(dir, (err: any, list: any) => {
        if (err) {
          if (err.code === 2) {
            resolve(false);
          } else {
            reject(new Error(`Error listing ${dir}: code: ${err.code} ${err.message}`));
          }
        } else {
          let [type] = list
            .filter((item: any) => item.filename === base)
            .map((item: any) => item.longname.substr(0, 1));
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
    if (haveDir) return true;

    let doMkdir = (p: string) => {
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
    if (havePreviousDir) {
      const result = await doMkdir(path);
      if (originPath) {
        if (path === originPath) return true;
        else return await this.mkdir(originPath);
      }
      return result;
    }
    return await this.mkdir(dir, originPath || path);
  }

  putFile(path: string, dest: string, options?: any) {
    return new Promise(async (resolve, reject) => {
      let totalTransfered = 0;

      function sendProgressInfo(_tt: any, chunk: any, total: any) {
        totalTransfered += chunk;
        let completedPercentage = (totalTransfered / total) * 100;
        if (options?.onProgress) {
          options.onProgress(completedPercentage, totalTransfered, total);
        }
      }

      let fastPutOptions = {
        step: sendProgressInfo,
      };

      let { dir } = parse(dest);
      await this.mkdir(dir);
      this._raw.sftp.fastPut(path, dest, fastPutOptions, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  async extractTarBall(path: string, dest?: string) {
    const { dir, base } = parse(path);

    let command = `cd ${dir} && tar -xvf ${base}`;

    if (dest) {
      await this.mkdir(dest);
      command += ` -C ${dest}`;
    }

    try {
      return await this.exec(command);
    } catch (err) {
      throw err;
    }
  }

  async installNode() {
    const { nodeVersion } = getConfig();

    const exec = async (
      command: string,
      callback?: (content: string) => void
    ): Promise<boolean> => {
      try {
        await this.exec(command, { onStdout: callback });
        return true;
      } catch (error) {
        const err = error as ISSHExecError;
        if (err.stderr) console.log(`\x1b[31m%s${err.stderr}\x1b[0m`);
        return false;
      }
    };

    let isSuccess = false;
    const setDefaultNodeVersion = `nvm alias default ${nodeVersion}`;

    console.log('check nvm has installed');
    const nvmInstalled = await exec(`nvm -v`);

    if (nvmInstalled) {
      console.log('nvm is already installed');
      isSuccess = await exec(`nvm install ${nodeVersion}`, console.log);
    } else {
      console.log('nvm is not yet installed, starting nvm installing...');
      const installNVM = `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash && source $HOME/.nvm/nvm.sh && nvm install ${nodeVersion}`;
      isSuccess = await exec(installNVM, console.log);
    }
    if (isSuccess) await exec(setDefaultNodeVersion);
  }

  async installPM2() {
    let pm2Version,
      nodeVersion,
      uninstalledPM2 = false;

    try {
      await this.exec('pm2 --version', {
        onStdout: (content: string) => {
          pm2Version = content.trim();
        },
      });
    } catch (err) {
      const error = err as ISSHExecError;
      if (error.code === COMMAND_NOT_FOUND_CODE) uninstalledPM2 = true;
      else throw err;
    }

    const differentVersion = !uninstalledPM2 && pm2Version !== PM2_VERSION;

    if (uninstalledPM2 || differentVersion) {
      try {
        await this.exec('node --version', {
          onStdout: (content: string) => {
            if (content !== '\n') nodeVersion = content;
          },
        });
      } catch (err) {
        throw err;
      }

      const installCommand = `npm install -g pm2@${PM2_VERSION} && sudo ln -s -f ~/.nvm/versions/node/${nodeVersion}/bin/pm2 /usr/local/bin`;
      try {
        return await this.exec(installCommand);
      } catch (err) {
        throw err;
      }
    }

    return true;
  }

  async stopApp(appName: string, dir: string) {
    try {
      const appDir = `${dir}/${appName}`;
      await this.exists(appDir);

      const command = `pm2 stop ${appName}`;
      await this.exec(command);

      return true;
    } catch (err) {
      throw err;
    }
  }

  close() {
    return new Promise((resolve) => {
      this._raw.connection.end();
      resolve(void 0);
    });
  }

  /**
   * Generate temporary backup folder
   * @param {string} appName - is name for pm2 manage
   * @param {string} dir - is root path of remote server
   */
  async moveTempBackup(appName: string, dir: string) {
    let path = '';
    let command = '';

    try {
      // Check if you already have a running deploy folder
      path = `${dir}/${appName}`;
      const hasBundle = await this.exists(path);
      if (!hasBundle) return false;

      // Move the backup file to a temporary folder
      command = `mkdir ${dir}/tempBackup && mv ${dir}/${appName}/bundle/* ${dir}/tempBackup`;
      return await this.exec(command);
    } catch (err) {
      throw err;
    }
  }

  /**
   * backup for revert at any time
   * @param {string} appName - is name for pm2 manage
   * @param {string} dir - is root path of remote server
   */
  async backup(appName: string, dir: string) {
    let path = '';
    let command = '';

    try {
      // Check if there is a backup folder in the application
      path = `${dir}/${appName}/${BACKUP_FOLDER}`;
      const hasBackup = await this.exists(path);
      if (hasBackup) {
        command = `cd ${dir}/${appName} && rm -rf ${BACKUP_FOLDER}`;
        await this.exec(command);
      }

      // Move from temporary folder to backup folder in application
      command = `mkdir ${dir}/${appName}/${BACKUP_FOLDER} && mv ${dir}/tempBackup/* ${dir}/${appName}/${BACKUP_FOLDER}`;
      await this.exec(command);

      // Move node_modules
      command = `mv ${dir}/${appName}/${BACKUP_FOLDER}/node_modules ${dir}/${appName}/bundle`;
      await this.exec(command);

      // Delete temporary backup folder
      command = `rm -rf ${dir}/tempBackup`;
      await this.exec(command);
    } catch (err) {
      throw err;
    }
  }

  async startApp(appName: string, dir: string, options?: IStartAppOptions) {
    const appDir = `${dir}/${appName}/bundle`;
    let command = `cd ${appDir} && `;
    command += options?.refreshConfig 
              ? `pm2 stop ${appName} && pm2 delete ${appName} && pm2 start ecosystem.config.js`
              : `pm2 start ecosystem.config.js` ;

    try {
      await this.exists(appDir);
      await this.exec(command, {onStdout: (c) => console.log(c)});

      return true;
    } catch (err) {
      throw err;
    }
  }

  async revertApp(appName: string, dir: string, options?: IRevertAppOptions) {
    let log = new Log(appName);

    let logger = (type: 'info' | 'warn' | 'error', msg: string) => {
      if (options?.disableLog !== true) log[type](msg);

      if (options?.onStep?.constructor === Function) {
        options.onStep(msg);
      }
    };

    try {
      const appDir = `${dir}/${appName}`;
      const bundleDir = `${appDir}/${BUNDLE_FOLDER}`;
      const backupDir = `${appDir}/${BACKUP_FOLDER}`;
      const backupEcosystemPath = `${backupDir}/ecosystem.config.js`;
      const revertTempDir = `${appDir}/temp`;

      // Check application directory
      logger('info', `Check application`);
      await this.exists(appDir);

      // Check backup directory
      logger('info', `Check backup`);
      await this.exists(backupDir);

      // Check backup pm2 ecosystem file
      logger('info', `Check previous ecosystem`);
      await this.exists(backupEcosystemPath);

      // Move current application to temp folder
      logger('info', `Move current application to temp`);
      let command1 = `mv ${bundleDir} ${revertTempDir}`;
      await this.exec(command1);

      // Move backup to bundle folder
      logger('info', `Copy backup to current application`);
      let command2 = `cp -r ${backupDir} ${bundleDir}`;
      await this.exec(command2);

      // Move node_modules from temp to bundle folder
      let command3 = `mv ${revertTempDir}/node_modules ${bundleDir}`;
      await this.exec(command3);

      // npm install
      logger('info', `Packages install`);
      let command4 = `cd ${bundleDir} && npm install`;
      await this.exec(command4, {
        onStdout: (stdout) => {
          if (options?.disableLog !== true) console.log(`[ NPM ] : ${stdout.trim()}`);
        },
      });

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
    } catch (err) {
      console.log('[][][][][[]][][][ 에러낫스마아어ㅓ');
      throw err;
    }
  }

  async getLog(appName: string): Promise<{stdout: string, stderr: string}> {
    return new Promise((resolve, reject) => {
      this._raw.connection.exec(`pm2 log ${appName} --nostream`, {pty: true}, (err, stream) => {
        if (err) reject(err);
        else {
          let context = {stdout: "", stderr: ""}
          stream.setEncoding('utf8');
          stream.on('data' , (data: any) => {
            context.stdout += data;
          }).stderr.on('data', (data: any) => {
            context.stderr += data;
          }).on('end', () => {
            resolve(context);
          })
        }
      })
    });
  }
}

async function getRemoteServer(config: ISSHConfig) {
  const uuid = config.alias || config.host;
  // Single Connection Pool
  if (connectionPool[uuid]) {
    console.log('싱글톤 패턴 객체 돌려줌!');
    return connectionPool[uuid] as RemoteServer;
  }

  try {
    if (config.pemLocation) {
      config.privateKey = readFileSync(config.pemLocation);
    }

    const client = await getConnection(config);
    connectionPool[uuid] = new RemoteServer(client, uuid);
    return connectionPool[uuid] as RemoteServer;
  } catch (error) {
    throw Error();
  }
}

export default getRemoteServer;
