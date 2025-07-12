#!/usr/bin/env node

/**
 * Simple Ink Hello World to prove it actually works
 */

import React from 'react';
import { render, Box, Text } from 'ink';

function HelloWorld() {
  return React.createElement(Box, { 
    flexDirection: 'column',
    borderStyle: 'single',
    borderColor: 'green',
    padding: 1
  },
    React.createElement(Text, { bold: true, color: 'green' }, 'Hello World from Ink!'),
    React.createElement(Text, { color: 'cyan' }, 'This proves Ink actually renders something.'),
    React.createElement(Text, { color: 'yellow' }, 'Press Ctrl+C to exit')
  );
}

const { waitUntilExit } = render(React.createElement(HelloWorld));

// Keep it running
waitUntilExit();