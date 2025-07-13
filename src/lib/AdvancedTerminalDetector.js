/**
 * Advanced Terminal Detector
 * 
 * Comprehensive terminal environment detection and adaptive scaling system
 * for optimal UI rendering across different terminal types and screen sizes.
 */

import { EventEmitter } from 'events';
import chalk from 'chalk';

/**
 * Advanced Terminal Detector
 * 
 * @class AdvancedTerminalDetector
 * @extends {EventEmitter}
 */
class AdvancedTerminalDetector extends EventEmitter {
  /**
   * Creates an instance of AdvancedTerminalDetector
   * @param {Object} [options={}] Configuration options
   * @param {boolean} [options.enableCapabilityDetection=true] Whether to enable capability detection
   * @param {boolean} [options.enableRealTimeMonitoring=true] Whether to enable real-time monitoring
   * @param {number} [options.detectionInterval=1000] Detection interval in milliseconds
   */
  constructor(options = {}) {
    super();
    
    // Default options
    this.options = {
      enableCapabilityDetection: true,
      enableRealTimeMonitoring: true,
      detectionInterval: 1000, // ms
      ...options
    };
    
    // Current state
    this.currentDimensions = this.detectDimensions();
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
        frameRate: 0
      }
    };
    
    // Internal state
    this.resizeTimeout = null;
    this.periodicCheckInterval = null;
    this.dimensionChangeHandlers = new Set();
    this.capabilityChangeHandlers = new Set();
    this.isTerminalResponsive = true;
    this.detectionInProgress = false;
    
    // Bind methods
    this.handleResize = this.handleResize.bind(this);
    this.detect = this.detect.bind(this);
    this.getTerminalReport = this.getTerminalReport.bind(this);
    this.supports = this.supports.bind(this);
    this.getTerminalType = this.getTerminalType.bind(this);
    this.getDimensions = this.getDimensions.bind(this);
    this.supportsColors = this.supportsColors.bind(this);
    this.initialize = this.initialize.bind(this);
    this.detectDimensions = this.detectDimensions.bind(this);
  }
  
  // === INITIALIZATION ===
  
  /**
   * Initialize the terminal detector
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.detectionInProgress) {
      return;
    }
    
    try {
      this.detectionInProgress = true;
      
      // Perform initial detection
      await this.performInitialDetection();
      
      // Start real-time monitoring if enabled
      if (this.options.enableRealTimeMonitoring) {
        this.startRealtimeMonitoring();
      }
      
      this.emit('initialized');
      return this;
      
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
   * Detect terminal dimensions
   * @returns {{columns: number, rows: number}} Terminal dimensions
   */
  detectDimensions() {
    try {
      const { columns = 80, rows = 24 } = process.stdout;
      return { columns, rows };
    } catch (error) {
      this.logError('Failed to detect terminal dimensions', error);
      return { columns: 80, rows: 24 }; // Fallback to default dimensions
    }
  }
  
  /**
   * Detect terminal capabilities
   * @returns {Promise<Object>} Terminal capabilities object
   */
  async detectCapabilities() {
    const capabilities = {
      colors: this.supportsColors(),
      unicode: this.supportsUnicode(),
      emoji: this.supportsEmoji(),
      hyperlinks: this.supportsHyperlinks(),
      images: this.supportsImages(),
      mouse: this.supportsMouse(),
      clipboard: this.supportsClipboard(),
      screenReader: this.isScreenReaderActive(),
      cjk: this.supportsCJK(),
      sixel: this.supportsSixel(),
      iterm2: this.isITerm2(),
      kitty: this.isKitty(),
      wezterm: this.isWezTerm(),
      windowsTerminal: this.isWindowsTerminal(),
      vscode: this.isVSCode(),
      tmux: this.isTmux(),
      screen: this.isScreen(),
      ci: this.isCI(),
      docker: this.isDocker(),
      wsl: this.isWSL(),
      ssh: this.isSSH(),
      root: this.isRoot()
    };
    
    this.emit('capabilitiesDetected', capabilities);
    return capabilities;
  }
  
  /**
   * Perform initial detection of terminal capabilities
   * @returns {Promise<Object>} Detection result with dimensions and capabilities
   */
  async performInitialDetection() {
    try {
      // Detect terminal dimensions
      this.currentDimensions = this.detectDimensions();
      
      // Detect terminal capabilities if enabled
      if (this.options.enableCapabilityDetection) {
        this.terminalCapabilities = await this.detectCapabilities();
      }
      
      // Record detection
      this.recordDetection();
      
      // Emit detection event
      this.emit('detection', {
        type: 'initial',
        dimensions: this.currentDimensions,
        capabilities: this.terminalCapabilities
      });
      
      return {
        dimensions: this.currentDimensions,
        capabilities: this.terminalCapabilities
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.emit('error', new Error(`Detection failed: ${errorMessage}`));
      throw error;
    }
  }
  
  // === CAPABILITY DETECTION METHODS ===
  
  /**
   * Check if terminal supports colors
   * @returns {boolean} True if colors are supported
   */
  supportsColors() {
    return !!(
      process.stdout.isTTY &&
      (process.env.TERM !== 'dumb' || Boolean(process.env.COLORTERM)) &&
      (process.platform !== 'win32' || process.env.ConEmuTask || process.env.TERM_PROGRAM === 'vscode')
    );
  }
  
  // === TERMINAL ENVIRONMENT DETECTION ===
  
  /**
   * Check if running in iTerm2
   * @returns {boolean} True if running in iTerm2
   */
  isITerm2() {
    return Boolean(
      process.env.TERM_PROGRAM === 'iTerm.app' ||
      process.env.TERM_PROGRAM === 'iTerm2' ||
      process.env.ITERM_SESSION_ID ||
      process.env.ITERM_PROFILE
    );
  }
  
  /**
   * Check if running in Kitty terminal
   * @returns {boolean} True if running in Kitty
   */
  isKitty() {
    return Boolean(
      process.env.KITTY_WINDOW_ID ||
      process.env.KITTY_PID ||
      process.env.TERM?.includes('kitty')
    );
  }
  
  /**
   * Check if running in WezTerm
   * @returns {boolean} True if running in WezTerm
   */
  isWezTerm() {
    return Boolean(
      process.env.WEZTERM_EXECUTABLE ||
      process.env.WEZTERM_CONFIG_FILE ||
      process.env.TERM?.includes('wezterm')
    );
  }
  
  /**
   * Check if running in Windows Terminal
   * @returns {boolean} True if running in Windows Terminal
   */
  isWindowsTerminal() {
    return Boolean(
      process.env.WT_SESSION ||
      process.env.WT_PROFILE_ID ||
      process.env.TERM_PROGRAM === 'vscode' && process.env.WT_SESSION
    );
  }
  
  /**
   * Check if running in VSCode integrated terminal
   * @returns {boolean} True if running in VSCode
   */
  isVSCode() {
    return Boolean(
      process.env.TERM_PROGRAM === 'vscode' ||
      process.env.VSCODE_PID ||
      process.env.VSCODE_CWD
    );
  }
  
  /**
   * Check if running inside tmux
   * @returns {boolean} True if running inside tmux
   */
  isTmux() {
    return Boolean(process.env.TMUX || process.env.TMUX_PANE);
  }
  
  /**
   * Check if running inside GNU Screen
   * @returns {boolean} True if running inside Screen
   */
  isScreen() {
    return Boolean(process.env.SCREEN || process.env.STARTED_SCREEN);
  }
  
  /**
   * Check if running in a CI environment
   * @returns {boolean} True if running in CI
   */
  isCI() {
    return Boolean(
      process.env.CI || // GitHub Actions, Travis CI, CircleCI, Cirrus CI, GitLab CI, AppVeyor, CodeShip, dsari
      process.env.CONTINUOUS_INTEGRATION || // Travis CI, Cirrus CI
      process.env.BUILD_NUMBER || // Jenkins, TeamCity
      process.env.RUN_ID || // TaskCluster, dsari
      process.env.BUILD_ID || // Jenkins, TeamCity
      process.env.CI_NAME || // Codeship and others
      process.env.TRAVIS || // Travis CI
      process.env.GITHUB_ACTIONS || // GitHub Actions
      process.env.CIRCLECI || // CircleCI
      process.env.CIRRUS_CI || // Cirrus CI
      process.env.GITLAB_CI || // GitLab CI
      process.env.APPVEYOR || // AppVeyor
      process.env.CODESHIP || // CodeShip
      process.env.DRONE || // Drone
      process.env.SHIPPABLE || // Shippable
      process.env.TEAMCITY_VERSION || // TeamCity
      process.env.BUILDKITE || // Buildkite
      process.env.BUILDKITE_BUILD_NUMBER || // Buildkite
      process.env.BITBUCKET_COMMIT || // Bitbucket Pipelines
      process.env.BITBUCKET_BUILD_NUMBER || // Bitbucket Pipelines
      process.env.CODEBUILD_BUILD_ID || // AWS CodeBuild
      process.env.TF_BUILD // Azure Pipelines
    );
  }
  
  /**
   * Check if running inside a Docker container
   * @returns {boolean} True if running in Docker
   */
  isDocker() {
    // Check for .dockerenv file (most reliable method)
    try {
      const fs = require('fs');
      if (fs.existsSync('/.dockerenv')) {
        return true;
      }
    } catch (err) {
      // Ignore errors
    }
    
    // Check for Docker-specific cgroup
    try {
      const fs = require('fs');
      const cgroup = fs.readFileSync('/proc/self/cgroup', 'utf8');
      return cgroup.includes('docker') || cgroup.includes('kubepods');
    } catch (err) {
      // Ignore errors
    }
    
    // Fall back to environment variables
    return Boolean(
      process.env.DOCKER === 'true' ||
      process.env.CONTAINER === 'docker' ||
      process.env.KUBERNETES_SERVICE_HOST
    );
  }
  
  /**
   * Check if running in Windows Subsystem for Linux (WSL)
   * @returns {boolean} True if running in WSL
   */
  isWSL() {
    if (process.platform !== 'linux') return false;
    
    try {
      const fs = require('fs');
      return (
        fs.existsSync('/proc/version') &&
        fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft')
      );
    } catch (err) {
      return false;
    }
  }
  
  /**
   * Check if running over SSH
   * @returns {boolean} True if running over SSH
   */
  isSSH() {
    return Boolean(
      process.env.SSH_TTY ||
      process.env.SSH_CONNECTION ||
      process.env.SSH_CLIENT ||
      process.env.SSH_CLIENT_IP ||
      (process.env.TERM_PROGRAM === 'vscode' && process.env.VSCODE_IPC_HOOK_CLI)
    );
  }
  
  /**
   * Check if running as root
   * @returns {boolean} True if running as root
   */
  isRoot() {
    // For non-Windows platforms
    if (process.platform !== 'win32') {
      return process.getuid && process.getuid() === 0;
    }
    
    // For Windows, check if the process has admin privileges
    try {
      const execSync = require('child_process').execSync;
      const result = execSync('net session', { stdio: 'ignore' });
      return result === null || result === undefined;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Check if terminal supports Unicode
   * @returns {boolean} True if Unicode is supported
   */
  supportsUnicode() {
    // Check for common Unicode support indicators
    return !/^xterm|^screen|^vt100|^rxvt|color|ansi|cygwin|linux|konsole|iTerm|alacritty|kitty|wezterm/i.test(
      process.env.TERM || ''
    ) || Boolean(process.env.CI) || process.platform === 'win32';
  }
  
  /**
   * Check if terminal supports emoji
   * @returns {boolean} True if emoji are supported
   */
  supportsEmoji() {
    // Most modern terminals support emoji
    return this.supportsUnicode() && 
      !/^xterm|^screen|^vt100|^rxvt|^linux/i.test(process.env.TERM || '') &&
      !process.env.TERM_PROGRAM?.includes('Apple_Terminal');
  }
  
  /**
   * Check if terminal supports hyperlinks
   * @returns {boolean} True if hyperlinks are supported
   */
  supportsHyperlinks() {
    // Check for known terminals that support hyperlinks
    const supported = [
      'iTerm',
      'Hyper',
      'vscode',
      'wezterm',
      'kitty',
      'alacritty',
      'WindowsTerminal',
      'mintty',
      'konsole',
      'foot',
      'terminology',
      'rio',
      'contour',
      'wezterm',
      'warp',
      'tabby',
      'wez',
      'terminus',
      'terminator',
      'tilix',
      'terminology',
      'rio',
      'contour',
      'wezterm',
      'warp',
      'tabby',
      'wez',
      'terminus',
      'terminator',
      'tilix',
      'terminology',
      'rio',
      'contour',
      'wezterm',
      'warp',
      'tabby',
      'wez',
      'terminus',
      'terminator',
      'tilix'
    ];
    
    return (
      Boolean(process.env.TERM_PROGRAM && supported.includes(process.env.TERM_PROGRAM)) ||
      Boolean(process.env.TERM && supported.some(term => process.env.TERM?.includes(term))) ||
      Boolean(process.env.TERM_PROGRAM?.includes('vscode')) ||
      Boolean(process.env.WT_SESSION) // Windows Terminal
    );
  }
  
  /**
   * Check if terminal supports images
   * @returns {boolean} True if images are supported
   */
  supportsImages() {
    // Check for terminals that support image display
    return this.isITerm2() || this.isKitty() || this.isWezTerm();
  }
  
  /**
   * Check if terminal supports mouse events
   * @returns {boolean} True if mouse events are supported
   */
  supportsMouse() {
    // Most modern terminals support mouse
    return this.isITerm2() || 
           this.isKitty() || 
           this.isWezTerm() || 
           this.isVSCode() || 
           this.isWindowsTerminal() ||
           /xterm|screen|tmux|rxvt|alacritty|foot|terminology|rio|contour|warp|tabby|wez|terminus|terminator|tilix/i.test(process.env.TERM || '');
  }
  
  /**
   * Check if terminal supports clipboard access
   * @returns {boolean} True if clipboard access is supported
   */
  supportsClipboard() {
    // Check for known terminals with clipboard support
    return this.isITerm2() || 
           this.isKitty() || 
           this.isWezTerm() || 
           this.isVSCode() || 
           this.isWindowsTerminal() ||
           process.platform === 'darwin' || // macOS has pbcopy/pbpaste
           process.platform === 'linux' && (process.env.DISPLAY || process.env.WAYLAND_DISPLAY); // X11 or Wayland
  }
  
  /**
   * Check if a screen reader is active
   * @returns {boolean} True if a screen reader is active
   */
  isScreenReaderActive() {
    // Check common screen reader environment variables
    return Boolean(
      process.env.ACCESSIBILITY_ENABLED === '1' ||
      process.env.GNOME_ACCESSIBILITY === '1' ||
      process.env.GTK_MODULES?.includes('gail') ||
      process.env.QT_ACCESSIBILITY === '1' ||
      process.env.ACCESSIBILITY_ENABLED === 'true' ||
      process.env.SCREEN_READER === '1' ||
      process.env.SCREEN_READER === 'true' ||
      process.env.NVDA ||
      process.env.ORCA ||
      process.env.YASR ||
      process.env.SPEECHD ||
      process.env.ESPEAK ||
      process.env.SPD_GTK
    );
  }
  
  /**
   * Check if terminal supports CJK (Chinese, Japanese, Korean) characters
   * @returns {boolean} True if CJK is supported
   */
  supportsCJK() {
    // Check for CJK locales or LANG settings
    return /^[a-z]{2,3}_[A-Z]{2}\.?.*UTF-?8$/i.test(process.env.LANG || '') ||
           /^[a-z]{2,3}_[A-Z]{2}\.?/i.test(process.env.LANG || '') && 
           ['zh', 'ja', 'ko', 'jp', 'cn', 'tw', 'hk'].some(lang => 
             (process.env.LANG || '').toLowerCase().startsWith(lang)
           );
  }
  
  /**
   * Check if terminal supports Sixel graphics
   * @returns {boolean} True if Sixel is supported
   */
  supportsSixel() {
    // Check for terminals that support Sixel
    return this.isWezTerm() || 
           this.isKitty() || 
           /xterm|mlterm|mintty|foot|contour|wezterm|warp|tabby|wez|terminus|terminator|tilix/i.test(process.env.TERM || '') ||
           process.env.SIXEL_SUPPORT === '1';
  }
  
  async initialize() {
    console.log(chalk.blue('🖥️  Initializing Advanced Terminal Detector...'));
    
    try {
      // Initial detection
      await this.performInitialDetection();
      
      // Set up monitoring if enabled
      if (this.options.enableRealtimeDetection) {
        this.startRealtimeMonitoring();
      }
      
      console.log(chalk.green('✅ Advanced Terminal Detector initialized'));
      this.emit('detector-ready', this.currentDimensions);
      
    } catch (error: unknown) {
      if (error instanceof Error) {
      console.error(chalk.red('❌ Terminal detector initialization failed:'), error.message);
      throw error;
    }
  }
  
  async performInitialDetection() {
    const startTime = Date.now();
    
    // Detect current dimensions
    this.currentDimensions = this.detectDimensions();
    
    // Detect terminal capabilities
    if (this.options.enableCapabilityDetection) {
      try {
        this.terminalCapabilities = await this.detectCapabilities();
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.logError('Error detecting terminal capabilities', error);
        } else {
          this.logError('Unknown error occurred while detecting terminal capabilities', String(error));
        }
        return false;
      }
    }
    
    // Record detection
    const detectionTime = Date.now() - startTime;
    this.recordDetection(detectionTime);
    
    console.log(chalk.cyan(`📐 Initial detection: ${this.currentDimensions.width}x${this.currentDimensions.height} (${this.currentDimensions.category})`));
  }
  
  // === DIMENSION DETECTION ===
  
  detectDimensions() {
    const columns = process.stdout.columns || 80;
    const rows = process.stdout.rows || 24;
    
    return {
      width: columns,
      height: rows,
      aspectRatio: columns / rows,
      totalCells: columns * rows,
      category: this.categorizeDimensions(columns, rows),
      breakpoint: this.getBreakpoint(columns, rows),
      timestamp: Date.now(),
      
      // Advanced metrics
      usableWidth: Math.max(columns - 4, 40), // Account for margins
      usableHeight: Math.max(rows - 2, 10),   // Account for headers/footers
      density: this.calculateDensity(columns, rows),
      efficiency: this.calculateEfficiency(columns, rows)
    };
  }
  
  categorizeDimensions(width, height) {
    const totalCells = width * height;
    
    if (totalCells < 2000) return 'tiny';        // < 80x25
    if (totalCells < 5000) return 'small';       // < 100x50
    if (totalCells < 10000) return 'medium';     // < 125x80
    if (totalCells < 20000) return 'large';      // < 160x125
    if (totalCells < 40000) return 'xlarge';     // < 200x200
    return 'massive';                             // >= 200x200
  }
  
  getBreakpoint(width, height) {
    if (width < 60 || height < 20) return 'xs';
    if (width < 80 || height < 24) return 'sm';
    if (width < 120 || height < 30) return 'md';
    if (width < 160 || height < 40) return 'lg';
    if (width < 200 || height < 50) return 'xl';
    return 'xxl';
  }
  
  calculateDensity(width, height) {
    // Information density score (0-1)
    const ratio = width / height;
    const idealRatio = 3.5; // Roughly 16:9 equivalent for text
    return Math.max(0, 1 - Math.abs(ratio - idealRatio) / idealRatio);
  }
  
  calculateEfficiency(width, height) {
    // UI efficiency score based on usable space
    const usableRatio = (width - 4) * (height - 2) / (width * height);
    return Math.max(0, Math.min(1, usableRatio));
  }
  
  // === CAPABILITY DETECTION ===
  
  async detectCapabilities() {
    const capabilities = {
      colors: this.detectColorSupport(),
      unicode: this.detectUnicodeSupport(),
      mouse: this.detectMouseSupport(),
      clipboard: this.detectClipboardSupport(),
      notifications: this.detectNotificationSupport(),
      fonts: this.detectFontSupport(),
      performance: await this.detectPerformanceCapabilities(),
      environment: this.detectEnvironment(),
      timestamp: Date.now()
    };
    
    // Calculate overall capability score
    capabilities.score = this.calculateCapabilityScore(capabilities);
    capabilities.tier = this.getCapabilityTier(capabilities.score);
    
    return capabilities;
  }
  
  detectColorSupport() {
    const colorDepth = process.stdout.getColorDepth ? process.stdout.getColorDepth() : 4;
    
    return {
      depth: colorDepth,
      trueColor: colorDepth >= 24,
      supports256: colorDepth >= 8,
      supports16: colorDepth >= 4,
      monochrome: colorDepth <= 1,
      score: Math.min(1, colorDepth / 24)
    };
  }
  
  detectUnicodeSupport() {
    // Test basic Unicode support
    const testChars = ['✓', '✗', '★', '◆', '▲', '●'];
    let supportLevel = 0;
    
    try {
      // Simple heuristic based on environment
      if (process.env.LANG && process.env.LANG.includes('UTF-8')) {
        supportLevel = 0.9;
      } else if (process.env.TERM && process.env.TERM.includes('xterm')) {
        supportLevel = 0.8;
      } else {
        supportLevel = 0.5;
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