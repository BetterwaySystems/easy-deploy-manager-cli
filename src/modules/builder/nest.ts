import { ChildProcess, exec as childExec  } from 'child_process';
import CommandBuilder from '../common/commandBuilder';
const NestBuilder = function (this: any, config: any): any {
  const { appLocation } = config;
  function exec() {
    return new Promise((resolve: any, reject: any) => {
      const Command = new CommandBuilder();
      const buildCommand = `cd ${appLocation} && nest build`;
      Command.add(buildCommand);
      const initCmd = Command.getCommand();
      const buildChild: ChildProcess = childExec(initCmd);
        buildChild.on('close', () => {
          console.log('finished building, please check your build folder!');
          resolve(true);
        })
        buildChild.on('error', (err) => {
          reject("nest build failed" + err);
        })
      });
    }

  return { exec };
};

export default NestBuilder;