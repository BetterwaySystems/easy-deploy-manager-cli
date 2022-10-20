import childProcess from "child_process";
import appLocationDirectory from "../common/appLocationDirectory";

const NextBundler = function (this: any, config: any = {}) {
  const { appLocation, output } = config;

  function exec() {
    return new Promise((resolve: any, reject: any) => {
      const findFiles = appLocationDirectory(appLocation);

      const includeBundleTargetFileNames = [
        ".next",
        "next.config.ts",
        "next.config.js",
        "package.json",
        "package-lock.json",
        "yarn-lock.json",
        "pnpm-lock.yaml",
      ];

      let command = "";

      for (const directory of findFiles) {
        if (includeBundleTargetFileNames.includes(directory.name)) {
          const appendCommand = `cp -r ${appLocation}/${directory.name} ${output}/${directory.name} && `;
          command += appendCommand;
        }
      }

      const makeTar = `
      cd ${output} && cd .. &&
      tar -cvf bundle.tar bundle`;

      command += makeTar;

      const process: any = childProcess.exec(command);

      process.stdout.on("data", function (data: any) {
        if (data) console.log(data);
      });

      process.stderr.on("data", function (data: any) {
        if (data) console.log(data);
      });

      process.on("exit", function (code: any) {
        if (code == 0) {
          resolve(true);
        } else {
          reject("bundle command failed");
        }
      });
    });
  }

  return {
    exec,
  };
};

export default NextBundler;
