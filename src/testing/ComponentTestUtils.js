/**
 * Component Test Utilities - Make Ink components testable
 */
import React from 'react';
import { render } from 'ink-testing-library';
import TestFramework from './TestFramework.js';

export class ComponentTester {
  constructor() {
    this.framework = new TestFramework();
  }

  /**
   * Test component with various props and edge cases
   */
  testComponent(Component, testCases) {
    const results = [];
    
    testCases.forEach(testCase => {
      this.framework.test(testCase.description, () => {
        const result = this.framework.testComponent(
          React.createElement(Component, testCase.props),
          testCase.expectedOutputs
        );
        
        if (!result.success) {
          throw new Error(
            `Component test failed: ${testCase.description}\n` +
            `Expected outputs: ${testCase.expectedOutputs.join(', ')}\n` +
            `Actual frame: ${result.frame}`
          );
        }
        
        results.push(result);
      });
    });
    
    return results;
  }

  /**
   * Test edge cases automatically
   */
  testEdgeCases(Component, baseProps = {}) {
    const edgeCases = [
      {
        description: 'handles undefined props',
        props: { ...baseProps, undefinedProp: undefined },
        expectedOutputs: [] // Should not crash
      },
      {
        description: 'handles null props', 
        props: { ...baseProps, nullProp: null },
        expectedOutputs: []
      },
      {
        description: 'handles empty string props',
        props: { ...baseProps, title: '' },
        expectedOutputs: []
      },
      {
        description: 'handles very long strings',
        props: { ...baseProps, title: 'x'.repeat(1000) },
        expectedOutputs: []
      },
      {
        description: 'handles special characters',
        props: { ...baseProps, title: '!@#$%^&*()_+{}|:"<>?[]\\;\'.,/' },
        expectedOutputs: []
      }
    ];

    return this.testComponent(Component, edgeCases);
  }

  /**
   * Performance test for component rendering
   */
  async testPerformance(Component, props, iterations = 100) {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = process.hrtime.bigint();
      
      try {
        const { lastFrame } = render(React.createElement(Component, props));
        lastFrame(); // Force render
      } catch (error) {
        // Component may not render in test environment, that's ok for perf test
      }
      
      const endTime = process.hrtime.bigint();
      times.push(Number(endTime - startTime) / 1000000); // Convert to milliseconds
    }
    
    const avgTime = times.reduce((a, b) => a + b) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    return {
      averageTime: avgTime,
      maxTime,
      minTime,
      iterations,
      times
    };
  }

  /**
   * Snapshot testing for consistent rendering
   */
  createSnapshot(Component, props, snapshotName) {
    try {
      const { lastFrame } = render(React.createElement(Component, props));
      const frame = lastFrame();
      
      return {
        name: snapshotName,
        frame,
        props,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: snapshotName,
        error: error.message,
        props,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Compare snapshots for regression testing
   */
  compareSnapshots(snapshot1, snapshot2) {
    if (snapshot1.error || snapshot2.error) {
      return {
        match: false,
        reason: 'One or both snapshots have errors',
        errors: [snapshot1.error, snapshot2.error].filter(Boolean)
      };
    }
    
    const match = snapshot1.frame === snapshot2.frame;
    
    return {
      match,
      reason: match ? 'Snapshots match' : 'Frame content differs',
      diff: match ? null : {
        snapshot1: snapshot1.frame,
        snapshot2: snapshot2.frame
      }
    };
  }

  /**
   * Run comprehensive component test suite
   */
  async runComponentSuite(Component, baseProps = {}, customTests = []) {
    console.log(`\n🔬 Testing Component: ${Component.name || 'Anonymous'}`);
    
    // Basic functionality test
    this.framework.test('renders without crashing', () => {
      const result = this.framework.testComponent(
        React.createElement(Component, baseProps),
        []
      );
      this.framework.assert.isFalse(!!result.error);
    });
    
    // Edge cases
    this.testEdgeCases(Component, baseProps);
    
    // Custom tests
    customTests.forEach(test => {
      this.framework.test(test.description, test.testFn);
    });
    
    // Performance test
    this.framework.test('performance benchmark', async () => {
      const perfResult = await this.testPerformance(Component, baseProps, 10);
      
      // Fail if average render time is over 50ms (very slow for terminal UI)
      if (perfResult.averageTime > 50) {
        throw new Error(`Component too slow: ${perfResult.averageTime}ms average`);
      }
    });
    
    return await this.framework.runTests();
  }
}

export default ComponentTester;