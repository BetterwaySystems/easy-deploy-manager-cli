import React, { useEffect, useState } from 'react';
import { Text } from 'ink';
import { getRemoteServer } from '../modules';

function delay(ms: number){
  return new Promise(resolve => setTimeout(resolve, ms));
}

const SampleSSH = ()=>{

  const [ message, setMessage ] = useState<string>();

  let config = {
    host: '13.125.105.220',
    username: 'ec2-user',
    pemLocation : "/Users/irelander/Desktop/02.Server/02.KeyFiles/dev-platformteam-server-key.pem"
  }

  async function init(){
    const remoteServer = await getRemoteServer(config)
    setMessage('SSH Connected');
    await delay(1000);

    // Stdout Options..
    const executeResult = await remoteServer.exec('ls -la');
    setMessage(`execute Result : ${executeResult}`);
    await delay(1000);

    // Stdout Options..
    // const executeResult = await remoteServer.exec('ls -la', { onStdout: (content)=>{ 
    //   console.log(content);
    // } });
    // setMessage(`execute Result : ${executeResult}`);
    // await delay(1000);

    // Error 처리
    try {
      const result = await remoteServer.extractTarBall('/test/test/test');
    }catch(err){
      console.log(err);
      setMessage(`${remoteServer.name} : 파일 압축 해제 실패`);
    }finally{
      await delay(1000);
    }

    setMessage('SSH Disconnected');
    await remoteServer.close();


  }

  useEffect(()=>{
    init();
  }, []);

  
	return <Text>{message}</Text>
}

export default SampleSSH;