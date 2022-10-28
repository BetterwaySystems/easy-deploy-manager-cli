import NextBundler from './next';
import NestBundler from './nest';
import PM2Handler from '../PM2Handler';
import fs from 'fs';
import { getConfig } from '../common/parseJsonFile';

const Bundlers = {
  next: NextBundler,
  nest: NestBundler,
};

function Bundler(props: any): any {
  const { config, options } = props;

  const pm2handler = new (PM2Handler as any)(config);
  const writedEcosystemLocationInfo: { pwd: string; fileName: string } =
    pm2handler.generateEcoSystemConfig(config);

  const output = options.output || options.o || config.output || process.cwd();

  const bundleOptions = {
    writedEcosystemLocationInfo,
    output,
  };

  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  return Bundlers[config.buildType as TBuildType](config, bundleOptions);
}

export default Bundler;
