import React, { useEffect, useState } from "react";
import cliSpinners from "cli-spinners";
import fs from "fs";
import { Text } from "ink";
import Bundler from "../modules/bundler/index";
import Builder from "../modules/builder/index";

const Bundle = (props: any) => {
  // const [updateFrame, setUpdateFrame] = useState("");
  // let timer;

  useEffect(() => {
    // const pointSpinner = cliSpinners.point;
    // const { frames, interval } = pointSpinner;
    // let i = 0;
    // timer = setInterval(() => {
    //   const dynamicFrameText =
    //     frames[(i = ++i % frames.length)] + " - bundling - ";
    //   console.log(dynamicFrameText);
    // }, interval);
  });

  const testInitFileDir = `${process.cwd()}/ed-manager.json`;
  const config: any = JSON.parse(fs.readFileSync(testInitFileDir, "utf-8"));

  const defaultOutputPath = `${process.cwd()}/ed-output`;
  config.output = props.output || props.o || defaultOutputPath;

  if (!fs.existsSync(defaultOutputPath)) {
    fs.mkdirSync(defaultOutputPath);
  }

  const builder: IBuilder = Builder(config);
  const bundler: IBundler = Bundler(config);

  try {
    builder.exec();
    bundler.exec();
  } catch (e: any) {
    throw new Error(e);
  }

  return (
    <>
      <Text></Text>
    </>
  );
};

export default Bundle;
