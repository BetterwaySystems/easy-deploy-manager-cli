export {};

declare global {
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
}
