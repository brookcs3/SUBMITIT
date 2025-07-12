/**
 * Retro-futuristic Ink Application - Main CLI Interface
 * Non-JSX Node.js compatible implementation
 */
import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import createDesktop from './Desktop.js';
import { getCurrentTheme } from './theme.js';
import chalk from 'chalk';

export function createRetroInkApp({ 
  theme = 'neon',
  debugLayout = false,
  enhanced = false 
}) {
  const currentTheme = getCurrentTheme(theme);
  const { exit } = useApp();
  const [showHelp, setShowHelp] = useState(false);

  useInput((input, key) => {
    // Global hotkeys
    if (key.escape || (key.ctrl && input === 'c')) {
      exit();
    }
    
    if (input === '?' || input === 'h') {
      setShowHelp(!showHelp);
    }

    if (input === 't') {
      // Theme toggle would go here in full implementation
      console.log('[debug] Theme toggle pressed (not implemented)');
    }
  });

  // Help overlay
  if (showHelp) {
    return React.createElement(Box, {
      flexDirection: 'column',
      height: '100%',
      borderStyle: 'double',
      borderColor: currentTheme.accent,
      padding: 2
    }, [
      React.createElement(Text, {
        key: 'title',
        bold: true,
        color: currentTheme.accent
      }, '✧ SUBMITIT RETRO DESKTOP HELP ✧'),
      
      React.createElement(Text, { key: 'space1' }, ''),
      
      React.createElement(Text, {
        key: 'controls-title',
        bold: true,
        color: currentTheme.text
      }, 'Window Controls:'),
      
      React.createElement(Text, {
        key: 'tab-help',
        color: currentTheme.text
      }, '  Tab          - Cycle focus between windows'),
      
      React.createElement(Text, {
        key: 'space-help',
        color: currentTheme.text
      }, '  Space        - Pick up/drop focused window'),
      
      React.createElement(Text, {
        key: 'arrows-help',
        color: currentTheme.text
      }, '  ← → ↑ ↓     - Move drag cursor (when dragging)'),
      
      React.createElement(Text, {
        key: 'enter-help',
        color: currentTheme.text
      }, '  Enter        - Drop window at target position'),
      
      React.createElement(Text, { key: 'space2' }, ''),
      
      React.createElement(Text, {
        key: 'global-title',
        bold: true,
        color: currentTheme.text
      }, 'Global Controls:'),
      
      React.createElement(Text, {
        key: 'help-help',
        color: currentTheme.text
      }, '  ? or h       - Toggle this help'),
      
      React.createElement(Text, {
        key: 'theme-help',
        color: currentTheme.text
      }, '  t            - Toggle theme (neon/crt)'),
      
      React.createElement(Text, {
        key: 'quit-help',
        color: currentTheme.text
      }, '  Esc or Ctrl+C - Quit application'),
      
      React.createElement(Text, { key: 'space3' }, ''),
      
      React.createElement(Text, {
        key: 'close-help',
        color: currentTheme.warning
      }, 'Press ? or h again to close help')
    ]);
  }

  // Main desktop interface
  return createDesktop({ theme, debugLayout, enhanced });
}

export default createRetroInkApp;