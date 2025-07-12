import React from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';

function TestApp() {
  const { exit } = useApp();
  
  useInput((input, key) => {
    if (key.ctrl && key.name === 'c') {
      exit();
    }
    if (input === 'q') {
      exit();
    }
  });

  return React.createElement(Box, { flexDirection: 'column', padding: 1 },
    React.createElement(Text, { color: 'green', bold: true }, '🎉 Ink + Yoga Working!'),
    React.createElement(Text, { color: 'cyan' }, 'This proves the integration is working'),
    React.createElement(Text, { color: 'gray' }, 'Press q to quit, Ctrl+C to exit'),
    React.createElement(Box, { marginTop: 1, padding: 1, borderStyle: 'round' },
      React.createElement(Text, { color: 'yellow' }, '📦 SUBMITIT CLI'),
      React.createElement(Text, { color: 'white' }, 'Ink interface is ready for components!')
    )
  );
}

render(React.createElement(TestApp));