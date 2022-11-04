import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import fs from 'fs';

import { getRemoteServer, PM2Handler } from '../modules';
import Builder from '../modules/builder';
import Bundler from '../modules/bundler';
import CommandBuilder from '../modules/common/commandBuilder';
import { exec } from 'child_process';

const ErrorText = ({ errorMessage }: any) => {
  return (
    <Box flexDirection="column">
      <Text color="red">ERROR: {errorMessage}</Text>
    </Box>
  );
};

const Deploy = (props: any) => {
  const { config, options } = props;
  const [resultMsg, setResultMsg] = useState<string>();
  const [processMsg, setProcessMsg] = useState<string>();
  const [messageColor, setMessageColor] = useState<string>();
  const processMsgColor = 'blue';

  let output = options.output || options.o || config.output;
  let useDefaultOutput = false;

  if (!output) {
    output = process.cwd();
    useDefaultOutput = true;
  }

  const isSkipBuild = options.skipBuild;

  if (config.bundleFilePath) {
    if (!fs.existsSync(config.bundleFilePath)) {
      return <ErrorText errorMessage="'bundleFilePath' does not exist." />;
    }

    output = config.bundleFilePath;
    useDefaultOutput = true;
  }

  if (isSkipBuild && !config.bundleFilePath) {
    return (
      <ErrorText errorMessage="If use 'skipBuild' option then 'bundleFilePath' is required in easy-deploy.json" />
    );
  }

  async function DeployModule() {
    const { appName, server, nodeVersion } = config;

    const builder: IBuilder = Builder();
    const bundler: IBundler = Bundler(props);
    const remoteServer = await getRemoteServer(server);

    const appDir = `${server.deploymentDir}/${appName}/bundle`;

    try {
      if (!remoteServer) {
        setMessageColor('red');
        setResultMsg("Failed: Can't connect remote server.");

        return false;
      }

      if (isSkipBuild) {
        console.log('skip build');
      } else {
        setProcessMsg('Process : Build start');
        await builder.exec();

        setProcessMsg('Process : Bundle start');
        await bundler.exec();
      }

      setProcessMsg('Process : Node install check');
      await remoteServer.installNode();

      setProcessMsg('Process : PM2 install check');
      await remoteServer.installPM2();

      setProcessMsg('Process : Generate Temporary backup folder');
      const hasBundle = await remoteServer.moveTempBackup(appName, server.deploymentDir);

      setProcessMsg('Process : Upload bundle');
      await remoteServer.putFile(`${output}/bundle.tar`, `${appDir}.tar`);

      if (useDefaultOutput) {
        exec(`rm -rf ${output}/bundle.tar`);
      }

      setProcessMsg('Process : Unzip bundle');
      await remoteServer.extractTarBall(`${appDir}.tar`, `${appDir}`);

      if (hasBundle) {
        setProcessMsg('Process : Generate backup');
        await remoteServer.backup(appName, `${server.deploymentDir}`);
      }

      setProcessMsg('Process : Install package');
      const changeDirectory = `cd ${appDir}`;
      const installPackage = `npm install`;

      const command = new CommandBuilder({nodeVersion});
      command
        .add(changeDirectory)
        .add(installPackage)

      const cmd = command.getCommand();

      await remoteServer.exec(cmd);

      setProcessMsg('Process : Application start');
      await remoteServer.startApp(appName, server.deploymentDir);

      setMessageColor('green');
      setResultMsg(`Success: Deployed successfully on ${server.host}`);
      await remoteServer.close();
    } catch (e) {
      const err = e as ISSHExecError & Error;
      const error = typeof err === 'object' ? err.stderr : err;
      setMessageColor('red');
      setResultMsg('Failed:\n' + error);
      await remoteServer.close();
    }

    return true;
  }

  useEffect(() => {
    DeployModule();
  }, []);

  return (
    <>
      <Box>
        <Text color={'red'}>D</Text>
        <Text color={'#ffa500'}>e</Text>
        <Text color={'yellow'}>p</Text>
        <Text color={'green'}>l</Text>
        <Text color={'blue'}>o</Text>
        <Text color={'#8b00ff'}>y</Text>
      </Box>
      {messageColor !== 'green' && <Text color={processMsgColor}>{processMsg}</Text>}
      <Text color={messageColor}>{resultMsg}</Text>
    </>
  );
};

export default Deploy;
