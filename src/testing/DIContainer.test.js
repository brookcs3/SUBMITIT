/**
 * DI Container Integration Tests
 * 
 * Comprehensive tests demonstrating the dependency injection system
 * and showcasing testing patterns for the submitit architecture.
 */

import { strictEqual, ok, deepEqual } from 'assert';
import { DITestUtils, createTestUtils, createTestContainerWithMocks } from './DITestUtils.js';
import { configureServices } from '../config/serviceRegistration.js';
import { DIContainer } from '../lib/DIContainer.js';

// Test suite runner (basic implementation)
class TestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
    this.beforeAllHooks = [];
    this.afterAllHooks = [];
  }

  beforeEach(fn) {
    this.beforeEachHooks.push(fn);
  }

  afterEach(fn) {
    this.afterEachHooks.push(fn);
  }

  beforeAll(fn) {
    this.beforeAllHooks.push(fn);
  }

  afterAll(fn) {
    this.afterAllHooks.push(fn);
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log(`\n🧪 Running test suite: ${this.name}`);
    console.log('=' + '='.repeat(this.name.length + 22));
    
    // Run beforeAll hooks
    for (const hook of this.beforeAllHooks) {
      await hook();
    }

    let passed = 0;
    let failed = 0;

    for (const test of this.tests) {
      try {
        // Run beforeEach hooks
        for (const hook of this.beforeEachHooks) {
          await hook();
        }

        await test.fn();
        
        // Run afterEach hooks
        for (const hook of this.afterEachHooks) {
          await hook();
        }

        console.log(`  ✅ ${test.name}`);
        passed++;
      } catch (error) {
        console.log(`  ❌ ${test.name}`);
        console.log(`     Error: ${error.message}`);
        failed++;
      }
    }

    // Run afterAll hooks
    for (const hook of this.afterAllHooks) {
      await hook();
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
      throw new Error(`${failed} tests failed`);
    }
  }
}

// === UNIT TESTS ===

const diContainerTests = new TestSuite('DI Container Core Tests');

// Test utilities setup
let testUtils;

diContainerTests.beforeEach(() => {
  testUtils = createTestUtils();
});

diContainerTests.afterEach(async () => {
  if (testUtils) {
    await testUtils.resetContainer();
  }
});

// Basic registration and resolution
diContainerTests.test('should register and resolve simple service', async () => {
  const container = testUtils.createContainer();
  
  class TestService {
    getName() {
      return 'TestService';
    }
  }
  
  container.register('testService', TestService);
  
  const service = await container.resolve('testService');
  ok(service instanceof TestService);
  strictEqual(service.getName(), 'TestService');
});

// Dependency injection
diContainerTests.test('should inject dependencies correctly', async () => {
  const container = testUtils.createContainer();
  
  class DatabaseService {
    query() {
      return 'database result';
    }
  }
  
  class UserService {
    constructor(database) {
      this.database = database;
    }
    
    getUser() {
      return this.database.query();
    }
  }
  
  container.register('database', DatabaseService);
  container.register('userService', {
    factory: (database) => new UserService(database),
    dependencies: ['database']
  });
  
  const userService = await container.resolve('userService');
  strictEqual(userService.getUser(), 'database result');
});

// Singleton lifecycle
diContainerTests.test('should maintain singleton lifecycle', async () => {
  const container = testUtils.createContainer();
  
  class SingletonService {
    constructor() {
      this.id = Math.random();
    }
  }
  
  container.singleton('singletonService', SingletonService);
  
  const instance1 = await container.resolve('singletonService');
  const instance2 = await container.resolve('singletonService');
  
  strictEqual(instance1, instance2);
  strictEqual(instance1.id, instance2.id);
});

// Transient lifecycle
diContainerTests.test('should create new instances for transient services', async () => {
  const container = testUtils.createContainer();
  
  class TransientService {
    constructor() {
      this.id = Math.random();
    }
  }
  
  container.transient('transientService', TransientService);
  
  const instance1 = await container.resolve('transientService');
  const instance2 = await container.resolve('transientService');
  
  ok(instance1 !== instance2);
  ok(instance1.id !== instance2.id);
});

// Circular dependency detection
diContainerTests.test('should detect circular dependencies', async () => {
  const container = testUtils.createContainer();
  
  container.register('serviceA', {
    factory: (serviceB) => ({ name: 'A', dependency: serviceB }),
    dependencies: ['serviceB']
  });
  
  container.register('serviceB', {
    factory: (serviceA) => ({ name: 'B', dependency: serviceA }),
    dependencies: ['serviceA']
  });
  
  try {
    await container.resolve('serviceA');
    throw new Error('Should have detected circular dependency');
  } catch (error) {
    ok(error.message.includes('Circular dependency'));
  }
});

// === INTEGRATION TESTS ===

const integrationTests = new TestSuite('DI Container Integration Tests');

integrationTests.test('should configure all submitit services', async () => {
  const container = configureServices({
    enableTestingMode: true
  });
  
  await container.initialize();
  
  // Test core services
  const coreServices = [
    'fileValidator',
    'smartFileHandler', 
    'layoutEngine',
    'themeSystem',
    'projectManager',
    'previewManager',
    'packageManager'
  ];
  
  for (const serviceName of coreServices) {
    const service = await container.resolve(serviceName);
    ok(service, `Service ${serviceName} should be resolved`);
  }
  
  await container.shutdown();
});

integrationTests.test('should handle service dependencies correctly', async () => {
  const container = configureServices({
    enableTestingMode: true
  });
  
  await container.initialize();
  
  // Test that projectManager has its dependencies
  const projectManager = await container.resolve('projectManager');
  ok(projectManager, 'ProjectManager should be resolved');
  
  // Test that themeIntegration has its dependencies  
  const themeIntegration = await container.resolve('themeIntegration');
  ok(themeIntegration, 'ThemeIntegration should be resolved');
  
  await container.shutdown();
});

// === MOCKING TESTS ===

const mockingTests = new TestSuite('DI Container Mocking Tests');

mockingTests.beforeEach(() => {
  testUtils = createTestUtils();
});

mockingTests.afterEach(async () => {
  await testUtils.resetContainer();
});

mockingTests.test('should mock services for testing', async () => {
  const container = testUtils.createContainer();
  
  // Register a service that depends on external service
  container.register('emailService', {
    factory: (httpClient) => ({
      sendEmail: (to, subject) => httpClient.post('/send', { to, subject })
    }),
    dependencies: ['httpClient']
  });
  
  // Mock the http client
  const mockHttpClient = testUtils.createMock({
    post: (url, data) => ({ success: true, url, data })
  });
  
  testUtils.mockService('httpClient', mockHttpClient);
  
  const emailService = await container.resolve('emailService');
  const result = emailService.sendEmail('test@example.com', 'Test Subject');
  
  strictEqual(result.success, true);
  strictEqual(result.url, '/send');
  deepEqual(result.data, { to: 'test@example.com', subject: 'Test Subject' });
});

mockingTests.test('should track method calls with spies', async () => {
  const container = testUtils.createContainer();
  
  const spy = testUtils.createSpy();
  testUtils.mockService('loggerService', spy);
  
  // Create service that uses logger
  container.register('businessService', {
    factory: (logger) => ({
      doSomething: () => {
        logger.log('Something happened');
        return 'done';
      }
    }),
    dependencies: ['loggerService']
  });
  
  const businessService = await container.resolve('businessService');
  businessService.doSomething();
  
  ok(spy.wasCreated());
  strictEqual(spy.getCallCount(), 1);
});

// === SCOPE TESTS ===

const scopeTests = new TestSuite('DI Container Scope Tests');

scopeTests.beforeEach(() => {
  testUtils = createTestUtils();
});

scopeTests.afterEach(async () => {
  await testUtils.resetContainer();
  await testUtils.cleanupScopes();
});

scopeTests.test('should maintain separate instances in different scopes', async () => {
  const container = testUtils.createContainer();
  
  class ScopedService {
    constructor() {
      this.id = Math.random();
    }
  }
  
  container.scoped('scopedService', ScopedService);
  
  const instance1 = await testUtils.runInScope('scope1', async () => {
    return await container.resolve('scopedService');
  });
  
  const instance2 = await testUtils.runInScope('scope2', async () => {
    return await container.resolve('scopedService');
  });
  
  ok(instance1 !== instance2);
  ok(instance1.id !== instance2.id);
});

// === PERFORMANCE TESTS ===

const performanceTests = new TestSuite('DI Container Performance Tests');

performanceTests.test('should resolve services efficiently', async () => {
  const container = configureServices({
    enableTestingMode: true
  });
  
  await container.initialize();
  
  const startTime = Date.now();
  const iterations = 100;
  
  for (let i = 0; i < iterations; i++) {
    await container.resolve('fileValidator');
    await container.resolve('projectManager');
    await container.resolve('themeSystem');
  }
  
  const endTime = Date.now();
  const averageTime = (endTime - startTime) / iterations;
  
  console.log(`Average resolution time: ${averageTime.toFixed(2)}ms`);
  
  // Should resolve quickly (less than 10ms average)
  ok(averageTime < 10, 'Service resolution should be fast');
  
  await container.shutdown();
});

// === TEST UTILITIES TESTS ===

const testUtilsTests = new TestSuite('DI Test Utilities Tests');

testUtilsTests.test('should provide helpful testing utilities', async () => {
  const { container, testUtils, mocks } = createTestContainerWithMocks();
  
  // Test that default mocks are available
  ok(mocks.logger, 'Logger mock should be available');
  ok(mocks.config, 'Config mock should be available');
  
  // Test service resolution assertion
  container.register('testService', () => ({ name: 'test' }));
  
  const service = await testUtils.assertServiceResolvable('testService');
  strictEqual(service.name, 'test');
  
  await testUtils.resetContainer();
});

// === MAIN TEST RUNNER ===

export async function runDIContainerTests() {
  console.log('\n🚀 Starting DI Container Test Suite');
  console.log('=====================================');
  
  try {
    await diContainerTests.run();
    await integrationTests.run();
    await mockingTests.run();
    await scopeTests.run();
    await performanceTests.run();
    await testUtilsTests.run();
    
    console.log('\n🎉 All DI Container tests passed!');
    
  } catch (error) {
    console.error('\n💥 DI Container tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDIContainerTests().catch(console.error);
}

export {
  diContainerTests,
  integrationTests,
  mockingTests,
  scopeTests,
  performanceTests,
  testUtilsTests
};