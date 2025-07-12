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

export const PreviewPanel = ({ theme, files }) => {
  const getThemeDescription = (theme) => {
    switch (theme) {
      case 'noir':
        return 'Dark, sophisticated styling with high contrast';
      case 'academic':
        return 'Clean, professional layout suitable for academic work';
      case 'brutalist':
        return 'Bold, geometric design with strong typography';
      case 'modern':
        return 'Clean, minimalist design with subtle animations';
      default:
        return 'Simple, elegant styling';
    }
  };

  return (
    <Box flexDirection="column">
      <Text bold color="magenta">🎨 Preview</Text>
      
      <Box marginTop={1} flexDirection="column">
        <Box borderStyle="single" borderColor="magenta" padding={1}>
          <Box flexDirection="column">
            <Text bold color="white">Theme: {chalk.cyan(theme)}</Text>
            <Text color="gray">{getThemeDescription(theme)}</Text>
          </Box>
        </Box>
        
        <Box marginTop={1} borderStyle="single" borderColor="cyan" padding={1}>
          <Box flexDirection="column">
            <Text bold color="white">Layout Preview</Text>
            <Box marginTop={1}>
              {files.length > 0 ? (
                files.map((file, index) => (
                  <Box key={index} marginTop={0}>
                    <Text color="gray">
                      [{index + 1}] {file.name} - {file.type}
                    </Text>
                  </Box>
                ))
              ) : (
                <Text color="gray">No files added yet</Text>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Box marginTop={1}>
        <Text color="green">
          ✅ Preview ready - files will be arranged according to {theme} theme
        </Text>
      </Box>
    </Box>
  );
};
*/