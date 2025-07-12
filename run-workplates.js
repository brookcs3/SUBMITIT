#!/usr/bin/env node

import { render } from 'ink';
import React from 'react';
import { WorkPlatesApp } from './src/components/WorkPlatesApp.js';

console.log('🎨 Starting Work Plates standalone...\n');

// Mock config for testing
const mockConfig = {
  name: 'Test Project',
  theme: 'minimal',
  files: [
    { name: 'example.txt', type: 'text', role: 'content', size: '1.2 KB' },
    { name: 'image.jpg', type: 'image', role: 'gallery', size: '250 KB' },
    { name: 'script.js', type: 'javascript', role: 'code', size: '5.1 KB' }
  ]
};

// Launch the interface
const { waitUntilExit } = render(
  React.createElement(WorkPlatesApp, {
    projectPath: process.cwd(),
    config: mockConfig,
    onExit: () => process.exit(0)
  })
);

await waitUntilExit();