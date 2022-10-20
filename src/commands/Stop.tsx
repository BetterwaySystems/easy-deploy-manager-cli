import React, { useEffect, useState } from 'react';
import { Text } from 'ink';
import { getRemoteServer } from '../modules';

const Stop = (props : any) => {
  const { config } = props;
  const [ message, setMessage ] = useState<string>();
  const [ messageColor, setMessageColor ] = useState<string>();

  async function stopApplication() {
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