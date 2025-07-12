/**
 * Dependency Injection Container
 * 
 * A sophisticated container for managing component lifecycle, dependencies, and testing.
 * Built with the architectural metaphor of a "Service Registry" - like a grand registry
 * office where all services register their capabilities and requirements.
 */

import { EventEmitter } from 'events';
import chalk from 'chalk';

export class DIContainer extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableLifecycleManagement: true,
      enableDependencyValidation: true,
      enableCircularDependencyDetection: true,
      enableTestingMode: false,
      strictMode: true,
      ...options
    };
    
    // Core registry stores
    this.services = new Map();           // service definitions
    this.instances = new Map();          // singleton instances
    this.lifecycleHandlers = new Map();  // lifecycle management
    this.dependencies = new Map();       // dependency graph
    this.testMocks = new Map();          // test mocks and stubs
    this.scopes = new Map();             // scoped instances
    
    // Container state
    this.isInitialized = false;
    this.isShuttingDown = false;
    this.currentScope = 'default';
    this.initializationOrder = [];
    
    // Statistics and monitoring
    this.stats = {
      totalRegistrations: 0,
      totalResolutions: 0,
      activeInstances: 0,
      circularDependenciesDetected: 0,
      testMocksActive: 0
    };
    
    this.setupDefaultServices();
  }

  // === SERVICE REGISTRATION ===

  /**
   * Register a service with the container
   */
  register(name, definition) {
    if (this.services.has(name)) {
      if (this.options.strictMode && !this.options.enableTestingMode) {
        throw new Error(`Service '${name}' is already registered`);
      }
      console.warn(chalk.yellow(`⚠️  Overriding existing service: ${name}`));
    }

    const serviceDefinition = this.normalizeServiceDefinition(name, definition);
    
    // Validate service definition
    this.validateServiceDefinition(serviceDefinition);
    
    // Register the service
    this.services.set(name, serviceDefinition);
    
    // Track dependencies
    if (serviceDefinition.dependencies.length > 0) {
      this.dependencies.set(name, serviceDefinition.dependencies);
    }
    
    // Set up lifecycle if provided
    if (serviceDefinition.lifecycle) {
      this.lifecycleHandlers.set(name, serviceDefinition.lifecycle);
    }
    
    this.stats.totalRegistrations++;
    this.emit('service-registered', { name, definition: serviceDefinition });
    
    console.log(chalk.gray(`📝 Registered service: ${name}`));
    
    return this;
  }

  /**
   * Register a singleton service
   */
  singleton(name, definition) {
    return this.register(name, {
      ...definition,
      lifecycle: 'singleton'
    });
  }

  /**
   * Register a transient service (new instance each time)
   */
  transient(name, definition) {
    return this.register(name, {
      ...definition,
      lifecycle: 'transient'
    });
  }

  /**
   * Register a scoped service (one instance per scope)
   */
  scoped(name, definition) {
    return this.register(name, {
      ...definition,
      lifecycle: 'scoped'
    });
  }

  // === SERVICE RESOLUTION ===

  /**
   * Resolve a service instance
   */
  async resolve(name, options = {}) {
    const startTime = Date.now();
    
    try {
      // Check for test mocks first
      if (this.options.enableTestingMode && this.testMocks.has(name)) {
        this.stats.totalResolutions++;
        return this.testMocks.get(name);
      }
      
      const service = this.services.get(name);
      if (!service) {
        throw new Error(`Service '${name}' is not registered`);
      }
      
      // Check circular dependencies
      if (this.options.enableCircularDependencyDetection) {
        this.checkCircularDependencies(name, new Set());
      }
      
      const instance = await this.createServiceInstance(name, service, options);
      
      this.stats.totalResolutions++;
      this.emit('service-resolved', { 
        name, 
        instance, 
        resolutionTime: Date.now() - startTime 
      });
      
      return instance;
      
    } catch (error) {
      this.emit('resolution-error', { name, error });
      throw new Error(`Failed to resolve service '${name}': ${error.message}`);
    }
  }

  /**
   * Resolve multiple services at once
   */
  async resolveMany(names) {
    const results = {};
    
    for (const name of names) {
      results[name] = await this.resolve(name);
    }
    
    return results;
  }

  /**
   * Check if a service is registered
   */
  has(name) {
    return this.services.has(name) || this.testMocks.has(name);
  }

  // === LIFECYCLE MANAGEMENT ===

  /**
   * Initialize the container and all singleton services
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn(chalk.yellow('⚠️  Container is already initialized'));
      return;
    }
    
    console.log(chalk.blue('🏗️  Initializing DI Container...'));
    
    try {
      // Determine initialization order
      this.initializationOrder = this.calculateInitializationOrder();
      
      // Initialize services in dependency order
      for (const serviceName of this.initializationOrder) {
        await this.initializeService(serviceName);
      }
      
      this.isInitialized = true;
      this.emit('container-initialized');
      
      console.log(chalk.green(`✅ DI Container initialized with ${this.services.size} services`));
      
    } catch (error) {
      this.emit('initialization-error', { error });
      throw new Error(`Container initialization failed: ${error.message}`);
    }
  }

  /**
   * Shutdown the container and cleanup all services
   */
  async shutdown() {
    if (this.isShuttingDown) {
      return;
    }
    
    this.isShuttingDown = true;
    console.log(chalk.yellow('🔄 Shutting down DI Container...'));
    
    try {
      // Shutdown services in reverse order
      const shutdownOrder = [...this.initializationOrder].reverse();
      
      for (const serviceName of shutdownOrder) {
        await this.shutdownService(serviceName);
      }
      
      // Clear all instances
      this.instances.clear();
      this.scopes.clear();
      
      this.isInitialized = false;
      this.emit('container-shutdown');
      
      console.log(chalk.green('✅ DI Container shutdown complete'));
      
    } catch (error) {
      this.emit('shutdown-error', { error });
      console.error(chalk.red('❌ Error during container shutdown:'), error.message);
    }
  }

  // === SCOPE MANAGEMENT ===

  /**
   * Create a new scope
   */
  createScope(scopeName = 'default') {
    this.scopes.set(scopeName, new Map());
    return new ScopeManager(this, scopeName);
  }

  /**
   * Switch to a different scope
   */
  switchScope(scopeName) {
    this.currentScope = scopeName;
    if (!this.scopes.has(scopeName)) {
      this.createScope(scopeName);
    }
  }

  /**
   * Clear a scope and dispose of its instances
   */
  async clearScope(scopeName) {
    const scopeInstances = this.scopes.get(scopeName);
    if (!scopeInstances) return;
    
    // Dispose of scoped instances
    for (const [serviceName, instance] of scopeInstances) {
      await this.disposeServiceInstance(serviceName, instance);
    }
    
    this.scopes.delete(scopeName);
  }

  // === TESTING SUPPORT ===

  /**
   * Enable testing mode
   */
  enableTestingMode() {
    this.options.enableTestingMode = true;
    console.log(chalk.cyan('🧪 Testing mode enabled'));
  }

  /**
   * Disable testing mode
   */
  disableTestingMode() {
    this.options.enableTestingMode = false;
    this.testMocks.clear();
    console.log(chalk.cyan('🧪 Testing mode disabled'));
  }

  /**
   * Mock a service for testing
   */
  mock(name, mockImplementation) {
    if (!this.options.enableTestingMode) {
      throw new Error('Testing mode must be enabled to use mocks');
    }
    
    this.testMocks.set(name, mockImplementation);
    this.stats.testMocksActive++;
    
    console.log(chalk.cyan(`🧪 Mocked service: ${name}`));
    
    return this;
  }

  /**
   * Remove a mock
   */
  unmock(name) {
    if (this.testMocks.delete(name)) {
      this.stats.testMocksActive--;
      console.log(chalk.cyan(`🧪 Unmocked service: ${name}`));
    }
  }

  /**
   * Clear all mocks
   */
  clearMocks() {
    this.testMocks.clear();
    this.stats.testMocksActive = 0;
    console.log(chalk.cyan('🧪 All mocks cleared'));
  }

  // === INTERNAL METHODS ===

  normalizeServiceDefinition(name, definition) {
    // Handle different registration formats
    if (typeof definition === 'function') {
      return {
        name,
        factory: definition,
        dependencies: this.extractDependencies(definition),
        lifecycle: 'singleton',
        scope: 'default'
      };
    }
    
    if (typeof definition === 'object' && definition.constructor !== Object) {
      // Class constructor
      return {
        name,
        factory: definition,
        dependencies: this.extractDependencies(definition),
        lifecycle: 'singleton',
        scope: 'default'
      };
    }
    
    return {
      name,
      factory: definition.factory || definition.implementation,
      dependencies: definition.dependencies || this.extractDependencies(definition.factory),
      lifecycle: definition.lifecycle || 'singleton',
      scope: definition.scope || 'default',
      options: definition.options || {},
      lifecycle: definition.lifecycle
    };
  }

  extractDependencies(factory) {
    if (!factory) return [];
    
    // Extract from function parameters or explicit dependencies
    const funcStr = factory.toString();
    const paramMatch = funcStr.match(/\(([^)]*)\)/);
    
    if (paramMatch && paramMatch[1].trim()) {
      return paramMatch[1]
        .split(',')
        .map(param => param.trim().replace(/=.*$/, '')) // Remove default values
        .filter(param => param.length > 0);
    }
    
    return [];
  }

  validateServiceDefinition(definition) {
    if (!definition.factory) {
      throw new Error(`Service '${definition.name}' must have a factory function or constructor`);
    }
    
    if (!['singleton', 'transient', 'scoped'].includes(definition.lifecycle)) {
      throw new Error(`Service '${definition.name}' has invalid lifecycle: ${definition.lifecycle}`);
    }
  }

  async createServiceInstance(name, service, options) {
    // Check for existing singleton instance
    if (service.lifecycle === 'singleton' && this.instances.has(name)) {
      return this.instances.get(name);
    }
    
    // Check for scoped instance
    if (service.lifecycle === 'scoped') {
      const scope = this.scopes.get(this.currentScope);
      if (scope && scope.has(name)) {
        return scope.get(name);
      }
    }
    
    // Resolve dependencies
    const dependencies = await this.resolveDependencies(service.dependencies);
    
    // Create instance
    let instance;
    try {
      if (typeof service.factory === 'function') {
        if (service.factory.prototype && service.factory.prototype.constructor === service.factory) {
          // Constructor function
          instance = new service.factory(...dependencies);
        } else {
          // Factory function
          instance = await service.factory(...dependencies);
        }
      } else {
        throw new Error(`Invalid factory for service '${name}'`);
      }
      
      // Initialize if method exists
      if (instance && typeof instance.initialize === 'function') {
        await instance.initialize();
      }
      
    } catch (error) {
      throw new Error(`Failed to create instance of '${name}': ${error.message}`);
    }
    
    // Store instance based on lifecycle
    if (service.lifecycle === 'singleton') {
      this.instances.set(name, instance);
    } else if (service.lifecycle === 'scoped') {
      let scope = this.scopes.get(this.currentScope);
      if (!scope) {
        scope = new Map();
        this.scopes.set(this.currentScope, scope);
      }
      scope.set(name, instance);
    }
    
    this.stats.activeInstances++;
    return instance;
  }

  async resolveDependencies(dependencies) {
    const resolved = [];
    
    for (const depName of dependencies) {
      resolved.push(await this.resolve(depName));
    }
    
    return resolved;
  }

  checkCircularDependencies(serviceName, visiting) {
    if (visiting.has(serviceName)) {
      const cycle = Array.from(visiting).join(' -> ') + ' -> ' + serviceName;
      this.stats.circularDependenciesDetected++;
      throw new Error(`Circular dependency detected: ${cycle}`);
    }
    
    const dependencies = this.dependencies.get(serviceName);
    if (!dependencies) return;
    
    visiting.add(serviceName);
    
    for (const depName of dependencies) {
      this.checkCircularDependencies(depName, visiting);
    }
    
    visiting.delete(serviceName);
  }

  calculateInitializationOrder() {
    const order = [];
    const visited = new Set();
    const visiting = new Set();
    
    const visit = (serviceName) => {
      if (visited.has(serviceName)) return;
      if (visiting.has(serviceName)) {
        throw new Error(`Circular dependency in initialization order: ${serviceName}`);
      }
      
      visiting.add(serviceName);
      
      const dependencies = this.dependencies.get(serviceName) || [];
      for (const depName of dependencies) {
        if (this.services.has(depName)) {
          visit(depName);
        }
      }
      
      visiting.delete(serviceName);
      visited.add(serviceName);
      order.push(serviceName);
    };
    
    // Visit all singleton services
    for (const [serviceName, service] of this.services) {
      if (service.lifecycle === 'singleton') {
        visit(serviceName);
      }
    }
    
    return order;
  }

  async initializeService(serviceName) {
    const lifecycle = this.lifecycleHandlers.get(serviceName);
    if (lifecycle && typeof lifecycle.onInitialize === 'function') {
      try {
        await lifecycle.onInitialize();
        console.log(chalk.gray(`🔧 Initialized service: ${serviceName}`));
      } catch (error) {
        console.error(chalk.red(`❌ Failed to initialize service '${serviceName}':`, error.message));
        throw error;
      }
    }
  }

  async shutdownService(serviceName) {
    const instance = this.instances.get(serviceName);
    if (instance) {
      await this.disposeServiceInstance(serviceName, instance);
      this.instances.delete(serviceName);
    }
  }

  async disposeServiceInstance(serviceName, instance) {
    try {
      // Call lifecycle handler
      const lifecycle = this.lifecycleHandlers.get(serviceName);
      if (lifecycle && typeof lifecycle.onShutdown === 'function') {
        await lifecycle.onShutdown(instance);
      }
      
      // Call instance dispose method if it exists
      if (instance && typeof instance.dispose === 'function') {
        await instance.dispose();
      }
      
      this.stats.activeInstances--;
      console.log(chalk.gray(`🗑️  Disposed service: ${serviceName}`));
      
    } catch (error) {
      console.error(chalk.red(`❌ Error disposing service '${serviceName}':`, error.message));
    }
  }

  setupDefaultServices() {
    // Register the container itself
    this.register('container', {
      factory: () => this,
      lifecycle: 'singleton'
    });
  }

  // === DIAGNOSTICS AND MONITORING ===

  /**
   * Get container statistics
   */
  getStats() {
    return {
      ...this.stats,
      registeredServices: this.services.size,
      singletonInstances: this.instances.size,
      activeScopes: this.scopes.size,
      isInitialized: this.isInitialized
    };
  }

  /**
   * Get dependency graph
   */
  getDependencyGraph() {
    const graph = {};
    
    for (const [serviceName, dependencies] of this.dependencies) {
      graph[serviceName] = dependencies;
    }
    
    return graph;
  }

  /**
   * Print container status
   */
  printStatus() {
    const stats = this.getStats();
    
    console.log(chalk.blue('\n📊 DI Container Status'));
    console.log(chalk.blue('========================'));
    console.log(`Services Registered: ${stats.registeredServices}`);
    console.log(`Total Resolutions: ${stats.totalResolutions}`);
    console.log(`Active Instances: ${stats.activeInstances}`);
    console.log(`Active Scopes: ${stats.activeScopes}`);
    console.log(`Test Mocks: ${stats.testMocksActive}`);
    console.log(`Circular Dependencies Detected: ${stats.circularDependenciesDetected}`);
    console.log(`Initialized: ${stats.isInitialized ? 'Yes' : 'No'}`);
    console.log('');
  }
}

// === SCOPE MANAGER ===

export class ScopeManager {
  constructor(container, scopeName) {
    this.container = container;
    this.scopeName = scopeName;
    this.originalScope = container.currentScope;
  }

  /**
   * Switch to this scope
   */
  enter() {
    this.container.switchScope(this.scopeName);
    return this;
  }

  /**
   * Return to original scope
   */
  exit() {
    this.container.switchScope(this.originalScope);
    return this;
  }

  /**
   * Execute function within this scope
   */
  async run(fn) {
    this.enter();
    try {
      return await fn();
    } finally {
      this.exit();
    }
  }

  /**
   * Clear this scope
   */
  async clear() {
    await this.container.clearScope(this.scopeName);
  }
}

// === FLUENT BUILDER ===

export class ServiceBuilder {
  constructor(container, name) {
    this.container = container;
    this.definition = { name };
  }

  implementation(factory) {
    this.definition.factory = factory;
    return this;
  }

  dependencies(...deps) {
    this.definition.dependencies = deps;
    return this;
  }

  singleton() {
    this.definition.lifecycle = 'singleton';
    return this;
  }

  transient() {
    this.definition.lifecycle = 'transient';
    return this;
  }

  scoped() {
    this.definition.lifecycle = 'scoped';
    return this;
  }

  withOptions(options) {
    this.definition.options = options;
    return this;
  }

  withLifecycle(lifecycle) {
    this.definition.lifecycle = lifecycle;
    return this;
  }

  onInitialize(handler) {
    if (!this.definition.lifecycle) {
      this.definition.lifecycle = {};
    }
    this.definition.lifecycle.onInitialize = handler;
    return this;
  }

  onShutdown(handler) {
    if (!this.definition.lifecycle) {
      this.definition.lifecycle = {};
    }
    this.definition.lifecycle.onShutdown = handler;
    return this;
  }

  register() {
    this.container.register(this.definition.name, this.definition);
    return this.container;
  }
}

// === FACTORY FUNCTION ===

/**
 * Create a new DI container
 */
export function createContainer(options = {}) {
  return new DIContainer(options);
}

export default DIContainer;