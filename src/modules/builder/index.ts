// import validator from "../../modules/common/validator";
import NextBuilder from "./next";
import NestBuilder from "./nest";

const Builders = {
  next: NextBuilder,
  nest: NestBuilder,
};

function Builder(config: any): any {
  return Builders[config.buildType as TBuildType](config);
}

export default Builder;
