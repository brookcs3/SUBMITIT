import React from 'react';
import { Box, Text } from 'ink';

export const PreviewPanel = ({ layout, theme }) => {
  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color="magenta" bold>
        🎨 Preview Panel
      </Text>
      
      <Box flexDirection="column" marginTop={1} paddingX={2}>
        <Box flexDirection="row" justifyContent="space-between">
          <Text color="cyan">Theme:</Text>
          <Text color="white">{theme || 'default'}</Text>
        </Box>
        
        <Box flexDirection="row" justifyContent="space-between" marginTop={1}>
          <Text color="cyan">Layout:</Text>
          <Text color="white">{layout?.type || 'column'}</Text>
        </Box>
        
        <Box marginTop={1}>
          <Text color="gray" italic>
            {layout?.children?.length > 0 ? 
              `${layout.children.length} items arranged` : 
              'No layout generated yet'
            }
          </Text>
        </Box>
        
        <Box marginTop={2} padding={1} borderStyle="round" borderColor="gray">
          <Text color="yellow">
            🖼️ Layout Preview
          </Text>
          <Box flexDirection="column" marginTop={1}>
            {layout?.children?.map((child, index) => (
              <Box key={index} flexDirection="row" marginY={0}>
                <Text color="blue">▪</Text>
                <Text color="white" marginLeft={1}>
                  {child.name} ({child.type})
                </Text>
              </Box>
            )) || (
              <Text color="gray" italic>
                Add files to see layout preview
              </Text>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};