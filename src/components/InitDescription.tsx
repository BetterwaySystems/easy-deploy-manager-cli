import React from 'react';
import { Text, Box, Newline } from 'ink';

const InitDescription = () => {
  return (
    <Box flexDirection="column">
      <Box>
        <Box borderStyle="classic" paddingX={2} paddingY={1} flexDirection="column" alignItems="center">
          <Text color="blue">Easy Deploy Manger CLI</Text>
          <Newline />
          <Text>version: v1.0.0</Text>
          <Text>source: github</Text>
        </Box>
      </Box>
      <Newline />
      <Box flexDirection="column">
        <Text>
          🔆 This utility will make you through creating a <Text color="orange">easy-deploy.json</Text> file.
        </Text>
        <Text>🔥 It only covers the most common items, and tries to guess sensible default.</Text>
        {/* <Newline />
        <Text>If you press enter, item is filled with default value.</Text> */}
        <Newline />
        {/* <Text color="green">Welcome to Easy Deploy Manager CLI</Text> */}
      </Box>
    </Box>
  );
};

export default InitDescription;
