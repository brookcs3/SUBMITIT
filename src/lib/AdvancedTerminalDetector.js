/**
 * Advanced Terminal Detector
 * 
 * Comprehensive terminal environment detection and adaptive scaling system
 * for optimal UI rendering across different terminal types and screen sizes.
 * 
 * @module AdvancedTerminalDetector
 */

// Core Node.js modules
import { EventEmitter } from 'events';
import { execSync } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';
import path from 'path';
import { promises as fs } from 'fs';

// Third-party imports
import supportsColor from 'supports-color';
import isUnicodeSupported from 'is-unicode-supported';
import isDocker from 'is-docker';
import isWsl from 'is-wsl';
import chalk from 'chalk';

// Import internal utilities
import { Logger } from './utils/Logger.js';

// Constants
const DEFAULT_OPTIONS = {
  enableCapabilityDetection: true,
  enableRealTimeMonitoring: true,
  detectionInterval: 1000
};

// Type definitions
/**
 * @typedef {Object} TerminalDimensions
 * @property {number} columns - Number of columns
 * @property {number} rows - Number of rows
 */

/**
 * @typedef {Object} TerminalCapabilities
 * @property {boolean} supports256Colors - Whether the terminal supports 256 colors
 * @property {boolean} supportsTrueColor - Whether the terminal supports true color
 * @property {boolean} unicode - Whether the terminal supports Unicode
 * @property {boolean} hyperlinks - Whether the terminal supports hyperlinks
 * @property {boolean} images - Whether the terminal supports images
 * @property {boolean} mouse - Whether the terminal supports mouse events
 * @property {boolean} clipboard - Whether the terminal supports clipboard access
 * @property {Object} performance - Terminal performance metrics
 * @property {number} performance.renderTime - Average render time in ms
 * @property {number} performance.frameRate - Frame rate in FPS
 */

/**
 * @typedef {Object} TerminalDetectionOptions
 * @property {boolean} [enableCapabilityDetection=true] - Whether to enable capability detection
 * @property {boolean} [enableRealTimeMonitoring=true] - Whether to enable real-time monitoring
 * @property {number} [detectionInterval=1000] - Detection interval in milliseconds
 */

// Type definitions for JSDoc
/**
 * @typedef {Object} TerminalDimensions
 * @property {number} width - Width in columns
 * @property {number} height - Height in rows
 */

/**
 * @typedef {Object} TerminalCapabilities
 * @property {boolean} colors - Whether the terminal supports colors
 * @property {boolean} unicode - Whether the terminal supports Unicode
 * @property {boolean} mouse - Whether the terminal supports mouse input
 * @property {boolean} clipboard - Whether the terminal supports clipboard operations
 * @property {boolean} notifications - Whether the terminal supports notifications
 * @property {Object} performance - Performance metrics
 * @property {number} performance.renderTime - Time to render a frame in ms
 * @property {number} performance.frameRate - Frames per second
 */

/**
 * @typedef {Object} TerminalEnvironment
 * @property {string} platform - Operating system platform
 * @property {string} shell - User's shell
 * @property {string} term - Terminal type
 * @property {boolean} isCI - Whether running in CI environment
 * @property {boolean} isTTY - Whether the output is a TTY
 */

/**
 * @typedef {'basic'|'intermediate'|'advanced'|'full'} TerminalCapabilityTier
 */

/**
 * Advanced terminal capabilities detector
 * @class AdvancedTerminalDetector
 * @extends {EventEmitter}
 */
/**
 * Advanced terminal capabilities detector
 * @class AdvancedTerminalDetector
 * @extends {EventEmitter}
 */
class AdvancedTerminalDetector extends EventEmitter {
  /** @type {TerminalCapabilities} */
  capabilities = {
    colors: false,
    unicode: false,
    mouse: false,
    clipboard: false,
    notifications: false,
    fontSupport: {
      emoji: false,
      powerline: false,
      nerdFont: false,
      ligatures: false,
    },
    performance: {
      highResTimer: false,
      fastRendering: false,
      gpuAcceleration: false,
    },
    environment: {
      isWSL: false,
      isDocker: false,
      isWSL2: false,
      isTerminalApp: false,
      isHyper: false,
      isWindowsTerminal: false,
      isITerm2: false,
      isAlacritty: false,
      isKitty: false,
      isWezTerm: false,
      isVSCode: false,
      isTmux: false,
      isScreen: false,
      isXTerm: false,
      isRxvt: false,
      isMintty: false,
      isGitBash: false,
      isCygwin: false,
      isMSYS2: false,
      isConEmu: false,
      isCmder: false,
    },
  };

  /** @type {TerminalDimensions} */
  dimensions = {
    width: 0,
    height: 0,
    pixelWidth: 0,
    pixelHeight: 0,
    dpi: 96,
    aspectRatio: 1.77,
    isWideScreen: true,
    isHighDensity: false,
    isRetina: false,
  };

  /** @type {TerminalEnvironment} */
  environment = {
    isCI: false,
    isTTY: false,
    hasFocus: false,
    hasAudio: false,
    hasVideo: false,
    hasWebGL: false,
    hasWebGPU: false,
    hasWebRTC: false,
    hasWebSockets: false,
  };

  /** @type {boolean} */
  isInitialized = false;

  /** @type {NodeJS.Timeout | null} */
  checkInterval = null;

  /** @type {number} */
  lastCheck = 0;

  /**
   * @param {Object} [options={}] Configuration options
   * @param {boolean} [options.enableCapabilityDetection=true] Whether to enable capability detection
   * @param {boolean} [options.enableRealtimeUpdates=true] Whether to enable real-time updates
   * @param {number} [options.updateInterval=1000] Update interval in milliseconds
   */
  constructor(options = {}) {
    super();
    this.options = {
      enableCapabilityDetection: true,
      enableRealtimeUpdates: true,
      updateInterval: 1000,
      ...options,
    };
  }

  /**
   * Initialize the detector
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Detect terminal type and capabilities
      await this.detectTerminalType();
      await this.detectCapabilities();
      await this.detectDimensions();
      await this.detectEnvironment();

      // Set up real-time monitoring if enabled
      if (this.options.enableRealtimeUpdates) {
        this.startRealtimeMonitoring();
      }

      this.isInitialized = true;
      this.emit('initialized', this.capabilities);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Detect terminal type and set appropriate flags
   * @private
   * @returns {Promise<void>}
   */
  async detectTerminalType() {
    try {
      // Set environment flags
      this.capabilities.environment = {
        isWSL: await isWSL(),
        isDocker: await isDocker(),
        isWSL2: await isWsl(),
        isTerminalApp: await isTerminalApp(),
        isHyper: await isHyper(),
        isWindowsTerminal: await isWindowsTerminal(),
        isITerm2: await isITerm2(),
        isAlacritty: await isAlacritty(),
        isKitty: await isKitty(),
        isWezTerm: await isWezTerm(),
        isVSCode: await isVSCode(),
        isTmux: await isTmux(),
        isScreen: await isScreen(),
        isXTerm: await isXTerm(),
        isRxvt: await isRxvt(),
        isMintty: await isMintty(),
        isGitBash: await isGitBash(),
        isCygwin: await isCygwin(),
        isMSYS2: await isMSYS2(),
        isConEmu: await isConEmu(),
        isCmder: await isCmder(),
      };
    } catch (error) {
      console.error('Error detecting terminal type:', error);
      throw error;
    }
  }

  /**
   * Detect terminal capabilities
   * @private
   * @returns {Promise<void>}
   */
  async detectCapabilities() {
    try {
      // Basic capabilities
      this.capabilities.colors = Boolean(supportsColor);
      this.capabilities.unicode = isUnicodeSupported();
      this.capabilities.mouse = await this.detectMouseSupport();
      this.capabilities.clipboard = await this.detectClipboardSupport();
      this.capabilities.notifications = await this.detectNotificationSupport();

      // Font support
      this.capabilities.fontSupport = {
        emoji: await this.detectEmojiSupport(),
        powerline: await this.detectPowerlineSupport(),
        nerdFont: await this.detectNerdFontSupport(),
        ligatures: await this.detectLigatureSupport(),
      };

      // Performance capabilities
      this.capabilities.performance = {
        highResTimer: 'performance' in globalThis && 'now' in performance,
        fastRendering: await this.detectFastRendering(),
        gpuAcceleration: await this.detectGpuAcceleration(),
      };
    } catch (error) {
      console.error('Error detecting terminal capabilities:', error);
      throw error;
    }
  }

  /**
   * Detect terminal dimensions
   * @private
   * @returns {Promise<void>}
   */
  async detectDimensions() {
    try {
      // Default dimensions
      const defaultWidth = process.stdout.columns || 80;
      const defaultHeight = process.stdout.rows || 24;

      // Try to get actual dimensions
      this.dimensions = {
        width: process.stdout.columns || defaultWidth,
        height: process.stdout.rows || defaultHeight,
        pixelWidth: 0, // Will be updated if possible
        pixelHeight: 0, // Will be updated if possible
        dpi: 96, // Default DPI
        aspectRatio: 1.77, // Default 16:9
        isWideScreen: true,
        isHighDensity: false,
        isRetina: false,
      };

      // Update pixel dimensions based on DPI
      this.updatePixelDimensions();

      // Emit event with updated dimensions
      this.emit('dimensions', this.dimensions);
    } catch (error) {
      console.error('Error detecting terminal dimensions:', error);
      throw error;
    }
  }

  /**
   * Update pixel dimensions based on DPI
   * @private
   */
  updatePixelDimensions() {
    const { width, height, dpi } = this.dimensions;
    const pixelsPerInch = dpi / 72; // Convert DPI to pixels per point (72 points per inch)
    
    this.dimensions.pixelWidth = Math.round(width * 7 * pixelsPerInch); // Approximate char width
    this.dimensions.pixelHeight = Math.round(height * 16 * pixelsPerInch); // Approximate line height
    this.dimensions.aspectRatio = this.dimensions.pixelWidth / Math.max(1, this.dimensions.pixelHeight);
    this.dimensions.isWideScreen = this.dimensions.aspectRatio > 1.5;
  }

  /**
   * Detect environment capabilities
   * @private
   * @returns {Promise<void>}
   */
  async detectEnvironment() {
    try {
      this.environment = {
        isCI: Boolean(process.env.CI || process.env.CONTINUOUS_INTEGRATION),
        isTTY: process.stdout.isTTY,
        hasFocus: true, // Default assumption
        hasAudio: false, // Terminal typically doesn't have audio
        hasVideo: false, // Terminal typically doesn't have video
        hasWebGL: false, // Terminal doesn't have WebGL
        hasWebGPU: false, // Terminal doesn't have WebGPU
        hasWebRTC: false, // Terminal doesn't have WebRTC
        hasWebSockets: true, // Node.js has WebSocket support
      };
    } catch (error) {
      console.error('Error detecting environment capabilities:', error);
      throw error;
    }
  }
  /**
   * @type {TerminalCapabilities}
   */
  capabilities;
  
  /**
   * @type {TerminalDimensions}
   */
  dimensions;
  
  /**
   * @type {TerminalEnvironment}
   */
  environment;
  
  /**
   * @type {boolean}
   */
  isInitialized = false;
  
  /**
   * @type {NodeJS.Timeout | null}
   */
  checkInterval = null;
  
  /**
   * @type {number}
   */
  lastCheck = 0;
  /**
   * Creates an instance of AdvancedTerminalDetector
   * @param {Object} [options={}] Configuration options
   * @param {boolean} [options.enableCapabilityDetection=true] Whether to enable capability detection
   * @param {boolean} [options.enableRealTimeMonitoring=true] Whether to enable real-time monitoring
   * @param {number} [options.detectionInterval=1000] Detection interval in milliseconds
   */
  /**
   * @param {import('../types/AdvancedTerminalDetector.js').TerminalDetectionOptions} [options={}] Configuration options
   */
  constructor(options = {}) {
    super();
    
    /** @type {import('../types/AdvancedTerminalDetector.js').TerminalDetectionOptions} */
    this.options = {
      enableCapabilityDetection: true,
      enableRealTimeMonitoring: true,
      detectionInterval: 1000, // ms
      ...options
    };
    
    /** @type {import('../types/AdvancedTerminalDetector.js').TerminalDimensions} */
    this.currentDimensions = { columns: 0, rows: 0 };
    
    /** @type {import('../types/AdvancedTerminalDetector.js').TerminalCapabilities} */
    this.terminalCapabilities = {
      supports256Colors: false,
      supportsTrueColor: false,
      unicode: false,
      hyperlinks: false,
      images: false,
      mouse: false,
      clipboard: false,
      performance: {
        renderTime: 0,
    };
    
    // Bind methods
    this.handleResize = this.handleResize.bind(this);
    this.checkCapabilities = this.checkCapabilities.bind(this);
    this.detectDimensions = this.detectDimensions.bind(this);
  }
  
  // === INITIALIZATION ===
  
  /**
   * Initialize the terminal detector
   * @returns {Promise<void>}
   */
  async initialize() {
    console.log(chalk.blue('🖥️  Initializing Advanced Terminal Detector...'));
    
    try {
      await this.performInitialDetection();
      
      if (this.options.enableRealTimeMonitoring) {
        this.startRealtimeMonitoring();
      }
      this.detectionInProgress = true;
      
      // Perform initial detection
      await this.performInitialDetection();
      
      console.log(chalk.green('✅ Advanced Terminal Detector initialized'));
      this.emit('detector-ready', this.currentDimensions);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.emit('error', new Error(`Initialization failed: ${errorMessage}`));
      throw error;
    } finally {
      this.detectionInProgress = false;
    }
  }
  
  // === DETECTION METHODS ===
  
  /**
   * Detect terminal dimensions (instance method)
   * @returns {TerminalDimensions} Terminal dimensions
   */
  detectDimensions() {
    return AdvancedTerminalDetector.detectDimensions();
  }
  
  /**
   * Detect terminal color support
   * @returns {Object} Color support information
   */
  static detectColorSupport() {
    return {
      has16m: process.env.COLORTERM === 'truecolor' || process.env.COLORTERM === '24bit',
      has256: process.env.TERM && /-256(color)?$/i.test(process.env.TERM),
      hasBasic: true, // Most terminals support basic colors
      level: process.env.COLORTERM === 'truecolor' || process.env.COLORTERM === '24bit' ? 3 :
             (process.env.TERM && /-256(color)?$/i.test(process.env.TERM) ? 2 : 1)
    };
  }
  
  /**
   * Detect terminal emulator features
   * @returns {Object} Terminal features
   */
  static detectTerminalFeatures() {
    return {
      isCI: process.env.CI === 'true' || process.env.CI === '1' || process.env.CI === true,
      isDumb: process.env.TERM === 'dumb',
      isWindows: process.platform === 'win32',
      isMacOS: process.platform === 'darwin',
      isLinux: process.platform === 'linux',
      isTTY: process.stdout.isTTY,
      hasUnicode: process.platform !== 'win32' || process.env.CI || process.env.WT_SESSION
    };
  }
  
  /**
   * Detect notification support in the terminal
   * @returns {boolean} True if notifications are supported
   */
  static detectNotificationSupport() {
    // Check for common terminals with notification support
    return (
      process.env.TERM_PROGRAM === 'iTerm.app' ||
      process.env.TERM_PROGRAM === 'vscode' ||
      process.env.TERM_PROGRAM === 'Hyper' ||
      process.env.TERM_PROGRAM === 'alacritty' ||
      process.env.TERM_PROGRAM === 'kitty' ||
      (process.env.TERM && (
        process.env.TERM.includes('xterm') ||
        process.env.TERM.includes('screen') ||
        process.env.TERM.includes('tmux')
      ))
    );
  }
  
  /**
   * Detect font support in the terminal
   * @returns {Object} Font support information
   */
  static detectFontSupport() {
    const supportsEmoji = process.platform !== 'win32' || 
                         process.env.TERM_PROGRAM === 'vscode' ||
                         process.env.TERM_PROGRAM === 'Hyper';
    
    return {
      emoji: supportsEmoji,
      powerline: process.env.TERM_PROGRAM === 'iTerm.app' || 
                process.env.TERM_PROGRAM === 'vscode' ||
                process.env.TERM_PROGRAM === 'Hyper',
      ligatures: process.env.TERM_PROGRAM === 'iTerm.app' ||
                process.env.TERM_PROGRAM === 'vscode' ||
                process.env.TERM_PROGRAM === 'Hyper'
    };
  }
  
  /**
   * Detect performance capabilities of the terminal
   * @returns {Object} Performance capabilities
   */
  static detectPerformanceCapabilities() {
    // Check for common high-performance terminals
    const isHighPerformance = [
      'iTerm.app', 'vscode', 'Hyper', 'alacritty', 'kitty', 'wezterm'
    ].includes(process.env.TERM_PROGRAM || '');
    
    return {
      highPerformance: isHighPerformance,
      // Assume basic animation support in most modern terminals
      animations: true,
      // Assume basic image display support in modern terminals
      images: process.env.TERM_PROGRAM === 'iTerm.app' || 
             process.env.TERM_PROGRAM === 'vscode' ||
             process.env.TERM_PROGRAM === 'wezterm',
      // Assume basic GPU acceleration in modern terminals
      gpuAccelerated: isHighPerformance
    };
  }
  
  /**
   * Detect the runtime environment
   * @returns {Object} Environment information
   */
  static detectEnvironment() {
    return {
      // Runtime environment
      node: process.versions.node,
      v8: process.versions.v8,
      // Container/virtualization detection
      isDocker: !!process.env.DOCKER,
      isWSL: process.env.WSL_DISTRO_NAME !== undefined,
      isCodespaces: !!process.env.CODESPACES,
      // CI/CD environment
      isCI: process.env.CI === 'true' || process.env.CI === '1' || process.env.CI === true,
      // Terminal multiplexer
      isTmux: !!process.env.TMUX,
      isScreen: !!process.env.SCREEN,
      // SSH session
      isSSH: !!process.env.SSH_CONNECTION || !!process.env.SSH_CLIENT || !!process.env.SSH_TTY
    };
  }
  
  /**
   * Detect mouse support in the terminal
   * @returns {boolean} True if mouse support is detected
   */
  static detectMouseSupport() {
    // Check common environment variables that indicate mouse support
    return (
      process.env.TERM_PROGRAM === 'iTerm.app' ||
      process.env.TERM_PROGRAM === 'vscode' ||
      process.env.TERM_PROGRAM === 'Hyper' ||
      (process.env.TERM && process.env.TERM.includes('xterm'))
    );
  }
  
  /**
   * Detect clipboard support in the terminal
   * @returns {boolean} True if clipboard operations are supported
   */
  static detectClipboardSupport() {
    // Check for common terminals with clipboard support
    return (
      process.env.TERM_PROGRAM === 'iTerm.app' ||
      process.env.TERM_PROGRAM === 'vscode' ||
      process.env.TERM_PROGRAM === 'Hyper' ||
      process.platform === 'darwin' || // macOS terminals typically support clipboard
      process.platform === 'win32' ||  // Windows terminals typically support clipboard
    if (capabilities.mouse) score += 10;
    if (capabilities.clipboard) score += 10;
    if (capabilities.unicode) score += 5;
    
  }
}

/**
 * Detect terminal capabilities
 * @returns {Object} Terminal capabilities
 */
static detectCapabilities() {
  return {
    colors: this.detectColorSupport(),
    unicode: this.detectUnicodeSupport(),
    mouse: this.detectMouseSupport(),
    clipboard: this.detectClipboardSupport(),
    notifications: this.detectNotificationSupport(),
    font: this.detectFontSupport(),
    performance: this.detectPerformanceCapabilities(),
    environment: this.detectEnvironment()
  };
}

/**
 * Detect terminal dimensions
 * @returns {{width: number, height: number}} Terminal dimensions
 */
static detectDimensions() {
  try {
    // Try to get terminal size from process.stdout
    if (process.stdout.isTTY) {
      return {
        width: process.stdout.columns || 80,
        height: process.stdout.rows || 24
      };
    }
    // Fallback to environment variables
    return {
      width: parseInt(process.env.COLUMNS, 10) || 80,
      height: parseInt(process.env.LINES, 10) || 24
    };
  } catch (error) {
    // Default fallback
    return { width: 80, height: 24 };
  }
}

/**
 * Detect terminal color support
 * @returns {boolean|number} Color support level
 */
static detectColorSupport() {
  // Check for color support
  if (process.stdout.isTTY) {
    if ('CI' in process.env) {
      return 8; // Basic color support in CI
    }
    if (process.env.TERM === 'xterm-256color' || process.env.TERM === 'screen-256color') {
      return 256;
    }
    if (process.env.COLORTERM === 'truecolor' || process.env.COLORTERM === '24bit') {
      return 16777216; // 16.7M colors (24-bit)
    }
    return 16; // Basic ANSI colors
  }
  return false; // No color support
}

/**
 * Detect Unicode support
 * @returns {boolean} Whether Unicode is supported
 */
static detectUnicodeSupport() {
  // Check for Unicode support
  if (process.platform === 'win32') {
    // On Windows, check for UTF-8 code page
    return process.env.TERM_PROGRAM === 'vscode' || 
           process.env.WT_SESSION ||
           process.env.TERM === 'xterm-256color';
  }
  // Assume Unicode support on Unix-like systems
  return true;
}

/**
 * Detect mouse support
 * @returns {boolean} Whether mouse is supported
 */
static detectMouseSupport() {
  // Check for mouse support
  return process.stdout.isTTY && 
         (process.env.TERM_PROGRAM === 'iTerm.app' ||
          process.env.TERM_PROGRAM === 'vscode' ||
          process.env.TERM_PROGRAM === 'Hyper' ||
          process.env.TERM === 'xterm-256color');
}

/**
 * Detect clipboard support
 * @returns {boolean} Whether clipboard is supported
 */
static detectClipboardSupport() {
  // Check for clipboard support
  return process.platform === 'darwin' ||  // macOS
         process.platform === 'win32' ||   // Windows
         process.env.DISPLAY ||           // X11
         process.env.WAYLAND_DISPLAY ||    // Wayland
         false;
}

/**
 * Detect notification support
 * @returns {boolean} Whether notifications are supported
 */
static detectNotificationSupport() {
  // Check for notification support
  return process.platform === 'darwin' ||  // macOS
         process.platform === 'win32' ||   // Windows
         process.env.DISPLAY ||           // X11
         process.env.WAYLAND_DISPLAY ||    // Wayland
         false;
}

/**
 * Detect font support
 * @returns {Object} Font support information
 */
static detectFontSupport() {
  // Basic font support detection
  return {
    emoji: process.platform !== 'win32',  // Emoji support
    powerline: process.env.TERM_PROGRAM === 'iTerm.app' || 
              process.env.TERM_PROGRAM === 'vscode',
    ligatures: process.env.TERM_PROGRAM === 'iTerm.app' ||
              process.env.TERM_PROGRAM === 'vscode'
  };
}

/**
 * Detect performance capabilities
 * @returns {Object} Performance metrics
 */
static detectPerformanceCapabilities() {
  return {
    // Basic performance metrics
    highResTime: typeof process.hrtime === 'function',
    cpuUsage: typeof process.cpuUsage === 'function',
    memoryUsage: typeof process.memoryUsage === 'function',
    // Platform-specific optimizations
    isFastTerminal: !process.env.CI && process.stdout.isTTY
  };
}

/**
 * Detect environment information
 * @returns {Object} Environment details
 */
static detectEnvironment() {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    isCI: process.env.CI === 'true' || 
          process.env.CI === '1' || 
          process.env.CI === true ||
          process.env.CONTINUOUS_INTEGRATION === 'true' ||
          process.env.BUILD_NUMBER !== undefined ||
          process.env.TRAVIS === 'true' ||
          process.env.GITHUB_ACTIONS === 'true'
  };
}

// === ADAPTIVE SCALING ===

/**
 * Detect all terminal capabilities
 * @returns {Object} Complete terminal capabilities
 */
static detectCapabilities() {
  const features = this.detectTerminalFeatures();
  const mouseSupport = this.detectMouseSupport();
  const clipboardSupport = this.detectClipboardSupport();
  const notificationSupport = this.detectNotificationSupport();
  const fontSupport = this.detectFontSupport();
  const performanceCapabilities = this.detectPerformanceCapabilities();
  const environment = this.detectEnvironment();

  // Calculate dimensions
  const dimensions = process.stdout.isTTY
    ? { width: process.stdout.columns, height: process.stdout.rows }
    : { width: 80, height: 24 }; // Default fallback

  // Calculate scores
  const layoutScore = this.getLayoutScore(dimensions, features);
  const capabilityScore = this.calculateCapabilityScore({
    ...features,
    mouse: mouseSupport,
    clipboard: clipboardSupport,
    unicode: features.hasUnicode,
    colors: features.colors || 0
  });

  const terminalType = this.getTerminalType(capabilityScore);
  const capabilityTier = this.getCapabilityTier(capabilityScore);

  return {
    // Basic info
    type: terminalType,
    tier: capabilityTier,

    // Capabilities
    features: {
      ...features,
      mouse: mouseSupport,
      clipboard: clipboardSupport,
      notifications: notificationSupport,
      ...fontSupport,
      ...performanceCapabilities
    },

    // Environment
    environment,

    // Metrics
    dimensions,
    scores: {
      layout: layoutScore,
      capability: capabilityScore
    },

    // Timestamp
    timestamp: new Date().toISOString()
  };
}
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
      supportLevel = 0.3;
    }
    
    return {
      level: supportLevel,
      basicSupport: supportLevel > 0.3,
      extendedSupport: supportLevel > 0.7,
      fullSupport: supportLevel > 0.9,
      testChars,
      score: supportLevel
    };
  }
  
  detectMouseSupport() {
    // Check if terminal likely supports mouse events
    const supportedTerms = ['xterm', 'screen', 'tmux', 'iTerm', 'WezTerm'];
    const termProgram = process.env.TERM_PROGRAM || process.env.TERM || '';
    
    const hasSupport = supportedTerms.some(term => 
      termProgram.toLowerCase().includes(term.toLowerCase())
    );
    
    return {
      supported: hasSupport,
      termProgram,
      score: hasSupport ? 1 : 0
    };
  }
  
  detectClipboardSupport() {
    // Detect clipboard integration capabilities
    const hasOSC52 = process.env.TERM_PROGRAM === 'iTerm.app' ||
                     process.env.TERM_PROGRAM === 'WezTerm' ||
                     process.env.TMUX !== undefined;
    
    return {
      osc52: hasOSC52,
      systemClipboard: process.platform !== 'linux' || !!process.env.DISPLAY,
      score: hasOSC52 ? 1 : 0.5
    };
  }
  
  detectNotificationSupport() {
    // Terminal notification capabilities
    const hasNotificationSupport = process.env.TERM_PROGRAM === 'iTerm.app' ||
                                   process.env.TERM_PROGRAM === 'WezTerm' ||
                                   !!process.env.DISPLAY;
    
    return {
      supported: hasNotificationSupport,
      types: hasNotificationSupport ? ['bell', 'visual', 'system'] : ['bell'],
      score: hasNotificationSupport ? 1 : 0.3
    };
  }
  
  detectFontSupport() {
    // Font and typography support detection
    const hasNerdFont = process.env.TERM_PROGRAM === 'iTerm.app' ||
                       process.env.TERM_PROGRAM === 'WezTerm';
    
    const hasLigatures = hasNerdFont; // Simplified assumption
    
    return {
      nerdFont: hasNerdFont,
      ligatures: hasLigatures,
      monospace: true, // Always assume monospace in terminal
      score: (hasNerdFont ? 0.5 : 0) + (hasLigatures ? 0.5 : 0)
    };
  }
  
  async detectPerformanceCapabilities() {
    if (!this.options.enablePerformanceOptimization) {
      return { score: 0.5 };
    }
    
    const startTime = Date.now();
    
    // Simple performance test
    let iterations = 0;
    const testDuration = 50; // 50ms test
    const endTime = startTime + testDuration;
    
    while (Date.now() < endTime) {
      // Simple operations to test terminal responsiveness
      process.stdout.write('');
      iterations++;
    }
    
    const actualDuration = Date.now() - startTime;
    const opsPerMs = iterations / actualDuration;
    
    // Normalize performance score (0-1)
    const performanceScore = Math.min(1, opsPerMs / 100);
    
    return {
      opsPerMs,
      score: performanceScore,
      responsive: performanceScore > 0.5,
      fast: performanceScore > 0.8
    };
  }
  
  detectEnvironment() {
    return {
      platform: process.platform,
      nodeVersion: process.version,
      termProgram: process.env.TERM_PROGRAM || 'unknown',
      term: process.env.TERM || 'unknown',
      shell: process.env.SHELL || 'unknown',
      isSSH: !!(process.env.SSH_CLIENT || process.env.SSH_TTY),
      isCI: !!(process.env.CI || process.env.CONTINUOUS_INTEGRATION),
      isTTY: process.stdout.isTTY,
      score: process.stdout.isTTY ? 1 : 0.5
    };
  }
  
  calculateCapabilityScore(capabilities) {
    const weights = {
      colors: 0.2,
      unicode: 0.15,
      mouse: 0.1,
      clipboard: 0.1,
      notifications: 0.05,
      fonts: 0.15,
      performance: 0.15,
      environment: 0.1
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(weights).forEach(([key, weight]) => {
      if (capabilities[key] && capabilities[key].score !== undefined) {
        totalScore += capabilities[key].score * weight;
        totalWeight += weight;
      }
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0.5;
  }
  
  getCapabilityTier(score) {
    if (score < 0.3) return 'basic';
    if (score < 0.5) return 'standard';
    if (score < 0.7) return 'enhanced';
    if (score < 0.9) return 'premium';
    return 'ultimate';
  }
  
  // === ADAPTIVE SCALING ===
  
  getAdaptiveScaling(targetLayout = 'responsive') {
    const dims = this.currentDimensions;
    const caps = this.terminalCapabilities;
    
    if (!dims || !caps) {
      return this.getDefaultScaling();
    }
    
    const scaling = {
      layout: this.getLayoutScaling(dims, targetLayout),
      typography: this.getTypographyScaling(dims, caps),
      spacing: this.getSpacingScaling(dims),
      interaction: this.getInteractionScaling(caps),
      performance: this.getPerformanceScaling(caps),
      accessibility: this.getAccessibilityScaling(caps)
    };
    
    // Calculate overall scaling factor
    scaling.overall = this.calculateOverallScaling(scaling);
    scaling.recommendation = this.getScalingRecommendation(scaling);
    
    return scaling;
  }
  
  getLayoutScaling(dims, targetLayout) {
    const { width, height, category, breakpoint } = dims;
    
    // Base scaling factors by breakpoint
    const breakpointScaling = {
      xs: 0.7,
      sm: 0.8,
      md: 1.0,
      lg: 1.2,
      xl: 1.4,
      xxl: 1.6
    };
    
    // Layout-specific adjustments
    const layoutAdjustments = {
      compact: 0.8,
      responsive: 1.0,
      spacious: 1.2,
      magazine: 1.1,
      gallery: 0.9
    };
    
    const baseScale = breakpointScaling[breakpoint] || 1.0;
    const layoutAdjustment = layoutAdjustments[targetLayout] || 1.0;
    
    return {
      factor: baseScale * layoutAdjustment,
      columns: Math.floor(width / (targetLayout === 'compact' ? 25 : 30)),
      rows: Math.floor(height / (targetLayout === 'compact' ? 8 : 10)),
      breakpoint,
      category,
      recommendation: this.getLayoutRecommendation(dims, targetLayout)
    };
  }
  
  getTypographyScaling(dims, caps) {
    const { width } = dims;
    const { fonts, unicode } = caps;
    
    // Base typography settings
    let charWidth = 1;
    let lineHeight = 1;
    let symbolSupport = unicode?.basicSupport || false;
    
    // Adjust for high-resolution displays
    if (width > 160) {
      charWidth = 1.1;
      lineHeight = 1.2;
    }
    
    // Enhance for font capabilities
    if (fonts?.nerdFont) {
      symbolSupport = true;
      charWidth *= 1.05;
    }
    
    return {
      charWidth,
      lineHeight,
      symbolSupport,
      fontTier: fonts?.score > 0.7 ? 'enhanced' : 'standard',
      recommendation: symbolSupport ? 'symbols' : 'ascii'
    };
  }
  
  getSpacingScaling(dims) {
    const { density, efficiency, category } = dims;
    
    // Adaptive spacing based on screen density
    const basePadding = category === 'tiny' ? 1 : 
                       category === 'small' ? 2 :
                       category === 'medium' ? 3 : 4;
    
    const baseMargin = Math.max(1, Math.floor(basePadding * 0.5));
    
    return {
      padding: basePadding,
      margin: baseMargin,
      gutter: Math.max(1, Math.floor(dims.width * 0.02)),
      density: density,
      efficiency: efficiency,
      recommendation: density > 0.7 ? 'tight' : 'comfortable'
    };
  }
  
  getInteractionScaling(caps) {
    const { mouse, clipboard, notifications } = caps;
    
    return {
      mouseEnabled: mouse?.supported || false,
      keyboardOnly: !mouse?.supported,
      clipboardIntegration: clipboard?.osc52 || false,
      notificationLevel: notifications?.supported ? 'full' : 'basic',
      interactionTier: caps.tier,
      recommendation: mouse?.supported ? 'interactive' : 'keyboard'
    };
  }
  
  getPerformanceScaling(caps) {
    const { performance, colors } = caps;
    
    const animationsEnabled = performance?.fast || false;
    const colorOptimization = colors?.trueColor ? 'full' : 
                             colors?.supports256 ? 'medium' : 'basic';
    
    return {
      animations: animationsEnabled,
      colorOptimization,
      refreshRate: performance?.responsive ? 'high' : 'standard',
      renderingTier: performance?.score > 0.7 ? 'optimized' : 'conservative',
      recommendation: animationsEnabled ? 'dynamic' : 'static'
    };
  }
  
  getAccessibilityScaling(caps) {
    const { colors, unicode, environment } = caps;
    
    return {
      highContrast: colors?.monochrome || false,
      reducedMotion: !caps.performance?.fast,
      screenReader: environment?.isSSH, // Heuristic
      colorBlindFriendly: !colors?.trueColor,
      symbolAlternatives: !unicode?.extendedSupport,
      recommendation: colors?.monochrome ? 'text-only' : 'enhanced'
    };
  }
  
  calculateOverallScaling(scaling) {
    // Weighted average of scaling factors
    const weights = {
      layout: 0.3,
      typography: 0.2,
      spacing: 0.2,
      interaction: 0.1,
      performance: 0.1,
      accessibility: 0.1
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(weights).forEach(([key, weight]) => {
      const factor = scaling[key]?.factor || 1;
      totalScore += factor * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 1.0;
  }
  
  getScalingRecommendation(scaling) {
    const { layout, performance, accessibility } = scaling;
    
    if (accessibility.highContrast) return 'accessible';
    if (performance.recommendation === 'static') return 'conservative';
    if (layout.category === 'tiny') return 'minimal';
    if (layout.category === 'massive') return 'luxurious';
    return 'balanced';
  }
  
  getLayoutRecommendation(dims, targetLayout) {
    const { width, height, category } = dims;
    
    if (category === 'tiny') return 'single-column';
    if (category === 'small') return 'two-column';
    if (width > height * 4) return 'horizontal-split';
    if (height > width * 2) return 'vertical-stack';
    return 'grid';
  }
  
  getDefaultScaling() {
    return {
      layout: { factor: 1.0, recommendation: 'responsive' },
      typography: { charWidth: 1, lineHeight: 1, recommendation: 'ascii' },
      spacing: { padding: 2, margin: 1, recommendation: 'comfortable' },
      interaction: { mouseEnabled: false, recommendation: 'keyboard' },
      performance: { animations: false, recommendation: 'static' },
      accessibility: { highContrast: false, recommendation: 'standard' },
      overall: 1.0,
      recommendation: 'conservative'
    };
  }
  
  // === REALTIME MONITORING ===
  
  startRealtimeMonitoring() {
    if (this.isMonitoring) return;
    
    console.log(chalk.blue('👁️  Starting realtime terminal monitoring...'));
    this.isMonitoring = true;
    
    // Monitor resize events
    process.stdout.on('resize', () => {
      this.handleResizeEvent();
    });
    
    // Periodic capability checks
    this.monitoringInterval = setInterval(() => {
      this.performPeriodicCheck();
    }, this.options.detectionInterval);
    
    this.emit('monitoring-started');
  }
  
  stopRealtimeMonitoring() {
    if (!this.isMonitoring) return;
    
    console.log(chalk.yellow('⏹️  Stopping terminal monitoring...'));
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }
    
    this.emit('monitoring-stopped');
  }
  
  handleResizeEvent() {
    // Debounce rapid resize events
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = setTimeout(() => {
      this.processResize();
    }, this.options.debounceDelay);
  }
  
  async processResize() {
    const startTime = Date.now();
    const previousDimensions = this.currentDimensions;
    
    // Detect new dimensions
    this.currentDimensions = this.detectDimensions();
    
    // Check if dimensions actually changed
    if (this.dimensionsChanged(previousDimensions, this.currentDimensions)) {
      this.detectionStats.dimensionChanges++;
      
      console.log(chalk.cyan(`📐 Terminal resized: ${this.currentDimensions.width}x${this.currentDimensions.height} (${this.currentDimensions.category})`));
      
      // Re-detect capabilities if significant change
      if (this.isSignificantChange(previousDimensions, this.currentDimensions)) {
        this.terminalCapabilities = await this.detectCapabilities();
        this.detectionStats.capabilityChanges++;
      }
      
      // Record detection
      const detectionTime = Date.now() - startTime;
      this.recordDetection(detectionTime);
      
      // Emit events
      this.emit('dimensions-changed', {
        previous: previousDimensions,
        current: this.currentDimensions,
        scaling: this.getAdaptiveScaling()
      });
      
      // Notify dimension change handlers
      this.notifyDimensionChangeHandlers(this.currentDimensions, previousDimensions);
    }
  }
  
  dimensionsChanged(prev, curr) {
    return !prev || 
           prev.width !== curr.width || 
           prev.height !== curr.height;
  }
  
  isSignificantChange(prev, curr) {
    if (!prev) return true;
    
    const widthChange = Math.abs(prev.width - curr.width) / prev.width;
    const heightChange = Math.abs(prev.height - curr.height) / prev.height;
    
    // Consider >20% change as significant
    return widthChange > 0.2 || heightChange > 0.2;
  }
  
  async performPeriodicCheck() {
    // Lightweight periodic checks for capability changes
    if (this.options.enableCapabilityDetection) {
      const newEnvironment = this.detectEnvironment();
      
      if (this.environmentChanged(this.terminalCapabilities?.environment, newEnvironment)) {
        console.log(chalk.blue('🔄 Terminal environment changed, re-detecting capabilities...'));
        this.terminalCapabilities = await this.detectCapabilities();
        this.detectionStats.capabilityChanges++;
        
        this.emit('capabilities-changed', this.terminalCapabilities);
      }
    }
  }
  
  environmentChanged(prev, curr) {
    return !prev || 
           prev.termProgram !== curr.termProgram ||
           prev.isTTY !== curr.isTTY ||
           prev.isSSH !== curr.isSSH;
  }
  
  // === DIMENSION CHANGE HANDLERS ===
  
  addDimensionChangeHandler(handler) {
    this.dimensionChangeHandlers.add(handler);
    return () => this.dimensionChangeHandlers.delete(handler);
  }
  
  notifyDimensionChangeHandlers(current, previous) {
    this.dimensionChangeHandlers.forEach(handler => {
      try {
        handler(current, previous);
      } catch (error: unknown) {
      if (error instanceof Error) {
        console.warn(chalk.yellow('⚠️  Dimension change handler error:'), error.message);
      }
    });
  }
  
  // === UTILITIES ===
  
  recordDetection(detectionTime) {
    this.detectionStats.totalDetections++;
    this.detectionStats.lastDetectionTime = detectionTime;
    
    // Update running average
    const totalTime = this.detectionStats.averageDetectionTime * (this.detectionStats.totalDetections - 1) + detectionTime;
    this.detectionStats.averageDetectionTime = totalTime / this.detectionStats.totalDetections;
    
    // Store in history (keep last 50)
    this.detectionHistory.push({
      timestamp: Date.now(),
      dimensions: { ...this.currentDimensions },
      detectionTime
    });
    
    if (this.detectionHistory.length > 50) {
      this.detectionHistory = this.detectionHistory.slice(-50);
    }
    
    this.lastDetection = Date.now();
  }
  
  // === PUBLIC API ===
  
  getCurrentDimensions() {
    return this.currentDimensions;
  }
  
  getCurrentCapabilities() {
    return this.terminalCapabilities;
  }
  
  getDetectionStats() {
    return {
      ...this.detectionStats,
      isMonitoring: this.isMonitoring,
      historySize: this.detectionHistory.length
    };
  }
  
  async refreshDetection() {
    await this.performInitialDetection();
    this.emit('detection-refreshed', {
      dimensions: this.currentDimensions,
      capabilities: this.terminalCapabilities
    });
  }
  
  // === ANALYSIS AND REPORTING ===
  
  printTerminalAnalysis() {
    const dims = this.currentDimensions;
    const caps = this.terminalCapabilities;
    const scaling = this.getAdaptiveScaling();
    
    console.log(chalk.blue('\n🖥️  Advanced Terminal Analysis'));
    console.log(chalk.blue('==============================='));
    
    if (dims) {
      console.log(chalk.cyan('\n📐 Dimensions:'));
      console.log(`Size: ${dims.width}x${dims.height} (${dims.totalCells} cells)`);
      console.log(`Category: ${dims.category} (${dims.breakpoint})`);
      console.log(`Aspect Ratio: ${dims.aspectRatio.toFixed(2)}`);
      console.log(`Density: ${(dims.density * 100).toFixed(1)}%`);
      console.log(`Efficiency: ${(dims.efficiency * 100).toFixed(1)}%`);
    }
    
    if (caps) {
      console.log(chalk.cyan('\n🎨 Capabilities:'));
      console.log(`Overall Score: ${(caps.score * 100).toFixed(1)}% (${caps.tier})`);
      console.log(`Colors: ${caps.colors.depth}-bit (${caps.colors.trueColor ? 'true color' : 'limited'})`);
      console.log(`Unicode: ${caps.unicode.level > 0.7 ? 'full' : 'basic'} support`);
      console.log(`Mouse: ${caps.mouse.supported ? 'supported' : 'not supported'}`);
      console.log(`Performance: ${caps.performance.responsive ? 'responsive' : 'standard'}`);
    }
    
    console.log(chalk.cyan('\n⚖️  Adaptive Scaling:'));
    console.log(`Overall Factor: ${scaling.overall.toFixed(2)}x`);
    console.log(`Layout: ${scaling.layout.recommendation}`);
    console.log(`Typography: ${scaling.typography.recommendation}`);
    console.log(`Spacing: ${scaling.spacing.recommendation}`);
    console.log(`Interaction: ${scaling.interaction.recommendation}`);
    console.log(`Performance: ${scaling.performance.recommendation}`);
    console.log(`Recommendation: ${scaling.recommendation}`);
    
    const stats = this.getDetectionStats();
    console.log(chalk.cyan('\n📊 Detection Statistics:'));
    console.log(`Total Detections: ${stats.totalDetections}`);
    console.log(`Dimension Changes: ${stats.dimensionChanges}`);
    console.log(`Average Detection Time: ${stats.averageDetectionTime.toFixed(2)}ms`);
    console.log(`Monitoring: ${stats.isMonitoring ? 'active' : 'inactive'}`);
    
    console.log(chalk.green('\n✅ Terminal analysis complete'));
  }
  
  dispose() {
    console.log(chalk.yellow('🧹 Disposing Advanced Terminal Detector...'));
    
    this.stopRealtimeMonitoring();
    this.dimensionChangeHandlers.clear();
    this.detectionHistory = [];
    
    console.log(chalk.green('✅ Terminal detector disposed'));
  }
}

export default AdvancedTerminalDetector;