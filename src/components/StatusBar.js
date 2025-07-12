// DISABLED: This file contains JSX syntax that crashes Node.js
// TODO: Convert JSX to React.createElement or compile with Babel
console.log('⚠️  JSX component disabled - needs conversion');
export default function DisabledComponent() {
  return null;
}

/* ORIGINAL CODE (commented out to prevent crashes):
import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import chalk from 'chalk';

export const StatusBar = ({ isLoading, status }) => {
  return (
    <Box borderStyle="single" borderColor="gray" padding={1}>
      <Box flexDirection="row" alignItems="center">
        {isLoading && (
          <Box marginRight={1}>
            <Text color="yellow">
              <Spinner type="dots" />
            </Text>
          </Box>
        )}
        <Text color={isLoading ? 'yellow' : 'green'}>
          {status}
        </Text>
      </Box>
    </Box>
  );
};
*/