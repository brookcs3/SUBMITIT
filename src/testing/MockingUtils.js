/**
 * Easy Mocking Utilities for Testing
 */

export class MockFactory {
  constructor() {
    this.mocks = new Map();
    this.originalModules = new Map();
  }

  /**
   * Create a simple function mock
   */
  createFunctionMock(name, defaultReturn = undefined) {
    const mock = {
      calls: [],
      callCount: 0,
      returnValue: defaultReturn,
      implementation: null,
      
      // Mock the function
      fn: (...args) => {
        mock.calls.push(args);
        mock.callCount++;
        
        if (mock.implementation) {
          return mock.implementation(...args);
        }
        return mock.returnValue;
      },
      
      // Helper methods
      mockReturnValue: (value) => {
        mock.returnValue = value;
        return mock;
      },
      
      mockImplementation: (fn) => {
        mock.implementation = fn;
        return mock;
      },
      
      mockReset: () => {
        mock.calls = [];
        mock.callCount = 0;
        mock.returnValue = defaultReturn;
        mock.implementation = null;
        return mock;
      },
      
      // Assertions
      toHaveBeenCalled: () => mock.callCount > 0,
      toHaveBeenCalledTimes: (times) => mock.callCount === times,
      toHaveBeenCalledWith: (...expectedArgs) => {
        return mock.calls.some(args => 
          args.length === expectedArgs.length &&
          args.every((arg, i) => arg === expectedArgs[i])
        );
      }
    };
    
    this.mocks.set(name, mock);
    return mock;
  }

  /**
   * Mock a module's exports
   */
  mockModule(moduleName, mockExports) {
    const mock = {
      moduleName,
      originalExports: null,
      mockExports,
      
      restore: () => {
        if (mock.originalExports) {
          // In a real implementation, this would restore the original module
          console.log(`Restored module: ${moduleName}`);
        }
      }
    };
    
    this.mocks.set(moduleName, mock);
    return mock;
  }

  /**
   * Mock Ink components for testing
   */
  mockInkComponent(componentName) {
    return this.createFunctionMock(`Ink${componentName}`, (props) => {
      return {
        type: componentName,
        props,
        children: props.children || null
      };
    });
  }

  /**
   * Mock process.emit for event testing
   */
  mockProcessEmit() {
    const originalEmit = process.emit;
    const emittedEvents = [];
    
    const mock = this.createFunctionMock('process.emit', (...args) => {
      emittedEvents.push(args);
      return true; // process.emit returns boolean
    });
    
    // Override process.emit
    process.emit = mock.fn;
    
    mock.getEmittedEvents = () => emittedEvents;
    mock.restore = () => {
      process.emit = originalEmit;
    };
    
    return mock;
  }

  /**
   * Mock file system operations
   */
  mockFileSystem() {
    const fsOperations = [];
    
    return {
      readFile: this.createFunctionMock('fs.readFile', (path, encoding) => {
        fsOperations.push({ operation: 'readFile', path, encoding });
        return Promise.resolve('mocked file content');
      }),
      
      writeFile: this.createFunctionMock('fs.writeFile', (path, data) => {
        fsOperations.push({ operation: 'writeFile', path, data });
        return Promise.resolve();
      }),
      
      stat: this.createFunctionMock('fs.stat', (path) => {
        fsOperations.push({ operation: 'stat', path });
        return Promise.resolve({
          isFile: () => true,
          isDirectory: () => false,
          mtime: new Date(),
          size: 1024
        });
      }),
      
      getOperations: () => fsOperations,
      clearOperations: () => { fsOperations.length = 0; }
    };
  }

  /**
   * Mock Yoga layout engine
   */
  mockYoga() {
    const nodeMock = {
      setWidth: this.createFunctionMock('node.setWidth'),
      setHeight: this.createFunctionMock('node.setHeight'),
      setPadding: this.createFunctionMock('node.setPadding'),
      calculateLayout: this.createFunctionMock('node.calculateLayout'),
      getComputedLayout: this.createFunctionMock('node.getComputedLayout', {
        width: 100,
        height: 50,
        left: 0,
        top: 0
      }),
      free: this.createFunctionMock('node.free')
    };
    
    return {
      Node: {
        create: this.createFunctionMock('Yoga.Node.create', nodeMock)
      },
      EDGE_ALL: 'all',
      FLEX_DIRECTION_COLUMN: 'column',
      FLEX_DIRECTION_ROW: 'row'
    };
  }

  /**
   * Get mock by name
   */
  getMock(name) {
    return this.mocks.get(name);
  }

  /**
   * Reset all mocks
   */
  resetAllMocks() {
    for (const mock of this.mocks.values()) {
      if (mock.mockReset) {
        mock.mockReset();
      }
      if (mock.restore) {
        mock.restore();
      }
    }
  }

  /**
   * Clear all mocks
   */
  clearAllMocks() {
    this.resetAllMocks();
    this.mocks.clear();
  }
}

// Global mock factory instance
export const mockFactory = new MockFactory();

export default MockFactory;