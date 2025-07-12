// DISABLED: This file contains JSX syntax that crashes Node.js
// TODO: Convert JSX to React.createElement or compile with Babel
console.log('⚠️  JSX component disabled - needs conversion');
export default function DisabledComponent() {
  return null;
}

/* ORIGINAL CODE (commented out to prevent crashes):
import React from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';

export const Banner = () => {
  return (
    <Box flexDirection="column">
      <Box borderStyle="double" borderColor="green" padding={1}>
        <Text bold color="green">
          ✨ SUBMITIT - Deliverable Packaging
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color="gray">
          🧘 Transform • 🎼 Orchestrate • ⛩️ Present
        </Text>
      </Box>
    </Box>
  );
};
*/