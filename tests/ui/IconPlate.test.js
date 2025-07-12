/**
 * IconPlate Component Tests
 */
import React from 'react';
import ComponentTester from '../../src/testing/ComponentTestUtils.js';
import createIconPlate from '../../src/ui/IconPlate.js';

const tester = new ComponentTester();

async function testIconPlateComponent() {
  const baseProps = {
    type: 'file',
    label: 'Test File',
    iconStyle: 'single',
    theme: 'neon'
  };

  const customTests = [
    {
      description: 'displays correct icon for file type',
      testFn: () => {
        const result = tester.framework.testComponent(
          React.createElement(createIconPlate, { ...baseProps, type: 'folder' }),
          ['▣'] // Single char folder icon
        );
        tester.framework.assert.isTrue(result.success);
      }
    },
    {
      description: 'displays label text',
      testFn: () => {
        const result = tester.framework.testComponent(
          React.createElement(createIconPlate, baseProps),
          ['Test File']
        );
        tester.framework.assert.isTrue(result.success);
      }
    },
    {
      description: 'handles different icon styles',
      testFn: () => {
        const emojiProps = { ...baseProps, iconStyle: 'emoji' };
        const result = tester.framework.testComponent(
          React.createElement(createIconPlate, emojiProps),
          ['📄'] // Emoji file icon
        );
        tester.framework.assert.isTrue(result.success);
      }
    },
    {
      description: 'handles unknown file types gracefully',
      testFn: () => {
        const unknownProps = { ...baseProps, type: 'unknown-type' };
        const result = tester.framework.testComponent(
          React.createElement(createIconPlate, unknownProps),
          ['■'] // Fallback icon
        );
        tester.framework.assert.isTrue(result.success);
      }
    },
    {
      description: 'supports different themes',
      testFn: () => {
        const crtProps = { ...baseProps, theme: 'crt' };
        const result = tester.framework.testComponent(
          React.createElement(createIconPlate, crtProps),
          ['Test File']
        );
        tester.framework.assert.isTrue(result.success);
      }
    }
  ];

  return await tester.runComponentSuite(createIconPlate, baseProps, customTests);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testIconPlateComponent().then(results => {
    const failed = results.filter(r => r.status === 'failed').length;
    process.exit(failed > 0 ? 1 : 0);
  });
}

export { testIconPlateComponent };
export default testIconPlateComponent;