/**
 * Application Context - The Sacred Foundation
 * 
 * This provides dependency injection and manages the lifecycle of all submitit components.
 * It's the beating heart that coordinates the ceremonial flow of the application using
 * the TempleCoordinator pattern to bind the sacred layers together.
 */

// Import the sacred layers
import { ProjectDataAccess } from '../layers/ProjectDataAccess.js';
import { ProjectBusinessLogic } from '../layers/ProjectBusinessLogic.js';
import { ProjectUILayer } from '../layers/ProjectUILayer.js';
import { TempleCoordinator } from '../core/AbstractLayers.js';

// Import utility classes
import { Logger } from '../utils/Logger.js';
import { Analytics } from '../utils/Analytics.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import fs from 'fs-extra';
import path from 'path';

export class Context {
  constructor(options = {}) {
    this.options = options;
    this.services = new Map();
    this.isInitialized = false;
    
    // Sacred layers - The temple architecture
    this.dataLayer = null;
    this.businessLayer = null;
    this.uiLayer = null;
    this.coordinator = null;
    
    // Initialize core services
    this.initializeCore();
  }

  initializeCore() {
    // File system utilities
    this.fs = {
      ...fs,
      join: path.join,
      basename: path.basename,
      dirname: path.dirname,
      extname: path.extname
    };

    // Logger with contextual information
    this.logger = new Logger({
      level: this.options.logLevel || 'info',
      context: 'submitit'
    });

    // Performance monitoring
    this.performanceMonitor = new PerformanceMonitor();

    // Analytics for understanding user behavior
    this.analytics = new Analytics({
      enabled: this.options.analytics !== false,
      anonymous: true
    });

    // Note: UI Manager is now part of the ProjectUILayer
    // We'll initialize the sacred layers in the initialize() method
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    this.performanceMonitor.start('context_initialization');

    try {
      // Initialize the sacred layers first
      await this.initializeSacredLayers();
      
      // Initialize legacy services for backward compatibility
      await this.initializeLegacyServices();
      
      // Setup cleanup handlers
      this.setupCleanupHandlers();
      
      this.isInitialized = true;
      this.logger.debug('Context initialized successfully with sacred architecture');
      
    } catch (error) {
      this.logger.error('Failed to initialize context:', error);
      throw error;
    } finally {
      this.performanceMonitor.end('context_initialization');
    }
  }

  async initializeSacredLayers() {
    this.logger.info('Initializing sacred temple architecture...');
    
    try {
      // Initialize the Foundation (Data Access Layer)
      this.dataLayer = new ProjectDataAccess(this);
      await this.dataLayer.establishConnection();
      await this.dataLayer.validateIntegrity();
      
      // Initialize the Inner Sanctum (Business Logic Layer)  
      this.businessLayer = new ProjectBusinessLogic(this);
      await this.businessLayer.establishWisdom();
      await this.businessLayer.prepareTransformations();
      
      // Initialize the Facade (UI Layer)
      this.uiLayer = new ProjectUILayer(this);
      await this.uiLayer.establishPresence();
      await this.uiLayer.calibrateExperience();
      
      // Bind all layers together with the TempleCoordinator
      this.coordinator = new TempleCoordinator(this);
      this.coordinator.bindLayers(this.dataLayer, this.businessLayer, this.uiLayer);
      
      // Set up event forwarding between layers
      this.setupLayerEventForwarding();
      
      this.logger.info('Sacred temple architecture initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize sacred layers:', error);
      throw error;
    }
  }

  async initializeLegacyServices() {
    // Keep legacy services for backward compatibility
    // These will be gradually replaced by the layer architecture
    
    // For now, expose layer services through legacy interfaces
    this.projectManager = this.businessLayer.projectManager;
    this.layoutEngine = this.businessLayer.layoutEngine;
    this.fileValidator = this.dataLayer.fileValidator;
    this.previewManager = this.businessLayer.previewManager;
    this.packageManager = this.businessLayer.packageManager;
    
    // UI Manager is now part of the UI Layer
    this.ui = this.uiLayer.uiManager;
    
    this.logger.debug('Legacy service interfaces established');
  }

  setupLayerEventForwarding() {
    // Forward important events from layers to the context
    
    // Data layer events
    this.dataLayer.on('ritual-complete', (event) => {
      this.analytics.track('data_operation', { operation: event.operation });
    });
    
    // Business layer events
    this.businessLayer.on('transformation-complete', (event) => {
      this.analytics.track('transformation', { phase: event.phase });
    });
    
    // UI layer events
    this.uiLayer.on('phase-shown', (event) => {
      this.analytics.track('ui_phase', { phase: event.phase });
    });
    
    // Coordinator events
    this.coordinator.on('layer-error', (event) => {
      this.logger.error(`Layer error in ${event.layer}:`, event.error);
    });
    
    this.coordinator.on('performance-warning', (event) => {
      this.logger.warn(`Performance warning in ${event.layer}:`, event.warning);
    });
  }

  detectColorMode() {
    if (process.env.NO_COLOR) return 'none';
    if (!process.stdout.isTTY) return 'none';
    if (process.env.TERM === 'dumb') return 'none';
    return 'full';
  }

  setupCleanupHandlers() {
    const cleanup = async (signal) => {
      this.logger.info(`Received ${signal}, cleaning up...`);
      
      try {
        // Clean up sacred layers first
        if (this.coordinator) {
          await this.coordinator.cleanup();
        }
        
        if (this.uiLayer) {
          await this.uiLayer.cleanup();
        }
        
        if (this.businessLayer) {
          await this.businessLayer.cleanup();
        }
        
        if (this.dataLayer) {
          await this.dataLayer.cleanup();
        }
        
        // Flush analytics
        if (this.analytics) {
          await this.analytics.flush();
        }
        
        // Performance report
        if (this.performanceMonitor) {
          const report = this.performanceMonitor.getReport();
          this.logger.debug('Performance report:', report);
        }
        
        this.logger.info('Sacred cleanup completed successfully');
        
      } catch (error) {
        this.logger.error('Error during cleanup:', error);
      }
      
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('SIGHUP', cleanup);
  }

  // Service registration for dependency injection
  register(name, service) {
    this.services.set(name, service);
    this.logger.debug(`Registered service: ${name}`);
  }

  get(name) {
    if (!this.services.has(name)) {
      throw new Error(`Service not found: ${name}`);
    }
    return this.services.get(name);
  }

  // Configuration management
  getConfig(key, defaultValue = null) {
    return this.options[key] ?? defaultValue;
  }

  setConfig(key, value) {
    this.options[key] = value;
  }

  // Memory management - Sacred disposal
  async dispose() {
    this.logger.info('Disposing sacred context...');
    
    // Dispose sacred layers first
    if (this.coordinator) {
      await this.coordinator.cleanup();
      this.coordinator = null;
    }
    
    if (this.uiLayer) {
      await this.uiLayer.cleanup();
      this.uiLayer = null;
    }
    
    if (this.businessLayer) {
      await this.businessLayer.cleanup();
      this.businessLayer = null;
    }
    
    if (this.dataLayer) {
      await this.dataLayer.cleanup();
      this.dataLayer = null;
    }
    
    // Dispose all services
    for (const [name, service] of this.services) {
      if (service && typeof service.dispose === 'function') {
        try {
          await service.dispose();
          this.logger.debug(`Disposed service: ${name}`);
        } catch (error) {
          this.logger.error(`Error disposing service ${name}:`, error);
        }
      }
    }
    
    // Clear services
    this.services.clear();
    
    this.isInitialized = false;
  }

  // === SACRED LAYER ACCESS METHODS ===

  /**
   * Execute an intent through the business layer
   * This is the primary way to interact with the sacred architecture
   */
  async executeIntent(intent, context = {}) {
    if (!this.coordinator) {
      throw new Error('Sacred temple not initialized');
    }
    
    return await this.coordinator.executeIntent(intent, context);
  }

  /**
   * Check the health of the sacred temple
   */
  async checkTempleHealth() {
    if (!this.coordinator) {
      return { status: 'not-initialized' };
    }
    
    return await this.coordinator.checkTempleHealth();
  }

  /**
   * Get direct access to layers (use sparingly)
   */
  getDataLayer() {
    return this.dataLayer;
  }

  getBusinessLayer() {
    return this.businessLayer;
  }

  getUILayer() {
    return this.uiLayer;
  }

  getCoordinator() {
    return this.coordinator;
  }

  // Development utilities
  isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }

  isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  // Debug information
  getDebugInfo() {
    return {
      version: '1.0.0',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      services: Array.from(this.services.keys()),
      isInitialized: this.isInitialized,
      options: this.options
    };
  }
}