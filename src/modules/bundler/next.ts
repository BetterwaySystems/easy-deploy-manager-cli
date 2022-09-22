import childProcess from "child_process";
import path from "path";
import fs from "fs";

function ReadLocationDirectories(location: any) {
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
    const findDirectory = ReadLocationDirectories(appLocation);

    let command = `
      cp -r ${appLocation}/.next ${output}/.next &&
      cp -r ${appLocation}/package.json ${output}/package.json &&
    `;

    /**
     * 공통 함수로 리팩토링 **********************************************************************
     */
    const nextConfig = findDirectory.find((file: any) => {
      return ["next.config.ts", "next.config.js"].includes(file.name);
    });
    if (nextConfig) {
      command += `cp -r ${appLocation}/${nextConfig.name} ${output}/${nextConfig.name} &&`;
    }

    const productionEnv = findDirectory.find((file: any) => {
      return [".env.production"].includes(file.name);
    });
    if (productionEnv) {
      command += `cp -r ${appLocation}/${productionEnv.name} ${output}/${productionEnv.name} &&`;
    }

    const commonEnv = findDirectory.find((file: any) => {
      return [".env"].includes(file.name);
    });
    if (commonEnv) {
      command += `cp -r ${appLocation}/${commonEnv.name} ${output}/${commonEnv.name} &&`;
    }

    if (config.packageManager === "npm") {
      const packageLock = findDirectory.find((file: any) => {
        return ["package-lock.json"].includes(file.name);
      });
      if (packageLock) {
        command += `cp -r ${appLocation}/${packageLock.name} ${output}/${packageLock.name} &&`;
      }
    }

    if (config.packageManager === "yarn") {
      const yarnLock = findDirectory.find((file: any) => {
        return ["yarn-lock.json"].includes(file.name);
      });
      if (yarnLock) {
        command += `cp -r ${appLocation}/${yarnLock.name} ${output}/${yarnLock.name} &&`;
      }
    }

    if (config.packageManager === "pnpm") {
      const pnpmLock = findDirectory.find((file: any) => {
        return ["pnpm-lock.yaml"].includes(file.name);
      });
      if (pnpmLock) {
        command += `cp -r ${appLocation}/${pnpmLock.name} ${output}/${pnpmLock.name} &&`;
      }
    }

    /****************************************************************************************/

    const makeTar = `
      cd ${output} && cd .. &&
      tar -cvf ed-output.tar ed-output`;
    command += makeTar;

    childProcess.execSync(command);
  }

  return {
    exec,
  };
};

export default NextBundler;
