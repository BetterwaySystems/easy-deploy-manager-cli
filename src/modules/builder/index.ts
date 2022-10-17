// import validator from "../../modules/common/validator";
import NextBuilder from "./next";
import NestBuilder from "./nest";

const Builders = {
  next: NextBuilder,
  nest: NestBuilder,
};

function Builder(config: any): any {
  // const validator = validator(config);

  // validator.existInitFile();
  // validator.existBuildType();
  // validator.existAppLocation();

  console.log("config.buildType >>>>>>>", config.buildType);
  console.log("Builders >>>", Builders.next);

  return Builders[config.buildType as TBuildType](config);
}

export default Builder;
