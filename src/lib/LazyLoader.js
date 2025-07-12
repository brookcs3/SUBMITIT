/**
 * Lazy Loading System for Heavy Dependencies
 * 
 * Implements progressive enhancement by loading heavy dependencies only when needed.
 * This improves startup time and memory usage for the submitit CLI.
 */

import { EventEmitter } from 'events';
import chalk from 'chalk';

export class LazyLoader extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enablePreloading: false,
      preloadDelay: 2000,
      enableCaching: true,
      enableProgressFeedback: true,
      ...options
    };
    
    this.modules = new Map();
    this.loading = new Set();
    this.preloadQueue = [];
    this.cache = new Map();
    this.loadStats = {
      totalLoads: 0,
      cacheHits: 0,
      preloadHits: 0,
      loadTimes: []
    };
  }

  // === MODULE REGISTRATION ===

  /**
   * Register a module for lazy loading
   */
  register(name, loader, options = {}) {
    const moduleConfig = {
      name,
      loader,
      priority: options.priority || 'normal', // 'critical', 'high', 'normal', 'low'
      dependencies: options.dependencies || [],
      preload: options.preload || false,
      cached: false,
      loadTime: null,
      errorCount: 0,
      lastError: null,
      ...options
    };

    this.modules.set(name, moduleConfig);
    
    if (moduleConfig.preload && this.options.enablePreloading) {
      this.schedulePreload(name);
    }

    this.emit('module-registered', { name, config: moduleConfig });
  }

  /**
   * Register multiple modules at once
   */
  registerModules(modules) {
    Object.entries(modules).forEach(([name, config]) => {
      if (typeof config === 'function') {
        this.register(name, config);
      } else {
        this.register(name, config.loader, config);
      }
    });
  }

  // === LAZY LOADING ===

  /**
   * Load a module lazily
   */
  async load(name, options = {}) {
    const startTime = Date.now();
    const moduleConfig = this.modules.get(name);
    
    if (!moduleConfig) {
      throw new Error(`Module '${name}' not registered`);
    }

    // Check cache first
    if (this.options.enableCaching && this.cache.has(name)) {
      this.loadStats.cacheHits++;
      this.emit('cache-hit', { name });
      return this.cache.get(name);
    }

    // Check if already loading
    if (this.loading.has(name)) {
      return this.waitForLoad(name);
    }

    this.loading.add(name);
    this.loadStats.totalLoads++;

    try {
      // Load dependencies first
      if (moduleConfig.dependencies.length > 0) {
        await this.loadDependencies(moduleConfig.dependencies);
      }

      // Provide progress feedback
      if (this.options.enableProgressFeedback) {
        this.emit('loading-start', { name, config: moduleConfig });
      }

      // Execute the loader
      const module = await this.executeLoader(moduleConfig, options);
      
      // Cache the result
      if (this.options.enableCaching) {
        this.cache.set(name, module);
      }

      const loadTime = Date.now() - startTime;
      this.loadStats.loadTimes.push(loadTime);
      
      moduleConfig.cached = true;
      moduleConfig.loadTime = loadTime;
      moduleConfig.errorCount = 0;
      moduleConfig.lastError = null;

      this.loading.delete(name);
      
      this.emit('loaded', { name, module, loadTime });
      
      return module;

    } catch (error) {
      this.loading.delete(name);
      
      moduleConfig.errorCount++;
      moduleConfig.lastError = error;
      
      this.emit('load-error', { name, error, config: moduleConfig });
      
      throw new Error(`Failed to load module '${name}': ${error.message}`);
    }
  }

  /**
   * Load multiple modules concurrently
   */
  async loadMultiple(names, options = {}) {
    const promises = names.map(name => this.load(name, options));
    
    if (options.failFast !== false) {
      return Promise.all(promises);
    } else {
      // Load all modules, collecting both successes and failures
      const results = await Promise.allSettled(promises);
      const loaded = {};
      const errors = {};
      
      results.forEach((result, index) => {
        const name = names[index];
        if (result.status === 'fulfilled') {
          loaded[name] = result.value;
        } else {
          errors[name] = result.reason;
        }
      });
      
      return { loaded, errors };
    }
  }

  // === PRELOADING ===

  /**
   * Schedule a module for preloading
   */
  schedulePreload(name, delay = this.options.preloadDelay) {
    if (!this.options.enablePreloading) return;
    
    this.preloadQueue.push(name);
    
    setTimeout(() => {
      this.preloadModule(name);
    }, delay);
  }

  /**
   * Preload a module in the background
   */
  async preloadModule(name) {
    try {
      await this.load(name);
      this.loadStats.preloadHits++;
      this.emit('preloaded', { name });
    } catch (error) {
      this.emit('preload-error', { name, error });
    }
  }

  /**
   * Preload all modules marked for preloading
   */
  async preloadAll() {
    const preloadModules = Array.from(this.modules.entries())
      .filter(([_, config]) => config.preload)
      .map(([name]) => name);
    
    return this.loadMultiple(preloadModules, { failFast: false });
  }

  // === UTILITY METHODS ===

  /**
   * Execute a module loader with error handling
   */
  async executeLoader(moduleConfig, options) {
    const { loader, name } = moduleConfig;
    
    if (typeof loader === 'function') {
      return await loader(options);
    } else if (typeof loader === 'string') {
      // Dynamic import
      const module = await import(loader);
      return module.default || module;
    } else if (loader && typeof loader.load === 'function') {
      return await loader.load(options);
    } else {
      throw new Error(`Invalid loader for module '${name}'`);
    }
  }

  /**
   * Load module dependencies
   */
  async loadDependencies(dependencies) {
    const loadPromises = dependencies.map(dep => this.load(dep));
    return Promise.all(loadPromises);
  }

  /**
   * Wait for a module that's already loading
   */
  async waitForLoad(name, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout waiting for module '${name}' to load`));
      }, timeout);

      const onLoaded = (data) => {
        if (data.name === name) {
          clearTimeout(timeoutId);
          this.removeListener('loaded', onLoaded);
          this.removeListener('load-error', onError);
          resolve(data.module);
        }
      };

      const onError = (data) => {
        if (data.name === name) {
          clearTimeout(timeoutId);
          this.removeListener('loaded', onLoaded);
          this.removeListener('load-error', onError);
          reject(data.error);
        }
      };

      this.on('loaded', onLoaded);
      this.on('load-error', onError);
    });
  }

  // === CACHE MANAGEMENT ===

  /**
   * Clear cache for specific modules
   */
  clearCache(moduleNames = null) {
    if (moduleNames === null) {
      this.cache.clear();
      this.emit('cache-cleared', { type: 'all' });
    } else {
      const names = Array.isArray(moduleNames) ? moduleNames : [moduleNames];
      names.forEach(name => {
        this.cache.delete(name);
        const config = this.modules.get(name);
        if (config) {
          config.cached = false;
        }
      });
      this.emit('cache-cleared', { type: 'selective', names });
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      cachedModules: Array.from(this.cache.keys()),
      memoryUsage: this.estimateCacheMemoryUsage()
    };
  }

  /**
   * Estimate memory usage of cached modules
   */
  estimateCacheMemoryUsage() {
    // Rough estimation - in a real implementation you'd use more sophisticated methods
    let estimatedBytes = 0;
    
    this.cache.forEach((module, name) => {
      estimatedBytes += name.length * 2; // String overhead
      if (typeof module === 'object') {
        estimatedBytes += JSON.stringify(module).length * 2;
      } else {
        estimatedBytes += 100; // Base overhead for functions/other types
      }
    });
    
    return estimatedBytes;
  }

  // === PERFORMANCE MONITORING ===

  /**
   * Get loading statistics
   */
  getLoadStats() {
    const avgLoadTime = this.loadStats.loadTimes.length > 0 
      ? this.loadStats.loadTimes.reduce((a, b) => a + b, 0) / this.loadStats.loadTimes.length
      : 0;

    return {
      ...this.loadStats,
      averageLoadTime: Math.round(avgLoadTime),
      cacheHitRate: this.loadStats.totalLoads > 0 
        ? (this.loadStats.cacheHits / this.loadStats.totalLoads * 100).toFixed(1)
        : 0,
      preloadEffectiveness: this.loadStats.totalLoads > 0
        ? (this.loadStats.preloadHits / this.loadStats.totalLoads * 100).toFixed(1)
        : 0
    };
  }

  /**
   * Get module health information
   */
  getModuleHealth() {
    const health = [];
    
    this.modules.forEach((config, name) => {
      health.push({
        name,
        status: config.cached ? 'loaded' : 'unloaded',
        loadTime: config.loadTime,
        errorCount: config.errorCount,
        lastError: config.lastError?.message,
        priority: config.priority
      });
    });
    
    return health.sort((a, b) => b.errorCount - a.errorCount);
  }

  // === DEBUGGING ===

  /**
   * Enable debug mode with detailed logging
   */
  enableDebug() {
    this.on('module-registered', (data) => {
      console.log(chalk.blue(`[LazyLoader] Registered: ${data.name}`));
    });

    this.on('loading-start', (data) => {
      console.log(chalk.yellow(`[LazyLoader] Loading: ${data.name}...`));
    });

    this.on('loaded', (data) => {
      console.log(chalk.green(`[LazyLoader] Loaded: ${data.name} (${data.loadTime}ms)`));
    });

    this.on('cache-hit', (data) => {
      console.log(chalk.cyan(`[LazyLoader] Cache hit: ${data.name}`));
    });

    this.on('load-error', (data) => {
      console.log(chalk.red(`[LazyLoader] Error loading ${data.name}: ${data.error.message}`));
    });

    this.on('preloaded', (data) => {
      console.log(chalk.magenta(`[LazyLoader] Preloaded: ${data.name}`));
    });
  }

  /**
   * Generate a loading report
   */
  generateReport() {
    const stats = this.getLoadStats();
    const health = this.getModuleHealth();
    const cache = this.getCacheStats();
    
    return {
      timestamp: new Date().toISOString(),
      performance: stats,
      moduleHealth: health,
      cache: cache,
      configuration: {
        enablePreloading: this.options.enablePreloading,
        enableCaching: this.options.enableCaching,
        enableProgressFeedback: this.options.enableProgressFeedback
      }
    };
  }
}

// === PROGRESSIVE ENHANCEMENT UTILITY ===

/**
 * Progressive enhancement wrapper for features
 */
export class ProgressiveFeature {
  constructor(name, config = {}) {
    this.name = name;
    this.config = {
      fallback: null,
      retryAttempts: 3,
      retryDelay: 1000,
      gracefulDegradetion: true,
      ...config
    };
    
    this.isLoaded = false;
    this.feature = null;
    this.attempts = 0;
  }

  /**
   * Try to load the feature with fallback support
   */
  async tryLoad(loader) {
    if (this.isLoaded) {
      return this.feature;
    }

    for (let i = 0; i < this.config.retryAttempts; i++) {
      try {
        this.feature = await loader();
        this.isLoaded = true;
        return this.feature;
      } catch (error) {
        this.attempts++;
        
        if (i < this.config.retryAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        } else {
          if (this.config.gracefulDegradetion && this.config.fallback) {
            return this.config.fallback;
          } else {
            throw error;
          }
        }
      }
    }
  }

  /**
   * Use feature if loaded, otherwise use fallback
   */
  use(fallbackValue = null) {
    return this.isLoaded ? this.feature : (this.config.fallback || fallbackValue);
  }
}

// === DEFAULT LAZY LOADER INSTANCE ===

export const defaultLazyLoader = new LazyLoader({
  enablePreloading: true,
  enableCaching: true,
  enableProgressFeedback: true
});

// === CONVENIENCE FUNCTIONS ===

/**
 * Lazy load a module using the default loader
 */
export const lazyLoad = (name, options) => defaultLazyLoader.load(name, options);

/**
 * Register modules with the default loader
 */
export const registerLazyModules = (modules) => defaultLazyLoader.registerModules(modules);

/**
 * Create a progressive feature
 */
export const createProgressiveFeature = (name, config) => new ProgressiveFeature(name, config);

export default LazyLoader;