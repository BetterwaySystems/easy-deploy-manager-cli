import { readFileSync } from 'fs';
import { ISSH, SSH } from './upload';
import { IDefaultDeployServerInfo } from '../commands/Init';

interface ISSHConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: Buffer;
}

/*
=====================================================================================

                                  MODULE. BACKUP
                                September 27, 2022

Description : When Deploying, if there are deploy file already in use, a backup folder 
is created and managed.
=====================================================================================
*/
async function backup_ex({ appName }: { appName: string }) {
  console.log('appName', appName);
  const initDeployFile = readFileSync('./easy-deploy.json', 'utf8');
  const initDeployJSON = JSON.parse(initDeployFile);

  /**
   * Set SSH config for connecting remote server https://www.npmjs.com/package/ssh2
   * @param {IDefaultDeployServerInfo} serverInfo - is remote server information
   * @returns sshConfig - consists of host, port, username, password, privateKey
   */
  const setSSHConfig = (serverInfo: IDefaultDeployServerInfo) => {
    const { host, port, username, password, pemLocation } = serverInfo;
    const sshConfig: ISSHConfig = { host, port, username };
    if (password) sshConfig.password = password;
    else sshConfig.privateKey = readFileSync(pemLocation);
    return sshConfig;
  };

  /**
   * Generate backup folder for rollback at any time
   * @param {ISSH} client - is Client instance of ssh2 package
   * @param {IDefaultDeployServerInfo} serverInfo - is remote server information
   */
  const generateBackUpFolder = async (client: ISSH, serverInfo: IDefaultDeployServerInfo) => {
    const { deploymentDir } = serverInfo;
    // check bundle folder already is use & backup folder
    const { stdout: hasBundleFile } = await client.exec(`find ${deploymentDir}/ -name ${appName}.tar`);
    if (hasBundleFile) {
      const { stdout: hasBackUpFolder } = await client.exec(`find ${deploymentDir}/ -name backup -type d`);
      if (!hasBackUpFolder) await client.exec('mkdir backup');
      // move the existing deploy file to the backup folder
      await client.exec(`cp ${deploymentDir}/${appName}/* ${deploymentDir}/backup`);
      await client.exec(`cp -r ${deploymentDir}/${appName}/node_modules ${deploymentDir}/backup`);
      // unzip the folder to be deployed
      await client.exec(`tar -xvf ${appName}.tar ${appName}`);
      // move the node_modules folder to the folder where will be deployed
      await client.exec(`mv ${deploymentDir}/backup/node_modules ${deploymentDir}/${appName}`);
      console.log('Generate backup folder');
    } else {
      console.log('Not exist deploy file!');
    }
  };

  // server multiple instance
  for (const serverInfo of initDeployJSON.server) {
    const sshConfig = setSSHConfig(serverInfo);
    const client: ISSH = await new (SSH as any)(sshConfig);
    await generateBackUpFolder(client, serverInfo);
  }
}
export { backup_ex };
