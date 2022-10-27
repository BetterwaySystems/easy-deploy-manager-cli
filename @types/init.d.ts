export {};

declare global {
  type TInkComponentType = 'selectInput' | 'textInput';
  type TOperatingSystem = 'ubuntu' | 'amazonlinux' | 'centos';
  type TPM2ExecMode = 'fork' | 'cluster';

  interface ISelectOption {
    label: string;
    value: string;
  }

  interface IInitSettingForComponent {
    type: TInkComponentType;
    target: string;
    label: string;
    rangeNum: number;
    defaultValue?: string;
    itemList?: Array<ISelectOption>;
  }

  interface IDefaultDeployServerInfo {
    os: TOperatingSystem | string;
    host: string;
    port: number;
    username: string;
    password: string;
    deploymentDir: string;
    pemLocation: string;
    alias: string;
  }

  interface IDefaultDeployPM2Info {
    exec_mode: TPM2ExecMode | string;
    instance: string;
  }

  interface IDefaultInitInfo {
    buildType: TBuildType | string;
    appName: string;
    nodeVersion: string;
    server: IDefaultDeployServerInfo;
    pm2: IDefaultDeployPM2Info;
    env: Record<string, any>;
    output: string;
  }

  interface InitDefaultInputComponentProps {
    initSettingInfo: IInitSettingForComponent;
    defaultInitInfo: IDefaultInitInfo;
    step: number;
    setStep: (step: number) => void;
    setDefaultInitInfo: (defaultInitInfo: IDefaultInitInfo) => void;
  }

  interface IInitKeyInfoForSetValue {
    index: number;
    oneDepth: string | undefined;
    twoDepth: string | undefined;
  }
}
