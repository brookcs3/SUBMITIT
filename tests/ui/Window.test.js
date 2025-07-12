/**
 * Window Component Tests - TDD approach
 */
import React from 'react';
import ComponentTester from '../../src/testing/ComponentTestUtils.js';
import createWindow from '../../src/ui/Window.js';

const tester = new ComponentTester();

// Test the Window component comprehensively
async function testWindowComponent() {
  const baseProps = {
    title: 'Test Window',
    width: 60,
    height: 20,
    focused: false,
    dragged: false,
    theme: 'neon',
    children: React.createElement('text', {}, 'Test content')
  };

  const customTests = [
    {
      description: 'displays title correctly',
      testFn: () => {
        const result = tester.framework.testComponent(
          React.createElement(createWindow, baseProps),
          ['Test Window']
        );
        tester.framework.assert.isTrue(result.success);
      }
    },
    {
      description: 'shows traffic lights', 
      testFn: () => {
        const result = tester.framework.testComponent(
          React.createElement(createWindow, baseProps),
          ['◯ ◯ ◯']
        );
        tester.framework.assert.isTrue(result.success);
      }
    },
    {
      description: 'renders neon divider',
      testFn: () => {
        const result = tester.framework.testComponent(
          React.createElement(createWindow, baseProps),
          ['─']
        );
        tester.framework.assert.isTrue(result.success);
      }
    },
    {
      description: 'handles focus state',
      testFn: () => {
        const focusedProps = { ...baseProps, focused: true };
        const result = tester.framework.testComponent(
          React.createElement(createWindow, focusedProps),
          ['Test Window']
        );
        tester.framework.assert.isTrue(result.success);
      }
    },
    {
      description: 'handles drag state',
      testFn: () => {
        const draggedProps = { ...baseProps, dragged: true };
        const result = tester.framework.testComponent(
          React.createElement(createWindow, draggedProps),
          ['Test Window']
        );
        tester.framework.assert.isTrue(result.success);
      }
    },
    {
      description: 'supports different themes',
      testFn: () => {
        const crtProps = { ...baseProps, theme: 'crt' };
        const result = tester.framework.testComponent(
          React.createElement(createWindow, crtProps),
          ['Test Window']
        );
        tester.framework.assert.isTrue(result.success);
      }
    }
  ];

  return await tester.runComponentSuite(createWindow, baseProps, customTests);
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testWindowComponent().then(results => {
    const failed = results.filter(r => r.status === 'failed').length;
    process.exit(failed > 0 ? 1 : 0);
  });
}

export { testWindowComponent };
export default testWindowComponent;