import childProcess from 'child_process';

const NextBuilder = function (this: any, config: any = {}): any {
  const { appLocation } = config;

  function exec() {
    return new Promise((resolve: any, reject: any) => {
      const command = `cd ${appLocation} && npx next build`;
      const process: any = childProcess.exec(command);

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
