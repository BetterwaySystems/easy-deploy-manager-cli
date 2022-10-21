import { ChildProcess, spawn, exec as childExec } from 'child_process';
import appLocationDirectory from "../common/appLocationDirectory";
const NestBuilder = function (this: any, config: any): any {
  console.log("config", config);

  function exec() {
    return new Promise((resolve: any, reject: any) => {
      const buildChild: ChildProcess =
      childExec(
        `nest build`
        );
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