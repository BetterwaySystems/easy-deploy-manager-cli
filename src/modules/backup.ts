/*
=====================================================================================

                                  MODULE. BACKUP
                                 October 04, 2022

Description : When Deploying, if there are bundle folder already in use, a backup folder 
is created and managed.
=====================================================================================
*/

const BACKUP_FOLDER = 'backup';

/**
 * Generate backup folder for rollback at any time
 * @param {ISSH} remoteServer - is Client instance of ssh2 package https://www.npmjs.com/package/ssh2
 * @param {string} appName - is name for pm2
 * @param {IDefaultDeployServerInfo} serverInfo - is remote server information
 */
const generateBackUpFolder = async (remoteServer: ISSH, appName: string, serverInfo: IDefaultDeployServerInfo) => {
  const { deploymentDir } = serverInfo;
  let command = '';
  try {
    // check bundle folder already is use & backup folder
    command = `find ${deploymentDir}/ -name ${appName}.tar`;
    const hasBundleFile = await remoteServer.exec(command);

    if (hasBundleFile) {
      command = `find ${deploymentDir}/ -name ${BACKUP_FOLDER} -type d`;
      const hasBackupFolder = await remoteServer.exec(command);
      if (!hasBackupFolder) {
        command = `mkdir ${BACKUP_FOLDER}`;
        await remoteServer.exec(command);
      }
      
      // copy the existing bundle file to the backup folder
      const moveFileToBackUpFolder = `cp ${deploymentDir}/${appName}/* ${deploymentDir}/${BACKUP_FOLDER}`;
      const moveFolderToBackupFolder = `cp -r ${deploymentDir}/${appName}/node_modules ${deploymentDir}/${BACKUP_FOLDER}`;
      command = `${moveFileToBackUpFolder} && ${moveFolderToBackupFolder}`;
      await remoteServer.exec(command);
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
 * @param {ISSH} remoteServer - is Client instance of ssh2 package https://www.npmjs.com/package/ssh2
 * @param {string} appName - is name for pm2
 * @param {IDefaultDeployServerInfo} serverInfo - is remote server information
 */
const useExistingNodeModules = async (remoteServer: ISSH, appName: string, serverInfo: IDefaultDeployServerInfo) => {
  const { deploymentDir } = serverInfo;
  try {
    // move the node_modules folder to the folder where will be deployed
    const command = `mv ${deploymentDir}/${BACKUP_FOLDER}/node_modules ${deploymentDir}/${appName}`;
    await remoteServer.exec(command);
    console.log('Use exist node_modules folder');
  } catch (err: any) {
    console.log(`SSH2 Server Error: ${(err as Error).message}`);
  }
};

export { generateBackUpFolder, useExistingNodeModules };