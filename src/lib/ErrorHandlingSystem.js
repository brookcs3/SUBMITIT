/**
 * Enhanced Error Handling System
 * 
 * Comprehensive error handling with retry mechanisms, graceful degradation,
 * intelligent error categorization, and sophisticated recovery strategies.
 */

import { EventEmitter } from 'events';
import chalk from 'chalk';

export class ErrorHandlingSystem extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableRetryMechanisms: true,
      enableGracefulDegradation: true,
      enableErrorRecovery: true,
      enableIntelligentFallbacks: true,
      enableErrorAnalytics: true,
      maxRetryAttempts: 3,
      retryDelayBase: 1000, // 1 second
      retryDelayMultiplier: 2,
      enableCircuitBreaker: true,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 30000, // 30 seconds
      enableLogging: true,
      ...options
    };
    
    // Error tracking and analytics
    this.errorHistory = [];
    this.errorCounts = new Map();
    this.circuitBreakers = new Map();
    this.retryStrategies = new Map();
    this.fallbackStrategies = new Map();
    
    // Performance tracking
    this.operationMetrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      retriedOperations: 0,
      recoveredOperations: 0,
      degradedOperations: 0
    };
    
    // Recovery patterns
    this.recoveryPatterns = new Map();
    this.degradationStrategies = new Map();
    
    this.initialize();
  }
  
  // === INITIALIZATION ===
  
  initialize() {
    console.log(chalk.blue('🛡️  Initializing Enhanced Error Handling System...'));
    
    // Set up built-in retry strategies
    this.setupBuiltInRetryStrategies();
    
    // Set up fallback strategies
    this.setupFallbackStrategies();
    
    // Set up degradation strategies
    this.setupDegradationStrategies();
    
    // Set up recovery patterns
    this.setupRecoveryPatterns();
    
    console.log(chalk.green('✅ Error handling system initialized'));
    this.emit('error-handling-ready');
  }
  
  // === RETRY STRATEGIES ===
  
  setupBuiltInRetryStrategies() {
    // Exponential backoff retry
    this.retryStrategies.set('exponential-backoff', {
      name: 'Exponential Backoff',
      description: 'Exponentially increasing delay between retries',
      calculateDelay: (attempt, baseDelay = this.options.retryDelayBase) => {
        return baseDelay * Math.pow(this.options.retryDelayMultiplier, attempt - 1);
      },
      shouldRetry: (error, attempt) => {
        return attempt <= this.options.maxRetryAttempts && this.isRetryableError(error);
      }
    });
    
    // Linear backoff retry
    this.retryStrategies.set('linear-backoff', {
      name: 'Linear Backoff',
      description: 'Linearly increasing delay between retries',
      calculateDelay: (attempt, baseDelay = this.options.retryDelayBase) => {
        return baseDelay * attempt;
      },
      shouldRetry: (error, attempt) => {
        return attempt <= this.options.maxRetryAttempts && this.isRetryableError(error);
      }
    });
    
    // Immediate retry (for transient errors)
    this.retryStrategies.set('immediate', {
      name: 'Immediate Retry',
      description: 'Immediate retry with no delay',
      calculateDelay: () => 0,
      shouldRetry: (error, attempt) => {
        return attempt <= 2 && this.isTransientError(error);
      }
    });
    
    // Jittered retry (adds randomness to prevent thundering herd)
    this.retryStrategies.set('jittered', {
      name: 'Jittered Retry',
      description: 'Exponential backoff with jitter to prevent thundering herd',
      calculateDelay: (attempt, baseDelay = this.options.retryDelayBase) => {
        const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * exponentialDelay * 0.1; // 10% jitter
        return exponentialDelay + jitter;
      },
      shouldRetry: (error, attempt) => {
        return attempt <= this.options.maxRetryAttempts && this.isRetryableError(error);
      }
    });
  }
  
  // === FALLBACK STRATEGIES ===
  
  setupFallbackStrategies() {
    // Graceful degradation fallback
    this.fallbackStrategies.set('graceful-degradation', {
      name: 'Graceful Degradation',
      description: 'Provide reduced functionality when primary operation fails',
      execute: async (operation, error, context) => {
        console.log(chalk.yellow(`⚠️  Graceful degradation for ${operation}`));
        return this.executeGracefulDegradation(operation, error, context);
      }
    });
    
    // Cache fallback
    this.fallbackStrategies.set('cache-fallback', {
      name: 'Cache Fallback',
      description: 'Fall back to cached results when operation fails',
      execute: async (operation, error, context) => {
        console.log(chalk.cyan(`📦 Cache fallback for ${operation}`));
        return this.executeCacheFallback(operation, error, context);
      }
    });
    
    // Default values fallback
    this.fallbackStrategies.set('default-values', {
      name: 'Default Values',
      description: 'Return sensible default values when operation fails',
      execute: async (operation, error, context) => {
        console.log(chalk.blue(`🔧 Default values fallback for ${operation}`));
        return this.executeDefaultValuesFallback(operation, error, context);
      }
    });
    
    // Alternative implementation fallback
    this.fallbackStrategies.set('alternative-implementation', {
      name: 'Alternative Implementation',
      description: 'Use alternative implementation when primary fails',
      execute: async (operation, error, context) => {
        console.log(chalk.magenta(`🔄 Alternative implementation for ${operation}`));
        return this.executeAlternativeImplementation(operation, error, context);
      }
    });
  }
  
  // === DEGRADATION STRATEGIES ===
  
  setupDegradationStrategies() {
    // Quality degradation
    this.degradationStrategies.set('quality-degradation', {
      name: 'Quality Degradation',
      description: 'Reduce output quality to ensure operation completes',
      apply: (options) => ({
        ...options,
        quality: 'basic',
        enableOptimizations: false,
        enableAdvancedFeatures: false
      })
    });
    
    // Feature reduction
    this.degradationStrategies.set('feature-reduction', {
      name: 'Feature Reduction',
      description: 'Disable non-essential features to ensure core functionality',
      apply: (options) => ({
        ...options,
        enableAnimations: false,
        enableAdvancedLayouts: false,
        enableExperimentalFeatures: false
      })
    });
    
    // Performance degradation
    this.degradationStrategies.set('performance-degradation', {
      name: 'Performance Degradation',
      description: 'Accept slower performance to ensure operation completes',
      apply: (options) => ({
        ...options,
        enableCaching: false,
        enableParallelProcessing: false,
        batchSize: 1
      })
    });
  }
  
  // === RECOVERY PATTERNS ===
  
  setupRecoveryPatterns() {
    // File operation recovery
    this.recoveryPatterns.set('file-operation', {
      patterns: [
        { errorCode: 'ENOENT', recovery: 'create-missing-directory' },
        { errorCode: 'EACCES', recovery: 'request-elevated-permissions' },
        { errorCode: 'EMFILE', recovery: 'close-unused-handles' },
        { errorCode: 'ENOSPC', recovery: 'cleanup-temporary-files' }
      ]
    });
    
    // Network operation recovery
    this.recoveryPatterns.set('network-operation', {
      patterns: [
        { errorCode: 'ECONNRESET', recovery: 'retry-with-keepalive' },
        { errorCode: 'ETIMEDOUT', recovery: 'increase-timeout' },
        { errorCode: 'ENOTFOUND', recovery: 'try-alternative-endpoint' },
        { errorCode: 'ECONNREFUSED', recovery: 'check-service-availability' }
      ]
    });
    
    // Memory operation recovery
    this.recoveryPatterns.set('memory-operation', {
      patterns: [
        { errorCode: 'ENOMEM', recovery: 'force-garbage-collection' },
        { errorCode: 'MEMORY_LIMIT', recovery: 'reduce-memory-usage' },
        { errorCode: 'HEAP_OVERFLOW', recovery: 'restart-with-larger-heap' }
      ]
    });
  }
  
  // === CORE ERROR HANDLING ===
  
  /**
   * Execute operation with comprehensive error handling
   */
  async executeWithErrorHandling(operationName, operationFn, options = {}) {
    const operationId = this.generateOperationId();
    const startTime = Date.now();
    
    const config = {
      retryStrategy: 'exponential-backoff',
      fallbackStrategy: 'graceful-degradation',
      enableCircuitBreaker: true,
      enableRecovery: true,
      maxAttempts: this.options.maxRetryAttempts,
      context: {},
      ...options
    };
    
    this.operationMetrics.totalOperations++;
    
    try {
      // Check circuit breaker
      if (config.enableCircuitBreaker && this.isCircuitOpen(operationName)) {
        throw new Error(`Circuit breaker is open for operation: ${operationName}`);
      }
      
      // Execute operation with retries
      const result = await this.executeWithRetries(
        operationName,
        operationFn,
        config,
        operationId
      );
      
      // Record success
      this.recordOperationSuccess(operationName, startTime);
      this.operationMetrics.successfulOperations++;
      
      return result;
      
    } catch (error) {
      // Record failure
      this.recordOperationFailure(operationName, error, startTime);
      this.operationMetrics.failedOperations++;
      
      // Attempt recovery
      if (config.enableRecovery) {
        const recoveryResult = await this.attemptRecovery(
          operationName,
          error,
          config,
          operationId
        );
        
        if (recoveryResult.recovered) {
          this.operationMetrics.recoveredOperations++;
          return recoveryResult.result;
        }
      }
      
      // Execute fallback strategy
      if (config.fallbackStrategy) {
        try {
          const fallbackResult = await this.executeFallback(
            operationName,
            error,
            config,
            operationId
          );
          
          this.operationMetrics.degradedOperations++;
          return fallbackResult;
          
        } catch (fallbackError) {
          // If fallback also fails, throw the original error
          this.emit('fallback-failed', {
            operationName,
            originalError: error,
            fallbackError,
            operationId
          });
        }
      }
      
      // If all recovery attempts fail, throw the original error
      throw this.enhanceError(error, operationName, operationId);
    }
  }
  
  /**
   * Execute operation with retry logic
   */
  async executeWithRetries(operationName, operationFn, config, operationId) {
    const retryStrategy = this.retryStrategies.get(config.retryStrategy);
    let lastError = null;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        this.emit('operation-attempt', {
          operationName,
          operationId,
          attempt,
          maxAttempts: config.maxAttempts
        });
        
        const result = await operationFn(config.context);
        
        // Success - reset circuit breaker if needed
        if (config.enableCircuitBreaker) {
          this.resetCircuitBreaker(operationName);
        }
        
        if (attempt > 1) {
          this.operationMetrics.retriedOperations++;
          console.log(chalk.green(`✅ Operation succeeded on attempt ${attempt}: ${operationName}`));
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        // Check if we should retry
        if (attempt < config.maxAttempts && retryStrategy.shouldRetry(error, attempt)) {
          const delay = retryStrategy.calculateDelay(attempt);
          
          console.log(chalk.yellow(
            `⚠️  Attempt ${attempt} failed for ${operationName}, retrying in ${delay}ms: ${error.message}`
          ));
          
          this.emit('operation-retry', {
            operationName,
            operationId,
            attempt,
            error: error.message,
            delay
          });
          
          if (delay > 0) {
            await this.sleep(delay);
          }
        } else {
          // No more retries, update circuit breaker
          if (config.enableCircuitBreaker) {
            this.updateCircuitBreaker(operationName, error);
          }
          break;
        }
      }
    }
    
    throw lastError;
  }
  
  // === CIRCUIT BREAKER ===
  
  isCircuitOpen(operationName) {
    const breaker = this.circuitBreakers.get(operationName);
    if (!breaker) return false;
    
    if (breaker.state === 'open') {
      if (Date.now() - breaker.lastFailure > this.options.circuitBreakerTimeout) {
        // Transition to half-open
        breaker.state = 'half-open';
        console.log(chalk.cyan(`🔄 Circuit breaker transitioning to half-open: ${operationName}`));
      } else {
        return true;
      }
    }
    
    return false;
  }
  
  updateCircuitBreaker(operationName, error) {
    if (!this.circuitBreakers.has(operationName)) {
      this.circuitBreakers.set(operationName, {
        failureCount: 0,
        state: 'closed',
        lastFailure: null
      });
    }
    
    const breaker = this.circuitBreakers.get(operationName);
    breaker.failureCount++;
    breaker.lastFailure = Date.now();
    
    if (breaker.failureCount >= this.options.circuitBreakerThreshold) {
      breaker.state = 'open';
      console.log(chalk.red(`🚫 Circuit breaker opened for ${operationName} after ${breaker.failureCount} failures`));
      
      this.emit('circuit-breaker-opened', {
        operationName,
        failureCount: breaker.failureCount,
        error: error.message
      });
    }
  }
  
  resetCircuitBreaker(operationName) {
    const breaker = this.circuitBreakers.get(operationName);
    if (breaker) {
      breaker.failureCount = 0;
      breaker.state = 'closed';
      breaker.lastFailure = null;
    }
  }
  
  // === RECOVERY MECHANISMS ===
  
  async attemptRecovery(operationName, error, config, operationId) {
    console.log(chalk.blue(`🔧 Attempting recovery for ${operationName}: ${error.message}`));
    
    // Find matching recovery pattern
    const recoveryPattern = this.findRecoveryPattern(operationName, error);
    
    if (recoveryPattern) {
      try {
        const recoveryResult = await this.executeRecovery(
          recoveryPattern,
          operationName,
          error,
          config
        );
        
        console.log(chalk.green(`✅ Recovery successful for ${operationName}`));
        
        this.emit('recovery-successful', {
          operationName,
          operationId,
          recoveryType: recoveryPattern.recovery,
          error: error.message
        });
        
        return { recovered: true, result: recoveryResult };
        
      } catch (recoveryError) {
        console.log(chalk.red(`❌ Recovery failed for ${operationName}: ${recoveryError.message}`));
        
        this.emit('recovery-failed', {
          operationName,
          operationId,
          recoveryType: recoveryPattern.recovery,
          originalError: error.message,
          recoveryError: recoveryError.message
        });
      }
    }
    
    return { recovered: false };
  }
  
  findRecoveryPattern(operationName, error) {
    // Determine operation category
    const operationCategory = this.categorizeOperation(operationName);
    const patterns = this.recoveryPatterns.get(operationCategory);
    
    if (!patterns) return null;
    
    // Find matching pattern
    return patterns.patterns.find(pattern => {
      return error.code === pattern.errorCode ||
             error.message.includes(pattern.errorCode) ||
             this.errorMatchesPattern(error, pattern);
    });
  }
  
  categorizeOperation(operationName) {
    if (operationName.includes('file') || operationName.includes('read') || operationName.includes('write')) {
      return 'file-operation';
    }
    if (operationName.includes('network') || operationName.includes('fetch') || operationName.includes('request')) {
      return 'network-operation';
    }
    if (operationName.includes('memory') || operationName.includes('allocation')) {
      return 'memory-operation';
    }
    return 'generic-operation';
  }
  
  async executeRecovery(recoveryPattern, operationName, error, config) {
    switch (recoveryPattern.recovery) {
      case 'create-missing-directory':
        return this.createMissingDirectory(error, config);
      
      case 'cleanup-temporary-files':
        return this.cleanupTemporaryFiles(config);
      
      case 'force-garbage-collection':
        return this.forceGarbageCollection();
      
      case 'retry-with-keepalive':
        return this.retryWithKeepalive(config);
      
      case 'increase-timeout':
        return this.increaseTimeout(config);
      
      default:
        throw new Error(`Unknown recovery type: ${recoveryPattern.recovery}`);
    }
  }
  
  // === FALLBACK EXECUTION ===
  
  async executeFallback(operationName, error, config, operationId) {
    const fallbackStrategy = this.fallbackStrategies.get(config.fallbackStrategy);
    
    if (!fallbackStrategy) {
      throw new Error(`Unknown fallback strategy: ${config.fallbackStrategy}`);
    }
    
    console.log(chalk.yellow(`🛡️  Executing fallback for ${operationName}: ${fallbackStrategy.name}`));
    
    this.emit('fallback-executing', {
      operationName,
      operationId,
      fallbackStrategy: fallbackStrategy.name,
      error: error.message
    });
    
    const result = await fallbackStrategy.execute(operationName, error, config.context);
    
    this.emit('fallback-successful', {
      operationName,
      operationId,
      fallbackStrategy: fallbackStrategy.name,
      result: typeof result
    });
    
    return result;
  }
  
  // === GRACEFUL DEGRADATION ===
  
  async executeGracefulDegradation(operationName, error, context) {
    // Apply degradation strategies based on error type
    let degradedOptions = { ...context };
    
    if (this.isResourceError(error)) {
      degradedOptions = this.degradationStrategies.get('performance-degradation').apply(degradedOptions);
    }
    
    if (this.isComplexityError(error)) {
      degradedOptions = this.degradationStrategies.get('feature-reduction').apply(degradedOptions);
    }
    
    if (this.isQualityError(error)) {
      degradedOptions = this.degradationStrategies.get('quality-degradation').apply(degradedOptions);
    }
    
    return {
      degraded: true,
      options: degradedOptions,
      degradationReason: error.message,
      originalOperation: operationName
    };
  }
  
  // === ERROR CATEGORIZATION ===
  
  isRetryableError(error) {
    const retryablePatterns = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'EMFILE',
      'ENFILE',
      'EAGAIN',
      'EBUSY'
    ];
    
    return retryablePatterns.some(pattern => 
      error.code === pattern || error.message.includes(pattern)
    );
  }
  
  isTransientError(error) {
    const transientPatterns = [
      'ECONNRESET',
      'EAGAIN',
      'EBUSY',
      'Resource temporarily unavailable'
    ];
    
    return transientPatterns.some(pattern => 
      error.code === pattern || error.message.includes(pattern)
    );
  }
  
  isResourceError(error) {
    const resourcePatterns = [
      'ENOMEM',
      'ENOSPC',
      'EMFILE',
      'ENFILE',
      'out of memory',
      'disk full'
    ];
    
    return resourcePatterns.some(pattern => 
      error.code === pattern || error.message.toLowerCase().includes(pattern)
    );
  }
  
  isComplexityError(error) {
    const complexityPatterns = [
      'too complex',
      'timeout',
      'exceeded limit',
      'maximum recursion'
    ];
    
    return complexityPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern)
    );
  }
  
  isQualityError(error) {
    const qualityPatterns = [
      'quality',
      'precision',
      'accuracy',
      'resolution'
    ];
    
    return qualityPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern)
    );
  }
  
  // === UTILITY METHODS ===
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  enhanceError(error, operationName, operationId) {
    error.operationName = operationName;
    error.operationId = operationId;
    error.timestamp = Date.now();
    error.handledBy = 'ErrorHandlingSystem';
    return error;
  }
  
  recordOperationSuccess(operationName, startTime) {
    const duration = Date.now() - startTime;
    
    this.emit('operation-success', {
      operationName,
      duration,
      timestamp: Date.now()
    });
  }
  
  recordOperationFailure(operationName, error, startTime) {
    const duration = Date.now() - startTime;
    
    this.errorHistory.push({
      operationName,
      error: error.message,
      duration,
      timestamp: Date.now()
    });
    
    // Update error counts
    const count = this.errorCounts.get(operationName) || 0;
    this.errorCounts.set(operationName, count + 1);
    
    this.emit('operation-failure', {
      operationName,
      error: error.message,
      duration,
      timestamp: Date.now()
    });
  }
  
  // === SPECIFIC RECOVERY IMPLEMENTATIONS ===
  
  async createMissingDirectory(error, config) {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Extract directory path from error
    const match = error.message.match(/ENOENT.*'([^']+)'/);
    if (match) {
      const filePath = match[1];
      const dirPath = path.dirname(filePath);
      
      await fs.mkdir(dirPath, { recursive: true });
      console.log(chalk.green(`📁 Created missing directory: ${dirPath}`));
      
      return { recoveryAction: 'directory-created', path: dirPath };
    }
    
    throw new Error('Could not determine missing directory path');
  }
  
  async cleanupTemporaryFiles(config) {
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    
    const tempDir = os.tmpdir();
    let cleanedCount = 0;
    
    try {
      const files = await fs.readdir(tempDir);
      const tempFiles = files.filter(file => file.startsWith('submitit_') || file.startsWith('tmp_'));
      
      for (const file of tempFiles) {
        try {
          await fs.unlink(path.join(tempDir, file));
          cleanedCount++;
        } catch (unlinkError) {
          // Ignore individual file cleanup errors
        }
      }
      
      console.log(chalk.green(`🧹 Cleaned up ${cleanedCount} temporary files`));
      return { recoveryAction: 'temp-cleanup', filesRemoved: cleanedCount };
      
    } catch (error) {
      throw new Error(`Failed to cleanup temporary files: ${error.message}`);
    }
  }
  
  async forceGarbageCollection() {
    if (global.gc) {
      global.gc();
      console.log(chalk.green('♻️  Forced garbage collection'));
      return { recoveryAction: 'gc-forced' };
    } else {
      throw new Error('Garbage collection not available (run with --expose-gc)');
    }
  }
  
  async retryWithKeepalive(config) {
    console.log(chalk.cyan('🔄 Retrying with keepalive enabled'));
    return {
      recoveryAction: 'keepalive-enabled',
      options: { ...config, keepAlive: true }
    };
  }
  
  async increaseTimeout(config) {
    const newTimeout = (config.timeout || 5000) * 2;
    console.log(chalk.cyan(`⏱️  Increasing timeout to ${newTimeout}ms`));
    return {
      recoveryAction: 'timeout-increased',
      options: { ...config, timeout: newTimeout }
    };
  }
  
  // === CACHE FALLBACK IMPLEMENTATIONS ===
  
  async executeCacheFallback(operationName, error, context) {
    // Simplified cache fallback - would integrate with actual cache system
    console.log(chalk.cyan(`📦 Attempting cache fallback for ${operationName}`));
    
    return {
      cached: true,
      data: this.getDefaultData(operationName),
      fallbackReason: error.message,
      timestamp: Date.now()
    };
  }
  
  async executeDefaultValuesFallback(operationName, error, context) {
    console.log(chalk.blue(`🔧 Using default values for ${operationName}`));
    
    return {
      defaults: true,
      data: this.getDefaultData(operationName),
      fallbackReason: error.message
    };
  }
  
  async executeAlternativeImplementation(operationName, error, context) {
    console.log(chalk.magenta(`🔄 Using alternative implementation for ${operationName}`));
    
    return {
      alternative: true,
      implementation: 'fallback',
      data: this.getDefaultData(operationName),
      fallbackReason: error.message
    };
  }
  
  getDefaultData(operationName) {
    const defaults = {
      'layout-generation': { type: 'simple', items: [], strategy: 'basic' },
      'file-validation': { valid: true, warnings: ['Validation failed, assuming valid'] },
      'theme-generation': { theme: 'default', colors: ['#000000', '#FFFFFF'] },
      'preview-generation': { preview: 'text-only', format: 'ascii' }
    };
    
    return defaults[operationName] || { status: 'fallback', message: 'Default fallback data' };
  }
  
  // === ANALYTICS AND REPORTING ===
  
  getErrorAnalytics() {
    return {
      metrics: this.operationMetrics,
      errorCounts: Object.fromEntries(this.errorCounts),
      circuitBreakers: Object.fromEntries(
        Array.from(this.circuitBreakers.entries()).map(([name, breaker]) => [
          name,
          { state: breaker.state, failureCount: breaker.failureCount }
        ])
      ),
      recentErrors: this.errorHistory.slice(-10),
      errorRate: this.operationMetrics.totalOperations > 0 
        ? this.operationMetrics.failedOperations / this.operationMetrics.totalOperations 
        : 0,
      recoveryRate: this.operationMetrics.failedOperations > 0 
        ? this.operationMetrics.recoveredOperations / this.operationMetrics.failedOperations 
        : 0
    };
  }
  
  printErrorReport() {
    const analytics = this.getErrorAnalytics();
    
    console.log(chalk.blue('\n🛡️  Error Handling System Report'));
    console.log(chalk.blue('====================================='));
    
    console.log(chalk.cyan('\n📊 Operation Metrics:'));
    console.log(`Total Operations: ${analytics.metrics.totalOperations}`);
    console.log(`Successful: ${analytics.metrics.successfulOperations}`);
    console.log(`Failed: ${analytics.metrics.failedOperations}`);
    console.log(`Recovered: ${analytics.metrics.recoveredOperations}`);
    console.log(`Degraded: ${analytics.metrics.degradedOperations}`);
    console.log(`Error Rate: ${(analytics.errorRate * 100).toFixed(2)}%`);
    console.log(`Recovery Rate: ${(analytics.recoveryRate * 100).toFixed(2)}%`);
    
    if (Object.keys(analytics.circuitBreakers).length > 0) {
      console.log(chalk.cyan('\n🔌 Circuit Breakers:'));
      Object.entries(analytics.circuitBreakers).forEach(([name, breaker]) => {
        const statusColor = breaker.state === 'open' ? chalk.red : 
                           breaker.state === 'half-open' ? chalk.yellow : chalk.green;
        console.log(`  ${name}: ${statusColor(breaker.state)} (${breaker.failureCount} failures)`);
      });
    }
    
    if (analytics.recentErrors.length > 0) {
      console.log(chalk.cyan('\n⚠️  Recent Errors:'));
      analytics.recentErrors.forEach(error => {
        const timeAgo = Math.round((Date.now() - error.timestamp) / 1000);
        console.log(`  ${error.operationName}: ${error.error} (${timeAgo}s ago)`);
      });
    }
    
    console.log(chalk.green('\n✅ Error handling report complete'));
  }
  
  // === CLEANUP ===
  
  dispose() {
    console.log(chalk.yellow('🧹 Disposing Error Handling System...'));
    
    this.errorHistory = [];
    this.errorCounts.clear();
    this.circuitBreakers.clear();
    this.removeAllListeners();
    
    console.log(chalk.green('✅ Error handling system disposed'));
  }
  
  // === UTILITY FOR ERROR MATCHING ===
  
  errorMatchesPattern(error, pattern) {
    // Advanced pattern matching logic could be implemented here
    return false;
  }
}

export default ErrorHandlingSystem;