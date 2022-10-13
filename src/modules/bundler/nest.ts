import { ChildProcess, spawn, exec as childExec } from 'child_process';
import {readdir, readdirSync } from 'fs';
import os from 'os';
import ts from 'typescript';

const NestBundler = function (this: any, config: any): any {
  console.log("config", config);
  const findManager = (): string => {
    const files = readdirSync(process.cwd());
    if (files === undefined) {
      console.log(`cannot find PackageManager, Assumed to be npm`);
      return 'cp package.json package-lock.json';
    } else {
      if (files.findIndex((filename) => filename === 'yarn.lock') > -1) {
        console.log(`PackageManager is YARN, start to collect dependencies files`);
        return 'cp package.json yarn.lock';
      } else if (files.findIndex((filename) => filename === 'pnpm-lock.yaml') > -1) {
        console.log(`PackageManager is PNPM, start to collect dependencies files`);
        return 'cp package.json pnpm-lock.yaml';
      } else {
        console.log(`PackageManager is NPM, start to collect dependencies files`);
        return 'cp package.json package-lock.json';
        }
    }
  }

  function exec() {
    const homeDir = os.homedir();
    const packageManager = findManager();
    const desktopDir = `${homeDir}/Desktop`;
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
    const buildChild: ChildProcess =
    childExec(
      `mkdir ${desktopDir}/${outDir} && 
      cp -rf ${outDir} ${desktopDir}/${outDir} && 
      ${packageManager} ${desktopDir}/${outDir} && 
      tar -cvf ${desktopDir}/nestBundle.tar -C ${desktopDir}/${outDir} . && 
      rm -rf ${desktopDir}/${outDir}`
      );
      buildChild.on('close', () => {
      console.log('finished bundling, please check your desktop');
      })
      buildChild.on('error', (err) => {
      console.log('error has occurred!!!', err);
    })
  }
  return { exec };
};

export default NestBundler;
