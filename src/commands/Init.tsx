import React, { useState } from 'react';
import { Text, Box, useApp, Newline } from 'ink';
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
 *  - deploymentDir : /home/ec2-user
 *  - nodeVersion : 16.4.0
 *  - exec_mode : fork_mode
 *  - instance : 1
 *  - pem : pem 파일 위치
 */

interface IInitProps {
  type?: 'next' | 'nest';
}

interface IInitInfo {
  type: 'selectInput' | 'textInput';
  target: string;
  label: string;
  rangeNum: number;
  defaultValue?: string;
  itemList?: Array<ISelectOption>;
}

interface ISelectOption {
  label: string;
  value: string;
}

// npm start -- init --type nextjs
// props: IInitProps
const Init = () => {
  const { exit } = useApp();

  const [step, setStep] = useState<number>(0);
  const [result, setResult] = useState<{ [key: string]: string | { [key: string]: string } }>({
    framework: '',
    packageManager: '',
    appLocation: '',
    nodeVersion: '',
    serverHost: '',
    serverPort: '',
    serverUsername: 'ec2-user',
    serverDeploymentDir: '/home/ec2-user',
    serverNodeVersion: '',
    // exec_mode: '',
    // instance: '',
    severPem: '',
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

  const initInfoList: Array<IInitInfo> = [
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
      target: 'serverHost',
      label: '(server) host',
      rangeNum: 3,
    },
    {
      type: 'textInput',
      target: 'serverPort',
      label: '(server) port',
      rangeNum: 4,
    },
    {
      type: 'textInput',
      target: 'serverUsername',
      label: '(server) username',
      defaultValue: 'ec2-user',
      rangeNum: 5,
    },
    {
      type: 'textInput',
      target: 'serverDeploymentDir',
      label: '(server) deploymentDir',
      defaultValue: '/home/ec2-user',
      rangeNum: 6,
    },
    {
      type: 'textInput',
      target: 'serverNodeVersion',
      label: '(server) nodeVersion',
      rangeNum: 7,
    },
    {
      type: 'textInput',
      target: 'serverPem',
      label: '(server) pem',
      rangeNum: 8,
    },
  ];

  if (step > 9) {
    const {
      framework,
      packageManager,
      appLocation,
      nodeVersion,
      serverHost,
      serverPort,
      serverUsername,
      serverDeploymentDir,
      serverNodeVersion,
      serverPem,
    } = result;

    const dataForDeploy = {
      framework,
      packageManager,
      appLocation,
      nodeVersion,
      server: {
        host: serverHost,
        port: serverPort,
        username: serverUsername,
        deploymentDir: serverDeploymentDir,
        nodeVersion: serverNodeVersion,
        pem: serverPem,
      },
    };

    // easy-deploy.json 파일 생성
    fs.writeFileSync('easy-deploy.json', JSON.stringify(dataForDeploy));
  }

  return (
    <Box flexDirection="column">
      <InitDescription />
      <Box flexDirection="column">
        {initInfoList.map((initInfo: IInitInfo) =>
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
        {step > 9 ? <Text>✨ About to write to easy-deploy.json </Text> : null}
      </Box>
    </Box>
  );
};

export default Init;
export { IInitProps, ISelectOption };
