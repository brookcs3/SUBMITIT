/**
 * Type definitions for AestheticTestingSuite
 */

declare module './AestheticTestingSuite' {
  /**
   * Interface for test results
   */
  export interface TestResult {
    /** Test name/identifier */
    name: string;
    /** Whether the test passed */
    passed: boolean;
    /** Optional error message if the test failed */
    error?: string;
    /** Additional details about the test result */
    details?: Record<string, any>;
  }

  /**
   * Interface for test suite options
   */
  export interface TestSuiteOptions {
    /** Whether to run tests in parallel (default: false) */
    parallel?: boolean;
    /** Whether to stop on first failure (default: false) */
    bail?: boolean;
    /** Timeout in milliseconds for each test (default: 5000) */
    timeout?: number;
    /** Test environment setup */
    environment?: Record<string, any>;
  }

  /**
   * Interface for test case
   */
  export interface TestCase {
    /** Test name */
    name: string;
    /** Test function */
    fn: () => Promise<void> | void;
    /** Test timeout in milliseconds */
    timeout?: number;
    /** Whether the test is skipped */
    skip?: boolean;
    /** Whether the test is marked as todo */
    todo?: boolean;
    /** Whether the test is marked as only */
    only?: boolean;
  }

  /**
   * A suite for testing aesthetic components and layouts
   */
  export default class AestheticTestingSuite {
    /**
     * Create a new test suite
     * @param options Test suite options
     */
    constructor(options?: TestSuiteOptions);

    /**
     * Add a test case to the suite
     * @param name Test name
     * @param fn Test function
     */
    test(name: string, fn: () => Promise<void> | void): void;

    /**
     * Add a test case that's expected to fail
     * @param name Test name
     * @param fn Test function
     */
    test.failing(name: string, fn: () => Promise<void> | void): void;

    /**
     * Add a test case that's marked as todo
     * @param name Test name
     */
    test.todo(name: string): void;

    /**
     * Add a test case that's marked as only
     * @param name Test name
     * @param fn Test function
     */
    test.only(name: string, fn: () => Promise<void> | void): void;

    /**
     * Add a test case that's marked as skip
     * @param name Test name
     * @param fn Test function
     */
    test.skip(name: string, fn: () => Promise<void> | void): void;

    /**
     * Run all tests in the suite
     */
    run(): Promise<TestResult[]>;

    /**
     * Generate a visual representation of the test results
     * @param results Test results to visualize
     */
    generateVisualRepresentations(results: TestResult[]): Promise<string>;

    /**
     * Generate a report of the test results
     * @param results Test results to include in the report
     */
    generateReport(results: TestResult[]): string;

    /**
     * Generate a summary of the test results
     * @param results Test results to summarize
     */
    generateSummary(results: TestResult[]): string;
  }
}
