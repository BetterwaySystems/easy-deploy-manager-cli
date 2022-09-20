import React from 'react';
import { Static, Box, Text } from 'ink';
import { ChildProcess, spawn, exec } from 'child_process';
import os from 'os';
import ts from 'typescript';



const NestBundle = ()=>{
    const homeDir = os.homedir();
    const desktopDir = `${homeDir}/Desktop`;
    const executionCommand = ``;
    const currentDir = process.cwd();
    const configFileName: string|undefined = ts.findConfigFile(
      currentDir,
      ts.sys.fileExists,
      "tsconfig.json"
    );
    const configFile = ts.readConfigFile(configFileName || './tsconfig.json', ts.sys.readFile);
    const compilerOptions = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      "./"
    );
    const outDir = compilerOptions.options.outDir || 'dist';
    console.log(outDir);
    console.log(desktopDir)
      const buildChild: ChildProcess = exec(`nest build && mkdir ${desktopDir}/${outDir} && cp -rf ${outDir} ${desktopDir}/${outDir} && cp package.json package-lock.json ${desktopDir}/${outDir} && tar -cvf ${desktopDir}/nestBundle.tar -C ${desktopDir}/${outDir} . && rm -rf ${desktopDir}/${outDir}`);
      buildChild.on('close', () => {
        console.log('bundling finished');
      })
      buildChild.on('error', (err) => {
        console.log(`ERROR: bundling failed! : ${err}`);
      })
  return (<></>)
}

export default NestBundle;
