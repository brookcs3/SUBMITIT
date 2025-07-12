/**
 * Browsh Preview Wrapper
 * 
 * Advanced preview wrapper with Browsh integration for terminal-based web browsing,
 * fallback ASCII art generation, and sophisticated preview rendering strategies.
 */

import { EventEmitter } from 'events';
import { spawn, exec } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join, basename } from 'path';
import chalk from 'chalk';

export class BrowshPreviewWrapper extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableBrowshIntegration: true,
      enableASCIIFallback: true,
      enableImageToASCII: true,
      enableHTMLToText: true,
      enableSmartFallback: true,
      browshExecutable: 'browsh',
      browshArgs: ['--startup-url', '--time-limit', '30'],
      previewWidth: 120,
      previewHeight: 30,
      asciiWidth: 80,
      asciiHeight: 24,
      enableColors: true,
      enableUnicode: true,
      fallbackStrategy: 'intelligent',
      tempDirectory: '/tmp/submitit-previews',
      ...options
    };
    
    // Preview state management
    this.isInitialized = false;
    this.browshAvailable = false;
    this.fallbackEngines = new Map();
    this.previewCache = new Map();
    this.activePreviewProcesses = new Set();
    
    // Performance tracking
    this.previewStats = {
      totalPreviews: 0,
      browshPreviews: 0,
      asciiFallbacks: 0,
      textFallbacks: 0,
      averagePreviewTime: 0,
      successRate: 0,
      cacheHits: 0
    };
    
    // ASCII art configuration
    this.asciiConfig = {
      charSets: {
        detailed: ' .:-=+*#%@',
        simple: ' .,;:clodxkO0KXNWM',
        minimal: ' .-+*%@',
        unicode: ' ░▒▓█'
      },
      defaultCharSet: 'detailed',
      contrastEnhancement: true,
      edgeDetection: false
    };
    
    this.initialize();
  }
  
  // === INITIALIZATION ===
  
  async initialize() {
    console.log(chalk.blue('🌐 Initializing Browsh Preview Wrapper...'));
    
    try {
      // Check for Browsh availability
      await this.checkBrowshAvailability();
      
      // Initialize fallback engines
      await this.initializeFallbackEngines();
      
      // Set up preview optimization
      this.setupPreviewOptimization();
      
      // Create temp directory
      await this.createTempDirectory();
      
      this.isInitialized = true;
      console.log(chalk.green('✅ Browsh preview wrapper initialized'));
      this.emit('wrapper-ready', {
        browshAvailable: this.browshAvailable,
        fallbackEngines: Array.from(this.fallbackEngines.keys())
      });
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to initialize preview wrapper:'), error.message);
      throw error;
    }
  }
  
  async checkBrowshAvailability() {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      await execAsync(`which ${this.options.browshExecutable}`);
      
      // Test Browsh version
      const { stdout } = await execAsync(`${this.options.browshExecutable} --version`);
      
      this.browshAvailable = true;
      console.log(chalk.green(`✅ Browsh available: ${stdout.trim()}`));
      
    } catch (error) {
      this.browshAvailable = false;
      console.log(chalk.yellow('⚠️  Browsh not available, using fallback engines'));
    }
  }
  
  async initializeFallbackEngines() {
    // Text-based fallback engine
    this.fallbackEngines.set('text-renderer', {
      name: 'Text Renderer',
      description: 'Converts HTML to formatted text',
      priority: 1,
      render: this.renderToText.bind(this)
    });
    
    // ASCII art fallback engine
    this.fallbackEngines.set('ascii-art', {
      name: 'ASCII Art Generator',
      description: 'Converts images and content to ASCII art',
      priority: 2,
      render: this.renderToASCII.bind(this)
    });
    
    // Simple HTML fallback
    this.fallbackEngines.set('html-simple', {
      name: 'Simple HTML Renderer',
      description: 'Simplified HTML rendering for terminal',
      priority: 3,
      render: this.renderSimpleHTML.bind(this)
    });
    
    // Debug fallback
    this.fallbackEngines.set('debug-info', {
      name: 'Debug Info Renderer',
      description: 'Shows debug information about the preview',
      priority: 99,
      render: this.renderDebugInfo.bind(this)
    });
    
    console.log(chalk.cyan(`🔧 Initialized ${this.fallbackEngines.size} fallback engines`));
  }
  
  setupPreviewOptimization() {
    this.optimizationStrategies = {
      'cache-optimization': this.enableCacheOptimization.bind(this),
      'resolution-scaling': this.enableResolutionScaling.bind(this),
      'content-analysis': this.enableContentAnalysis.bind(this),
      'smart-fallback': this.enableSmartFallback.bind(this)
    };
  }
  
  async createTempDirectory() {
    try {
      const fs = await import('fs/promises');
      await fs.mkdir(this.options.tempDirectory, { recursive: true });
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not create temp directory:', error.message));
    }
  }
  
  // === MAIN PREVIEW GENERATION ===
  
  async generatePreview(content, options = {}) {
    const startTime = Date.now();
    
    const previewOptions = {
      format: 'auto', // auto, browsh, ascii, text, html
      width: this.options.previewWidth,
      height: this.options.previewHeight,
      enableColors: this.options.enableColors,
      enableUnicode: this.options.enableUnicode,
      cacheKey: null,
      fallbackStrategy: this.options.fallbackStrategy,
      ...options
    };
    
    this.previewStats.totalPreviews++;
    
    try {
      // Check cache first
      if (previewOptions.cacheKey && this.previewCache.has(previewOptions.cacheKey)) {
        this.previewStats.cacheHits++;
        console.log(chalk.green('📦 Using cached preview'));
        return this.previewCache.get(previewOptions.cacheKey);
      }
      
      // Determine optimal preview strategy
      const strategy = await this.determinePreviewStrategy(content, previewOptions);
      
      // Generate preview using selected strategy
      const preview = await this.executePreviewStrategy(strategy, content, previewOptions);
      
      // Cache the result
      if (previewOptions.cacheKey) {
        this.previewCache.set(previewOptions.cacheKey, preview);
      }
      
      // Update statistics
      const previewTime = Date.now() - startTime;
      this.updatePreviewStats(strategy.engine, previewTime, true);
      
      console.log(chalk.green(`✅ Preview generated using ${strategy.engine} (${previewTime}ms)`));
      
      this.emit('preview-generated', {
        engine: strategy.engine,
        previewTime,
        contentType: strategy.contentType,
        success: true
      });
      
      return preview;
      
    } catch (error) {
      const previewTime = Date.now() - startTime;
      this.updatePreviewStats('failed', previewTime, false);
      
      console.error(chalk.red('❌ Preview generation failed:'), error.message);
      
      this.emit('preview-failed', {
        error: error.message,
        previewTime,
        fallback: true
      });
      
      // Try emergency fallback
      return await this.generateEmergencyFallback(content, previewOptions);
    }
  }
  
  async determinePreviewStrategy(content, options) {
    const contentAnalysis = await this.analyzeContent(content);
    
    // Auto-detect format if not specified
    if (options.format === 'auto') {
      if (this.browshAvailable && contentAnalysis.hasHTML) {
        options.format = 'browsh';
      } else if (contentAnalysis.hasImages) {
        options.format = 'ascii';
      } else {
        options.format = 'text';
      }
    }
    
    // Select engine based on format and availability
    let engine = 'text-renderer';
    
    switch (options.format) {
      case 'browsh':
        engine = this.browshAvailable ? 'browsh' : 'html-simple';
        break;
      case 'ascii':
        engine = 'ascii-art';
        break;
      case 'text':
        engine = 'text-renderer';
        break;
      case 'html':
        engine = 'html-simple';
        break;
      default:
        engine = 'text-renderer';
    }
    
    return {
      engine,
      contentType: contentAnalysis.type,
      hasImages: contentAnalysis.hasImages,
      hasHTML: contentAnalysis.hasHTML,
      complexity: contentAnalysis.complexity
    };
  }
  
  async executePreviewStrategy(strategy, content, options) {
    switch (strategy.engine) {
      case 'browsh':
        return await this.generateBrowshPreview(content, options);
        
      case 'ascii-art':
        return await this.generateASCIIPreview(content, options);
        
      case 'text-renderer':
        return await this.generateTextPreview(content, options);
        
      case 'html-simple':
        return await this.generateSimpleHTMLPreview(content, options);
        
      default:
        // Use fallback engine
        const fallbackEngine = this.fallbackEngines.get(strategy.engine);
        if (fallbackEngine) {
          return await fallbackEngine.render(content, options);
        }
        throw new Error(`Unknown preview engine: ${strategy.engine}`);
    }
  }
  
  // === BROWSH INTEGRATION ===
  
  async generateBrowshPreview(content, options) {
    console.log(chalk.blue('🌐 Generating Browsh preview...'));
    
    try {
      // Create temporary HTML file
      const tempFile = await this.createTempHTMLFile(content);
      
      // Prepare Browsh command
      const browshArgs = [
        ...this.options.browshArgs,
        `file://${tempFile}`,
        '--stdout',
        `--width=${options.width}`,
        `--height=${options.height}`
      ];
      
      // Execute Browsh
      const browshOutput = await this.executeBrowsh(browshArgs);
      
      // Clean up temp file
      await this.cleanupTempFile(tempFile);
      
      // Process Browsh output
      const processedOutput = this.processBrowshOutput(browshOutput, options);
      
      this.previewStats.browshPreviews++;
      
      return {
        type: 'browsh',
        content: processedOutput,
        width: options.width,
        height: options.height,
        colors: options.enableColors,
        metadata: {
          engine: 'browsh',
          generatedAt: Date.now(),
          originalContent: content.substring(0, 100) + '...'
        }
      };
      
    } catch (error) {
      console.error(chalk.red('❌ Browsh preview failed:'), error.message);
      
      // Fallback to alternative engine
      if (this.options.enableSmartFallback) {
        console.log(chalk.yellow('🔄 Falling back to alternative engine...'));
        return await this.generateAlternativePreview(content, options);
      }
      
      throw error;
    }
  }
  
  async executeBrowsh(args) {
    return new Promise((resolve, reject) => {
      const browshProcess = spawn(this.options.browshExecutable, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      this.activePreviewProcesses.add(browshProcess);
      
      let stdout = '';
      let stderr = '';
      
      browshProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      browshProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      browshProcess.on('close', (code) => {
        this.activePreviewProcesses.delete(browshProcess);
        
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Browsh exited with code ${code}: ${stderr}`));
        }
      });
      
      browshProcess.on('error', (error) => {
        this.activePreviewProcesses.delete(browshProcess);
        reject(error);
      });
      
      // Set timeout
      setTimeout(() => {
        if (this.activePreviewProcesses.has(browshProcess)) {
          browshProcess.kill('SIGTERM');
          this.activePreviewProcesses.delete(browshProcess);
          reject(new Error('Browsh preview timeout'));
        }
      }, 30000); // 30 second timeout
    });
  }
  
  processBrowshOutput(output, options) {
    // Process Browsh ANSI output
    let processed = output;
    
    // Remove excessive whitespace
    processed = processed.replace(/\n{3,}/g, '\n\n');
    
    // Apply width/height constraints
    const lines = processed.split('\n');
    const constrainedLines = lines.slice(0, options.height);
    
    return constrainedLines.map(line => {
      if (line.length > options.width) {
        return line.substring(0, options.width);
      }
      return line;
    }).join('\n');
  }
  
  // === ASCII ART GENERATION ===
  
  async generateASCIIPreview(content, options) {
    console.log(chalk.cyan('🎨 Generating ASCII art preview...'));
    
    try {
      const contentAnalysis = await this.analyzeContent(content);
      
      if (contentAnalysis.hasImages) {
        return await this.generateImageToASCII(content, options);
      } else {
        return await this.generateTextToASCII(content, options);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ ASCII preview failed:'), error.message);
      throw error;
    }
  }
  
  async generateImageToASCII(content, options) {
    // Simplified ASCII art generation
    const asciiOptions = {
      width: options.width || this.options.asciiWidth,
      height: options.height || this.options.asciiHeight,
      charSet: this.asciiConfig.charSets[this.asciiConfig.defaultCharSet],
      ...options
    };
    
    // For demonstration, create a simple ASCII pattern
    const asciiArt = this.createSimpleASCIIPattern(asciiOptions);
    
    this.previewStats.asciiFallbacks++;
    
    return {
      type: 'ascii',
      content: asciiArt,
      width: asciiOptions.width,
      height: asciiOptions.height,
      colors: false, // ASCII is typically monochrome
      metadata: {
        engine: 'ascii-art',
        charSet: this.asciiConfig.defaultCharSet,
        generatedAt: Date.now()
      }
    };
  }
  
  async generateTextToASCII(content, options) {
    // Convert text content to formatted ASCII
    const lines = content.split('\n');
    const asciiLines = [];
    
    for (let i = 0; i < Math.min(lines.length, options.height); i++) {
      let line = lines[i];
      
      // Truncate or pad line to width
      if (line.length > options.width) {
        line = line.substring(0, options.width - 3) + '...';
      } else {
        line = line.padEnd(options.width);
      }
      
      asciiLines.push(line);
    }
    
    // Create ASCII border
    const border = '+' + '-'.repeat(options.width - 2) + '+';
    const asciiWithBorder = [
      border,
      ...asciiLines.map(line => '|' + line.substring(1, line.length - 1) + '|'),
      border
    ].join('\n');
    
    return {
      type: 'ascii-text',
      content: asciiWithBorder,
      width: options.width,
      height: asciiLines.length + 2,
      colors: false,
      metadata: {
        engine: 'text-to-ascii',
        generatedAt: Date.now()
      }
    };
  }
  
  createSimpleASCIIPattern(options) {
    const { width, height, charSet } = options;
    const pattern = [];
    
    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        // Create a simple gradient pattern
        const intensity = Math.floor((x + y) / (width + height) * charSet.length);
        const charIndex = Math.min(intensity, charSet.length - 1);
        line += charSet[charIndex];
      }
      pattern.push(line);
    }
    
    return pattern.join('\n');
  }
  
  // === TEXT RENDERING ===
  
  async generateTextPreview(content, options) {
    console.log(chalk.green('📝 Generating text preview...'));
    
    const textPreview = await this.renderToText(content, options);
    
    this.previewStats.textFallbacks++;
    
    return {
      type: 'text',
      content: textPreview,
      width: options.width,
      height: Math.min(content.split('\n').length, options.height),
      colors: options.enableColors,
      metadata: {
        engine: 'text-renderer',
        generatedAt: Date.now()
      }
    };
  }
  
  async renderToText(content, options) {
    // Remove HTML tags if present
    let textContent = content.replace(/<[^>]*>/g, '');
    
    // Format text for terminal display
    const lines = textContent.split('\n');
    const formattedLines = [];
    
    for (let i = 0; i < Math.min(lines.length, options.height); i++) {
      let line = lines[i].trim();
      
      // Apply text formatting
      if (options.enableColors) {
        // Add some basic coloring for better readability
        if (line.startsWith('#')) {
          line = chalk.cyan(line); // Headers
        } else if (line.includes('http')) {
          line = chalk.blue(line); // Links
        }
      }
      
      // Truncate long lines
      if (line.length > options.width) {
        line = line.substring(0, options.width - 3) + '...';
      }
      
      formattedLines.push(line);
    }
    
    return formattedLines.join('\n');
  }
  
  // === SIMPLE HTML RENDERING ===
  
  async generateSimpleHTMLPreview(content, options) {
    console.log(chalk.magenta('🌐 Generating simple HTML preview...'));
    
    const htmlPreview = await this.renderSimpleHTML(content, options);
    
    return {
      type: 'html-simple',
      content: htmlPreview,
      width: options.width,
      height: options.height,
      colors: options.enableColors,
      metadata: {
        engine: 'html-simple',
        generatedAt: Date.now()
      }
    };
  }
  
  async renderSimpleHTML(content, options) {
    // Simple HTML to text conversion with basic formatting
    let rendered = content;
    
    // Replace common HTML elements with text equivalents
    const replacements = [
      { pattern: /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, replacement: '\n═══ $1 ═══\n' },
      { pattern: /<p[^>]*>(.*?)<\/p>/gi, replacement: '\n$1\n' },
      { pattern: /<br\s*\/?>/gi, replacement: '\n' },
      { pattern: /<strong[^>]*>(.*?)<\/strong>/gi, replacement: '**$1**' },
      { pattern: /<em[^>]*>(.*?)<\/em>/gi, replacement: '*$1*' },
      { pattern: /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, replacement: '$2 [$1]' },
      { pattern: /<li[^>]*>(.*?)<\/li>/gi, replacement: '• $1\n' },
      { pattern: /<[^>]*>/g, replacement: '' } // Remove remaining tags
    ];
    
    replacements.forEach(({ pattern, replacement }) => {
      rendered = rendered.replace(pattern, replacement);
    });
    
    // Clean up excessive whitespace
    rendered = rendered.replace(/\n{3,}/g, '\n\n');
    
    // Apply width/height constraints
    const lines = rendered.split('\n');
    const constrainedLines = lines.slice(0, options.height);
    
    return constrainedLines.map(line => {
      if (line.length > options.width) {
        return line.substring(0, options.width - 3) + '...';
      }
      return line;
    }).join('\n');
  }
  
  // === CONTENT ANALYSIS ===
  
  async analyzeContent(content) {
    const analysis = {
      type: 'unknown',
      hasHTML: false,
      hasImages: false,
      hasCSS: false,
      hasJavaScript: false,
      complexity: 'low',
      estimatedRenderTime: 1000
    };
    
    // Detect content type
    if (content.includes('<html') || content.includes('<!DOCTYPE')) {
      analysis.type = 'html';
      analysis.hasHTML = true;
    } else if (content.includes('<')) {
      analysis.type = 'markup';
      analysis.hasHTML = true;
    } else {
      analysis.type = 'text';
    }
    
    // Detect specific elements
    if (content.includes('<img') || content.includes('<svg')) {
      analysis.hasImages = true;
    }
    
    if (content.includes('<style') || content.includes('.css')) {
      analysis.hasCSS = true;
    }
    
    if (content.includes('<script') || content.includes('javascript:')) {
      analysis.hasJavaScript = true;
    }
    
    // Estimate complexity
    const elementCount = (content.match(/<[^>]*>/g) || []).length;
    if (elementCount > 100) {
      analysis.complexity = 'high';
      analysis.estimatedRenderTime = 5000;
    } else if (elementCount > 20) {
      analysis.complexity = 'medium';
      analysis.estimatedRenderTime = 2000;
    }
    
    return analysis;
  }
  
  // === FALLBACK STRATEGIES ===
  
  async generateAlternativePreview(content, options) {
    console.log(chalk.yellow('🔄 Generating alternative preview...'));
    
    // Try fallback engines in order of priority
    const sortedEngines = Array.from(this.fallbackEngines.entries())
      .sort(([, a], [, b]) => a.priority - b.priority);
    
    for (const [name, engine] of sortedEngines) {
      try {
        console.log(chalk.cyan(`Trying fallback engine: ${engine.name}`));
        const preview = await engine.render(content, options);
        
        console.log(chalk.green(`✅ Alternative preview generated using ${engine.name}`));
        return preview;
        
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Fallback engine ${engine.name} failed:`, error.message));
        continue;
      }
    }
    
    // If all fallbacks fail, generate emergency fallback
    return await this.generateEmergencyFallback(content, options);
  }
  
  async generateEmergencyFallback(content, options) {
    console.log(chalk.red('🚨 Generating emergency fallback...'));
    
    const emergencyPreview = {
      type: 'emergency',
      content: this.createEmergencyContent(content, options),
      width: options.width,
      height: Math.min(10, options.height),
      colors: false,
      metadata: {
        engine: 'emergency-fallback',
        generatedAt: Date.now(),
        warning: 'All preview engines failed'
      }
    };
    
    return emergencyPreview;
  }
  
  createEmergencyContent(content, options) {
    const emergency = [
      '╔' + '═'.repeat(options.width - 2) + '╗',
      '║' + ' PREVIEW UNAVAILABLE '.padStart(Math.floor((options.width - 2 + 20) / 2)).padEnd(options.width - 2) + '║',
      '║' + ' '.repeat(options.width - 2) + '║',
      '║' + ' All preview engines failed '.padStart(Math.floor((options.width - 2 + 26) / 2)).padEnd(options.width - 2) + '║',
      '║' + ' Showing content summary: '.padEnd(options.width - 2) + '║',
      '║' + ' '.repeat(options.width - 2) + '║',
      '║' + content.substring(0, options.width - 4).padEnd(options.width - 2) + '║',
      '╚' + '═'.repeat(options.width - 2) + '╝'
    ];
    
    return emergency.join('\n');
  }
  
  async renderDebugInfo(content, options) {
    const debugInfo = [
      'DEBUG PREVIEW INFORMATION',
      '========================',
      `Content length: ${content.length} characters`,
      `Requested size: ${options.width}x${options.height}`,
      `Colors enabled: ${options.enableColors}`,
      `Unicode enabled: ${options.enableUnicode}`,
      `Browsh available: ${this.browshAvailable}`,
      `Fallback engines: ${this.fallbackEngines.size}`,
      '',
      'CONTENT PREVIEW:',
      content.substring(0, 200) + (content.length > 200 ? '...' : '')
    ];
    
    return {
      type: 'debug',
      content: debugInfo.join('\n'),
      width: options.width,
      height: debugInfo.length,
      colors: false,
      metadata: {
        engine: 'debug-info',
        generatedAt: Date.now()
      }
    };
  }
  
  // === UTILITY METHODS ===
  
  async createTempHTMLFile(content) {
    const tempFileName = `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.html`;
    const tempFilePath = join(this.options.tempDirectory, tempFileName);
    
    // Ensure content is valid HTML
    let htmlContent = content;
    if (!content.includes('<html')) {
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Submitit Preview</title>
  <style>
    body { font-family: monospace; margin: 20px; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${content}
</body>
</html>`;
    }
    
    await writeFile(tempFilePath, htmlContent, 'utf8');
    return tempFilePath;
  }
  
  async cleanupTempFile(filePath) {
    try {
      await unlink(filePath);
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Could not cleanup temp file ${filePath}:`, error.message));
    }
  }
  
  updatePreviewStats(engine, previewTime, success) {
    if (success) {
      const totalTime = this.previewStats.averagePreviewTime * (this.previewStats.totalPreviews - 1) + previewTime;
      this.previewStats.averagePreviewTime = totalTime / this.previewStats.totalPreviews;
      
      // Update engine-specific stats
      switch (engine) {
        case 'browsh':
          this.previewStats.browshPreviews++;
          break;
        case 'ascii-art':
          this.previewStats.asciiFallbacks++;
          break;
        case 'text-renderer':
          this.previewStats.textFallbacks++;
          break;
      }
    }
    
    // Calculate success rate
    const successfulPreviews = this.previewStats.browshPreviews + 
                              this.previewStats.asciiFallbacks + 
                              this.previewStats.textFallbacks;
    this.previewStats.successRate = successfulPreviews / this.previewStats.totalPreviews;
  }
  
  // === OPTIMIZATION STRATEGIES ===
  
  enableCacheOptimization() {
    // Implement intelligent caching based on content hash
    return true;
  }
  
  enableResolutionScaling() {
    // Implement dynamic resolution scaling based on terminal size
    return true;
  }
  
  enableContentAnalysis() {
    // Implement content analysis for optimal engine selection
    return true;
  }
  
  enableSmartFallback() {
    // Implement smart fallback selection based on content type
    return true;
  }
  
  // === PUBLIC API ===
  
  getPreviewStats() {
    return {
      ...this.previewStats,
      cacheSize: this.previewCache.size,
      activeProcesses: this.activePreviewProcesses.size,
      browshAvailable: this.browshAvailable,
      fallbackEngines: Array.from(this.fallbackEngines.keys())
    };
  }
  
  clearCache() {
    this.previewCache.clear();
    console.log(chalk.green('✅ Preview cache cleared'));
  }
  
  printPreviewReport() {
    const stats = this.getPreviewStats();
    
    console.log(chalk.blue('\n🌐 Browsh Preview Wrapper Report'));
    console.log(chalk.blue('================================='));
    
    console.log(chalk.cyan('\n📊 Preview Statistics:'));
    console.log(`Total Previews: ${stats.totalPreviews}`);
    console.log(`Browsh Previews: ${stats.browshPreviews}`);
    console.log(`ASCII Fallbacks: ${stats.asciiFallbacks}`);
    console.log(`Text Fallbacks: ${stats.textFallbacks}`);
    console.log(`Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
    console.log(`Average Preview Time: ${stats.averagePreviewTime.toFixed(2)}ms`);
    console.log(`Cache Hits: ${stats.cacheHits}`);
    
    console.log(chalk.cyan('\n🛠️  Engine Status:'));
    console.log(`Browsh Available: ${stats.browshAvailable ? 'Yes' : 'No'}`);
    console.log(`Fallback Engines: ${stats.fallbackEngines.length}`);
    console.log(`Cache Size: ${stats.cacheSize} entries`);
    console.log(`Active Processes: ${stats.activeProcesses}`);
    
    if (stats.fallbackEngines.length > 0) {
      console.log(chalk.cyan('\n🔧 Available Fallback Engines:'));
      stats.fallbackEngines.forEach(engine => {
        const engineInfo = this.fallbackEngines.get(engine);
        console.log(`  ${engineInfo.name}: ${engineInfo.description}`);
      });
    }
    
    console.log(chalk.green('\n✅ Preview wrapper report complete'));
  }
  
  // === CLEANUP ===
  
  async dispose() {
    console.log(chalk.yellow('🧹 Disposing Browsh Preview Wrapper...'));
    
    // Kill active processes
    for (const process of this.activePreviewProcesses) {
      try {
        process.kill('SIGTERM');
      } catch (error) {
        console.warn(chalk.yellow('⚠️  Error killing process:', error.message));
      }
    }
    
    this.activePreviewProcesses.clear();
    this.previewCache.clear();
    this.fallbackEngines.clear();
    this.removeAllListeners();
    
    console.log(chalk.green('✅ Preview wrapper disposed'));
  }
}

export default BrowshPreviewWrapper;