import childProcess from "child_process";
import path from "path";
import fs from "fs";

function getAppLocationDirectories(location: any) {
  const files = fs.readdirSync(location, { withFileTypes: true });
  const directoriesInDIrectory = files.map((item: any) => {
    if (item.isDirectory()) {
      return {
        type: "directory",
        name: item.name,
      };
    } else {
      return {
        ext: path.extname(item.name),
        type: "file",
        name: item.name,
      };
    }
  });

  return directoriesInDIrectory;
}

const NextBundler = function (this: any, config: any = {}) {
  const { appLocation, output } = config;

  function exec() {
    const findFiles = getAppLocationDirectories(appLocation);

    const bundleTargetFileNames = [
      ".next",
      "next.config.ts",
      "next.config.js",
      ".env.production",
      ".env",
      "package.json",
      "package-lock.json",
      "yarn-lock.json",
      "pnpm-lock.yaml",
    ];

    let command = "";

    for (const directory of findFiles) {
      if (bundleTargetFileNames.includes(directory.name)) {
        const appendCommand = `cp -r ${appLocation}/${directory.name} ${output}/${directory.name} && `;
        command += appendCommand;
      }
    }

    const makeTar = `
      cd ${output} && cd .. &&
      tar -cvf bundle.tar ed-output`;

    command += makeTar;

    childProcess.execSync(command);
  }

  return {
    exec,
  };
};

export default NextBundler;
