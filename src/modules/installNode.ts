import getRemoteServer from './SSH';

async function installNode() {
  const version = '16.4.0';
  const config = {};

  const client: ISSH = await getRemoteServer(config);
  const node_version = `v${version}`;

  console.log('check nvm has installed');
  const checkNvmInstalled: ISSHExecResult = await client.exec(
    'find $HOME/.nvm -name nvm.sh',
  );
  const hasNvm = checkNvmInstalled.stdout;

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
