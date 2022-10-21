import React, { useEffect, useState } from 'react';
import { Text } from 'ink';
import { getRemoteServer } from '../modules';

const Stop = ({ config } : ICommandProps) => {

  const [ message, setMessage ] = useState<string>();
  const [ messageColor, setMessageColor ] = useState<string>();

  async function stopApplication() {
    if(!config) {
      setMessage("There is no config file");
      return;
    }

    const { appName, server } = config;
    const remoteServer = await getRemoteServer(server);

    try {
      await remoteServer.stopApp(appName, server.deploymentDir);
      setMessageColor("green");
      setMessage("Stop application");
    } catch(err) {
      const error = err as ISSHExecError;
      setMessageColor("red");
      setMessage(`${remoteServer.name} : Fail to stop application - ${error.stderr}`);
    }

    remoteServer.close();
  }

  useEffect(() => {
    stopApplication();
  }, [])

	return <Text color={messageColor}>{message}</Text>
}

export default Stop;