import childProcess from 'child_process';
import CommandBuilder from '../common/commandBuilder';
import fs from 'fs';

const NextBuilder = function (this: any, config: any = {}): any {
  const { appLocation } = config;

  function exec() {
    return new Promise((resolve: any, reject: any) => {
      const appBuild = `cd ${appLocation} && npx next build`;
      const command = new CommandBuilder();
      command.add(appBuild);

      const existPackageLockFile = fs.existsSync(`${appLocation}/package-lock.json`);
      if(!existPackageLockFile) {
        const addLockFile = `cd ${appLocation} && npm install --package-lock-only`;
        command.add(addLockFile);
      }

      const cmd = command.getCommand();

      const process: any = childProcess.exec(cmd);

      process.stdout.on('data', function (data: any) {
        console.log(data);
      });

      process.stderr.on('data', function (data: any) {
        if (data) console.log(data);
      });

      process.on('exit', function (code: any) {
        if (code == 0) {
          resolve(true);
        } else {
          reject('builder command failed');
        }
      });
    });
  }

  return {
    exec,
  };
};

export default NextBuilder;
