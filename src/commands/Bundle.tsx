import React from "react";
import fs from "fs";
import Bundler from "../modules/bundler/index";
import Builder from "../modules/builder/index";

interface IBundler {
  exec(): string;
}

interface IBuilder {}

const Bundle = (props: any) => {
  console.log("props", props);
  const testInitFileDir = `${process.cwd()}/ed-manager.json`;
  const config = JSON.parse(fs.readFileSync(testInitFileDir, "utf-8"));

  const defaultOutputPath = `${process.cwd()}/ed-output`;
  config.output = props.output || props.o || defaultOutputPath;

  console.log("config.output", config.output);

  const builder: IBuilder = Builder(config);
  console.log("builder", builder);

  // deploy 연계 시 프로세스 다시 생성하는 여부에 따라 command로 리턴되도록 변경
  const bundler: IBundler = Bundler(config);
  bundler.exec();

  return <></>;
};

export default Bundle;
