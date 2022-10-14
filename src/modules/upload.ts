import { Client } from 'ssh2'

// SSH 커넥션 작업 완료전까지 임시로 쓸 SSH 커넥션
const SSH = function(this: any, config : ISSHConfig ){

  return new Promise<ISSH>((resolve)=>{
    
    const sshClient = new Client();
    sshClient.once('ready', ()=>{
      this._client = sshClient;
      this._client.sftp((err : Error, sftp:any)=>{
        if (err){}
        this._sftp = sftp;
        resolve(this);
      });

    });
    sshClient.connect(config);

  });
}


export {
  SSH,
}