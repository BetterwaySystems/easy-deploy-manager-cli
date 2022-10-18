import fs from "fs";
import path from "path";

interface IEcoSystemAppConfig {
  // General
  name: string;
  script: string;
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
    script: "npx next start",
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
};

export default PM2Handler;
