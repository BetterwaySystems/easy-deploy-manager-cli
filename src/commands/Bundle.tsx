import React, { useEffect, useState } from "react";
import fs from "fs";
import { Text } from "ink";
import Bundler from "../modules/bundler/index";
import Builder from "../modules/builder/index";
import PM2Handler from "../modules/PM2Handler";
import { getConfig } from "../modules/common/parseJsonFile";

const BUNDLE_FOLDER = "bundle";

const Bundle = (props: any) => {
  // TODO 쓰기 및 참조 작업 전 항상 대상디렉토리가 존재하는지 확인 후 진행
  /**
   * init 커맨드에서 생성 된 easy-deploy.json을 핸들링하기 위해 JSON형태 파싱
   */
  const config = getConfig();

  const pm2handler = new (PM2Handler as any)(config);
  const ecosystemConfigLocation = pm2handler.generateEcoSystemConfig(config);

  /**
   * output or o 옵션이 들어오는 경우 옵션 값을 우선함
   */
  if (props.output || props.o) {
    config.output = props.output || props.o;
  }

  const options = {
    ecosystemConfigLocation,
  };

  /**
   * build & bundle 결과가 저장 될 디렉토리가 없다면 생성
   */

  if (!fs.existsSync(config.output + "/" + BUNDLE_FOLDER)) {
    fs.mkdirSync(config.output + "/" + BUNDLE_FOLDER, { recursive: true });
  }

  /**
   * config.buildType에 따른 Builder And Bundler를 가져옴
   */
  const builder: IBuilder = Builder(config);
  const bundler: IBundler = Bundler(config, options);

  async function execHandler() {
    try {
      console.log("---------- build start ----------");
      await builder.exec();
      console.log("---------- build success ----------");
      console.log("---------- bundle start ----------");
      await bundler.exec();
      console.log("---------- bundle success ----------");
    } catch (err) {
      console.log(err);
    }
  }

  execHandler();

  return (
    <>
      <Text></Text>
    </>
  );
};

export default Bundle;
