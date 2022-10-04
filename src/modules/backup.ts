import { ISSH } from './upload';
import { IDefaultDeployServerInfo } from '../commands/Init';

/*
=====================================================================================

                                  MODULE. BACKUP
                                 October 04, 2022

Description : When Deploying, if there are bundle folder already in use, a backup folder 
is created and managed.
=====================================================================================
*/

/**
 * Generate backup folder for rollback at any time
 * @param {ISSH} client - is Client instance of ssh2 package https://www.npmjs.com/package/ssh2
 * @param {string} appName - is name for pm2
 * @param {IDefaultDeployServerInfo} serverInfo - is remote server information
 */
const generateBackUpFolder = async (client: ISSH, appName: string, serverInfo: IDefaultDeployServerInfo) => {
  const { deploymentDir } = serverInfo;
  try {
    // check bundle folder already is use & backup folder
    const { stdout: hasBundleFile } = await client.exec(`find ${deploymentDir}/ -name ${appName}.tar`);
    if (hasBundleFile) {
      const { stdout: hasBackupFolder } = await client.exec(`find ${deploymentDir}/ -name backup -type d`);
      if (!hasBackupFolder) await client.exec('mkdir backup');
      // copy the existing bundle file to the backup folder
      await client.exec(`cp ${deploymentDir}/${appName}/* ${deploymentDir}/backup`);
      await client.exec(`cp -r ${deploymentDir}/${appName}/node_modules ${deploymentDir}/backup`);
      console.log('Check bundle file & Generate backup folder');
    } else {
      console.log('Not exist bundle file');
    }
  } catch (err) {
    console.log(`SSH2 Server Error: ${(err as Error).message}`);
  }
};

/**
 * Use Existing node_modules folder
 * @param {ISSH} client - is Client instance of ssh2 package https://www.npmjs.com/package/ssh2
 * @param {string} appName - is name for pm2
 * @param {IDefaultDeployServerInfo} serverInfo - is remote server information
 */
const useExistingNodeModules = async (client: ISSH, appName: string, serverInfo: IDefaultDeployServerInfo) => {
  const { deploymentDir } = serverInfo;
  try {
    // move the node_modules folder to the folder where will be deployed
    await client.exec(`mv ${deploymentDir}/backup/node_modules ${deploymentDir}/${appName}`);
    console.log('Use exist node_modules folder');
  } catch (err: any) {
    console.log(`SSH2 Server Error: ${(err as Error).message}`);
  }
};

export { generateBackUpFolder, useExistingNodeModules };
