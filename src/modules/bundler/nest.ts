import { ChildProcess, exec as childExec } from 'child_process';
import { readdirSync } from 'fs';
import appLocationDirectory from "../common/appLocationDirectory";
import ts from 'typescript';
import CommandBuilder from '../common/commandBuilder';

const NestBundler = function (this: any, config: any, bundleOptions:Record<string, any>): any {
  const PACKAGE_NPM: string = 'cp package.json package-lock.json';
  const PACKAGE_YARN: string = 'cp package.json yarn.lock';
  const PACKAGE_PNPM: string = 'cp package.json pnpm-lock.yaml';
  const OUT_PUT_DIR: string = config.output;
  const BUNDLE_FILE: string = 'bundle.tar';
  const Command = new CommandBuilder();
  const { writedEcosystemLocationInfo, output } = bundleOptions;
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
      const files = readdirSync(config.appLocation);
      if (files === undefined) {
        console.log(`cannot find PakageManager, Assumed to be npm`);
        return PACKAGE_NPM;
      } else {
        if (files.findIndex((filename) => filename === 'yarn.lock') > -1) {
          console.log(`PackageManager is YARN, start to collect dependencies files`);
          return 'package.json yarn.lock tsconfig.build.json';
        } else if (files.findIndex((filename) => filename === 'pnpm-lock.yaml') > -1) {
          console.log(`PackageManager is PNPM, start to collect dependencies files`);
          return 'package.json pnpm-lock.yaml tsconfig.build.json';
        } else {
          console.log(`PackageManager is NPM, start to collect dependencies files`);
          return 'package.json package-lock.json tsconfig.build.json';
        }
      }
    }
  }

  function exec() {
    const packageManager = findManager();
    const configFileName: string|undefined = ts.findConfigFile(
      config.appLocation,
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
    const moveLocalCommand = `cd ${config.appLocation}`
    const tarCommand = `tar cvf ${OUT_PUT_DIR}/${BUNDLE_FILE} ${outDir} ${packageManager} `;
    const moveExternalCommand = `cd ${writedEcosystemLocationInfo.pwd}`;
    const removeTarCommand = `tar rvf ${output}/${BUNDLE_FILE} ${writedEcosystemLocationInfo.fileName}`;
    const removeEcoCommand = `rm -rf ${writedEcosystemLocationInfo.pwd}/${writedEcosystemLocationInfo.fileName}`;
    Command
      .add(moveLocalCommand)
      .add(tarCommand)
      .add(moveExternalCommand)
      .add(removeTarCommand)
      .add(removeEcoCommand);
    const initCmd = Command.getCommand();
    
    return new Promise((resolve: any, reject: any) => {
      const buildChild: ChildProcess = childExec(initCmd);
        buildChild.on('close', () => {
          console.log('finished bundling, please check your bundleFile');
          resolve(true);
        })
        buildChild.on('error', (err) => {
          reject("nest bundle failed" + err);
      })
    });
  }
  return { exec };
};

export default NestBundler;
