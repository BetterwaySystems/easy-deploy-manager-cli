import React, { useState } from 'react';
import { Text, Box, Newline } from 'ink';
import Markdown from 'ink-markdown';
import dedent from 'dedent';
import fs from 'fs';
import { InitDescription, InitSelectInput, InitTextInput } from '../components';

interface ISelectOption {
  label: string;
  value: string;
}
interface IInitSettingForComponent {
  type: 'selectInput' | 'textInput';
  target: string;
  label: string;
  rangeNum: number;
  defaultValue?: string;
  itemList?: Array<ISelectOption>;
}
interface IDefaultDeployServerInfo {
  host: string;
  port: string;
  username: string;
  password: string;
  deploymentDir: string;
  nodeVersion: string;
  pemLocation: string;
}
interface IDefaultDeployPM2Info {
  appName: string;
  // script: string;
  // exec_mode: string;
  // instance: string;
}
interface IDefaultInitInfo {
  buildType: 'next' | 'nest' | string;
  packageManager: 'npm' | 'yarn' | 'pnmp' | string;
  appLocation: string;
  nodeVersion: string;
  server: IDefaultDeployServerInfo;
  pm2: IDefaultDeployPM2Info;
  env: Record<string, any>;
}

const frameworkList = [
  {
    label: 'next',
    value: 'next',
  },
  {
    label: 'nest',
    value: 'nest',
  },
];
const packageManagerList = [
  {
    label: 'npm',
    value: 'npm',
  },
  {
    label: 'yarn',
    value: 'yarn',
  },
  {
    label: 'pnpm',
    value: 'pnpm',
  },
];

const initInfoList: Array<IInitSettingForComponent> = [
  {
    type: 'selectInput',
    target: 'buildType',
    label: 'buildType',
    rangeNum: -1,
    itemList: frameworkList,
  },
  {
    type: 'selectInput',
    target: 'packageManager',
    label: 'packageManager',
    rangeNum: 0,
    itemList: packageManagerList,
  },
  {
    type: 'textInput',
    target: 'appLocation',
    label: 'appLocation',
    rangeNum: 1,
  },
  {
    type: 'textInput',
    target: 'nodeVersion',
    label: 'nodeVersion',
    rangeNum: 2,
  },
  {
    type: 'textInput',
    target: 'server.host',
    label: '(server) host',
    rangeNum: 3,
  },
  {
    type: 'textInput',
    target: 'server.port',
    label: '(server) port',
    rangeNum: 4,
  },
  {
    type: 'textInput',
    target: 'server.username',
    label: '(server) username',
    defaultValue: 'ec2-user',
    rangeNum: 5,
  },
  {
    type: 'textInput',
    target: 'server.password',
    label: '(server) password',
    rangeNum: 6,
  },
  {
    type: 'textInput',
    target: 'server.deploymentDir',
    label: '(server) deploymentDir',
    defaultValue: '/home/ec2-user',
    rangeNum: 7,
  },
  {
    type: 'textInput',
    target: 'server.nodeVersion',
    label: '(server) nodeVersion',
    rangeNum: 8,
  },
  {
    type: 'textInput',
    target: 'server.pemLocation',
    label: '(server) pemLocation',
    rangeNum: 9,
  },
  {
    type: 'textInput',
    target: 'pm2.appName',
    label: '(pm2) appName',
    rangeNum: 10,
  },
];

const Init = () => {
  const [step, setStep] = useState<number>(0);
  const [defaultInitInfo, setDefaultInitInfo] = useState<IDefaultInitInfo>({
    buildType: '',
    packageManager: '',
    appLocation: '',
    nodeVersion: '',
    server: {
      host: '',
      port: '',
      username: 'ec2-user',
      password: '',
      deploymentDir: '/home/ec2-user',
      nodeVersion: '',
      pemLocation: '',
    },
    pm2: {
      appName: '',
    },
    env: {},
  });

  if (step > initInfoList.length - 1) {
    const initializeFileInfo = {
      ...defaultInitInfo,
      server: [
        {
          ...defaultInitInfo.server,
          port: Number(defaultInitInfo.server.port),
        },
      ],
    };

    // easy-deploy.json 파일 생성
    fs.writeFileSync('easy-deploy.json', JSON.stringify(initializeFileInfo));
  }

  const checkFinalJson = dedent`
    {
      "buildType": "${defaultInitInfo.buildType}",
      "packageManager": "${defaultInitInfo.packageManager}",
      "appLocation": "${defaultInitInfo.appLocation}",
      "nodeVersion": "${defaultInitInfo.nodeVersion}",
      "server": [
        {
          "host": "${defaultInitInfo.server.host}",
          "port": ${defaultInitInfo.server.port},
          "username": "${defaultInitInfo.server.username}",
          "password": "${defaultInitInfo.server.password}",
          "deploymentDir": "${defaultInitInfo.server.deploymentDir}",
          "nodeVersion": "${defaultInitInfo.server.nodeVersion}",
          "pemLocation": "${defaultInitInfo.server.pemLocation}"
        }
      ],
      "pm2": {
        "appName": "${defaultInitInfo.pm2.appName}"
      },
      "env": {}
    }
  `;

  return (
    <Box flexDirection="column">
      <InitDescription />
      <Box flexDirection="column">
        {initInfoList.map((initInfo: IInitSettingForComponent) =>
          initInfo.type === 'selectInput' ? (
            <InitSelectInput
              key={initInfo.target}
              target={initInfo.target}
              label={initInfo.label}
              rangeNum={initInfo.rangeNum}
              itemList={initInfo.itemList}
              step={step}
              defaultInitInfo={defaultInitInfo}
              setStep={setStep}
              setDefaultInitInfo={setDefaultInitInfo}
            />
          ) : (
            <InitTextInput
              key={initInfo.target}
              target={initInfo.target}
              label={initInfo.label}
              rangeNum={initInfo.rangeNum}
              defaultValue={initInfo.defaultValue}
              step={step}
              defaultInitInfo={defaultInitInfo}
              setStep={setStep}
              setDefaultInitInfo={setDefaultInitInfo}
            />
          )
        )}
        <Newline />
        {step > initInfoList.length - 1 ? (
          <Box flexDirection="column">
            <Markdown>{checkFinalJson}</Markdown>
            <Newline />
            <Text>
              ✨ About to write to{' '}
              <Text color="#f2cd7c" bold>
                easy-deploy.json
              </Text>
            </Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default Init;
export { ISelectOption, IDefaultInitInfo };
