import React, { useState } from 'react';
import { Text, Box, Newline } from 'ink';
import Markdown from 'ink-markdown';
import dedent from 'dedent';
import fs from 'fs';
import { InitDescription, InitDefaultInputComponent } from '../components';

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
const serverOSList = [
  {
    label: 'amazonlinux',
    value: 'amazonlinux',
  },
  {
    label: 'ubuntu',
    value: 'ubuntu',
  },
  {
    label: 'centos',
    value: 'centos',
  },
];
const pm2ExecModeList = [
  {
    label: 'fork',
    value: 'fork',
  },
  {
    label: 'cluster',
    value: 'cluster',
  },
];
const initSettingInfo: Array<IInitSettingForComponent> = [
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
    target: 'appName',
    label: 'appName',
    rangeNum: 1,
  },
  {
    type: 'textInput',
    target: 'nodeVersion',
    label: 'nodeVersion',
    rangeNum: 2,
  },
  {
    type: 'selectInput',
    target: 'server.os',
    label: '(server) os',
    defaultValue: 'amazonlinux',
    itemList: serverOSList,
    rangeNum: 3,
  },
  {
    type: 'textInput',
    target: 'server.host',
    label: '(server) host',
    rangeNum: 4,
  },
  {
    type: 'textInput',
    target: 'server.port',
    label: '(server) port',
    defaultValue: '22',
    rangeNum: 5,
  },
  {
    type: 'textInput',
    target: 'server.username',
    label: '(server) username',
    defaultValue: 'ec2-user',
    rangeNum: 6,
  },
  {
    type: 'textInput',
    target: 'server.password',
    label: '(server) password',
    rangeNum: 7,
  },
  {
    type: 'textInput',
    target: 'server.deploymentDir',
    label: '(server) deploymentDir',
    defaultValue: '/home/ec2-user',
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
    target: 'server.alias',
    label: '(server) alias',
    rangeNum: 10,
  },
  {
    type: 'selectInput',
    target: 'pm2.exec_mode',
    label: '(pm2) exec_mode',
    itemList: pm2ExecModeList,
    defaultValue: 'fork',
    rangeNum: 11,
  },
  {
    type: 'textInput',
    target: 'pm2.instance',
    label: '(pm2) instance',
    defaultValue: '1',
    rangeNum: 12,
  },
];

const Init = () => {
  const [step, setStep] = useState<number>(0);
  const [defaultInitInfo, setDefaultInitInfo] = useState<IDefaultInitInfo>({
    buildType: '',
    packageManager: '',
    appName: '',
    nodeVersion: '(Enter the node version used in your project)',
    server: {
      os: 'amazonlinux',
      host: '(Enter the remote server host)',
      port: 22,
      username: 'ec2-user',
      password: '(If you need a password to access the remote server, enter it)',
      deploymentDir: '/home/ec2-user',
      pemLocation: '(Enter the local path where the pem file is located)',
      alias: '(Enter the server connection alias)',
    },
    pm2: {
      exec_mode: 'fork',
      instance: '1',
    },
    env: {},
  });

  if (step > initSettingInfo.length - 1) {
    const initializeFileInfo = {
      ...defaultInitInfo,
      server: {
        ...defaultInitInfo.server,
        port: Number(defaultInitInfo.server.port),
      },
    };

    // create easy-deploy.json
    fs.writeFileSync('easy-deploy.json', JSON.stringify(initializeFileInfo));
  }

  const checkFinalJson = dedent`
    {
      "buildType": "${defaultInitInfo.buildType}",
      "packageManager": "${defaultInitInfo.packageManager}",
      "appName": "${defaultInitInfo.appName}",
      "nodeVersion": "${defaultInitInfo.nodeVersion}",
      "server": {
        "os": "${defaultInitInfo.server.os}"
        "host": "${defaultInitInfo.server.host}",
        "port": ${defaultInitInfo.server.port},
        "username": "${defaultInitInfo.server.username}",
        "password": "${defaultInitInfo.server.password}",
        "deploymentDir": "${defaultInitInfo.server.deploymentDir}",
        "pemLocation": "${defaultInitInfo.server.pemLocation}",
        "alias": "${defaultInitInfo.server.alias}"
      },
      "pm2": {
        "exec_mode": "${defaultInitInfo.pm2.exec_mode}",
        "instance": "${defaultInitInfo.pm2.instance}"
      },
      "env": {}
    }
  `;

  return (
    <Box flexDirection="column">
      <InitDescription />
      <Box flexDirection="column">
        {initSettingInfo.map((initSettingInfo: IInitSettingForComponent) => (
          <InitDefaultInputComponent
            key={initSettingInfo.target}
            initSettingInfo={initSettingInfo}
            step={step}
            defaultInitInfo={defaultInitInfo}
            setStep={setStep}
            setDefaultInitInfo={setDefaultInitInfo}
          />
        ))}
        <Newline />
        {step > initSettingInfo.length - 1 ? (
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
