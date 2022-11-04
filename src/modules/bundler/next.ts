import childProcess from 'child_process';
import appLocationDirectory from '../common/appLocationDirectory';
import CommandBuilder from '../common/commandBuilder';
const BUNDLE_TAR_NAME = 'bundle.tar';

const NextBundler = function (this: any, config: any = {}, bundleOptions: any) {
  const { appLocation } = config;
  const { writedEcosystemLocationInfo, output } = bundleOptions;

  function exec() {
    return new Promise((resolve: any, reject: any) => {
      const bundleTargetFileNamesFromAppLocation = [
        '.next',
        'next.config.ts',
        'next.config.js',
        'package.json',
        'package-lock.json',
      ];

      let existBundleTargetFileNames = [];

      const appLocationDirectories = appLocationDirectory(appLocation);

      for (const appDirectory of appLocationDirectories) {
        bundleTargetFileNamesFromAppLocation.includes(appDirectory.name) &&
          existBundleTargetFileNames.push(appDirectory.name);
      }

      const changeDirAppLocation = `cd ${appLocation}`;
      const appBundle = `tar cvf ${output}/${BUNDLE_TAR_NAME} ${existBundleTargetFileNames.join(' ')}`;
      const changeDirEcosystemFile = `cd ${writedEcosystemLocationInfo.pwd}`;
      const includeEcosystemConfig = `tar rvf ${output}/${BUNDLE_TAR_NAME} ${writedEcosystemLocationInfo.fileName}`;
      const removeEcosystemConfigFile = `rm -rf ${writedEcosystemLocationInfo.pwd}/${writedEcosystemLocationInfo.fileName}`;

      const command = new CommandBuilder();
      command
        .add(changeDirAppLocation)
        .add(appBundle)
        .add(changeDirEcosystemFile)
        .add(includeEcosystemConfig)
        .add(removeEcosystemConfigFile);

      const cmd = command.getCommand();

      const process: any = childProcess.exec(cmd);

      process.stdout.on('data', function (data: any) {
        if (data) console.log(data);
      });

      process.stderr.on('data', function (data: any) {
        if (data) console.log(data);
      });

      process.on('exit', function (code: any) {
        if (code == 0) {
          resolve(true);
        } else {
          reject('bundle command failed');
        }
      });
    });
  }

  return {
    exec,
  };
};

export default NextBundler;
