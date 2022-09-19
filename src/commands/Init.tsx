import React, { useState } from 'react';
import { Text, Box, Newline } from 'ink';
import Markdown from 'ink-markdown';
import dedent from 'dedent';
import fs from 'fs';
import { InitDescription, InitSelectInput, InitTextInput } from '../components';

/**
 * 배포하기 위해 필요한 것들
 * 1. framework : nest | next
 * 2. packageManager : npm | yarn | yarnBerry
 * 3. appLocation : /Users/parkhyemin/projects/Red-Platform-RestApi
 * 4. nodeVersion : 16.4.0
 * 5. server
 *  - host : 3.38.77.69
 *  - port : 3000
 *  - username : ec2-user
 *  - password: 비밀번호
 *  - deploymentDir : /home/ec2-user
 *  - nodeVersion : 16.4.0
 *  - exec_mode : fork_mode
 *  - instance : 1
 *  - pemLocation : pem 파일 위치
 */

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
interface IDefaultDeployInfo {
  framework: string;
  packageManager: string;
  appLocation: string;
  nodeVersion: string;
  server: IDefaultDeployServerInfo;
}

// npm start -- init --type nextjs
const Init = () => {
  const [step, setStep] = useState<number>(0);
  const [result, setResult] = useState<IDefaultDeployInfo>({
    framework: '',
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
  });

  const frameworkList = [
    {
      label: 'nest',
      value: 'nest',
    },
    {
      label: 'next',
      value: 'next',
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
      label: 'yarnBerry',
      value: 'yarnBerry',
    },
  ];

  const initInfoList: Array<IInitSettingForComponent> = [
    {
      type: 'selectInput',
      target: 'framework',
      label: 'framework',
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
  ];

  if (step > initInfoList.length - 1) {
    // easy-deploy.json 파일 생성
    fs.writeFileSync('easy-deploy.json', JSON.stringify(result));
  }

  const checkFinalJson = dedent`
    {
      "framework": "${result.framework}",
      "packageManager": "${result.packageManager}",
      "appLocation": "${result.appLocation}",
      "nodeVersion": "${result.nodeVersion}",
      "server": {
        "host": "${result.server.host}",
        "port": "${result.server.port}",
        "username": "${result.server.username}",
        "password": "${result.server.password}",
        "deploymentDir": "${result.server.deploymentDir}",
        "nodeVersion": "${result.server.nodeVersion}",
        "pemLocation": "${result.server.pemLocation}"
      }
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
              result={result}
              setStep={setStep}
              setResult={setResult}
            />
          ) : (
            <InitTextInput
              key={initInfo.target}
              target={initInfo.target}
              label={initInfo.label}
              rangeNum={initInfo.rangeNum}
              defaultValue={initInfo.defaultValue}
              step={step}
              result={result}
              setStep={setStep}
              setResult={setResult}
            />
          )
        )}
        <Newline />
        {step > initInfoList.length - 1 ? (
          <Box flexDirection="column">
            <Markdown>{checkFinalJson}</Markdown>
            <Newline />
            <Text>✨ About to write to easy-deploy.json </Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default Init;
export { ISelectOption, IDefaultDeployInfo };
