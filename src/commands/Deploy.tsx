import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import fs from "fs";

import { getRemoteServer, PM2Handler } from "../modules";
import Builder from "../modules/builder";
import Bundler from "../modules/bundler";

const Deploy = (props: any) => {
  const { config } = props;
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [messageColor, setMessageColor] = useState<string>();

  const defaultOutputPath = `${process.cwd()}/bundle`;

  config.output = props.output || props.o || defaultOutputPath;

  const pm2handler = new (PM2Handler as any)(config);
  const ecosystemConfigLocation = pm2handler.generateEcoSystemConfig(config);

  const options = {
    ecosystemConfigLocation,
  };

  if (!fs.existsSync(defaultOutputPath)) {
    fs.mkdirSync(defaultOutputPath);
  }

  async function DeployModule() {
    const { appName, server } = config;

    const appDir = `${server.deploymentDir}/${appName}/bundle`;

    const builder: IBuilder = Builder(config);
    const bundler: IBundler = Bundler(config, options);
    const remoteServer = await getRemoteServer(server);

    try {
      if (!remoteServer) {
        setMessageColor("red");
        setMessage("Failed: Can't connect remote server.");

        return false;
      }

      await builder.exec();
      await bundler.exec();

      console.log("\n ----------- installNode-----------");
      await remoteServer.installNode();

      console.log("\n----------- installPM2-----------");
      await remoteServer.installPM2();

      console.log("\n----------- putFile -----------");
      await remoteServer.putFile(
        `${process.cwd()}/bundle.tar`,
        appDir + ".tar",
      );

      console.log("\n----------- extractTarBall -----------");
      await remoteServer.extractTarBall(appDir + ".tar");

      console.log("\n----------- node install -----------");
      await remoteServer.exec(
        `cd ${appDir} && ${
          ["npm", "pnpm"].includes(config.packageManager)
            ? `${config.packageManager} i --legacy-peer-deps`
            : `${config.packageManager}`
        }`,
      );

      console.log("\n----------- start -----------");
      await remoteServer.exec(`cd ${appDir} && pm2 start ecosystem.config.js`);

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
