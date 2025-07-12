import React from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';

export const Banner = () => {
  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Text color="cyan" bold>
        {chalk.cyan('┌─────────────────────────────────────────────────────────────────────────┐')}
      </Text>
      <Text color="cyan" bold>
        {chalk.cyan('│')}                          {chalk.magenta('SUBMITIT')}                             {chalk.cyan('│')}
      </Text>
      <Text color="cyan" bold>
        {chalk.cyan('│')}           {chalk.gray('Transform deliverables into polished submissions')}           {chalk.cyan('│')}
      </Text>
      <Text color="cyan" bold>
        {chalk.cyan('└─────────────────────────────────────────────────────────────────────────┘')}
      </Text>
    </Box>
  );
};