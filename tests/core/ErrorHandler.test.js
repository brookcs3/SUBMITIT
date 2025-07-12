/**
 * Error Handler Tests
 */
import ErrorHandler, { SubmititError } from '../../src/core/ErrorHandler.js';
import TestFramework from '../../src/testing/TestFramework.js';
import { mockFactory } from '../../src/testing/MockingUtils.js';

const framework = new TestFramework();

// Test SubmititError creation
framework.test('SubmititError creates properly', () => {
  const error = new SubmititError('Test message', 'TEST_CODE', { file: 'test.js' });
  
  framework.assert.equals(error.message, 'Test message');
  framework.assert.equals(error.code, 'TEST_CODE');
  framework.assert.equals(error.context.file, 'test.js');
  framework.assert.isTrue(error.name === 'SubmititError');
  framework.assert.isTrue(error.timestamp.length > 0);
});

// Test ErrorHandler instantiation
framework.test('ErrorHandler instantiates with theme', () => {
  const handler = new ErrorHandler('neon');
  framework.assert.isTrue(handler.theme.border === '#6aa9ff');
  framework.assert.isTrue(Array.isArray(handler.errorHistory));
});

// Test error handling and formatting
framework.test('ErrorHandler formats user messages correctly', () => {
  const handler = new ErrorHandler('neon');
  const error = new Error('File not found: /some/long/path/file.txt');
  error.code = 'ENOENT';
  
  const userMessage = handler.formatUserMessage(error, 'file-read');
  
  framework.assert.equals(userMessage.title, 'File Not Found');
  framework.assert.includes(userMessage.description, 'File not found');
  framework.assert.isTrue(userMessage.suggestions.length > 0);
  framework.assert.includes(userMessage.suggestions[0], 'Check if the file path');
});

// Test error suggestions
framework.test('ErrorHandler provides relevant suggestions', () => {
  const handler = new ErrorHandler();
  
  const suggestions = handler.getSuggestions('ENOENT', 'file-read');
  framework.assert.isTrue(suggestions.length > 0);
  framework.assert.includes(suggestions[0], 'Check if the file path');
  
  const yamlSuggestions = handler.getSuggestions('YAML_PARSE_ERROR', 'config-load');
  framework.assert.includes(yamlSuggestions[0], 'Check your submitit.config.json');
});

// Test message sanitization
framework.test('ErrorHandler sanitizes messages', () => {
  const handler = new ErrorHandler();
  
  const dirtyMessage = 'Error: File not found at /very/long/system/path/file.txt with details';
  const clean = handler.sanitizeMessage(dirtyMessage);
  
  framework.assert.includes(clean, '.../<file>');
  framework.assert.isFalse(clean.includes('Error: '));
  framework.assert.isFalse(clean.includes('/very/long/system/path/'));
});

// Test async operation wrapping
framework.test('ErrorHandler wraps async operations', async () => {
  const handler = new ErrorHandler();
  
  // Mock console.log to prevent output during test
  const consoleMock = mockFactory.createFunctionMock('console.log');
  const originalLog = console.log;
  console.log = consoleMock.fn;
  
  try {
    // Should catch and re-throw the error
    await framework.assert.throws(async () => {
      await handler.wrapAsync('test-operation', 'test', async () => {
        throw new Error('Test async error');
      });
    }, 'Test async error');
    
    // Should have logged the error
    framework.assert.isTrue(handler.errorHistory.length > 0);
    framework.assert.equals(handler.errorHistory[0].operation, 'test');
    
  } finally {
    console.log = originalLog;
  }
});

// Test error history management
framework.test('ErrorHandler manages error history', () => {
  const handler = new ErrorHandler();
  
  // Initially empty
  framework.assert.equals(handler.getErrorHistory().length, 0);
  
  // Add some errors
  handler.handle(new Error('Error 1'), 'op1');
  handler.handle(new Error('Error 2'), 'op2');
  
  const history = handler.getErrorHistory();
  framework.assert.equals(history.length, 2);
  framework.assert.equals(history[0].operation, 'op1');
  framework.assert.equals(history[1].operation, 'op2');
  
  // Clear history
  handler.clearHistory();
  framework.assert.equals(handler.getErrorHistory().length, 0);
});

// Test createError helper
framework.test('ErrorHandler creates typed errors', () => {
  const handler = new ErrorHandler();
  
  const error = handler.createError('TEST_CODE', 'Test message', { context: 'test' });
  
  framework.assert.isTrue(error instanceof SubmititError);
  framework.assert.equals(error.code, 'TEST_CODE');
  framework.assert.equals(error.message, 'Test message');
  framework.assert.equals(error.context.context, 'test');
});

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  framework.runTests().then(results => {
    mockFactory.clearAllMocks();
    const failed = results.filter(r => r.status === 'failed').length;
    process.exit(failed > 0 ? 1 : 0);
  });
}

export { framework as errorHandlerTests };
export default framework;