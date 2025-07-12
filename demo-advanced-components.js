#!/usr/bin/env node

/**
 * Advanced Components Demo Runner
 * 
 * Standalone demo to showcase the advanced Ink components
 * with animations, transitions, and responsive behavior.
 */

import React from 'react';
import { render } from 'ink';
import AdvancedInkDemo from './src/components/AdvancedInkDemo.js';

console.log('🎼 Starting Advanced Ink Components Demo...\n');

// Render the demo application
const { waitUntilExit } = render(React.createElement(AdvancedInkDemo));

// Wait for the application to exit
waitUntilExit().then(() => {
  console.log('\n🎉 Demo completed! Thanks for exploring submitit advanced components.');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Demo error:', error);
  process.exit(1);
});