import fs from "fs";
import path from "path";

const PM2Handler = function (this: any, config: any) {
  this._config = config;
  return;
};

PM2Handler.prototype.generateEcoSystemConfig = function () {
  const pwd = process.env["PWD"] || process.cwd();
  const fileName = "ecosystem.config.js";

  const defaultApplicationStartScriptCommands = {
    next: "npx next start",
    nest: "nest start",
  };

  // TODO: package.json에서 start명령어가 없는 경우 defaultApplicationStartScriptCommands를 참조해서
  let app: any = {
    name: this._config.appName,
    script: `npx ${this._config.packageManger} start`,
    env: this._config.env,
  };

  for (const [key, value] of Object.entries(this._config.pm2)) {
    if (key) {
      app[key] = value;
    }
  }

  const dt = `module.exports = {
    apps:${JSON.stringify([app])}
  }`;

  fs.writeFileSync(path.join(pwd, fileName), dt);

  const ecosystemConfigLocation = path.join(pwd, fileName);
  return ecosystemConfigLocation;
};

export default PM2Handler;
