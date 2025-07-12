/**
 * Advanced Terminal Detector
 * 
 * Comprehensive terminal environment detection and adaptive scaling system
 * for optimal UI rendering across different terminal types and screen sizes.
 */

import { EventEmitter } from 'events';
import chalk from 'chalk';

export class AdvancedTerminalDetector extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableRealtimeDetection: true,
      enableCapabilityDetection: true,
      enablePerformanceOptimization: true,
      detectionInterval: 1000, // 1 second
      debounceDelay: 250, // 250ms debounce
      ...options
    };
    
    // Terminal state tracking
    this.currentDimensions = null;
    this.terminalCapabilities = null;
    this.detectionHistory = [];
    this.lastDetection = null;
    this.isMonitoring = false;
    
    // Performance tracking
    this.detectionStats = {
      totalDetections: 0,
      dimensionChanges: 0,
      capabilityChanges: 0,
      averageDetectionTime: 0,
      lastDetectionTime: 0
    };
    
    // Debouncing for rapid resize events
    this.resizeTimeout = null;
    this.dimensionChangeHandlers = new Set();
    
    // Initialize detection
    this.initialize();
  }
  
  // === INITIALIZATION ===
  
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
      
    } catch (error) {
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
      this.terminalCapabilities = await this.detectCapabilities();
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
    } catch (error) {
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
      } catch (error) {
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