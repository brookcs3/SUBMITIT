/**
 * Retro-futuristic Window Component - Non-JSX Node.js compatible
 */
import React from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';
import { getCurrentTheme } from './theme.js';

export function createWindow({
  title = 'Untitled',
  width = 60,
  height = 20,
  focused = false,
  dragged = false,
  theme = 'neon',
  children
}) {
  const currentTheme = getCurrentTheme(theme);
  
  return React.createElement(Box, {
    flexDirection: 'column',
    width,
    height,
    borderStyle: 'round',
    borderColor: focused ? currentTheme.accent : currentTheme.border,
    opacity: dragged ? 0.5 : 1,
    paddingX: 1
  }, [
    // Title bar with traffic lights
    React.createElement(Box, {
      key: 'titlebar',
      justifyContent: 'space-between'
    }, [
      React.createElement(Text, { key: 'lights' }, 
        chalk.hex(currentTheme.border)('◯ ◯ ◯')
      ),
      React.createElement(Text, { key: 'title' }, 
        chalk.hex(currentTheme.text)(title)
      ),
      React.createElement(Text, { key: 'spacer' }, ' ')
    ]),
    
    // Neon divider line
    React.createElement(Box, {
      key: 'divider',
      marginY: 0,
      width: '100%'
    }, 
      React.createElement(Text, {}, 
        chalk.hex(currentTheme.border)('─'.repeat(width - 2))
      )
    ),
    
    // Content area
    React.createElement(Box, {
      key: 'content',
      flexGrow: 1
    }, children)
  ]);
}

export default createWindow;