# Dependency Injection Container

Submitit uses a sophisticated dependency injection (DI) container to manage component lifecycle, dependencies, and testing. This architectural pattern provides better separation of concerns, easier testing, and more maintainable code.

## Overview

The DI container acts as a "Service Registry" - a central place where all services register their capabilities and requirements. Think of it as a grand registry office where components declare what they provide and what they need.

## Key Benefits

- **Dependency Management**: Automatic resolution of service dependencies
- **Lifecycle Management**: Control over service creation, initialization, and cleanup
- **Testing Support**: Easy mocking and stubbing for unit tests
- **Scoped Services**: Different service instances for different contexts
- **Circular Dependency Detection**: Prevents problematic dependency cycles

## Basic Usage

### Registering Services

```javascript
import { createContainer } from '../lib/DIContainer.js';

const container = createContainer();

// Simple singleton registration
container.singleton('logger', LoggerService);

// Factory function with dependencies
container.register('userService', {
  factory: (database, logger) => new UserService(database, logger),
  dependencies: ['database', 'logger'],
  lifecycle: 'singleton'
});

// Transient service (new instance each time)
container.transient('requestHandler', RequestHandler);

// Scoped service (one instance per scope)
container.scoped('sessionManager', SessionManager);
```

### Resolving Services

```javascript
// Resolve a single service
const userService = await container.resolve('userService');

// Resolve multiple services
const { logger, database } = await container.resolveMany(['logger', 'database']);

// Check if service exists
if (container.has('optionalService')) {
  const service = await container.resolve('optionalService');
}
```

### Container Lifecycle

```javascript
// Initialize container and all singleton services
await container.initialize();

// Use services...

// Shutdown container and cleanup
await container.shutdown();
```

## Service Lifecycles

### Singleton
- **One instance** per container
- **Shared** across all requests
- **Best for**: Stateless services, configuration, database connections

```javascript
container.singleton('database', DatabaseService);
```

### Transient
- **New instance** every time resolved
- **Not shared** between requests  
- **Best for**: Request handlers, temporary processors

```javascript
container.transient('requestProcessor', RequestProcessor);
```

### Scoped
- **One instance** per scope
- **Shared** within scope, different between scopes
- **Best for**: User sessions, request contexts

```javascript
container.scoped('userContext', UserContextService);

// Use within a scope
const scope = container.createScope('user-123');
await scope.run(async () => {
  const context = await container.resolve('userContext');
  // Same instance throughout this scope
});
```

## Testing Support

### Test Container Setup

```javascript
import { createTestUtils } from '../testing/DITestUtils.js';

const testUtils = createTestUtils();
const container = testUtils.createContainer();
```

### Mocking Services

```javascript
// Mock a service
const mockLogger = testUtils.createMock({
  log: (message) => console.log(`MOCK: ${message}`),
  error: (error) => console.error(`MOCK ERROR: ${error}`)
});

testUtils.mockService('logger', mockLogger);

// Service now uses the mock
const userService = await container.resolve('userService');
userService.doSomething(); // Uses mock logger
```

### Spying on Services

```javascript
// Create a spy that tracks calls
const loggerSpy = testUtils.createSpy();
testUtils.mockService('logger', loggerSpy);

// Use the service
const service = await container.resolve('someService');
service.performAction();

// Check spy results
console.log(loggerSpy.getCallCount()); // Number of calls
console.log(loggerSpy.wasMethodCalled('log')); // true/false
console.log(loggerSpy.getCallHistory()); // All calls
```

### Stubbing Responses

```javascript
// Create stub with predefined responses
const databaseStub = testUtils.createStub({
  findUser: { id: 1, name: 'Test User' },
  saveUser: true,
  deleteUser: (id) => id > 0 // Dynamic response
});

testUtils.mockService('database', databaseStub);
```

### Test Lifecycle

```javascript
describe('UserService Tests', () => {
  let testUtils;
  
  beforeEach(() => {
    testUtils = createTestUtils();
  });
  
  afterEach(async () => {
    await testUtils.resetContainer();
  });
  
  test('should create user', async () => {
    const container = testUtils.createContainer();
    
    // Mock dependencies
    const mockDatabase = testUtils.createMock({
      save: (user) => ({ ...user, id: 1 })
    });
    
    testUtils.mockService('database', mockDatabase);
    
    // Test the service
    const userService = await container.resolve('userService');
    const result = await userService.createUser({ name: 'John' });
    
    expect(result.id).toBe(1);
  });
});
```

## Submitit Service Architecture

### Core Services

The submitit application is built with these core services:

```javascript
// File processing
fileValidator       // Enhanced file validation with celebrations
smartFileHandler    // Ninja-style file processing
packageManager      // Archive creation and export
streamingPackageManager // Memory-efficient exports

// Layout and design
layoutEngine        // Enhanced Yoga layout engine
themeSystem         // Sophisticated theme system
astroGenerator      // Dynamic Astro site generation
themeIntegration    // Theme system integration

// Project management
projectManager      // Core project coordination
previewManager      // Web and terminal previews

// Infrastructure
lazyLoader          // Dynamic import management
accessibilityManager // Inclusive experience features
appContext          // Global application state
configManager       // Configuration management

// High-level API
submitit            // Main service facade
```

### Service Dependencies

```javascript
// ProjectManager depends on:
// - layoutEngine
// - smartFileHandler
// - fileValidator

// PreviewManager depends on:
// - layoutEngine
// - themeIntegration

// ThemeIntegration depends on:
// - themeSystem
// - astroGenerator

// And so on...
```

### Using Services in CLI Commands

```javascript
import { configureServices } from '../config/serviceRegistration.js';

const container = configureServices();
await container.initialize();

// In CLI commands
export async function addCommand(options) {
  const submitit = await container.resolve('submitit');
  return await submitit.addFiles(options.project, options.files);
}

export async function previewCommand(options) {
  const submitit = await container.resolve('submitit');
  return await submitit.generatePreview(options.project, options);
}
```

## Advanced Patterns

### Service Builder Pattern

```javascript
import { ServiceBuilder } from '../lib/DIContainer.js';

container.register('complexService', 
  new ServiceBuilder(container, 'complexService')
    .implementation(ComplexService)
    .dependencies('logger', 'database', 'cache')
    .singleton()
    .withOptions({ timeout: 5000 })
    .onInitialize(async () => {
      console.log('Complex service initializing...');
    })
    .onShutdown(async (instance) => {
      await instance.cleanup();
    })
    .register()
);
```

### Conditional Registration

```javascript
// Register different implementations based on environment
if (process.env.NODE_ENV === 'production') {
  container.singleton('logger', ProductionLogger);
} else {
  container.singleton('logger', DevelopmentLogger);
}
```

### Factory with Complex Logic

```javascript
container.register('database', {
  factory: (config) => {
    const connectionString = config.get('DATABASE_URL');
    
    if (connectionString.includes('postgres')) {
      return new PostgresDatabase(connectionString);
    } else if (connectionString.includes('mysql')) {
      return new MySqlDatabase(connectionString);
    } else {
      return new SqliteDatabase();
    }
  },
  dependencies: ['configManager'],
  lifecycle: 'singleton'
});
```

### Service Decorators

```javascript
// Wrap services with additional functionality
container.register('logger', LoggerService);

container.register('auditedLogger', {
  factory: (logger, auditService) => {
    return new Proxy(logger, {
      get(target, prop) {
        if (typeof target[prop] === 'function') {
          return function(...args) {
            auditService.log(`Logger.${prop} called`);
            return target[prop].apply(target, args);
          };
        }
        return target[prop];
      }
    });
  },
  dependencies: ['logger', 'auditService']
});
```

## Best Practices

### 1. Use Interface-Based Registration

```javascript
// Define interfaces for better testing
class IUserRepository {
  async findById(id) { throw new Error('Not implemented'); }
  async save(user) { throw new Error('Not implemented'); }
}

class DatabaseUserRepository extends IUserRepository {
  async findById(id) {
    // Implementation
  }
  
  async save(user) {
    // Implementation  
  }
}

// Register by interface
container.singleton('userRepository', DatabaseUserRepository);
```

### 2. Fail Fast with Validation

```javascript
container.register('criticalService', {
  factory: (dependency) => {
    if (!dependency) {
      throw new Error('CriticalService requires valid dependency');
    }
    return new CriticalService(dependency);
  },
  dependencies: ['requiredDependency']
});
```

### 3. Use Descriptive Service Names

```javascript
// Good
container.singleton('emailNotificationService', EmailService);
container.singleton('userAuthenticationService', AuthService);

// Bad
container.singleton('email', EmailService);
container.singleton('auth', AuthService);
```

### 4. Group Related Services

```javascript
// Register all notification services together
container.singleton('emailNotification', EmailNotificationService);
container.singleton('smsNotification', SmsNotificationService);
container.singleton('pushNotification', PushNotificationService);

// Aggregate service
container.singleton('notificationService', {
  factory: (email, sms, push) => new NotificationAggregator(email, sms, push),
  dependencies: ['emailNotification', 'smsNotification', 'pushNotification']
});
```

### 5. Use Scopes for Request Isolation

```javascript
// Per-request services
container.scoped('currentUser', CurrentUserService);
container.scoped('requestContext', RequestContextService);

// In request handler
app.get('/api/users', async (req, res) => {
  const requestScope = container.createScope(`request-${req.id}`);
  
  await requestScope.run(async () => {
    const userService = await container.resolve('userService');
    const users = await userService.getCurrentUserData();
    res.json(users);
  });
});
```

## Troubleshooting

### Common Issues

1. **Circular Dependencies**
   ```
   Error: Circular dependency detected: serviceA -> serviceB -> serviceA
   ```
   **Solution**: Refactor to remove circular dependency or use lazy injection

2. **Service Not Found**
   ```
   Error: Service 'unknownService' is not registered
   ```
   **Solution**: Check service name spelling and registration

3. **Dependency Resolution Failure**
   ```
   Error: Failed to resolve service 'userService': Service 'database' is not registered
   ```
   **Solution**: Register all required dependencies before the dependent service

4. **Lifecycle Issues**
   ```
   Error: Cannot resolve transient service 'sessionManager' - use scoped instead
   ```
   **Solution**: Choose appropriate lifecycle for your use case

### Debugging Tips

```javascript
// Enable debug logging
const container = createContainer({
  enableDebugLogging: true
});

// Check container status
container.printStatus();

// Get dependency graph
const graph = container.getDependencyGraph();
console.log('Dependencies:', graph);

// Monitor resolution events
container.on('service-resolved', ({ name, resolutionTime }) => {
  console.log(`Resolved ${name} in ${resolutionTime}ms`);
});
```

## Migration Guide

### From Direct Instantiation

```javascript
// Before
import { ProjectManager } from './lib/ProjectManager.js';
import { FileValidator } from './lib/FileValidator.js';

const validator = new FileValidator();
const projectManager = new ProjectManager(validator);

// After
import { configureServices } from './config/serviceRegistration.js';

const container = configureServices();
await container.initialize();

const projectManager = await container.resolve('projectManager');
```

### From Manual Dependency Passing

```javascript
// Before
function createUserService(database, logger, cache) {
  return new UserService(database, logger, cache);
}

// After
container.register('userService', {
  factory: (database, logger, cache) => new UserService(database, logger, cache),
  dependencies: ['database', 'logger', 'cache']
});
```

The dependency injection container provides a robust foundation for the submitit architecture, enabling better testing, maintainability, and scalability of the codebase.