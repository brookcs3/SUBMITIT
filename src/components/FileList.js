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

export const FileList = ({ files }) => {
  const getFileIcon = (type) => {
    switch (type) {
      case 'document':
        return '📄';
      case 'image':
        return '🖼️';
      case 'text':
        return '📝';
      case 'audio':
        return '🎵';
      case 'video':
        return '🎬';
      default:
        return '📎';
    }
  };

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">📁 Files</Text>
      {files.map((file, index) => (
        <Box key={index} marginTop={0}>
          <Text color="gray">
            {getFileIcon(file.type)} {file.name}
          </Text>
          <Text color="gray" marginLeft={2}>
            ({file.size})
          </Text>
        </Box>
      ))}
    </Box>
  );
};
*/