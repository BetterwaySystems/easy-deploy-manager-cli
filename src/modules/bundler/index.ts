import NextBundler from "./next";
import NestBundler from "./nest";

const Bundlers = {
  next: NextBundler,
  nest: NestBundler,
};

function Bundler(config: any): any {
  return Bundlers[config.buildType as TBuildType](config);
}

export default Bundler;
