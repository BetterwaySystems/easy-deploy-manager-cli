import { readFileSync } from 'fs';
import { ISSH, SSH } from './upload'

interface IExecResult {
  stdout: string;
  stderr: string;
  code: number;
  signal: any;
}

const PM2_VERSION: string = '5.2.0';
const COMMAND_NOT_FOUND_CODE = 127;

async function installPM2() {

  let sshConfig = {}

  const client : ISSH = await new (SSH as any)(sshConfig);

  const checkPM2Version: IExecResult = await client.exec('pm2 --version');
  const checkNodeVersion: IExecResult = await client.exec('node --version');
  const nodeVersion: string = checkNodeVersion.stdout.replace('\n', '');
  const pm2Version: string = checkPM2Version.stdout.replace('\n', '');

  const uninstalledPM2: boolean = checkPM2Version.code === COMMAND_NOT_FOUND_CODE;
  const differentVersion: boolean = !uninstalledPM2 && pm2Version !== PM2_VERSION;

  if (uninstalledPM2 || differentVersion) {
    await client.exec(`npm install -g pm2@${PM2_VERSION} && sudo ln -s -f ~/.nvm/versions/node/${nodeVersion}/bin/pm2 /usr/local/bin`);
  }
}

export {
  installPM2 
}