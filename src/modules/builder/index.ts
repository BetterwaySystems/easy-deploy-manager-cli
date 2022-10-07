// import validator from "../../modules/common/validator";

import NextBuilder from "./next";
import NestBuilder from "./nest";

type TBuildType = "next" | "nest";

const Builders = {
  next: NextBuilder,
  nest: NestBuilder,
};

function Builder(config: any, options?:string): any {
  // const validator = validator(config);

  // validator.existInitFile();
  // validator.existBuildType();
  // validator.existAppLocaion();

  console.log("config.buildType >>>>>>>", config.buildType);
  console.log("Builders >>>", Builders.next);
  console.log('BuildersPropOption>>>>>>', options)


  return Builders[config.buildType as TBuildType](config, options);
}

export default Builder;
