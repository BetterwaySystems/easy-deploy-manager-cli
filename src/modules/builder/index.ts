// import validator from "../../modules/common/validator";
import NextBuilder from './next';
import NestBuilder from './nest';
import { getConfig } from '../common/parseJsonFile';

const Builders = {
  next: NextBuilder,
  nest: NestBuilder,
};

function Builder(): any {
  const config = getConfig();

  return Builders[config.buildType as TBuildType](config);
}

export default Builder;
