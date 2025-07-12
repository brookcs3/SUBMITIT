/**
 * Lazy Module Configuration for Submitit
 * 
 * Defines which modules should be loaded lazily to improve startup performance.
 * Heavy dependencies are only loaded when actually needed.
 */

import { defaultLazyLoader } from '../lib/LazyLoader.js';

// === HEAVY DEPENDENCY LOADERS ===

const lazyModules = {
  // === IMAGE PROCESSING ===
  'sharp': {
    loader: async () => {
      try {
        const sharp = await import('sharp');
        return sharp.default;
      } catch (error) {
        // Fallback to a lightweight image processor
        console.warn('Sharp not available, using fallback image processing');
        return createImageProcessorFallback();
      }
    },
    priority: 'high',
    preload: false,
    description: 'High-performance image processing'
  },

  // === ARCHIVE PROCESSING ===
  'archiver': {
    loader: async () => {
      const archiver = await import('archiver');
      return archiver.default;
    },
    priority: 'high',
    preload: false,
    description: 'Archive creation (zip, tar, etc.)'
  },

  'yauzl': {
    loader: async () => {
      const yauzl = await import('yauzl');
      return yauzl;
    },
    priority: 'normal',
    preload: false,
    description: 'ZIP file extraction'
  },

  'tar-stream': {
    loader: async () => {
      const tar = await import('tar-stream');
      return tar;
    },
    priority: 'normal',
    preload: false,
    description: 'TAR file processing'
  },

  // === PDF PROCESSING ===
  'pdf-parse': {
    loader: async () => {
      try {
        const pdfParse = await import('pdf-parse');
        return pdfParse.default;
      } catch (error) {
        return createPdfProcessorFallback();
      }
    },
    priority: 'normal',
    preload: false,
    description: 'PDF text extraction and analysis'
  },

  // === VIDEO/AUDIO PROCESSING ===
  'fluent-ffmpeg': {
    loader: async () => {
      try {
        const ffmpeg = await import('fluent-ffmpeg');
        return ffmpeg.default;
      } catch (error) {
        return createMediaProcessorFallback();
      }
    },
    priority: 'low',
    preload: false,
    description: 'Video and audio processing'
  },

  // === WEB BROWSER AUTOMATION ===
  'puppeteer': {
    loader: async () => {
      try {
        const puppeteer = await import('puppeteer');
        return puppeteer.default;
      } catch (error) {
        return createBrowserFallback();
      }
    },
    priority: 'low',
    preload: false,
    description: 'Browser automation for preview generation'
  },

  // === ADVANCED FILE OPERATIONS ===
  'chokidar': {
    loader: async () => {
      const chokidar = await import('chokidar');
      return chokidar.default;
    },
    priority: 'normal',
    preload: false,
    description: 'File system watching'
  },

  'mime-types': {
    loader: async () => {
      const mime = await import('mime-types');
      return mime;
    },
    priority: 'high',
    preload: true,
    description: 'MIME type detection'
  },

  'file-type': {
    loader: async () => {
      const fileType = await import('file-type');
      return fileType;
    },
    priority: 'high',
    preload: true,
    description: 'File type detection from content'
  },

  // === YOGA LAYOUT ENGINE ===
  'yoga-layout': {
    loader: async () => {
      try {
        const yoga = await import('yoga-layout-prebuilt');
        return yoga.default;
      } catch (error) {
        // Fallback to basic layout calculations
        return createLayoutEngineeFallback();
      }
    },
    priority: 'critical',
    preload: true,
    description: 'Yoga flexbox layout engine'
  },

  // === ASTRO INTEGRATION ===
  'astro': {
    loader: async () => {
      try {
        const astro = await import('astro');
        return astro;
      } catch (error) {
        return createAstroFallback();
      }
    },
    priority: 'normal',
    preload: false,
    dependencies: ['yoga-layout'],
    description: 'Astro static site generator'
  },

  // === TERMINAL ENHANCEMENTS ===
  'chalk-animation': {
    loader: async () => {
      try {
        const chalkAnimation = await import('chalk-animation');
        return chalkAnimation.default;
      } catch (error) {
        return createAnimationFallback();
      }
    },
    priority: 'low',
    preload: false,
    description: 'Terminal text animations'
  },

  'boxen': {
    loader: async () => {
      const boxen = await import('boxen');
      return boxen.default;
    },
    priority: 'low',
    preload: false,
    description: 'Terminal box drawing'
  },

  'terminal-image': {
    loader: async () => {
      try {
        const terminalImage = await import('terminal-image');
        return terminalImage.default;
      } catch (error) {
        return createImageDisplayFallback();
      }
    },
    priority: 'low',
    preload: false,
    description: 'Display images in terminal'
  },

  // === VALIDATION LIBRARIES ===
  'joi': {
    loader: async () => {
      const joi = await import('joi');
      return joi.default;
    },
    priority: 'normal',
    preload: false,
    description: 'Data validation schema'
  },

  // === PERFORMANCE MONITORING ===
  'perf-hooks': {
    loader: async () => {
      const { performance, PerformanceObserver } = await import('perf_hooks');
      return { performance, PerformanceObserver };
    },
    priority: 'low',
    preload: false,
    description: 'Performance monitoring utilities'
  },

  // === SUBMITIT CORE MODULES ===
  'enhanced-yoga-layout': {
    loader: async () => {
      const { EnhancedYogaLayoutEngine } = await import('../lib/EnhancedYogaLayoutEngine.js');
      return EnhancedYogaLayoutEngine;
    },
    priority: 'critical',
    preload: true,
    dependencies: ['yoga-layout'],
    description: 'Enhanced Yoga layout engine with Submitit features'
  },

  'smart-file-handler': {
    loader: async () => {
      const { SmartFileHandlerSimple } = await import('../lib/SmartFileHandlerSimple.js');
      return SmartFileHandlerSimple;
    },
    priority: 'high',
    preload: true,
    dependencies: ['mime-types', 'file-type'],
    description: 'Intelligent file processing system'
  },

  'package-manager': {
    loader: async () => {
      const { PackageManager } = await import('../lib/PackageManager.js');
      return PackageManager;
    },
    priority: 'high',
    preload: false,
    dependencies: ['archiver'],
    description: 'File packaging and compression'
  },

  'preview-manager': {
    loader: async () => {
      const { PreviewManager } = await import('../lib/PreviewManager.js');
      return PreviewManager;
    },
    priority: 'normal',
    preload: false,
    dependencies: ['astro', 'enhanced-yoga-layout'],
    description: 'Preview generation system'
  },

  'file-validator': {
    loader: async () => {
      const { FileValidator } = await import('../lib/FileValidator.js');
      return FileValidator;
    },
    priority: 'high',
    preload: false,
    dependencies: ['mime-types', 'file-type'],
    description: 'Comprehensive file validation'
  },

  'accessibility-manager': {
    loader: async () => {
      const AccessibilityManager = await import('../lib/AccessibilityManager.js');
      return AccessibilityManager.default;
    },
    priority: 'high',
    preload: true,
    description: 'Screen reader and accessibility support'
  },

  'work-plates-app': {
    loader: async () => {
      const { WorkPlatesApp } = await import('../components/WorkPlatesApp.js');
      return WorkPlatesApp;
    },
    priority: 'normal',
    preload: false,
    dependencies: ['enhanced-yoga-layout', 'accessibility-manager'],
    description: 'Interactive work plates interface'
  },

  'advanced-ink-components': {
    loader: async () => {
      const components = await import('../components/AdvancedInkComponents.js');
      return components;
    },
    priority: 'normal',
    preload: false,
    description: 'Advanced terminal UI components'
  }
};

// === FALLBACK IMPLEMENTATIONS ===

function createImageProcessorFallback() {
  return {
    resize: (buffer, options) => {
      console.warn('Image resize not available - Sharp not installed');
      return buffer;
    },
    metadata: (buffer) => {
      return Promise.resolve({ width: 0, height: 0, format: 'unknown' });
    }
  };
}

function createPdfProcessorFallback() {
  return (buffer) => {
    console.warn('PDF processing not available - pdf-parse not installed');
    return Promise.resolve({ text: '', info: {} });
  };
}

function createMediaProcessorFallback() {
  return {
    ffprobe: () => {
      console.warn('Media processing not available - FFmpeg not installed');
      return Promise.resolve({});
    }
  };
}

function createBrowserFallback() {
  return {
    launch: () => {
      console.warn('Browser automation not available - Puppeteer not installed');
      return Promise.resolve({
        newPage: () => Promise.resolve({
          goto: () => Promise.resolve(),
          screenshot: () => Promise.resolve(Buffer.alloc(0)),
          close: () => Promise.resolve()
        }),
        close: () => Promise.resolve()
      });
    }
  };
}

function createLayoutEngineeFallback() {
  console.warn('Yoga Layout not available - using basic layout fallback');
  return {
    Node: {
      create: () => ({
        setWidth: () => {},
        setHeight: () => {},
        setJustifyContent: () => {},
        setAlignItems: () => {},
        insertChild: () => {},
        calculateLayout: () => {},
        getComputedLayout: () => ({ left: 0, top: 0, width: 100, height: 100 }),
        free: () => {}
      })
    },
    JUSTIFY_CENTER: 'center',
    ALIGN_CENTER: 'center'
  };
}

function createAstroFallback() {
  console.warn('Astro not available - using static preview fallback');
  return {
    build: () => Promise.resolve(),
    dev: () => Promise.resolve({ stop: () => {} })
  };
}

function createAnimationFallback() {
  return {
    rainbow: (text) => text,
    pulse: (text) => text,
    glitch: (text) => text,
    neon: (text) => text
  };
}

function createImageDisplayFallback() {
  return {
    file: () => Promise.resolve(''),
    buffer: () => Promise.resolve('')
  };
}

// === INITIALIZATION ===

/**
 * Initialize lazy loading for submitit
 */
export function initializeLazyLoading(options = {}) {
  // Configure the lazy loader
  defaultLazyLoader.options = {
    ...defaultLazyLoader.options,
    ...options
  };

  // Register all modules
  defaultLazyLoader.registerModules(lazyModules);

  // Enable debug mode if requested
  if (options.debug) {
    defaultLazyLoader.enableDebug();
  }

  // Preload critical modules
  if (options.preloadCritical !== false) {
    setTimeout(() => {
      preloadCriticalModules();
    }, options.preloadDelay || 1000);
  }

  return defaultLazyLoader;
}

/**
 * Preload critical modules for better UX
 */
export async function preloadCriticalModules() {
  const criticalModules = [
    'enhanced-yoga-layout',
    'smart-file-handler',
    'accessibility-manager',
    'mime-types',
    'file-type'
  ];

  try {
    await defaultLazyLoader.loadMultiple(criticalModules, { failFast: false });
  } catch (error) {
    console.warn('Some critical modules failed to preload:', error.message);
  }
}

/**
 * Get a lazy-loaded module
 */
export async function getLazyModule(name) {
  return defaultLazyLoader.load(name);
}

/**
 * Check if a module is available (loaded or cached)
 */
export function isModuleAvailable(name) {
  return defaultLazyLoader.cache.has(name);
}

/**
 * Get loading statistics
 */
export function getLazyLoadingStats() {
  return defaultLazyLoader.getLoadStats();
}

// === PROGRESSIVE FEATURE HELPERS ===

/**
 * Create a progressive feature that degrades gracefully
 */
export function createProgressiveFeature(name, loader, fallback) {
  return {
    async use() {
      try {
        return await getLazyModule(name);
      } catch (error) {
        console.warn(`Feature '${name}' not available, using fallback`);
        return fallback;
      }
    },
    
    isAvailable() {
      return isModuleAvailable(name);
    }
  };
}

// Export the configuration
export { lazyModules };
export default lazyModules;