import fs from "fs";
import path from "path";

interface IEcoSystemAppConfig {
  // General
  name?: string;
  script?: string;
  cwd?: string;
  args?: string;
  interpreter?: string;
  interpreter_args?: string;
  node_agrs?: string;
  // Advanced features
  instances?: number;
  exec_mode?: string;
  watch?: boolean | [];
  ignore_watch?: [];
  max_memory_restart?: string;
  env?: Record<string, any>;
  env_?: Record<string, any>;
  source_map_support?: boolean;
  instance_var?: string;
  filter_env?: string[];
  // Log Files
  log_date_format?: string;
  error_file?: string;
  out_file?: string;
  log_file?: string;
  combine_logs?: boolean;
  merge_logs?: boolean;
  time?: boolean;
  pid_file?: string;
  // Control flow
  min_uptime?: number;
  listen_timeout?: number;
  kill_timeout?: number;
  shotdown_with_message?: boolean;
  wait_ready?: boolean;
  max_restarts?: number;
  restart_delay?: number;
  autorestart?: boolean;
  cron_restart?: string;
  vizion?: boolean;
  post_update?: [];
  force?: boolean;
}

interface IEcoSystemConfig {
  apps: Array<IEcoSystemAppConfig>;
}

const PM2Handler = function (this: any, config: any) {
  this._config = config;
};

function getEnvironmentData() {}

PM2Handler.prototype.generateEcoSystemConfig = function () {
  // const that = JSON.parse(this);
  console.log("generateEcoSystemConfig CONFIG>>> ", this._config);
  // console.log("getIntegrationEnv >>>>>", this);
  const pwd = process.env["PWD"] || process.cwd();
  const fileName = "ecosystem.config.js";

  let apps: any = [{}];

  apps[0].name = this._config.appName;
  apps[0].script = "npx next start";
  apps[0].instance = this._config.pm2?.instance;
  apps[0].exec_mode = this._config.pm2?.exec_mode;

  const env = getEnvironmentData();
  apps[0].env = this._config.env;

  const dt = `module.exports = {
    apps:${JSON.stringify(apps)}
  }`;

  fs.writeFileSync(path.join(pwd, fileName), dt);
};

export default PM2Handler;
