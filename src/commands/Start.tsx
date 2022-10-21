import React, { useEffect, useState } from 'react';
import { Text } from 'ink';
import { getRemoteServer } from '../modules';

const Start = ({ config } : ICommandProps) => {
  const [ message, setMessage ] = useState<string>();
  const [ messageColor, setMessageColor ] = useState<string>();

  async function startApp() {
    if(!config) {
      setMessage("There is no config file");
      return;
    }

    const { appName, server } = config;
    const remoteServer = await getRemoteServer(server);

    try {
      await remoteServer.startApp(appName, server.deploymentDir);
      setMessageColor("green");
      setMessage("Start application");
    } catch(err) {
      const error = err as ISSHExecError;
      setMessageColor("red");
      setMessage(`${remoteServer.name} : Fail to start application - ${error.stderr}`);
    }

    remoteServer.close();
  }

  useEffect(() => {
    startApp();
  }, [])
  
	return <Text color={messageColor}>{message}</Text>
}

export default Start;