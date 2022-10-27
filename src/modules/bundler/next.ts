import childProcess from 'child_process';
import appLocationDirectory from '../common/appLocationDirectory';
const BUNDLE_TAR_NAME = 'bundle.tar';

const NextBundler = function (this: any, config: any = {}, options: any) {
  const { appLocation } = config;
  const { writedEcosystemLocationInfo, output } = options;

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

      const commandFromAppLocation: string = `
        cd ${appLocation} && 
        tar cvf ${output}/${BUNDLE_TAR_NAME} ${existBundleTargetFileNames.join(' ')} &&
      `;

      const commandFromExternalLocation: string = `
        cd ${writedEcosystemLocationInfo.pwd} &&
        tar rvf ${output}/${BUNDLE_TAR_NAME} ${writedEcosystemLocationInfo.fileName}
        rm -rf ${writedEcosystemLocationInfo.pwd}/${writedEcosystemLocationInfo.fileName}
      `;

      const command: string = commandFromAppLocation + commandFromExternalLocation;

      const process: any = childProcess.exec(command);

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
