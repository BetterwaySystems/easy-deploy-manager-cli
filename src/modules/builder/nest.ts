import React from 'react';
import { ChildProcess, spawn, exec as childExec } from 'child_process';
import dedent from 'dedent';
const NestBuilder = function (this: any, config: any, options?:string): any {
  console.log(config);
  console.log('props.options: ' + options);
  options === '-w' || '--watch'  ? options = '' : options = options;
  function exec() {
    const buildChild: ChildProcess =
    childExec(
      `nest build --${options}`
      );
    buildChild.on('close', () => {
      console.log('finished building, please check your build folder!');
      })
    buildChild.on('error', (err) => {
        if(err.message.includes('ENOENT')) {
          console.log('Please install [nest-cli] first!');
        }
    })
  }
  

  return {exec};
};

export default NestBuilder;