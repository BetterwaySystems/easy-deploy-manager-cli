export {};

declare global {
  type TBuildType = "next" | "nest";

  interface IBundler {
    exec(): any;
  }

  interface IBuilder {
    exec(): any;
    validator(): any;
  }

  // TODO: init IDefaultDeployServerInfo 타입 인터페이스와 전역 타입으로 관리하기
  interface IServerConfig {
    os: "ubuntu" | "amazonlinux" | "centos" | string;
    host: string;
    port: number | 22;
    username: string;
    password: string;
    deploymentDir: string;
    pemLocation: string;
  }

  interface IPM2Config {
    exec_mode: "fork" | "cluster";
    instance: string;
  }

  interface IEasyDeployConfig {
    appLocation: string;
    buildType: "next" | "nest";
    packageManager: "yarn" | "npm" | "pnpm";
    appName: string;
    nodeVersion: string;
    server: Array<IServerConfig>;
    pm2: IPM2Config;
    env: {
      PORT: 3000;
      TEST: "TEST";
    };
    output?: string;
  }
}
