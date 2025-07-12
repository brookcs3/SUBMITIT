/**
 * DI Container Testing Utilities
 * 
 * Provides comprehensive testing utilities for the dependency injection system,
 * including mocking, stubbing, and test container management.
 */

import { createTestContainer } from '../config/serviceRegistration.js';
import { EventEmitter } from 'events';

export class DITestUtils {
  constructor() {
    this.testContainer = null;
    this.activeMocks = new Set();
    this.testScopes = new Set();
    this.testLifecycle = new TestLifecycleManager();
  }

  // === CONTAINER MANAGEMENT ===

  /**
   * Create a test container with optional overrides
   */
  createContainer(overrides = {}) {
    this.testContainer = createTestContainer(overrides);
    return this.testContainer;
  }

  /**
   * Get the current test container
   */
  getContainer() {
    if (!this.testContainer) {
      this.testContainer = this.createContainer();
    }
    return this.testContainer;
  }

  /**
   * Reset the test container
   */
  async resetContainer() {
    if (this.testContainer) {
      await this.cleanupMocks();
      await this.testContainer.shutdown();
    }
    this.testContainer = null;
    this.activeMocks.clear();
    this.testScopes.clear();
  }

  // === MOCKING UTILITIES ===

  /**
   * Create a mock implementation with optional behavior
   */
  createMock(behavior = {}) {
    return new MockService(behavior);
  }

  /**
   * Create a spy that tracks method calls
   */
  createSpy(originalImplementation = null) {
    return new SpyService(originalImplementation);
  }

  /**
   * Create a stub with predefined responses
   */
  createStub(responses = {}) {
    return new StubService(responses);
  }

  /**
   * Mock a service with automatic cleanup
   */
  mockService(serviceName, mockImplementation) {
    const container = this.getContainer();
    container.mock(serviceName, mockImplementation);
    this.activeMocks.add(serviceName);
    return mockImplementation;
  }

  /**
   * Mock multiple services at once
   */
  mockServices(mocks) {
    const container = this.getContainer();
    const mockInstances = {};
    
    Object.entries(mocks).forEach(([serviceName, mockImplementation]) => {
      container.mock(serviceName, mockImplementation);
      this.activeMocks.add(serviceName);
      mockInstances[serviceName] = mockImplementation;
    });
    
    return mockInstances;
  }

  /**
   * Cleanup all active mocks
   */
  async cleanupMocks() {
    if (this.testContainer) {
      this.testContainer.clearMocks();
    }
    this.activeMocks.clear();
  }

  // === TESTING PATTERNS ===

  /**
   * Test service resolution
   */
  async testServiceResolution(serviceName, expectedType = null) {
    const container = this.getContainer();
    
    try {
      const service = await container.resolve(serviceName);
      
      const result = {
        resolved: true,
        service,
        type: service.constructor.name,
        hasExpectedType: expectedType ? service instanceof expectedType : true
      };
      
      return result;
    } catch (error) {
      return {
        resolved: false,
        error: error.message,
        hasExpectedType: false
      };
    }
  }

  /**
   * Test dependency injection
   */
  async testDependencyInjection(serviceName, expectedDependencies = []) {
    const container = this.getContainer();
    
    try {
      // Create spies for dependencies
      const dependencySpies = {};
      for (const depName of expectedDependencies) {
        dependencySpies[depName] = this.createSpy();
        container.mock(depName, dependencySpies[depName]);
      }
      
      // Resolve the service
      const service = await container.resolve(serviceName);
      
      // Check if dependencies were injected
      const injectionResults = {};
      for (const depName of expectedDependencies) {
        injectionResults[depName] = {
          wasInjected: dependencySpies[depName].wasCreated(),
          callCount: dependencySpies[depName].getCallCount()
        };
      }
      
      return {
        success: true,
        service,
        dependencies: injectionResults
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test service lifecycle
   */
  async testServiceLifecycle(serviceName, lifecycle = 'singleton') {
    const container = this.getContainer();
    
    try {
      // Resolve service multiple times
      const instance1 = await container.resolve(serviceName);
      const instance2 = await container.resolve(serviceName);
      
      const result = {
        lifecycle,
        instance1Type: instance1.constructor.name,
        instance2Type: instance2.constructor.name,
        areSameInstance: instance1 === instance2,
        expectedBehavior: true
      };
      
      // Check expected behavior based on lifecycle
      switch (lifecycle) {
        case 'singleton':
          result.expectedBehavior = result.areSameInstance;
          break;
        case 'transient':
          result.expectedBehavior = !result.areSameInstance;
          break;
        case 'scoped':
          // Same instance within scope, different across scopes
          const scope = container.createScope('test-scope');
          const instance3 = await scope.run(async () => {
            return await container.resolve(serviceName);
          });
          result.instance3Type = instance3.constructor.name;
          result.areSameInstanceInScope = instance1 === instance3;
          result.expectedBehavior = !result.areSameInstanceInScope;
          break;
      }
      
      return result;
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test circular dependency detection
   */
  async testCircularDependencyDetection() {
    const container = this.getContainer();
    
    // Create services with circular dependencies
    container.register('serviceA', {
      factory: (serviceB) => ({ name: 'ServiceA', dependency: serviceB }),
      dependencies: ['serviceB']
    });
    
    container.register('serviceB', {
      factory: (serviceA) => ({ name: 'ServiceB', dependency: serviceA }),
      dependencies: ['serviceA']
    });
    
    try {
      await container.resolve('serviceA');
      return {
        detected: false,
        error: 'Circular dependency was not detected'
      };
    } catch (error) {
      return {
        detected: error.message.includes('Circular dependency'),
        error: error.message
      };
    }
  }

  // === SCOPED TESTING ===

  /**
   * Create a test scope
   */
  createTestScope(scopeName = `test-scope-${Date.now()}`) {
    const container = this.getContainer();
    const scope = container.createScope(scopeName);
    this.testScopes.add(scopeName);
    return scope;
  }

  /**
   * Run test within a scope
   */
  async runInScope(scopeName, testFunction) {
    const container = this.getContainer();
    const scope = container.createScope(scopeName);
    this.testScopes.add(scopeName);
    
    return await scope.run(testFunction);
  }

  /**
   * Cleanup test scopes
   */
  async cleanupScopes() {
    const container = this.getContainer();
    
    for (const scopeName of this.testScopes) {
      await container.clearScope(scopeName);
    }
    
    this.testScopes.clear();
  }

  // === ASSERTION HELPERS ===

  /**
   * Assert service is registered
   */
  assertServiceRegistered(serviceName) {
    const container = this.getContainer();
    if (!container.has(serviceName)) {
      throw new Error(`Service '${serviceName}' is not registered`);
    }
  }

  /**
   * Assert service can be resolved
   */
  async assertServiceResolvable(serviceName) {
    const result = await this.testServiceResolution(serviceName);
    if (!result.resolved) {
      throw new Error(`Service '${serviceName}' cannot be resolved: ${result.error}`);
    }
    return result.service;
  }

  /**
   * Assert service has expected dependencies
   */
  async assertServiceDependencies(serviceName, expectedDependencies) {
    const result = await this.testDependencyInjection(serviceName, expectedDependencies);
    if (!result.success) {
      throw new Error(`Dependency injection test failed for '${serviceName}': ${result.error}`);
    }
    
    for (const depName of expectedDependencies) {
      if (!result.dependencies[depName].wasInjected) {
        throw new Error(`Dependency '${depName}' was not injected into '${serviceName}'`);
      }
    }
  }

  /**
   * Assert service follows lifecycle rules
   */
  async assertServiceLifecycle(serviceName, expectedLifecycle) {
    const result = await this.testServiceLifecycle(serviceName, expectedLifecycle);
    if (!result.expectedBehavior) {
      throw new Error(`Service '${serviceName}' does not follow '${expectedLifecycle}' lifecycle`);
    }
  }
}

// === MOCK IMPLEMENTATIONS ===

export class MockService extends EventEmitter {
  constructor(behavior = {}) {
    super();
    this.behavior = behavior;
    this.callHistory = [];
    this.methodCalls = new Map();
    this.created = true;
  }

  // Dynamic method creation based on behavior
  setupMethods() {
    Object.entries(this.behavior).forEach(([methodName, response]) => {
      this[methodName] = (...args) => {
        this.recordCall(methodName, args);
        
        if (typeof response === 'function') {
          return response(...args);
        } else {
          return response;
        }
      };
    });
  }

  recordCall(methodName, args) {
    const call = {
      method: methodName,
      args,
      timestamp: Date.now()
    };
    
    this.callHistory.push(call);
    
    if (!this.methodCalls.has(methodName)) {
      this.methodCalls.set(methodName, []);
    }
    this.methodCalls.get(methodName).push(call);
    
    this.emit('method-called', call);
  }

  getCallHistory() {
    return [...this.callHistory];
  }

  getMethodCalls(methodName) {
    return this.methodCalls.get(methodName) || [];
  }

  wasMethodCalled(methodName) {
    return this.methodCalls.has(methodName);
  }

  getCallCount(methodName = null) {
    if (methodName) {
      return this.getMethodCalls(methodName).length;
    }
    return this.callHistory.length;
  }

  reset() {
    this.callHistory = [];
    this.methodCalls.clear();
  }
}

export class SpyService extends MockService {
  constructor(originalImplementation = null) {
    super();
    this.original = originalImplementation;
    this.spyMode = true;
  }

  createSpyMethod(methodName) {
    return (...args) => {
      this.recordCall(methodName, args);
      
      if (this.original && typeof this.original[methodName] === 'function') {
        return this.original[methodName](...args);
      }
      
      return undefined;
    };
  }

  wasCreated() {
    return this.created;
  }
}

export class StubService extends MockService {
  constructor(responses = {}) {
    super(responses);
    this.responses = responses;
    this.setupMethods();
  }

  setResponse(methodName, response) {
    this.responses[methodName] = response;
    this[methodName] = (...args) => {
      this.recordCall(methodName, args);
      return typeof response === 'function' ? response(...args) : response;
    };
  }
}

// === LIFECYCLE MANAGER ===

export class TestLifecycleManager {
  constructor() {
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
    this.beforeAllHooks = [];
    this.afterAllHooks = [];
  }

  beforeEach(hook) {
    this.beforeEachHooks.push(hook);
  }

  afterEach(hook) {
    this.afterEachHooks.push(hook);
  }

  beforeAll(hook) {
    this.beforeAllHooks.push(hook);
  }

  afterAll(hook) {
    this.afterAllHooks.push(hook);
  }

  async runBeforeEach(context) {
    for (const hook of this.beforeEachHooks) {
      await hook(context);
    }
  }

  async runAfterEach(context) {
    for (const hook of this.afterEachHooks) {
      await hook(context);
    }
  }

  async runBeforeAll(context) {
    for (const hook of this.beforeAllHooks) {
      await hook(context);
    }
  }

  async runAfterAll(context) {
    for (const hook of this.afterAllHooks) {
      await hook(context);
    }
  }
}

// === FACTORY FUNCTIONS ===

/**
 * Create test utilities instance
 */
export function createTestUtils() {
  return new DITestUtils();
}

/**
 * Create a test container with common test services
 */
export function createTestContainerWithMocks() {
  const testUtils = new DITestUtils();
  const container = testUtils.createContainer();
  
  // Common test mocks
  const mocks = {
    logger: testUtils.createMock({
      log: () => {},
      error: () => {},
      warn: () => {},
      info: () => {}
    }),
    
    config: testUtils.createMock({
      get: (key, defaultValue) => defaultValue,
      set: () => {},
      has: () => false
    })
  };
  
  testUtils.mockServices(mocks);
  
  return { container, testUtils, mocks };
}

export default DITestUtils;