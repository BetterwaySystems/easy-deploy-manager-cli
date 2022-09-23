import { ChildProcess, spawn, exec as childExec } from 'child_process';
const NestBuilder = function (this: any, config: any): any {
  console.log("config", config);

  function exec() {
    const buildChild: ChildProcess =
    childExec(
      `nest build`
      );
      buildChild.on('close', () => {
      console.log('finished building, please check your build folder!');
      })
      buildChild.on('error', (err) => {
      console.log('error has occured!!!', err);
    })
  }
  return { exec };
};

export default NestBuilder;