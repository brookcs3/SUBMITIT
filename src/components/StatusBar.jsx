import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

export const StatusBar = ({ status, isLoading, currentView, projectName }) => {
  return (
    <Box flexDirection="row" justifyContent="space-between" paddingX={1} paddingY={1}>
      <Box flexDirection="row">
        {isLoading && (
          <Box marginRight={1}>
            <Text color="yellow">
              <Spinner type="dots" />
            </Text>
          </Box>
        )}
        <Text color="green">
          {getStatusText(status, currentView, projectName)}
        </Text>
      </Box>
      
      <Box flexDirection="row">
        <Text color="gray">
          Press 'q' to quit • 'h' for help
        </Text>
      </Box>
    </Box>
  );
};

function getStatusText(status, currentView, projectName) {
  const statusMessages = {
    'ready': '✅ Ready',
    'loading': '⏳ Loading...',
    'error': '❌ Error',
    'success': '🎉 Success'
  };

  const viewText = currentView === 'main' && projectName ? 
    `Project: ${projectName}` : 
    `View: ${currentView}`;

  return `${statusMessages[status] || status} | ${viewText}`;
}