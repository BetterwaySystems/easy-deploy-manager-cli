import childProcess from "child_process";

const NextBuilder = function (this: any, config: any = {}): any {
  const { appLocation, packageManager } = config;

  function exec() {
    const command = `
      cd ${appLocation} && 
      ${packageManager} build
    `;

    childProcess.execSync(command);
  }

  function validator() {
    return {
      existInitFile() {},
    };
  }

  return {
    exec,
    validator,
  };
};

export default NextBuilder;
