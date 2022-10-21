import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import fs from "fs";
const BUNDLE_FOLDER = "bundle";

import { getRemoteServer, PM2Handler } from "../modules";
import Builder from "../modules/builder";
import Bundler from "../modules/bundler";

const Deploy = (props: any) => {
  const { config } = props;
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [messageColor, setMessageColor] = useState<string>();

  if (props.output || props.o) {
    config.output = props.output || props.o;
  }

  const pm2handler = new (PM2Handler as any)(config);
  const ecosystemConfigLocation = pm2handler.generateEcoSystemConfig(config);

  const options = {
    ecosystemConfigLocation,
  };

  if (!fs.existsSync(config.output)) {
    fs.mkdirSync(config.output);
    fs.mkdirSync(config.output + "/" + BUNDLE_FOLDER);
  }

  async function DeployModule() {
    const { appName, server } = config;

    const builder: IBuilder = Builder(config);
    const bundler: IBundler = Bundler(config, options);
    const remoteServer = await getRemoteServer(server);

    const appDir = `${server.deploymentDir}/${appName}/bundle`;

    try {
      if (!remoteServer) {
        setMessageColor("red");
        setMessage("Failed: Can't connect remote server.");

        return false;
      }

      setMessageColor("blue");

      setMessage("Process : Build start");
      await builder.exec();

      setMessage("Process : Bundle start");
      await bundler.exec();

      setMessage("Process : Node install check");
      await remoteServer.installNode();

      setMessage("Process : PM2 install check");
      await remoteServer.installPM2();

      setMessage("Process : Upload bundle");
      await remoteServer.putFile(
        `${config.output}/bundle.tar`,
        appDir + ".tar"
      );

      setMessage("Process : Unzip bundle");
      await remoteServer.extractTarBall(appDir + ".tar");

      setMessage("Process : node_modules install");
      await remoteServer.exec(
        `cd ${appDir} && ${
          ["npm", "pnpm"].includes(config.packageManager)
            ? `${config.packageManager} i --legacy-peer-deps`
            : `${config.packageManager}`
        }`
      );

      setMessage("Process : Application start");
      await remoteServer.startApp(appName, server.deploymentDir);

      setMessageColor("green");
      setMessage(`Success: Deployed successfully on ${server.host}`);
      await remoteServer.close();
    } catch (e) {
      setMessageColor("red");
      setMessage("Failed:\n" + e);
      await remoteServer.close();
    }

    return true;
  }

  useEffect(() => {
    DeployModule();
  }, []);

  return (
    <>
      <Box>
        <Text color={"red"}>D</Text>
        <Text color={"#ffa500"}>e</Text>
        <Text color={"yellow"}>p</Text>
        <Text color={"green"}>l</Text>
        <Text color={"blue"}>o</Text>
        <Text color={"#8b00ff"}>y</Text>
      </Box>
      <Box>
        <Text color={messageColor}>{message}</Text>
      </Box>
    </>
  );
};

export default Deploy;
