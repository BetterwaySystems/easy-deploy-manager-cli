import childProcess from "child_process";

const NextBuilder = function (this: any, config: any = {}): any {
  const { appLocation, packageManager } = config;

  function exec() {
    return new Promise((resolve: any, reject: any) => {
      // 추가 명령어가 붙는 패키지의 경우 관리 리팩토링
      const command = `
        cd ${appLocation} && 
        ${["npm,  pnpm"].includes(packageManager) ? "run build" : "build"}
      `;

      const process: any = childProcess.exec(command);

      process.stdout.on("data", function (data: any) {
        console.log(data);
      });

      process.stderr.on("data", function (data: any) {
        if (data) console.log(data);
      });

      process.on("exit", function (code: any) {
        if (code == 0) {
          resolve(true);
        } else {
          reject("builder command failed");
        }
      });
    });
  }

  return {
    exec,
  };
};

export default NextBuilder;
