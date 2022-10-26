import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';

import { getRemoteServer, PM2Handler } from '../modules';
import Builder from '../modules/builder';
import Bundler from '../modules/bundler';
import { exec } from 'child_process';

const Deploy = (props: any) => {
  const { config } = props;
  const [resultMsg, setResultMsg] = useState<string>();
  const [processMsg, setProcessMsg] = useState<string>();
  const [messageColor, setMessageColor] = useState<string>();
  const processMsgColor = 'blue';

  let output = props.output || props.o || config.output;
  let useDefaultOutput = false;

  if (!output) {
    output = process.cwd();
    useDefaultOutput = true;
  }

  async function DeployModule() {
    const { appName, server } = config;

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

      setProcessMsg('Process : Build start');
      await builder.exec();

      setProcessMsg('Process : Bundle start');
      await bundler.exec();

      setProcessMsg('Process : Node install check');
      await remoteServer.installNode();

      setProcessMsg('Process : PM2 install check');
      await remoteServer.installPM2();

      setProcessMsg('Process : Generate backup');
      const hasBackup = await remoteServer.backup(appName, server.deploymentDir);

      setProcessMsg('Process : Upload bundle');
      await remoteServer.putFile(`${output}/bundle.tar`, `${appDir}.tar`);

      if (useDefaultOutput) {
        exec(`rm -rf ${output}/bundle.tar`);
      }

      setProcessMsg('Process : Unzip bundle');
      await remoteServer.extractTarBall(`${appDir}.tar`);

      if (hasBackup) {
        setProcessMsg('Process : Move node_modules from backup');
        await remoteServer.useExistingNodeModules(appName, `${server.deploymentDir}`);
      }

      setProcessMsg('Process : Install package');
      await remoteServer.exec(
        `cd ${appDir} && ${
          ['npm', 'pnpm'].includes(config.packageManager)
            ? `${config.packageManager} i --legacy-peer-deps`
            : `${config.packageManager}`
        }`
      );

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
