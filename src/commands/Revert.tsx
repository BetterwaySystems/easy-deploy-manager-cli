import React, { useEffect } from 'react';
import { getRemoteServer } from '../modules';

const Revert = ({config} : ICommandProps)=>{

  async function action(){
    if (!config) return;
    
    const remoteServer = await getRemoteServer(config.server)

    try {
      await remoteServer.revertApp(config.appName, config.server.deploymentDir);
      await remoteServer.close()
    }catch (error){
        console.error(error)
    }
        
    
  }

  useEffect(()=>{
    action();
  }, [])

	return (<></>)
}

export default Revert;