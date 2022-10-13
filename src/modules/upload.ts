import { Client } from 'ssh2'
import cliProgress from 'cli-progress'
import { parse } from 'node:path/posix'
import { connection } from './SSH'

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

const upload = async ({path, title, dest} : IUpload)=> {

  const client = await connection({module : false});

  const {dir} = parse(dest);
  await client.mkdir(dir);

  return Promise.all(client._client.map((server)=>{

    return new Promise((resolve)=>{
      let totalTransferred = 0;

      const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
      let isInit = false;
    
    
      function ProgressBar(percent:number, transferred:number, total:number){
        if (!isInit) {
          if (title) console.log(`[ ${title} ] UPLOAD`)
          progressBar.start(total, transferred);
          isInit = true; 
        }
        
        progressBar.update(transferred, {filename : title});
    
        if (percent === 100){
          progressBar.stop();
        }
      }

      function sendProgressInfo(_tt : any, chunk : any, total : any) {
        totalTransferred += chunk;
        let completedPercentage = (totalTransferred/total) * 100;
          ProgressBar(completedPercentage, totalTransferred, total);
      }

      let fastPutOptions = {
        step: sendProgressInfo
      };

      server.sftp?.fastPut(path, dest, fastPutOptions, ()=>{
        resolve(true)
      })
    });
  }));
}


export {
  upload,
  SSH,
}