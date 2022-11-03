import React, { useEffect, useState } from 'react';
import { Text } from 'ink';
import Bundler from '../modules/bundler/index';
import Builder from '../modules/builder/index';

const Bundle = (props: any) => {
  const builder: IBuilder = Builder();
  const bundler: IBundler = Bundler(props);

  async function execHandler() {
    try {
      console.log('---------- build start ----------');
      await builder.exec();
      console.log('---------- build success ----------');
      console.log('---------- bundle start ----------');
      await bundler.exec();
      console.log('---------- bundle success ----------');
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
