/**
 * Share-CLI Integration System
 * 
 * Advanced file sharing integration with share-cli for seamless post-export workflow,
 * multiple sharing platforms, and intelligent sharing strategies.
 */

import { EventEmitter } from 'events';
import { spawn, exec } from 'child_process';
import { stat, access } from 'fs/promises';
import { join, basename, extname } from 'path';
import chalk from 'chalk';

export class ShareCliIntegration extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableShareCli: true,
      enableMultiplePlatforms: true,
      enableSmartSharing: true,
      enableSharingAnalytics: true,
      enableSharingHistory: true,
      shareCliExecutable: 'share-cli',
      defaultPlatforms: ['transfer.sh', 'file.io', '0x0.st'],
      maxFileSize: 100 * 1024 * 1024, // 100MB
      shareTimeout: 60000, // 60 seconds
      enableQRCodes: true,
      enableShortLinks: true,
      enableExpirationDates: true,
      ...options
    };
    
    // Sharing state management
    this.isInitialized = false;
    this.shareCliAvailable = false;
    this.availablePlatforms = new Set();
    this.sharingHistory = [];
    this.activeShares = new Map();
    
    // Sharing strategies
    this.sharingStrategies = new Map();
    this.platformCapabilities = new Map();
    this.fallbackPlatforms = [];
    
    // Performance tracking
    this.sharingStats = {
      totalShares: 0,
      successfulShares: 0,
      failedShares: 0,
      averageShareTime: 0,
      platformUsage: new Map(),
      fileTypesShared: new Map()
    };
    
    // Platform configurations
    this.platformConfigs = new Map();
    
    this.initialize();
  }
  
  // === INITIALIZATION ===
  
  async initialize() {
    console.log(chalk.blue('📤 Initializing Share-CLI Integration...'));
    
    try {
      // Check for share-cli availability
      await this.checkShareCliAvailability();
      
      // Initialize sharing platforms
      await this.initializeSharingPlatforms();
      
      // Set up sharing strategies
      this.setupSharingStrategies();
      
      // Initialize platform capabilities
      await this.analyzePlatformCapabilities();
      
      this.isInitialized = true;
      console.log(chalk.green('✅ Share-CLI integration initialized'));
      this.emit('sharing-ready', {
        shareCliAvailable: this.shareCliAvailable,
        availablePlatforms: Array.from(this.availablePlatforms)
      });
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to initialize share-cli integration:'), error.message);
      // Continue without share-cli but with fallback sharing
      this.setupFallbackSharing();
    }
  }
  
  async checkShareCliAvailability() {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      await execAsync(`which ${this.options.shareCliExecutable}`);
      
      // Test share-cli version
      const { stdout } = await execAsync(`${this.options.shareCliExecutable} --version`);
      
      this.shareCliAvailable = true;
      console.log(chalk.green(`✅ Share-CLI available: ${stdout.trim()}`));
      
    } catch (error) {
      this.shareCliAvailable = false;
      console.log(chalk.yellow('⚠️  Share-CLI not available, using built-in sharing methods'));
    }
  }
  
  async initializeSharingPlatforms() {
    // Initialize platform configurations
    this.setupPlatformConfigs();
    
    if (this.shareCliAvailable) {
      // Get available platforms from share-cli
      try {
        const platforms = await this.getShareCliPlatforms();
        platforms.forEach(platform => this.availablePlatforms.add(platform));
      } catch (error) {
        console.warn(chalk.yellow('⚠️  Could not get share-cli platforms:', error.message));
      }
    }
    
    // Add built-in platforms
    this.availablePlatforms.add('transfer.sh');
    this.availablePlatforms.add('file.io');
    this.availablePlatforms.add('0x0.st');
    this.availablePlatforms.add('curl-upload');
    
    console.log(chalk.cyan(`📋 Available sharing platforms: ${Array.from(this.availablePlatforms).join(', ')}`));
  }
  
  setupPlatformConfigs() {
    // Transfer.sh configuration
    this.platformConfigs.set('transfer.sh', {
      name: 'Transfer.sh',
      description: 'Simple file sharing with 14-day retention',
      maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
      retention: '14 days',
      features: ['anonymous', 'temporary', 'cli-friendly'],
      uploadMethod: 'curl',
      baseUrl: 'https://transfer.sh'
    });
    
    // File.io configuration
    this.platformConfigs.set('file.io', {
      name: 'File.io',
      description: 'Ephemeral file sharing with one-time downloads',
      maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
      retention: 'one-time',
      features: ['anonymous', 'ephemeral', 'secure'],
      uploadMethod: 'curl',
      baseUrl: 'https://file.io'
    });
    
    // 0x0.st configuration
    this.platformConfigs.set('0x0.st', {
      name: '0x0.st',
      description: 'No-bullshit file hosting and URL shortening',
      maxFileSize: 512 * 1024 * 1024, // 512MB
      retention: '365 days',
      features: ['anonymous', 'long-term', 'minimal'],
      uploadMethod: 'curl',
      baseUrl: 'https://0x0.st'
    });
  }
  
  setupSharingStrategies() {
    // Smart sharing strategy
    this.sharingStrategies.set('smart', {
      name: 'Smart Sharing',
      description: 'Automatically select best platform based on file characteristics',
      selectPlatform: this.selectSmartPlatform.bind(this)
    });
    
    // Size-optimized strategy
    this.sharingStrategies.set('size-optimized', {
      name: 'Size Optimized',
      description: 'Select platform based on file size limits',
      selectPlatform: this.selectSizeOptimizedPlatform.bind(this)
    });
    
    // Security-focused strategy
    this.sharingStrategies.set('secure', {
      name: 'Security Focused',
      description: 'Prioritize platforms with security features',
      selectPlatform: this.selectSecurePlatform.bind(this)
    });
    
    // Speed-optimized strategy
    this.sharingStrategies.set('fast', {
      name: 'Speed Optimized',
      description: 'Select fastest available platform',
      selectPlatform: this.selectFastPlatform.bind(this)
    });
  }
  
  async analyzePlatformCapabilities() {
    for (const platform of this.availablePlatforms) {
      const config = this.platformConfigs.get(platform);
      if (config) {
        this.platformCapabilities.set(platform, {
          ...config,
          available: true,
          tested: false,
          averageUploadTime: 0,
          successRate: 1.0
        });
      }
    }
  }
  
  setupFallbackSharing() {
    console.log(chalk.yellow('🔄 Setting up fallback sharing methods...'));
    
    // Add basic curl-based sharing
    this.availablePlatforms.add('curl-upload');
    this.availablePlatforms.add('local-server');
    
    console.log(chalk.green('✅ Fallback sharing methods configured'));
  }
  
  // === CORE SHARING FUNCTIONALITY ===
  
  async shareFile(filePath, options = {}) {
    const startTime = Date.now();
    
    const shareOptions = {
      platform: 'auto', // auto, transfer.sh, file.io, etc.
      strategy: 'smart', // smart, size-optimized, secure, fast
      expiration: null,
      password: null,
      description: null,
      generateQR: this.options.enableQRCodes,
      generateShortLink: this.options.enableShortLinks,
      enableAnalytics: this.options.enableSharingAnalytics,
      ...options
    };
    
    this.sharingStats.totalShares++;
    
    try {
      // Validate file
      await this.validateFileForSharing(filePath, shareOptions);
      
      // Select platform
      const platform = await this.selectSharingPlatform(filePath, shareOptions);
      
      // Execute sharing
      const shareResult = await this.executeSharingStrategy(filePath, platform, shareOptions);
      
      // Process sharing result
      const processedResult = await this.processShareResult(shareResult, shareOptions);
      
      // Update statistics
      const shareTime = Date.now() - startTime;
      this.updateSharingStats(platform, shareTime, true, filePath);
      
      // Add to history
      this.addToSharingHistory(filePath, platform, processedResult, shareTime);
      
      console.log(chalk.green(`✅ File shared successfully via ${platform} (${shareTime}ms)`));
      
      this.emit('file-shared', {
        filePath,
        platform,
        shareTime,
        result: processedResult
      });
      
      return processedResult;
      
    } catch (error) {
      const shareTime = Date.now() - startTime;
      this.updateSharingStats('failed', shareTime, false, filePath);
      
      console.error(chalk.red('❌ File sharing failed:'), error.message);
      
      this.emit('sharing-failed', {
        filePath,
        error: error.message,
        shareTime
      });
      
      // Try fallback sharing
      if (this.options.enableSmartSharing) {
        console.log(chalk.yellow('🔄 Attempting fallback sharing...'));
        return await this.attemptFallbackSharing(filePath, shareOptions);
      }
      
      throw error;
    }
  }
  
  async validateFileForSharing(filePath, options) {
    // Check if file exists
    try {
      await access(filePath);
    } catch (error) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Check file size
    const stats = await stat(filePath);
    if (stats.size > this.options.maxFileSize) {
      throw new Error(`File too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB (max: ${(this.options.maxFileSize / 1024 / 1024).toFixed(2)}MB)`);
    }
    
    // Check file type restrictions (if any)
    const extension = extname(filePath).toLowerCase();
    const restrictedExtensions = ['.exe', '.bat', '.cmd', '.scr'];
    if (restrictedExtensions.includes(extension)) {
      console.warn(chalk.yellow(`⚠️  Sharing potentially unsafe file type: ${extension}`));
    }
    
    return true;
  }
  
  async selectSharingPlatform(filePath, options) {
    if (options.platform !== 'auto') {
      // Use specified platform
      if (this.availablePlatforms.has(options.platform)) {
        return options.platform;
      } else {
        throw new Error(`Platform not available: ${options.platform}`);
      }
    }
    
    // Use strategy to select platform
    const strategy = this.sharingStrategies.get(options.strategy);
    if (!strategy) {
      throw new Error(`Unknown sharing strategy: ${options.strategy}`);
    }
    
    return await strategy.selectPlatform(filePath, options);
  }
  
  async executeSharingStrategy(filePath, platform, options) {
    const activeShareId = this.generateShareId();
    this.activeShares.set(activeShareId, {
      filePath,
      platform,
      startTime: Date.now(),
      status: 'uploading'
    });
    
    try {
      let shareResult;
      
      if (this.shareCliAvailable && platform !== 'curl-upload') {
        shareResult = await this.shareViaShareCli(filePath, platform, options);
      } else {
        shareResult = await this.shareViaBuiltinMethod(filePath, platform, options);
      }
      
      this.activeShares.get(activeShareId).status = 'completed';
      return shareResult;
      
    } catch (error) {
      this.activeShares.get(activeShareId).status = 'failed';
      throw error;
    } finally {
      // Clean up after delay
      setTimeout(() => {
        this.activeShares.delete(activeShareId);
      }, 30000);
    }
  }
  
  async shareViaShareCli(filePath, platform, options) {
    const shareArgs = [filePath];
    
    // Add platform-specific arguments
    if (platform !== 'auto') {
      shareArgs.push('--service', platform);
    }
    
    // Add optional arguments
    if (options.expiration) {
      shareArgs.push('--expire', options.expiration);
    }
    
    if (options.password) {
      shareArgs.push('--password', options.password);
    }
    
    return await this.executeShareCli(shareArgs);
  }
  
  async shareViaBuiltinMethod(filePath, platform, options) {
    switch (platform) {
      case 'transfer.sh':
        return await this.uploadToTransferSh(filePath, options);
        
      case 'file.io':
        return await this.uploadToFileIo(filePath, options);
        
      case '0x0.st':
        return await this.uploadTo0x0(filePath, options);
        
      case 'curl-upload':
        return await this.uploadViaCurl(filePath, options);
        
      default:
        throw new Error(`Built-in method not available for platform: ${platform}`);
    }
  }
  
  // === PLATFORM-SPECIFIC IMPLEMENTATIONS ===
  
  async uploadToTransferSh(filePath, options) {
    const fileName = basename(filePath);
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const command = `curl --upload-file "${filePath}" "https://transfer.sh/${fileName}"`;
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: this.options.shareTimeout
      });
      
      if (stderr) {
        throw new Error(`Transfer.sh error: ${stderr}`);
      }
      
      const shareUrl = stdout.trim();
      
      return {
        platform: 'transfer.sh',
        url: shareUrl,
        fileName,
        method: 'curl',
        timestamp: Date.now()
      };
      
    } catch (error) {
      throw new Error(`Transfer.sh upload failed: ${error.message}`);
    }
  }
  
  async uploadToFileIo(filePath, options) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const command = `curl -F "file=@${filePath}" "https://file.io"`;
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: this.options.shareTimeout
      });
      
      if (stderr) {
        throw new Error(`File.io error: ${stderr}`);
      }
      
      const response = JSON.parse(stdout);
      
      if (!response.success) {
        throw new Error(`File.io upload failed: ${response.message || 'Unknown error'}`);
      }
      
      return {
        platform: 'file.io',
        url: response.link,
        fileName: basename(filePath),
        key: response.key,
        expiry: response.expiry,
        method: 'curl',
        timestamp: Date.now()
      };
      
    } catch (error) {
      throw new Error(`File.io upload failed: ${error.message}`);
    }
  }
  
  async uploadTo0x0(filePath, options) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const command = `curl -F "file=@${filePath}" "https://0x0.st"`;
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: this.options.shareTimeout
      });
      
      if (stderr) {
        throw new Error(`0x0.st error: ${stderr}`);
      }
      
      const shareUrl = stdout.trim();
      
      return {
        platform: '0x0.st',
        url: shareUrl,
        fileName: basename(filePath),
        method: 'curl',
        timestamp: Date.now()
      };
      
    } catch (error) {
      throw new Error(`0x0.st upload failed: ${error.message}`);
    }
  }
  
  async uploadViaCurl(filePath, options) {
    // Generic curl upload - using transfer.sh as default
    return await this.uploadToTransferSh(filePath, options);
  }
  
  // === PLATFORM SELECTION STRATEGIES ===
  
  async selectSmartPlatform(filePath, options) {
    const stats = await stat(filePath);
    const fileSize = stats.size;
    const extension = extname(filePath).toLowerCase();
    
    // Select platform based on file characteristics
    if (fileSize > 1024 * 1024 * 1024) { // > 1GB
      return 'transfer.sh'; // Best for large files
    }
    
    if (extension === '.zip' || extension === '.tar.gz') {
      return 'file.io'; // Good for archives with one-time download
    }
    
    if (options.expiration || options.password) {
      return this.shareCliAvailable ? 'auto' : 'file.io';
    }
    
    // Default to most reliable
    return 'transfer.sh';
  }
  
  async selectSizeOptimizedPlatform(filePath, options) {
    const stats = await stat(filePath);
    const fileSize = stats.size;
    
    // Select platform with best size limits
    const platforms = Array.from(this.availablePlatforms)
      .map(platform => ({
        name: platform,
        config: this.platformConfigs.get(platform)
      }))
      .filter(p => p.config && fileSize <= p.config.maxFileSize)
      .sort((a, b) => b.config.maxFileSize - a.config.maxFileSize);
    
    return platforms.length > 0 ? platforms[0].name : 'transfer.sh';
  }
  
  async selectSecurePlatform(filePath, options) {
    // Prioritize platforms with security features
    const securePlatforms = Array.from(this.availablePlatforms)
      .map(platform => ({
        name: platform,
        config: this.platformConfigs.get(platform)
      }))
      .filter(p => p.config && p.config.features.includes('secure'))
      .sort((a, b) => b.config.features.length - a.config.features.length);
    
    return securePlatforms.length > 0 ? securePlatforms[0].name : 'file.io';
  }
  
  async selectFastPlatform(filePath, options) {
    // Select platform with best performance
    const platformPerformance = Array.from(this.platformCapabilities.entries())
      .filter(([name, caps]) => caps.available)
      .sort(([, a], [, b]) => a.averageUploadTime - b.averageUploadTime);
    
    return platformPerformance.length > 0 ? platformPerformance[0][0] : 'transfer.sh';
  }
  
  // === SHARE-CLI INTEGRATION ===
  
  async executeShareCli(args) {
    return new Promise((resolve, reject) => {
      const shareProcess = spawn(this.options.shareCliExecutable, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      shareProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      shareProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      shareProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // Try to parse as JSON, fallback to text
            const result = stdout.trim();
            const parsed = result.startsWith('{') ? JSON.parse(result) : { url: result };
            resolve(parsed);
          } catch (error) {
            resolve({ url: stdout.trim() });
          }
        } else {
          reject(new Error(`Share-CLI exited with code ${code}: ${stderr}`));
        }
      });
      
      shareProcess.on('error', (error) => {
        reject(error);
      });
      
      // Set timeout
      setTimeout(() => {
        shareProcess.kill('SIGTERM');
        reject(new Error('Share-CLI timeout'));
      }, this.options.shareTimeout);
    });
  }
  
  async getShareCliPlatforms() {
    try {
      const result = await this.executeShareCli(['--list-services']);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not get share-cli platforms:', error.message));
      return [];
    }
  }
  
  // === RESULT PROCESSING ===
  
  async processShareResult(shareResult, options) {
    const processedResult = {
      ...shareResult,
      processed: true,
      processedAt: Date.now()
    };
    
    // Generate QR code if requested
    if (options.generateQR && shareResult.url) {
      try {
        processedResult.qrCode = await this.generateQRCode(shareResult.url);
      } catch (error) {
        console.warn(chalk.yellow('⚠️  Could not generate QR code:', error.message));
      }
    }
    
    // Generate short link if requested
    if (options.generateShortLink && shareResult.url) {
      try {
        processedResult.shortLink = await this.generateShortLink(shareResult.url);
      } catch (error) {
        console.warn(chalk.yellow('⚠️  Could not generate short link:', error.message));
      }
    }
    
    // Add sharing analytics
    if (options.enableAnalytics) {
      processedResult.analytics = {
        shareId: this.generateShareId(),
        sharedAt: Date.now(),
        expiresAt: this.calculateExpiration(shareResult, options),
        trackingEnabled: true
      };
    }
    
    return processedResult;
  }
  
  async generateQRCode(url) {
    // Simplified QR code generation - would use actual QR library
    return {
      url,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`,
      qrCodeText: this.generateASCIIQR(url)
    };
  }
  
  generateASCIIQR(url) {
    // Simplified ASCII QR code - would use actual QR generation
    const qrSize = 10;
    const pattern = [];
    
    for (let y = 0; y < qrSize; y++) {
      let line = '';
      for (let x = 0; x < qrSize; x++) {
        // Simple pattern based on URL hash
        const hash = this.simpleHash(url + x + y);
        line += (hash % 2 === 0) ? '██' : '  ';
      }
      pattern.push(line);
    }
    
    return pattern.join('\n');
  }
  
  async generateShortLink(url) {
    // Simplified short link generation - would integrate with URL shortener
    const hash = this.simpleHash(url).toString(36);
    return `https://short.ly/${hash}`;
  }
  
  calculateExpiration(shareResult, options) {
    if (options.expiration) {
      return Date.now() + (parseInt(options.expiration) * 1000);
    }
    
    // Default expiration based on platform
    const platform = shareResult.platform;
    const config = this.platformConfigs.get(platform);
    
    if (config && config.retention) {
      if (config.retention === 'one-time') {
        return Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      } else if (config.retention === '14 days') {
        return Date.now() + (14 * 24 * 60 * 60 * 1000);
      } else if (config.retention === '365 days') {
        return Date.now() + (365 * 24 * 60 * 60 * 1000);
      }
    }
    
    return Date.now() + (7 * 24 * 60 * 60 * 1000); // Default 7 days
  }
  
  // === FALLBACK SHARING ===
  
  async attemptFallbackSharing(filePath, options) {
    console.log(chalk.yellow('🔄 Attempting fallback sharing methods...'));
    
    const fallbackPlatforms = ['transfer.sh', 'file.io', '0x0.st'];
    
    for (const platform of fallbackPlatforms) {
      if (this.availablePlatforms.has(platform)) {
        try {
          console.log(chalk.cyan(`Trying fallback platform: ${platform}`));
          
          const fallbackOptions = {
            ...options,
            platform
          };
          
          const result = await this.shareViaBuiltinMethod(filePath, platform, fallbackOptions);
          
          console.log(chalk.green(`✅ Fallback sharing successful via ${platform}`));
          return await this.processShareResult(result, fallbackOptions);
          
        } catch (error) {
          console.warn(chalk.yellow(`⚠️  Fallback platform ${platform} failed:`, error.message));
          continue;
        }
      }
    }
    
    throw new Error('All sharing methods failed');
  }
  
  // === UTILITY METHODS ===
  
  generateShareId() {
    return `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  updateSharingStats(platform, shareTime, success, filePath) {
    if (success) {
      this.sharingStats.successfulShares++;
      
      // Update average share time
      const totalTime = this.sharingStats.averageShareTime * (this.sharingStats.successfulShares - 1) + shareTime;
      this.sharingStats.averageShareTime = totalTime / this.sharingStats.successfulShares;
      
      // Update platform usage
      const platformCount = this.sharingStats.platformUsage.get(platform) || 0;
      this.sharingStats.platformUsage.set(platform, platformCount + 1);
      
      // Update file type statistics
      const extension = extname(filePath).toLowerCase() || 'no-extension';
      const typeCount = this.sharingStats.fileTypesShared.get(extension) || 0;
      this.sharingStats.fileTypesShared.set(extension, typeCount + 1);
      
    } else {
      this.sharingStats.failedShares++;
    }
  }
  
  addToSharingHistory(filePath, platform, result, shareTime) {
    const historyEntry = {
      filePath,
      fileName: basename(filePath),
      platform,
      result,
      shareTime,
      timestamp: Date.now()
    };
    
    this.sharingHistory.push(historyEntry);
    
    // Keep history limited
    if (this.sharingHistory.length > 100) {
      this.sharingHistory = this.sharingHistory.slice(-100);
    }
  }
  
  // === PUBLIC API ===
  
  async shareProject(projectPath, options = {}) {
    console.log(chalk.blue(`📤 Sharing project: ${basename(projectPath)}`));
    
    // Create archive if it's a directory
    if ((await stat(projectPath)).isDirectory()) {
      // This would integrate with the packaging system
      const archivePath = await this.createProjectArchive(projectPath, options);
      return await this.shareFile(archivePath, options);
    } else {
      return await this.shareFile(projectPath, options);
    }
  }
  
  async createProjectArchive(projectPath, options) {
    // Simplified archive creation - would integrate with PackageManager
    const archiveName = `${basename(projectPath)}_${Date.now()}.zip`;
    const archivePath = join('/tmp', archiveName);
    
    // This is a placeholder - would use actual archive creation
    console.log(chalk.cyan(`📦 Creating archive: ${archiveName}`));
    
    return archivePath;
  }
  
  getSharingStats() {
    return {
      ...this.sharingStats,
      shareCliAvailable: this.shareCliAvailable,
      availablePlatforms: Array.from(this.availablePlatforms),
      activeShares: this.activeShares.size,
      successRate: this.sharingStats.totalShares > 0 
        ? this.sharingStats.successfulShares / this.sharingStats.totalShares 
        : 0
    };
  }
  
  getSharingHistory(limit = 10) {
    return this.sharingHistory.slice(-limit);
  }
  
  getActivePlatforms() {
    return Array.from(this.availablePlatforms).map(platform => ({
      name: platform,
      config: this.platformConfigs.get(platform),
      capabilities: this.platformCapabilities.get(platform)
    }));
  }
  
  printSharingReport() {
    const stats = this.getSharingStats();
    
    console.log(chalk.blue('\n📤 Share-CLI Integration Report'));
    console.log(chalk.blue('================================='));
    
    console.log(chalk.cyan('\n📊 Sharing Statistics:'));
    console.log(`Total Shares: ${stats.totalShares}`);
    console.log(`Successful: ${stats.successfulShares}`);
    console.log(`Failed: ${stats.failedShares}`);
    console.log(`Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
    console.log(`Average Share Time: ${stats.averageShareTime.toFixed(2)}ms`);
    
    console.log(chalk.cyan('\n🌐 Platform Status:'));
    console.log(`Share-CLI Available: ${stats.shareCliAvailable ? 'Yes' : 'No'}`);
    console.log(`Available Platforms: ${stats.availablePlatforms.length}`);
    console.log(`Active Shares: ${stats.activeShares}`);
    
    if (stats.platformUsage.size > 0) {
      console.log(chalk.cyan('\n📈 Platform Usage:'));
      Array.from(stats.platformUsage.entries())
        .sort(([, a], [, b]) => b - a)
        .forEach(([platform, count]) => {
          console.log(`  ${platform}: ${count} shares`);
        });
    }
    
    if (stats.fileTypesShared.size > 0) {
      console.log(chalk.cyan('\n📁 File Types Shared:'));
      Array.from(stats.fileTypesShared.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([type, count]) => {
          console.log(`  ${type}: ${count} files`);
        });
    }
    
    if (this.sharingHistory.length > 0) {
      console.log(chalk.cyan('\n📜 Recent Sharing History:'));
      this.sharingHistory.slice(-5).forEach(entry => {
        const timeAgo = Math.round((Date.now() - entry.timestamp) / 1000);
        console.log(`  ${entry.fileName} via ${entry.platform} (${timeAgo}s ago)`);
      });
    }
    
    console.log(chalk.green('\n✅ Sharing report complete'));
  }
  
  // === CLEANUP ===
  
  async dispose() {
    console.log(chalk.yellow('🧹 Disposing Share-CLI Integration...'));
    
    // Cancel active shares
    for (const [shareId, share] of this.activeShares) {
      console.log(chalk.yellow(`Cancelling active share: ${shareId}`));
    }
    
    this.activeShares.clear();
    this.sharingHistory = [];
    this.availablePlatforms.clear();
    this.platformConfigs.clear();
    this.removeAllListeners();
    
    console.log(chalk.green('✅ Share-CLI integration disposed'));
  }
}

export default ShareCliIntegration;