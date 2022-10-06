import React, { useEffect, useState } from "react";
import fs from "fs";
import { Text } from "ink";
import Bundler from "../modules/bundler/index";
import Builder from "../modules/builder/index";
import PM2Handler from "../modules/PM2Handler";

interface IBundler {
  exec(): any;
}

interface IBuilder {
  exec(): any;
  validator(): any;
}

const Bundle = (props: any) => {
  // TODO 쓰기 및 참조 작업 전 항상 대상디렉토리가 존재하는지 확인 후 진행
  const testInitFileDir = `${process.cwd()}/easy-deploy.json`;
  /**
   * init 커맨드를 사용하여 생성 된 easy-deploy.json을 핸들링하기 위해 JSON형태 파싱
   */
  const config: any = JSON.parse(fs.readFileSync(testInitFileDir, "utf-8"));

  /**
   * 빌드 결과가 저장 될 디렉토리
   */
  const defaultOutputPath = `${process.cwd()}/ed-output`;

  /**
   * output or o 옵션이 들어오는 경우 옵션 값을 우선함
   */
  config.output = props.output || props.o || defaultOutputPath;

  /**
   * pm2 테스트용도
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

  try {
    builder.exec();
    bundler.exec();
    // TODO 디렉토리 삭제?
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
