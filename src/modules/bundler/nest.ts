import { ChildProcess, exec as childExec } from 'child_process';
import ts from 'typescript';
import CommandBuilder from '../common/commandBuilder';

const NestBundler = function (this: any, config: any, bundleOptions:Record<string, any>): any {
  const PACKAGE_NPM = 'package.json package-lock.json tsconfig.build.json';
  const PACKAGE_YARN = 'package.json yarn.lock tsconfig.build.json';
  const PACKAGE_PNPM = 'package.json pnpm-lock.yaml tsconfig.build.json';

  const OUT_PUT_DIR = config.output;
  const BUNDLE_FILE = 'bundle.tar';

  const { writedEcosystemLocationInfo, output } = bundleOptions;
  const { packageManager } = config;

  const findManager = (): string => {
    switch(packageManager) {
      case 'npm':
        return PACKAGE_NPM;
      case 'yarn':
        return PACKAGE_YARN;
      case 'pnpm':
        return PACKAGE_PNPM;
      default:
        // 초기버전은 npm만 지원, config 파일에 packageManager 없기 때문에 default는 npm으로 설치
        return PACKAGE_NPM;
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

    const Command = new CommandBuilder();
    
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
