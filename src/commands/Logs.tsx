import React, { useEffect } from 'react';
import { getRemoteServer } from '../modules';

const Logs = ({ config } : ICommandProps)=>{

  async function getLogs () {
    if(!config) return;

    const { appName, server } = config;
    const remoteServer = await getRemoteServer(server);

    try {
      const logs = await remoteServer.getLog(appName);
      console.log(logs);
    } catch(err) {
      console.log(err);
    }

    remoteServer.close();
  }

  useEffect(() => {
    getLogs();
  }, [])
  
	return (<></>)
}

export default Logs;