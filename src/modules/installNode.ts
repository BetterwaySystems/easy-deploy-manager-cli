import { readFileSync } from 'fs';
import { ISSH, SSH } from './upload';

async function installNode(version: string) {
  const sshConfig = {};

  const client: ISSH = await new (SSH as any)(sshConfig);
  const node_version = `v${version}`;

  console.log('check nvm has installed');
  const { stdout: hasNvm } = await client.exec('find $HOME/.nvm -name nvm.sh');

  if (hasNvm) {
    console.log('nvm is already installed');
    await client.exec(`nvm use ${version} || nvm install ${version}`);
  } else {
    console.log('nvm is not yet installed, starting nvm installing...');
    await client.exec(
      `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash && source $HOME/.nvm/nvm.sh && nvm install ${version}`,
    );
    console.log('nvm install completed');
  }
  console.log(`Now using node ${node_version}`);
}

export { installNode };
