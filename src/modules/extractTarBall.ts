import { ISSH } from './upload'

async function extractTarBall(){

  let sshConfig = {
    host: '172.20.1.23',
    username: 'u1',
    password: 'hiswill4874',
  }

  // const client : ISSH = await new (SSH as any)(sshConfig);

  // await client.exec('cd /home/u1/uploadTest/ && tar -xvf file.tar', console.log)
}

export {
  extractTarBall
}