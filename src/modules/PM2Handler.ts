import fs from 'fs';
import path from 'path';

const PM2Handler = function (this: any, config: any) {
  this._config = config;
  return;
};

PM2Handler.prototype.generateEcoSystemConfig = function () {
  const pwd = process.env['PWD'] || process.cwd();
  const fileName = 'ecosystem.config.js';

  let app: any = {
    name: this._config.appName,
    script: `npx ${this._config.buildType} start`,
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

  const ecosystemFileInfo = {
    pwd,
    fileName,
  };

  return ecosystemFileInfo;
};

export default PM2Handler;
