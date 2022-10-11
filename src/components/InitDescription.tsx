import React from 'react';
import { Text, Box, Newline } from 'ink';
import Markdown from 'ink-markdown';
import dedent from 'dedent';

const InitDescription = () => {
  const descriptionText = dedent`
    🔆 This utility will make you through creating a \`easy-deploy.json\` file.
    🔥 It only covers the most common items, and tries to guess sensible default.

    \`appName is essential\`, and the value you input is the default value.
  `;

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
        <Markdown>{descriptionText}</Markdown>
        <Newline />
      </Box>
    </Box>
  );
};

export default InitDescription;
