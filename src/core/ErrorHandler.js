/**
 * Base Error Handling System - Readable error messages with context
 */
import chalk from 'chalk';
import { getCurrentTheme } from '../ui/theme.js';

export class SubmititError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = 'SubmititError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

export class ErrorHandler {
  constructor(theme = 'neon') {
    this.theme = getCurrentTheme(theme);
    this.errorHistory = [];
    this.debugMode = process.env.DEBUG === 'true';
  }

  /**
   * Handle and format errors with readable messages
   */
  handle(error, operation = 'unknown') {
    const errorInfo = {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      operation,
      timestamp: new Date().toISOString(),
      stack: error.stack
    };

    this.errorHistory.push(errorInfo);
    
    // Format user-friendly error message
    const userMessage = this.formatUserMessage(error, operation);
    
    if (this.debugMode) {
      this.printDebugError(errorInfo);
    } else {
      this.printUserError(userMessage, error.code);
    }

    return errorInfo;
  }

  /**
   * Format readable error messages for users
   */
  formatUserMessage(error, operation) {
    const suggestions = this.getSuggestions(error.code || error.message, operation);
    
    return {
      title: this.getErrorTitle(error.code || 'UNKNOWN'),
      description: this.sanitizeMessage(error.message),
      suggestions,
      operation
    };
  }

  /**
   * Get user-friendly error titles
   */
  getErrorTitle(code) {
    const titles = {
      'ENOENT': 'File Not Found',
      'EACCES': 'Permission Denied', 
      'EMFILE': 'Too Many Open Files',
      'ENOTDIR': 'Invalid Directory',
      'EISDIR': 'Cannot Process Directory',
      'YAML_PARSE_ERROR': 'Configuration Error',
      'VALIDATION_ERROR': 'Input Validation Failed',
      'NINJA_BUILD_ERROR': 'Build Process Failed',
      'LAYOUT_ERROR': 'Layout Calculation Failed',
      'UNKNOWN': 'Unexpected Error'
    };
    
    return titles[code] || 'System Error';
  }

  /**
   * Provide helpful suggestions based on error type
   */
  getSuggestions(errorCode, operation) {
    const suggestionMap = {
      'ENOENT': [
        'Check if the file path is correct',
        'Verify the file exists in the project directory',
        'Run "submitit init <name>" if not in a project'
      ],
      'EACCES': [
        'Check file permissions',
        'Try running with appropriate permissions',
        'Ensure you own the file or directory'
      ],
      'YAML_PARSE_ERROR': [
        'Check your submitit.config.json for syntax errors',
        'Validate JSON format using an online validator',
        'Reset config with "submitit init --reset"'
      ],
      'NINJA_BUILD_ERROR': [
        'Clear build cache with "submitit build --clean"',
        'Check for circular dependencies in your files',
        'Run with --debug-build to see detailed logs'
      ],
      'LAYOUT_ERROR': [
        'Simplify your layout configuration',
        'Check for conflicting CSS properties',
        'Run with --debug-layout to see Yoga tree'
      ]
    };

    return suggestionMap[errorCode] || [
      'Try running the command again',
      'Check the documentation for this operation',
      'Report this issue if it persists'
    ];
  }

  /**
   * Clean up error messages for user display
   */
  sanitizeMessage(message) {
    // Remove file paths and technical details for cleaner UX
    return message
      .replace(/\/[^\/\s]+\/[^\/\s]+\/[^\s]+/g, '.../<file>')
      .replace(/Error: /g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Print user-friendly error
   */
  printUserError(userMessage, code) {
    console.log('');
    console.log(chalk.hex(this.theme.error)('✗ ') + 
                chalk.bold(userMessage.title));
    console.log(chalk.gray(userMessage.description));
    
    if (userMessage.suggestions.length > 0) {
      console.log('');
      console.log(chalk.hex(this.theme.text)('💡 Suggestions:'));
      userMessage.suggestions.forEach(suggestion => {
        console.log(chalk.hex(this.theme.text)(`  • ${suggestion}`));
      });
    }
    
    if (code && code !== 'UNKNOWN') {
      console.log('');
      console.log(chalk.gray(`Error code: ${code}`));
    }
    console.log('');
  }

  /**
   * Print detailed debug error information  
   */
  printDebugError(errorInfo) {
    console.log('');
    console.log(chalk.hex(this.theme.error)('🐛 DEBUG ERROR DETAILS'));
    console.log(chalk.hex(this.theme.border)('='.repeat(50)));
    console.log(chalk.hex(this.theme.text)(`Operation: ${errorInfo.operation}`));
    console.log(chalk.hex(this.theme.text)(`Code: ${errorInfo.code}`));
    console.log(chalk.hex(this.theme.text)(`Message: ${errorInfo.message}`));
    console.log(chalk.hex(this.theme.text)(`Time: ${errorInfo.timestamp}`));
    
    if (errorInfo.stack) {
      console.log(chalk.hex(this.theme.text)('Stack trace:'));
      console.log(chalk.gray(errorInfo.stack));
    }
    console.log('');
  }

  /**
   * Create typed errors for different operations
   */
  createError(code, message, context = {}) {
    return new SubmititError(message, code, context);
  }

  /**
   * Wrap async operations with error handling
   */
  async wrapAsync(operation, operationName, fn) {
    try {
      return await fn();
    } catch (error) {
      this.handle(error, operationName);
      throw error;
    }
  }

  /**
   * Get error history for debugging
   */
  getErrorHistory() {
    return this.errorHistory;
  }

  /**
   * Clear error history
   */
  clearHistory() {
    this.errorHistory = [];
  }
}

// Global error handler instance
export const globalErrorHandler = new ErrorHandler();

// Process-wide error handling
process.on('uncaughtException', (error) => {
  globalErrorHandler.handle(error, 'uncaught-exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  globalErrorHandler.handle(error, 'unhandled-rejection');
});

export default ErrorHandler;