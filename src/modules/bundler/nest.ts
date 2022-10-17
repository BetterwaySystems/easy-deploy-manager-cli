import { ChildProcess, spawn, exec as childExec } from 'child_process';
import { readdirSync, existsSync, mkdirSync } from 'fs';
import os from 'os';
import ts from 'typescript';

const NestBundler = function (this: any, config: any): any {
  console.log("config", config);
  const PACKAGE_NPM: string = 'cp package.json package-lock.json';
  const PACKAGE_YARN: string = 'cp package.json yarn.lock';
  const PACKAGE_PNPM: string = 'cp package.json pnpm-lock.yaml';

  const findManager = (): string => {
    if (config.packageManager) {
      switch (config.packageManager) {
        case 'npm':
          return PACKAGE_NPM;
        case 'yarn':
          return PACKAGE_YARN;
        case 'pnpm':
          return PACKAGE_PNPM;
        default:
          return PACKAGE_NPM;
      }
    } else {
      const files = readdirSync(process.cwd());
      if (files === undefined) {
        console.log(`cannot find PakageManager, Assumed to be npm`);
        return PACKAGE_NPM;
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
  }

  function exec() {
    const packageManager = findManager();
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
    function mkdir( dirPath:string ) {
      const isExists = existsSync( dirPath );
      if( !isExists ) {
          mkdirSync( dirPath, { recursive: true } );
      }
  }
    mkdir(`../${outDir}`);
    const buildChild: ChildProcess =
    childExec(
      `
      cp -rf ${outDir} ../${outDir} && 
      ${packageManager} ../${outDir} && 
      tar -cvf ../Bundle_Nest.tar -C ../${outDir} . && 
      rm -rf ../${outDir}
      `
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
