import React from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';

export const FileList = ({ files, selectedIndex = 0 }) => {
  if (!files || files.length === 0) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text color="gray" italic>
          No files added yet. Use 'submitit add <files>' to add content.
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color="yellow" bold>
        📁 Project Files ({files.length})
      </Text>
      <Box flexDirection="column" marginTop={1}>
        {files.map((file, index) => (
          <Box key={index} flexDirection="row" paddingY={0}>
            <Text color={index === selectedIndex ? "green" : "white"}>
              {index === selectedIndex ? "▶ " : "  "}
              {getFileIcon(file.type)} {file.name}
            </Text>
            <Text color="gray" marginLeft={2}>
              ({file.size}) {file.type}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

function getFileIcon(type) {
  const icons = {
    'image': '🖼️',
    'document': '📄',
    'text': '📝',
    'audio': '🎵',
    'video': '🎬',
    'file': '📎'
  };
  return icons[type] || icons.file;
}