/**
 * Baseline Functionality Tests - Ensure core system works
 */
import TestFramework from '../../src/testing/TestFramework.js';
import ComponentTester from '../../src/testing/ComponentTestUtils.js';
import createDesktop from '../../src/ui/Desktop.js';
import createWindow from '../../src/ui/Window.js';
import createIconPlate from '../../src/ui/IconPlate.js';
import { createText, createBox, createButton } from '../../src/core/BaseComponents.js';
import React from 'react';

const framework = new TestFramework();
const componentTester = new ComponentTester();

// Test that all core components can be instantiated
framework.test('Core components instantiate without errors', () => {
  // Test base components
  const text = createText({ text: 'Test' });
  const box = createBox({ children: 'Test' });
  const button = createButton({ label: 'Test' });
  
  framework.assert.isTrue(React.isValidElement(text));
  framework.assert.isTrue(React.isValidElement(box));
  framework.assert.isTrue(React.isValidElement(button));
});

// Test retro UI components
framework.test('Retro UI components instantiate correctly', () => {
  const window = createWindow({
    title: 'Test Window',
    children: React.createElement('text', {}, 'content')
  });
  
  const iconPlate = createIconPlate({
    type: 'file',
    label: 'Test File'
  });
  
  const desktop = createDesktop({
    theme: 'neon',
    debugLayout: false
  });
  
  framework.assert.isTrue(React.isValidElement(window));
  framework.assert.isTrue(React.isValidElement(iconPlate));
  framework.assert.isTrue(React.isValidElement(desktop));
});

// Test theme system
framework.test('Theme system provides valid colors', () => {
  const { getCurrentTheme } = require('../../src/ui/theme.js');
  
  const neonTheme = getCurrentTheme('neon');
  const crtTheme = getCurrentTheme('crt');
  
  // Validate neon theme
  framework.assert.equals(neonTheme.border, '#6aa9ff');
  framework.assert.equals(neonTheme.text, '#8fbfff');
  framework.assert.equals(neonTheme.accent, '#4d7dff');
  
  // Validate crt theme
  framework.assert.equals(crtTheme.border, '#00ff41');
  framework.assert.equals(crtTheme.text, '#35ff6d');
  framework.assert.equals(crtTheme.accent, '#00ff41');
});

// Test icon system
framework.test('Icon system provides fallbacks', () => {
  const { getIcon } = require('../../src/ui/icons.js');
  
  // Test known icons
  framework.assert.equals(getIcon('file', 'single'), '▢');
  framework.assert.equals(getIcon('folder', 'single'), '▣');
  framework.assert.equals(getIcon('file', 'emoji'), '📄');
  
  // Test unknown icons fall back gracefully
  framework.assert.equals(getIcon('unknown-type', 'single'), '■');
});

// Test error handling system
framework.test('Error handling system works correctly', () => {
  const ErrorHandler = require('../../src/core/ErrorHandler.js').default;
  
  const handler = new ErrorHandler('neon');
  const testError = new Error('Test error message');
  testError.code = 'TEST_ERROR';
  
  // Should not throw when handling errors
  const errorInfo = handler.handle(testError, 'test-operation');
  
  framework.assert.equals(errorInfo.operation, 'test-operation');
  framework.assert.equals(errorInfo.code, 'TEST_ERROR');
  framework.assert.isTrue(handler.getErrorHistory().length > 0);
});

// Test component rendering baseline
framework.test('Components render basic content correctly', () => {
  const windowResult = componentTester.framework.testComponent(
    React.createElement(createWindow, {
      title: 'Test Window',
      children: React.createElement('text', {}, 'Test Content')
    }),
    ['Test Window', '◯ ◯ ◯', '─']
  );
  
  framework.assert.isTrue(windowResult.success);
  
  const iconResult = componentTester.framework.testComponent(
    React.createElement(createIconPlate, {
      type: 'file',
      label: 'Test File'
    }),
    ['Test File']
  );
  
  framework.assert.isTrue(iconResult.success);
});

// Test performance baseline
framework.test('Components render within performance baseline', async () => {
  const perfResult = await componentTester.testPerformance(
    createWindow,
    {
      title: 'Perf Test',
      children: React.createElement('text', {}, 'Content')
    },
    50 // 50 iterations
  );
  
  // Should render in under 10ms on average for terminal UI
  framework.assert.isTrue(perfResult.averageTime < 10);
  framework.assert.isTrue(perfResult.maxTime < 50);
});

// Test system integration
framework.test('Systems integrate without conflicts', () => {
  // Test that error handler and components work together
  const { globalErrorHandler } = require('../../src/core/ErrorHandler.js');
  const { componentRegistry } = require('../../src/core/BaseComponents.js');
  
  framework.assert.isTrue(globalErrorHandler.theme.border.length > 0);
  framework.assert.isTrue(Object.keys(componentRegistry).length > 0);
  
  // Test that theme system and components integrate
  const button = componentRegistry.Button({ 
    label: 'Test', 
    theme: 'crt' 
  });
  
  framework.assert.isTrue(React.isValidElement(button));
});

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  framework.runTests().then(results => {
    const failed = results.filter(r => r.status === 'failed').length;
    process.exit(failed > 0 ? 1 : 0);
  });
}

export { framework as baselineTests };
export default framework;