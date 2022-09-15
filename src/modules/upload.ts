import { Client } from 'ssh2'
import cliProgress from 'cli-progress'
import { parse } from 'node:path/posix'

// SSH Connection 완료되면 변경
interface ISSH {
  _client : Client | null
  _sftp   : any
  putFile : Function
  exec    : Function
  mkdir   : Function
}

interface ISSHConfig {
  host    : string
  username: string
  password: string
}

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

SSH.prototype.exec = function(command: string){

  return new Promise((resolve, reject)=>{

    const self = this;
    self._client.exec(command, onExec);

    function onExec(err : Error, stream: any) {
      if(err) {
        reject(err);
      } else {
        var context : any = {stdout: "", stderr: ""};
        stream.on('close', function(code : string, signal : any) {
          context.code = code;
          context.signal = signal;
          resolve(context);
        }).on('data', function(data:any) {
          data = data.toString();
          context.stdout += data;
        }).stderr.on('data', function(data:any) {
          data = data.toString();
          context.stderr += data;
        });
      }
    }

  });
}

SSH.prototype.exists = function(path: string) {

  const self = this;

  return new Promise((resolve, reject) => {
    
    let {dir, base} = parse(path);

    self._sftp.readdir(dir, (err:any, list:any) => {
      if (err) {
        if (err.code === 2) {
          resolve(false);
        } else {
          reject(
            new Error(`Error listing ${dir}: code: ${err.code} ${err.message}`)
          );
        }
      } else {
        let [type] = list
          .filter((item:any) => item.filename === base)
          .map((item:any) => item.longname.substr(0, 1));
        if (type) {
          resolve(type);
        } else {
          resolve(false);
        }
      }
    });

  });
};

SSH.prototype.mkdir = function(path: string){

  const self = this;

  let doMkdir = (p:string) => {
    return new Promise((resolve, reject) => {
      self._sftp.mkdir(p, (err: Error) => {
        if (err) {
          reject(new Error(`Failed to create directory ${p}: ${err.message}`));
        }
        resolve(`${p} directory created`);
      });
    });
  };

  let mkdir = (p:string) => {
    let {dir} = parse(p);
    if(dir === '' || dir === '/' || dir === '.'){
      return;
    }
    return self.exists(dir)
      .then((type:boolean) => {
        if (!type) {
          return mkdir(dir);
        }
      })
      .then(() => {
        return doMkdir(p);
      });
  };
  return mkdir(path);
}

interface IPutFileOptions {
  onProgress? : Function
}

SSH.prototype.putFile = function(path : string, dest :string, options : IPutFileOptions = {}) {
  return new Promise(async (resolve)=>{
    
    const self = this;
    let totalTransfered = 0;

    function sendProgressInfo(_tt : any, chunk : any, total : any) {
      totalTransfered += chunk;
      let completedPercentage = (totalTransfered/total) * 100;
      if(options.onProgress) {
        options.onProgress(completedPercentage, totalTransfered, total);
      }
    }

    let fastPutOptions = {
      step: sendProgressInfo
    };

    const {dir} = parse(dest)
    await self.mkdir(dir);
    
    self._sftp.fastPut(path, dest, fastPutOptions, ()=>{
      resolve(true)
    })

  })
}


interface IUpload {
  path    : string
  dest    : string
  title?  : string
}

const upload = async ({path, title, dest} : IUpload)=> {

  // 테스트를 위한 코드
  let sshConfig = {
    host: '172.20.1.23',
    username: 'u1',
    password: 'hiswill4874',
  }

  const client : ISSH = await new (SSH as any)(sshConfig);

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  let isInit = false;
  


  function ProgressBar(percent:number, transfered:number, total:number){
    if (!isInit) {
      if (title) console.log(`[ ${title} ] UPLOAD`)
      progressBar.start(total, transfered);
      isInit = true; 
    }
    
    progressBar.update(transfered, {filename : title});

    if (percent === 100){
      progressBar.stop();
    }
  }

  await client.putFile(path, dest, {onProgress : ProgressBar})
}


export {
  SSH,
  upload,
}

export {
  IUpload,
  ISSH,
}