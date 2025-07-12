/**
 * Service Registration Configuration
 * 
 * Central registry for all submitit services and their dependencies.
 * This module configures the DI container with all core services.
 */

import { createContainer } from '../lib/DIContainer.js';

// Core Services
import { ProjectManager } from '../lib/ProjectManager.js';
import { PreviewManager } from '../lib/PreviewManager.js';
import { PackageManager } from '../lib/PackageManager.js';
import { FileValidator } from '../lib/FileValidator.js';
import { EnhancedYogaLayoutEngine } from '../lib/EnhancedYogaLayoutEngine.js';
import { SmartFileHandlerSimple } from '../lib/SmartFileHandlerSimple.js';
import { DynamicAstroGenerator } from '../lib/DynamicAstroGenerator.js';
import { SophisticatedThemeSystem } from '../lib/SophisticatedThemeSystem.js';
import { ThemeSystemIntegration } from '../lib/ThemeSystemIntegration.js';
import { StreamingPackageManager } from '../lib/StreamingPackageManager.js';
import { AccessibilityManager } from '../lib/AccessibilityManager.js';
import { LazyLoader } from '../lib/LazyLoader.js';
import { ErrorHandlingSystem } from '../lib/ErrorHandlingSystem.js';
import { HotReloadPreviewSystem } from '../lib/HotReloadPreviewSystem.js';
import { BrowshPreviewWrapper } from '../lib/BrowshPreviewWrapper.js';
import { ShareCliIntegration } from '../lib/ShareCliIntegration.js';
import { IntelligentErrorMessaging } from '../lib/IntelligentErrorMessaging.js';
import { CelebrationAnimationSystem } from '../lib/CelebrationAnimationSystem.js';
import { FileSizeValidationSystem } from '../lib/FileSizeValidationSystem.js';
import { VisualThemeEditor } from '../lib/VisualThemeEditor.js';
import { ThemePreviewSystem } from '../lib/ThemePreviewSystem.js';

/**
 * Configure and register all submitit services
 */
export function configureServices(options = {}) {
  const container = createContainer({
    enableLifecycleManagement: true,
    enableDependencyValidation: true,
    enableCircularDependencyDetection: true,
    enableTestingMode: process.env.NODE_ENV === 'test',
    strictMode: process.env.NODE_ENV !== 'test',
    ...options
  });

  // === CORE INFRASTRUCTURE ===

  // Error Handling System - Comprehensive error handling with retry mechanisms
  container.singleton('errorHandler', {
    factory: () => new ErrorHandlingSystem({
      enableRetryMechanisms: true,
      enableGracefulDegradation: true,
      enableErrorRecovery: true,
      enableIntelligentFallbacks: true,
      enableErrorAnalytics: true,
      maxRetryAttempts: 3,
      enableCircuitBreaker: true,
      enableLogging: true
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('🛡️  Error handling system with retry mechanisms initialized');
      }
    }
  });

  // Lazy Loader - Foundation service for dynamic imports
  container.singleton('lazyLoader', {
    factory: () => new LazyLoader({
      enableCaching: true,
      enablePerformanceMonitoring: true
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('🚀 Lazy loader initialized');
      }
    }
  });

  // Accessibility Manager - Ensures inclusive experience
  container.singleton('accessibilityManager', {
    factory: () => new AccessibilityManager({
      announceChanges: true,
      enableKeyboardNavigation: true,
      enableHighContrast: true
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('♿ Accessibility manager initialized');
      }
    }
  });

  // === FILE PROCESSING SERVICES ===

  // File Validator - Enhanced with celebration rituals
  container.singleton('fileValidator', {
    factory: () => new FileValidator({
      enableCelebrations: true,
      ceremonialMode: true,
      achievementTracking: true,
      maxFileSize: 100 * 1024 * 1024 // 100MB
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('🛡️  File validator with ceremonial rituals initialized');
      }
    }
  });

  // Smart File Handler - Ninja-style processing
  container.singleton('smartFileHandler', {
    factory: (fileValidator) => new SmartFileHandlerSimple({
      enableIncrementalMode: true,
      enableBatchProcessing: true,
      validator: fileValidator
    }),
    dependencies: ['fileValidator'],
    lifecycle: {
      onInitialize: async function() {
        console.log('⚡ Smart file handler initialized');
      }
    }
  });

  // === LAYOUT AND DESIGN SERVICES ===

  // Enhanced Yoga Layout Engine - Flexbox calculations with advanced optimization, memory management, and terminal detection
  container.singleton('layoutEngine', {
    factory: () => new EnhancedYogaLayoutEngine({
      enableSmartOptimization: true,
      enableContentAnalysis: true,
      enableResponsiveBreakpoints: true,
      enableConfigOptimization: true,
      enablePerformanceMonitoring: true,
      enableMemoryOptimization: true,
      enableMemoryProfiling: true,
      enableLeakDetection: true,
      enableTerminalDetection: true,
      enableAdaptiveScaling: true,
      enableRealtimeResize: true,
      enableExperimentalFeatures: false
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('🧘 Enhanced Yoga layout engine with config optimization, memory management, and terminal detection initialized');
        // Initialize the engine to set up advanced configurations, memory optimization, and terminal detection
        await this.initializeEngine();
      },
      onShutdown: async function(instance) {
        await instance.dispose();
        console.log('🧹 Enhanced Yoga layout engine disposed with comprehensive cleanup');
      }
    }
  });

  // Sophisticated Theme System - Professional theming
  container.singleton('themeSystem', {
    factory: () => new SophisticatedThemeSystem({
      cacheThemes: true,
      enableHotReload: true,
      generateResponsive: true,
      enableAnimations: true,
      enableDarkMode: true
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('🎨 Sophisticated theme system initialized');
      }
    }
  });

  // Dynamic Astro Generator - Beautiful site generation
  container.singleton('astroGenerator', {
    factory: (themeSystem) => new DynamicAstroGenerator({
      themeSystem,
      enableComponentLibrary: true,
      enableOptimizations: true
    }),
    dependencies: ['themeSystem'],
    lifecycle: {
      onInitialize: async function() {
        console.log('🌟 Dynamic Astro generator initialized');
      }
    }
  });

  // Theme System Integration - Connects theme system to previews
  container.singleton('themeIntegration', {
    factory: (themeSystem, astroGenerator) => new ThemeSystemIntegration({
      themeSystem,
      astroGenerator,
      enablePreviewMode: true,
      enableThemeCustomization: true,
      enableRealTimePreview: true
    }),
    dependencies: ['themeSystem', 'astroGenerator'],
    lifecycle: {
      onInitialize: async function() {
        console.log('🎭 Theme system integration initialized');
      }
    }
  });

  // === PROJECT MANAGEMENT SERVICES ===

  // Project Manager - Core project coordination
  container.singleton('projectManager', {
    factory: (layoutEngine, smartFileHandler, fileValidator, errorHandler) => new ProjectManager({
      layoutEngine,
      fileHandler: smartFileHandler,
      validator: fileValidator,
      errorHandler
    }),
    dependencies: ['layoutEngine', 'smartFileHandler', 'fileValidator', 'errorHandler'],
    lifecycle: {
      onInitialize: async function() {
        console.log('📁 Project manager initialized');
      }
    }
  });

  // Hot Reload Preview System - Automatic regeneration on content changes
  container.singleton('hotReloadSystem', {
    factory: () => new HotReloadPreviewSystem({
      enableHotReload: true,
      enableInstantPreview: true,
      enableDependencyTracking: true,
      enableIntelligentCaching: true,
      enableBatchUpdates: true,
      watchInterval: 100,
      debounceDelay: 300,
      enableLiveReload: true,
      enableDiffGeneration: true,
      enablePreviewOptimization: true
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('🔥 Hot-reload preview system with automatic regeneration initialized');
      }
    }
  });

  // Browsh Preview Wrapper - Terminal web browsing with ASCII fallbacks
  container.singleton('browshWrapper', {
    factory: () => new BrowshPreviewWrapper({
      enableBrowshIntegration: true,
      enableASCIIFallback: true,
      enableImageToASCII: true,
      enableHTMLToText: true,
      enableSmartFallback: true,
      previewWidth: 120,
      previewHeight: 30,
      enableColors: true,
      enableUnicode: true,
      fallbackStrategy: 'intelligent'
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('🌐 Browsh preview wrapper with ASCII fallbacks initialized');
      }
    }
  });

  // Preview Manager - Web and terminal previews
  container.singleton('previewManager', {
    factory: (layoutEngine, themeIntegration, hotReloadSystem, browshWrapper) => new PreviewManager({
      layoutEngine,
      themeIntegration,
      hotReloadSystem,
      browshWrapper,
      enableBrowshIntegration: true,
      enablePostcardFormat: true,
      enableHotReload: true,
      enableASCIIFallback: true
    }),
    dependencies: ['layoutEngine', 'themeIntegration', 'hotReloadSystem', 'browshWrapper'],
    lifecycle: {
      onInitialize: async function() {
        console.log('👁️  Preview manager initialized');
      }
    }
  });

  // Package Manager - Archive creation and export
  container.singleton('packageManager', {
    factory: (fileValidator) => new PackageManager({
      validator: fileValidator,
      supportedFormats: ['zip', 'tar', 'rar', '7z', 'iso'],
      enableCompression: true
    }),
    dependencies: ['fileValidator'],
    lifecycle: {
      onInitialize: async function() {
        console.log('📦 Package manager initialized');
      }
    }
  });

  // Streaming Package Manager - Memory-efficient exports
  container.singleton('streamingPackageManager', {
    factory: (packageManager, fileValidator) => new StreamingPackageManager({
      packageManager,
      validator: fileValidator,
      enableStreaming: true,
      enableOptimization: true
    }),
    dependencies: ['packageManager', 'fileValidator'],
    lifecycle: {
      onInitialize: async function() {
        console.log('🌊 Streaming package manager initialized');
      }
    }
  });

  // Share-CLI Integration - File sharing with multiple platforms
  container.singleton('shareCliIntegration', {
    factory: () => new ShareCliIntegration({
      enableShareCli: true,
      enableMultiplePlatforms: true,
      enableSmartSharing: true,
      enableSharingAnalytics: true,
      enableSharingHistory: true,
      defaultPlatforms: ['transfer.sh', 'file.io', '0x0.st'],
      maxFileSize: 100 * 1024 * 1024, // 100MB
      enableQRCodes: true,
      enableShortLinks: true,
      enableExpirationDates: true
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('📤 Share-CLI integration with multiple platforms initialized');
      }
    }
  });

  // === ADVANCED MESSAGING AND VALIDATION SERVICES ===

  // Intelligent Error Messaging - Contextual error analysis with actionable suggestions
  container.singleton('intelligentErrorMessaging', {
    factory: () => new IntelligentErrorMessaging({
      enableIntelligentSuggestions: true,
      enableContextualHelp: true,
      enableErrorPatternMatching: true,
      enableActionableSolutions: true,
      enableLearningFromErrors: true,
      enableErrorCategories: true,
      enableSeverityScoring: true,
      maxSuggestions: 5,
      enableErrorHistory: true,
      enablePreventiveTips: true
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('🧠 Intelligent error messaging with contextual suggestions initialized');
      }
    }
  });

  // Celebration Animation System - Sophisticated celebration animations with rarity systems
  container.singleton('celebrationSystem', {
    factory: () => new CelebrationAnimationSystem({
      enableAnimations: true,
      enableContextualMessages: true,
      enableAchievementDetection: true,
      enablePersonalizedMessages: true,
      enableSoundEffects: false,
      animationDuration: 3000,
      enableRaritySystem: true,
      enableCelebrationHistory: true,
      maxHistorySize: 100
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('🎉 Celebration animation system with rarity levels and achievements initialized');
      }
    }
  });

  // File Size Validation System - Advanced file validation with optimization suggestions
  container.singleton('fileSizeValidation', {
    factory: () => new FileSizeValidationSystem({
      enableSizeValidation: true,
      enableDimensionValidation: true,
      enableOptimizationSuggestions: true,
      enableAutomaticOptimization: false,
      enableHealthReporting: true,
      enableBatchValidation: true,
      enableProgressiveValidation: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxImageDimensions: { width: 8192, height: 8192 },
      maxVideoDuration: 3600,
      compressionThresholds: {
        images: 1024 * 1024,
        videos: 50 * 1024 * 1024,
        archives: 10 * 1024 * 1024
      }
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('📏 File size and dimension validation with optimization suggestions initialized');
      }
    }
  });

  // Visual Theme Editor - Interactive theme creation and editing
  container.singleton('visualThemeEditor', {
    factory: () => new VisualThemeEditor({
      enableInteractiveEditor: true,
      enableRealTimePreview: true,
      enableColorPicker: true,
      enableTypographyControls: true,
      enableCustomThemes: true,
      enableThemeValidation: true,
      enableThemeSharing: true,
      themesDirectory: './themes',
      previewWidth: 80,
      previewHeight: 24,
      autoSave: true,
      autoSaveInterval: 5000
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('🎨 Visual theme editor with real-time preview and validation initialized');
      }
    }
  });

  // Theme Preview System - Side-by-side theme comparison and visualization
  container.singleton('themePreviewSystem', {
    factory: () => new ThemePreviewSystem({
      enableSideBySideComparison: true,
      enableRealTimeUpdates: true,
      enableInteractivePreview: true,
      enableResponsivePreview: true,
      enableComponentPreview: true,
      previewWidth: 80,
      previewHeight: 24,
      comparisonColumns: 2,
      maxThemesInComparison: 4,
      animationDuration: 200,
      updateDebounceTime: 300
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('🖼️  Theme preview system with side-by-side comparison initialized');
      }
    }
  });

  // === APPLICATION SERVICES ===

  // Application Context - Global application state
  container.singleton('appContext', {
    factory: () => ({
      version: '2.0.0',
      name: 'submitit',
      environment: process.env.NODE_ENV || 'development',
      startTime: Date.now(),
      capabilities: {
        yogaLayout: true,
        themeSystem: true,
        celebrations: true,
        accessibility: true,
        streaming: true
      }
    }),
    lifecycle: {
      onInitialize: async function() {
        console.log('🌐 Application context initialized');
      }
    }
  });

  // Configuration Manager - Application configuration
  container.singleton('configManager', {
    factory: (appContext) => ({
      appContext,
      get(key, defaultValue) {
        return process.env[key] || defaultValue;
      },
      getBoolean(key, defaultValue) {
        const value = process.env[key];
        if (value === undefined) return defaultValue;
        return value.toLowerCase() === 'true';
      },
      isProduction() {
        return this.appContext.environment === 'production';
      },
      isDevelopment() {
        return this.appContext.environment === 'development';
      },
      isTest() {
        return this.appContext.environment === 'test';
      }
    }),
    dependencies: ['appContext'],
    lifecycle: {
      onInitialize: async function() {
        console.log('⚙️  Configuration manager initialized');
      }
    }
  });

  // === FACADE SERVICES ===

  // Main Submitit Service - High-level API facade
  container.singleton('submitit', {
    factory: (projectManager, previewManager, packageManager, streamingPackageManager, themeIntegration, layoutEngine, errorHandler, hotReloadSystem, browshWrapper, shareCliIntegration, intelligentErrorMessaging, celebrationSystem, fileSizeValidation, visualThemeEditor, themePreviewSystem) => ({
      // Core operations
      async createProject(config) {
        return await projectManager.createProject(config);
      },
      
      async addFiles(projectName, files) {
        return await projectManager.addFiles(projectName, files);
      },
      
      async generatePreview(projectName, options = {}) {
        const project = await projectManager.getProject(projectName);
        return await previewManager.startWebPreview(project, options);
      },
      
      async exportProject(projectName, options = {}) {
        const project = await projectManager.getProject(projectName);
        if (options.streaming) {
          return await streamingPackageManager.exportProjectStreaming(project, options);
        } else {
          return await packageManager.createPackage(project, options);
        }
      },
      
      async generateThemedPreview(projectName, themeOptions = {}) {
        const project = await projectManager.getProject(projectName);
        return await themeIntegration.generateThemedPreview(project, themeOptions);
      },
      
      // Advanced layout operations
      async optimizeLayoutPerformance(projectName, context = {}) {
        const project = await projectManager.getProject(projectName);
        return await layoutEngine.analyzeLayoutPerformance({
          ...context,
          projectName,
          itemCount: project.files?.length || 0
        });
      },
      
      async switchLayoutConfig(context = 'terminal') {
        return await layoutEngine.switchToOptimizedConfig(context);
      },
      
      async getLayoutStats() {
        return layoutEngine.getConfigOptimizationStats();
      },
      
      async printLayoutAnalysis() {
        return layoutEngine.printConfigurationAnalysis();
      },
      
      // Memory optimization operations
      async generateMemoryOptimizedLayout(projectName, options = {}) {
        const project = await projectManager.getProject(projectName);
        return await layoutEngine.generateMemoryOptimizedLayout(project.files || [], options);
      },
      
      async runMemoryAnalysis() {
        return await layoutEngine.runMemoryAnalysis();
      },
      
      async getMemoryStats() {
        return layoutEngine.getMemoryOptimizationStats();
      },
      
      async printMemoryAnalysis() {
        return layoutEngine.printMemoryAnalysis();
      },
      
      // Smart cache operations
      async getCacheStats() {
        return layoutEngine.getCachePerformanceStats();
      },
      
      async printCacheAnalysis() {
        return layoutEngine.printCacheAnalysis();
      },
      
      async invalidateSmartCache(contentChanges = {}) {
        return layoutEngine.invalidateSmartCache(contentChanges);
      },
      
      async warmCache(projectName, strategies = ['magazine', 'portfolio', 'academic']) {
        const project = await projectManager.getProject(projectName);
        return await layoutEngine.warmCache(project.files || [], strategies);
      },
      
      // Terminal detection and adaptive scaling operations
      async getTerminalInfo() {
        return layoutEngine.getCurrentTerminalInfo();
      },
      
      async getTerminalStats() {
        return layoutEngine.getTerminalDetectionStats();
      },
      
      async printTerminalAnalysis() {
        return layoutEngine.printTerminalAnalysis();
      },
      
      async generateAdaptiveLayout(projectName, options = {}) {
        const project = await projectManager.getProject(projectName);
        return await layoutEngine.generateAdaptiveResponsiveLayout(project.files || [], options);
      },
      
      async getAdaptiveBreakpoints() {
        return layoutEngine.getTerminalBreakpoints();
      },
      
      async getAdaptiveGridConfig(targetColumns = null) {
        return layoutEngine.getAdaptiveGridConfig(targetColumns);
      },
      
      // Hot reload and preview operations
      async startHotReload(projectPath, options = {}) {
        return await hotReloadSystem.startWatching(projectPath, options);
      },
      
      async stopHotReload() {
        return await hotReloadSystem.stopWatching();
      },
      
      async getReloadStats() {
        return hotReloadSystem.getReloadStats();
      },
      
      async getPreviewHistory() {
        return hotReloadSystem.getPreviewHistory();
      },
      
      async getCurrentPreview() {
        return hotReloadSystem.getCurrentPreview();
      },
      
      async printReloadReport() {
        return hotReloadSystem.printReloadReport();
      },
      
      async generatePreviewWithHotReload(projectName, options = {}) {
        const project = await projectManager.getProject(projectName);
        const preview = await previewManager.startWebPreview(project, {
          ...options,
          enableHotReload: true
        });
        
        // Start hot reload watching
        if (project.path) {
          await this.startHotReload(project.path);
        }
        
        return preview;
      },
      
      // Browsh and ASCII preview operations
      async generateBrowshPreview(content, options = {}) {
        return await browshWrapper.generatePreview(content, {
          format: 'browsh',
          ...options
        });
      },
      
      async generateASCIIPreview(content, options = {}) {
        return await browshWrapper.generatePreview(content, {
          format: 'ascii',
          ...options
        });
      },
      
      async generateTextPreview(content, options = {}) {
        return await browshWrapper.generatePreview(content, {
          format: 'text',
          ...options
        });
      },
      
      async getPreviewStats() {
        return browshWrapper.getPreviewStats();
      },
      
      async printPreviewReport() {
        return browshWrapper.printPreviewReport();
      },
      
      async clearPreviewCache() {
        return browshWrapper.clearCache();
      },
      
      // File sharing and distribution operations
      async shareFile(filePath, options = {}) {
        return await shareCliIntegration.shareFile(filePath, options);
      },
      
      async shareProject(projectName, options = {}) {
        const project = await projectManager.getProject(projectName);
        return await shareCliIntegration.shareProject(project.path, options);
      },
      
      async shareExport(projectName, exportOptions = {}, shareOptions = {}) {
        // Export project first
        const exportResult = await this.exportProject(projectName, exportOptions);
        
        // Then share the exported file
        return await shareCliIntegration.shareFile(exportResult.filePath, {
          description: `Exported ${projectName}`,
          generateQR: true,
          generateShortLink: true,
          ...shareOptions
        });
      },
      
      async getSharingStats() {
        return shareCliIntegration.getSharingStats();
      },
      
      async getSharingHistory(limit = 10) {
        return shareCliIntegration.getSharingHistory(limit);
      },
      
      async getActivePlatforms() {
        return shareCliIntegration.getActivePlatforms();
      },
      
      async printSharingReport() {
        return shareCliIntegration.printSharingReport();
      },
      
      // Error handling and resilience operations
      async executeWithRetry(operationName, operationFn, options = {}) {
        return await errorHandler.executeWithErrorHandling(operationName, operationFn, options);
      },
      
      async getErrorAnalytics() {
        return errorHandler.getErrorAnalytics();
      },
      
      async printErrorReport() {
        return errorHandler.printErrorReport();
      },
      
      async resetCircuitBreakers() {
        Object.keys(errorHandler.circuitBreakers).forEach(name => {
          errorHandler.resetCircuitBreaker(name);
        });
        return { message: 'All circuit breakers reset' };
      },
      
      // Utility methods
      async listProjects() {
        return await projectManager.listProjects();
      },
      
      async getProjectStats(projectName) {
        return await projectManager.getProjectStats(projectName);
      },
      
      // === INTELLIGENT ERROR MESSAGING OPERATIONS ===
      
      async analyzeError(error, context = {}) {
        return await intelligentErrorMessaging.analyzeError(error, context);
      },
      
      async getErrorSuggestions(errorType, context = {}) {
        return await intelligentErrorMessaging.getErrorSuggestions(errorType, context);
      },
      
      async getErrorHistory(limit = 20) {
        return intelligentErrorMessaging.getErrorHistory(limit);
      },
      
      async printErrorAnalysis() {
        return intelligentErrorMessaging.printErrorAnalysis();
      },
      
      // === CELEBRATION ANIMATION OPERATIONS ===
      
      async celebrate(type, context = {}) {
        return await celebrationSystem.celebrate(type, context);
      },
      
      async getCelebrationStats() {
        return celebrationSystem.getCelebrationStats();
      },
      
      async getCelebrationHistory(limit = 10) {
        return celebrationSystem.getCelebrationHistory(limit);
      },
      
      async printCelebrationReport() {
        return celebrationSystem.printCelebrationReport();
      },
      
      async getAvailableCelebrationTypes() {
        return celebrationSystem.getAvailableCelebrationTypes();
      },
      
      // === FILE SIZE AND DIMENSION VALIDATION OPERATIONS ===
      
      async validateFile(filePath, options = {}) {
        return await fileSizeValidation.validateFile(filePath, options);
      },
      
      async validateBatch(filePaths, options = {}) {
        return await fileSizeValidation.validateBatch(filePaths, options);
      },
      
      async getValidationStats() {
        return fileSizeValidation.getValidationStats();
      },
      
      async getHealthMetrics() {
        return fileSizeValidation.getHealthMetrics();
      },
      
      async getValidationHistory(limit = 50) {
        return fileSizeValidation.getValidationHistory(limit);
      },
      
      async printValidationReport() {
        return fileSizeValidation.printValidationReport();
      },
      
      async clearValidationCache() {
        return fileSizeValidation.clearCache();
      },
      
      // === INTEGRATED WORKFLOWS ===
      
      async createProjectWithCelebration(config) {
        try {
          const project = await projectManager.createProject(config);
          
          // Celebrate project creation
          await celebrationSystem.celebrate('project-created', {
            projectName: project.name,
            isFirstTime: true,
            fileCount: project.files?.length || 0
          });
          
          return project;
        } catch (error) {
          const errorAnalysis = await intelligentErrorMessaging.analyzeError(error, {
            operation: 'project-creation',
            config
          });
          throw new Error(`Project creation failed: ${errorAnalysis.suggestion || error.message}`);
        }
      },
      
      async addFilesWithValidation(projectName, files) {
        try {
          // Validate files first
          const validationResults = await fileSizeValidation.validateBatch(files, {
            continueOnError: true
          });
          
          // Filter out files with critical issues
          const validFiles = validationResults.results
            .filter(result => result.healthScore > 50)
            .map(result => result.filePath);
          
          if (validFiles.length === 0) {
            throw new Error('No valid files to add after validation');
          }
          
          // Add valid files
          const result = await projectManager.addFiles(projectName, validFiles);
          
          // Celebrate file validation
          await celebrationSystem.celebrate('file-validated', {
            projectName,
            fileCount: validFiles.length,
            validationCount: validationResults.successfulValidations,
            perfectScore: validationResults.results.every(r => r.healthScore === 100)
          });
          
          return {
            ...result,
            validation: validationResults,
            validatedFiles: validFiles
          };
          
        } catch (error) {
          const errorAnalysis = await intelligentErrorMessaging.analyzeError(error, {
            operation: 'file-addition',
            projectName,
            fileCount: files.length
          });
          throw new Error(`File addition failed: ${errorAnalysis.suggestion || error.message}`);
        }
      },
      
      async exportProjectWithCelebration(projectName, options = {}) {
        try {
          const startTime = Date.now();
          
          // Export project
          const exportResult = options.streaming 
            ? await streamingPackageManager.exportProjectStreaming(await projectManager.getProject(projectName), options)
            : await packageManager.createPackage(await projectManager.getProject(projectName), options);
          
          const duration = Date.now() - startTime;
          
          // Celebrate export completion
          await celebrationSystem.celebrate('export-completed', {
            projectName,
            exportFormat: options.format || 'zip',
            duration,
            fileSize: exportResult.size,
            milestone: duration < 5000 // Fast export milestone
          });
          
          return exportResult;
          
        } catch (error) {
          const errorAnalysis = await intelligentErrorMessaging.analyzeError(error, {
            operation: 'project-export',
            projectName,
            options
          });
          throw new Error(`Export failed: ${errorAnalysis.suggestion || error.message}`);
        }
      },
      
      async shareExportWithCelebration(projectName, exportOptions = {}, shareOptions = {}) {
        try {
          // Export and share project
          const exportResult = await this.exportProjectWithCelebration(projectName, exportOptions);
          const shareResult = await shareCliIntegration.shareFile(exportResult.filePath, {
            description: `Exported ${projectName}`,
            generateQR: true,
            generateShortLink: true,
            ...shareOptions
          });
          
          // Celebrate first share if applicable
          if (shareOptions.isFirstShare) {
            await celebrationSystem.celebrate('first-share', {
              projectName,
              platform: shareResult.platform,
              shareUrl: shareResult.url
            });
          }
          
          return {
            export: exportResult,
            share: shareResult
          };
          
        } catch (error) {
          const errorAnalysis = await intelligentErrorMessaging.analyzeError(error, {
            operation: 'share-export',
            projectName,
            exportOptions,
            shareOptions
          });
          throw new Error(`Share export failed: ${errorAnalysis.suggestion || error.message}`);
        }
      },
      
      // === VISUAL THEME EDITOR OPERATIONS ===
      
      async createNewTheme(name, baseTheme = null) {
        return await visualThemeEditor.createNewTheme(name, baseTheme);
      },
      
      async loadTheme(themeName) {
        return await visualThemeEditor.loadTheme(themeName);
      },
      
      async saveTheme(theme) {
        return await visualThemeEditor.saveTheme(theme);
      },
      
      async updateThemeProperty(componentName, propertyName, value) {
        visualThemeEditor.updateThemeProperty(componentName, propertyName, value);
        
        // Trigger celebration for theme updates
        if (Math.random() < 0.1) { // 10% chance for theme update celebration
          await celebrationSystem.celebrate('milestone-reached', {
            operation: 'theme-update',
            component: componentName,
            property: propertyName
          });
        }
      },
      
      async validateTheme(theme) {
        return await visualThemeEditor.validateTheme(theme);
      },
      
      async exportTheme(theme, format = 'css') {
        const exportPath = await visualThemeEditor.exportTheme(theme, format);
        
        // Celebrate theme export
        await celebrationSystem.celebrate('export-completed', {
          operation: 'theme-export',
          themeName: theme.name,
          format,
          exportPath
        });
        
        return exportPath;
      },
      
      async startThemeEditor() {
        return await visualThemeEditor.startInteractiveEditor();
      },
      
      async processThemeEditorCommand(command, args = []) {
        return await visualThemeEditor.processEditorCommand(command, args);
      },
      
      async getCurrentTheme() {
        return visualThemeEditor.getCurrentTheme();
      },
      
      async getThemeComponents() {
        return visualThemeEditor.getThemeComponents();
      },
      
      async getColorPalettes() {
        return visualThemeEditor.getColorPalettes();
      },
      
      async getTypographyPresets() {
        return visualThemeEditor.getTypographyPresets();
      },
      
      async printThemeEditorReport() {
        return visualThemeEditor.printEditorReport();
      },
      
      // === THEME PREVIEW SYSTEM OPERATIONS ===
      
      async loadThemeForPreview(themeName, alias = null) {
        return await themePreviewSystem.loadTheme(themeName, alias);
      },
      
      async generateThemePreview(themeKey, mode = 'full', options = {}) {
        return await themePreviewSystem.generatePreview(themeKey, mode, options);
      },
      
      async generateThemeComparison(themeKeys, mode = 'full', options = {}) {
        const comparison = await themePreviewSystem.generateComparison(themeKeys, mode, options);
        
        // Celebrate theme comparison creation
        if (themeKeys.length > 2) {
          await celebrationSystem.celebrate('milestone-reached', {
            operation: 'theme-comparison',
            themeCount: themeKeys.length,
            mode
          });
        }
        
        return comparison;
      },
      
      async setPreviewMode(mode) {
        themePreviewSystem.setPreviewMode(mode);
      },
      
      async setComparisonLayout(layout) {
        themePreviewSystem.setComparisonLayout(layout);
      },
      
      async getActiveThemes() {
        return themePreviewSystem.getActiveThemes();
      },
      
      async getPreviewModes() {
        return themePreviewSystem.getPreviewModes();
      },
      
      async removeThemeFromPreview(themeKey) {
        themePreviewSystem.removeTheme(themeKey);
      },
      
      async clearPreviewCache() {
        themePreviewSystem.clearCache();
      },
      
      async printThemePreviewReport() {
        return themePreviewSystem.printPreviewReport();
      },
      
      // === INTEGRATED THEME WORKFLOWS ===
      
      async createAndPreviewTheme(name, baseTheme = null) {
        try {
          // Create new theme
          const newTheme = await visualThemeEditor.createNewTheme(name, baseTheme);
          
          // Load theme for preview
          await themePreviewSystem.loadTheme(name, name);
          
          // Generate initial preview
          const preview = await themePreviewSystem.generatePreview(name, 'full');
          
          // Celebrate theme creation
          await celebrationSystem.celebrate('project-created', {
            operation: 'theme-creation',
            themeName: name,
            baseTheme,
            isFirstTime: true
          });
          
          return {
            theme: newTheme,
            preview
          };
          
        } catch (error) {
          const errorAnalysis = await intelligentErrorMessaging.analyzeError(error, {
            operation: 'theme-creation',
            themeName: name,
            baseTheme
          });
          throw new Error(`Theme creation failed: ${errorAnalysis.suggestion || error.message}`);
        }
      },
      
      async compareThemeVariations(baseName, variations) {
        try {
          const themeKeys = [baseName, ...variations];
          
          // Load all themes for preview
          for (const themeKey of themeKeys) {
            await themePreviewSystem.loadTheme(themeKey, themeKey);
          }
          
          // Generate side-by-side comparison
          const comparison = await themePreviewSystem.generateComparison(themeKeys, 'full', {
            layout: 'side-by-side'
          });
          
          // Celebrate comprehensive comparison
          if (themeKeys.length >= 3) {
            await celebrationSystem.celebrate('milestone-reached', {
              operation: 'theme-comparison',
              themeCount: themeKeys.length,
              baseName,
              variations
            });
          }
          
          return comparison;
          
        } catch (error) {
          const errorAnalysis = await intelligentErrorMessaging.analyzeError(error, {
            operation: 'theme-comparison',
            baseName,
            variations
          });
          throw new Error(`Theme comparison failed: ${errorAnalysis.suggestion || error.message}`);
        }
      },
      
      async editThemeWithPreview(themeName) {
        try {
          // Load theme in editor
          const theme = await visualThemeEditor.loadTheme(themeName);
          
          // Load theme for preview
          await themePreviewSystem.loadTheme(themeName, 'current');
          
          // Set up real-time preview updates
          visualThemeEditor.on('theme-updated', async (updateData) => {
            // Regenerate preview on theme updates
            await themePreviewSystem.generatePreview('current', 'full');
          });
          
          // Generate initial preview
          const preview = await themePreviewSystem.generatePreview('current', 'full');
          
          return {
            theme,
            preview,
            editorReady: true
          };
          
        } catch (error) {
          const errorAnalysis = await intelligentErrorMessaging.analyzeError(error, {
            operation: 'theme-editing',
            themeName
          });
          throw new Error(`Theme editing setup failed: ${errorAnalysis.suggestion || error.message}`);
        }
      }
    }),
    dependencies: ['projectManager', 'previewManager', 'packageManager', 'streamingPackageManager', 'themeIntegration', 'layoutEngine', 'errorHandler', 'hotReloadSystem', 'browshWrapper', 'shareCliIntegration', 'intelligentErrorMessaging', 'celebrationSystem', 'fileSizeValidation', 'visualThemeEditor', 'themePreviewSystem'],
    lifecycle: {
      onInitialize: async function() {
        console.log('🚀 Submitit service facade with advanced layout optimization, memory management, smart caching, terminal detection, error handling, hot-reload, Browsh preview, file sharing, intelligent error messaging, celebration animations, file size validation, visual theme editor, and theme preview system initialized');
      }
    }
  });

  return container;
}

/**
 * Create and configure a test container
 */
export function createTestContainer(overrides = {}) {
  const container = configureServices({
    enableTestingMode: true,
    strictMode: false,
    ...overrides
  });
  
  container.enableTestingMode();
  return container;
}

/**
 * Get service configuration for specific environment
 */
export function getServiceConfig(environment = 'development') {
  const baseConfig = {
    enableLifecycleManagement: true,
    enableDependencyValidation: true,
    enableCircularDependencyDetection: true
  };

  switch (environment) {
    case 'production':
      return {
        ...baseConfig,
        enableTestingMode: false,
        strictMode: true,
        enableDebugLogging: false
      };
      
    case 'development':
      return {
        ...baseConfig,
        enableTestingMode: false,
        strictMode: false,
        enableDebugLogging: true
      };
      
    case 'test':
      return {
        ...baseConfig,
        enableTestingMode: true,
        strictMode: false,
        enableDebugLogging: false
      };
      
    default:
      return baseConfig;
  }
}

export default configureServices;