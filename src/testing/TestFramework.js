/**
 * Test Framework - Simple TDD framework for Ink components
 */
import { render } from 'ink-testing-library';
import chalk from 'chalk';

export class TestFramework {
  constructor() {
    this.tests = [];
    this.results = [];
    this.mocks = new Map();
  }

  /**
   * Add a test case with description and test function
   */
  test(description, testFn) {
    this.tests.push({ description, testFn });
  }

  /**
   * Create easy mock for any function or module
   */
  createMock(name, implementation = () => {}) {
    const mock = {
      fn: jest.fn(implementation),
      calls: [],
      callCount: 0,
      reset: function() {
        this.calls = [];
        this.callCount = 0;
        this.fn.mockClear();
      }
    };
    
    this.mocks.set(name, mock);
    return mock;
  }

  /**
   * Get existing mock by name
   */
  getMock(name) {
    return this.mocks.get(name);
  }

  /**
   * Test Ink component rendering
   */
  testComponent(component, expectedOutputs = []) {
    try {
      const { lastFrame, rerender } = render(component);
      const frame = lastFrame();
      
      const results = expectedOutputs.map(expected => ({
        expected,
        found: frame.includes(expected),
        frame
      }));
      
      return {
        success: results.every(r => r.found),
        frame,
        results,
        rerender
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        frame: null,
        results: []
      };
    }
  }

  /**
   * Run all tests and return detailed results
   */
  async runTests() {
    console.log(chalk.blue('\n🧪 Running Test Suite...\n'));
    
    for (const test of this.tests) {
      try {
        const startTime = Date.now();
        await test.testFn();
        const duration = Date.now() - startTime;
        
        this.results.push({
          description: test.description,
          status: 'passed',
          duration,
          error: null
        });
        
        console.log(chalk.green(`✓ ${test.description} (${duration}ms)`));
        
      } catch (error) {
        this.results.push({
          description: test.description,
          status: 'failed',
          duration: Date.now() - (Date.now()),
          error: error.message
        });
        
        console.log(chalk.red(`✗ ${test.description}`));
        console.log(chalk.red(`  Error: ${error.message}`));
        if (error.stack) {
          console.log(chalk.gray(`  ${error.stack.split('\n')[1]?.trim()}`));
        }
      }
    }
    
    this.printSummary();
    return this.results;
  }

  /**
   * Print test summary with statistics
   */
  printSummary() {
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const total = this.results.length;
    
    console.log(chalk.blue('\n📊 Test Summary'));
    console.log(chalk.blue('================'));
    console.log(chalk.green(`✓ Passed: ${passed}`));
    console.log(chalk.red(`✗ Failed: ${failed}`));
    console.log(chalk.blue(`📋 Total: ${total}`));
    
    if (failed > 0) {
      console.log(chalk.red('\n❌ Some tests failed. See details above.'));
    } else {
      console.log(chalk.green('\n✅ All tests passed!'));
    }
  }

  /**
   * Assert functions for testing
   */
  assert = {
    equals: (actual, expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    
    includes: (haystack, needle) => {
      if (!haystack.includes(needle)) {
        throw new Error(`Expected "${haystack}" to include "${needle}"`);
      }
    },
    
    isTrue: (value) => {
      if (value !== true) {
        throw new Error(`Expected true, got ${value}`);
      }
    },
    
    isFalse: (value) => {
      if (value !== false) {
        throw new Error(`Expected false, got ${value}`);
      }
    },
    
    throws: (fn, expectedError) => {
      try {
        fn();
        throw new Error('Expected function to throw');
      } catch (error) {
        if (expectedError && !error.message.includes(expectedError)) {
          throw new Error(`Expected error containing "${expectedError}", got "${error.message}"`);
        }
      }
    }
  };
}

export default TestFramework;