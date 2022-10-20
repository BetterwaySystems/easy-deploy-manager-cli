import React, { useEffect, useState } from "react";
import fs from "fs";
import { Text } from "ink";
import Bundler from "../modules/bundler/index";
import Builder from "../modules/builder/index";
import PM2Handler from "../modules/PM2Handler";

const Bundle = (props: any) => {
  // TODO 쓰기 및 참조 작업 전 항상 대상디렉토리가 존재하는지 확인 후 진행
  /**
   * init 커맨드에서 생성 된 easy-deploy.json을 핸들링하기 위해 JSON형태 파싱
   */
  const easyDeployFilePath = `${process.cwd()}/easy-deploy.json`;
  const config: IEasyDeployConfig = JSON.parse(
    fs.readFileSync(easyDeployFilePath, "utf-8")
  );

  /**
   * 빌드 결과가 저장 될 디렉토리
   */
  const defaultOutputPath = `${process.cwd()}/bundle`;

  /**
   * output or o 옵션이 들어오는 경우 옵션 값을 우선함
   */
  config.output = props.output || props.o || defaultOutputPath;

  /**
   * pm2 ecosystem.config 생성 테스트용도
   */
  const pm2handler = new (PM2Handler as any)(config);
  pm2handler.generateEcoSystemConfig(config);

  /**
   * build 결과가 저장 될 디렉토리가 없다면 생성
   */
  if (!fs.existsSync(defaultOutputPath)) {
    fs.mkdirSync(defaultOutputPath);
  }

  /**
   * config.buildType에 따른 Builder And Bundler를 가져옴
   */
  const builder: IBuilder = Builder(config);
  const bundler: IBundler = Bundler(config);

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
