/**
 * Work Plate Component - Individual draggable/tiled window
 */
import React from 'react';
import { Box, Text } from 'ink';

export function createWorkPlate({ 
  title = 'Untitled', 
  content = '', 
  width = 35, 
  height = 10, 
  theme = 'default',
  isActive = false 
}) {
  const themes = {
    default: {
      border: 'single',
      borderColor: 'white',
      titleColor: 'cyan',
      contentColor: 'white'
    },
    noir: {
      border: 'double',
      borderColor: 'gray',
      titleColor: 'white',
      contentColor: 'gray'
    },
    expressive: {
      border: 'round',
      borderColor: 'magenta',
      titleColor: 'magenta',
      contentColor: 'white'
    },
    academic: {
      border: 'classic',
      borderColor: 'blue',
      titleColor: 'blue',
      contentColor: 'white'
    }
  };
  
  const currentTheme = themes[theme] || themes.default;
  const borderColor = isActive ? 'yellow' : currentTheme.borderColor;
  
  return React.createElement(Box, {
    width,
    height,
    borderStyle: currentTheme.border,
    borderColor,
    flexDirection: "column",
    padding: 1
  },
    // Title bar
    React.createElement(Box, { marginBottom: 1 },
      React.createElement(Text, { bold: true, color: currentTheme.titleColor }, title)
    ),
    // Content area
    React.createElement(Box, { flexGrow: 1 },
      React.createElement(Text, { color: currentTheme.contentColor }, 
        content.slice(0, width * (height - 3))
      )
    ),
    // Status indicator
    React.createElement(Box, { justifyContent: "flex-end" },
      React.createElement(Text, { dimColor: true, color: "gray" }, 
        isActive ? '●' : '○'
      )
    )
  );
}

export default createWorkPlate;