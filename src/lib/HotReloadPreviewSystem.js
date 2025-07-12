/**
 * Hot-Reload Preview System
 * 
 * Advanced hot-reload system with automatic regeneration on content changes,
 * intelligent file watching, dependency tracking, and instant preview updates.
 */

import { EventEmitter } from 'events';
import { watch, stat } from 'fs/promises';
import { existsSync, statSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import chalk from 'chalk';

export class HotReloadPreviewSystem extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableHotReload: true,
      enableInstantPreview: true,
      enableDependencyTracking: true,
      enableIntelligentCaching: true,
      enableBatchUpdates: true,
      watchInterval: 100, // 100ms polling interval
      debounceDelay: 300, // 300ms debounce for rapid changes
      previewPort: 3000,
      enableLiveReload: true,
      enableDiffGeneration: true,
      enablePreviewOptimization: true,
      ...options
    };
    
    // File watching and change detection
    this.watchers = new Map();
    this.watchedFiles = new Set();
    this.fileChecksums = new Map();
    this.dependencyGraph = new Map();
    
    // Hot reload state
    this.isWatching = false;
    this.previewServer = null;
    this.activeConnections = new Set();
    this.reloadQueue = [];
    this.batchTimer = null;
    
    // Performance tracking
    this.reloadStats = {
      totalReloads: 0,
      successfulReloads: 0,
      failedReloads: 0,
      averageReloadTime: 0,
      lastReloadTime: null,
      filesWatched: 0,
      dependenciesTracked: 0
    };
    
    // Preview state management
    this.previewCache = new Map();
    this.previewHistory = [];
    this.currentPreview = null;
    
    // Change detection
    this.changeDetector = {
      lastScan: Date.now(),
      changedFiles: new Set(),
      addedFiles: new Set(),
      removedFiles: new Set(),
      renamedFiles: new Map()
    };
    
    this.initialize();
  }
  
  // === INITIALIZATION ===
  
  initialize() {
    console.log(chalk.blue('🔥 Initializing Hot-Reload Preview System...'));
    
    // Set up change detection strategies
    this.setupChangeDetection();
    
    // Set up preview optimization
    this.setupPreviewOptimization();
    
    // Set up dependency tracking
    this.setupDependencyTracking();
    
    console.log(chalk.green('✅ Hot-reload preview system initialized'));
    this.emit('hot-reload-ready');
  }
  
  // === FILE WATCHING ===
  
  async startWatching(projectPath, options = {}) {
    if (this.isWatching) {
      console.log(chalk.yellow('⚠️  Already watching for changes'));
      return;
    }
    
    const watchConfig = {
      recursive: true,
      includePatterns: ['**/*'],
      excludePatterns: [
        'node_modules/**',
        '.git/**',
        '**/.DS_Store',
        '**/Thumbs.db',
        '**/*.tmp',
        '**/*.temp'
      ],
      ...options
    };
    
    console.log(chalk.blue(`👁️  Starting file watching for ${projectPath}`));
    
    try {
      // Set up main project watcher
      await this.setupProjectWatcher(projectPath, watchConfig);
      
      // Scan for initial files
      await this.performInitialScan(projectPath, watchConfig);
      
      // Start dependency tracking
      if (this.options.enableDependencyTracking) {
        await this.buildDependencyGraph(projectPath);
      }
      
      this.isWatching = true;
      this.reloadStats.filesWatched = this.watchedFiles.size;
      
      console.log(chalk.green(`✅ Watching ${this.watchedFiles.size} files for changes`));
      this.emit('watching-started', {
        projectPath,
        filesWatched: this.watchedFiles.size,
        dependenciesTracked: this.dependencyGraph.size
      });
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to start file watching:'), error.message);
      throw error;
    }
  }
  
  async setupProjectWatcher(projectPath, config) {
    const watcher = watch(projectPath, { recursive: true });
    this.watchers.set(projectPath, watcher);
    
    // Handle file changes
    for await (const event of watcher) {
      if (this.shouldIgnoreFile(event.filename, config.excludePatterns)) {
        continue;
      }
      
      await this.handleFileChange(event, projectPath);
    }
  }
  
  async performInitialScan(projectPath, config) {
    console.log(chalk.cyan('🔍 Performing initial file scan...'));
    
    const scanResults = await this.scanDirectory(projectPath, config);
    
    // Store initial checksums
    for (const filePath of scanResults.files) {
      const checksum = await this.calculateFileChecksum(filePath);
      this.fileChecksums.set(filePath, checksum);
      this.watchedFiles.add(filePath);
    }
    
    console.log(chalk.green(`📋 Initial scan complete: ${scanResults.files.length} files`));
  }
  
  async scanDirectory(directoryPath, config, scannedFiles = []) {
    try {
      const items = await import('fs/promises').then(fs => fs.readdir(directoryPath, { withFileTypes: true }));
      
      for (const item of items) {
        const fullPath = join(directoryPath, item.name);
        
        if (item.isDirectory()) {
          if (!this.shouldIgnoreFile(item.name, config.excludePatterns)) {
            await this.scanDirectory(fullPath, config, scannedFiles);
          }
        } else {
          if (!this.shouldIgnoreFile(item.name, config.excludePatterns)) {
            scannedFiles.push(fullPath);
          }
        }
      }
      
      return { files: scannedFiles };
      
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Could not scan directory ${directoryPath}: ${error.message}`));
      return { files: scannedFiles };
    }
  }
  
  // === CHANGE DETECTION ===
  
  setupChangeDetection() {
    // Set up intelligent change detection with checksums
    this.changeDetector.strategies = {
      checksum: this.detectChecksumChanges.bind(this),
      timestamp: this.detectTimestampChanges.bind(this),
      size: this.detectSizeChanges.bind(this),
      content: this.detectContentChanges.bind(this)
    };
  }
  
  async handleFileChange(event, projectPath) {
    const filePath = join(projectPath, event.filename);
    const eventType = event.eventType;
    
    // Debounce rapid changes
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    
    // Add to reload queue
    this.reloadQueue.push({
      filePath,
      eventType,
      timestamp: Date.now()
    });
    
    // Set batch timer
    this.batchTimer = setTimeout(() => {
      this.processBatchedChanges();
    }, this.options.debounceDelay);
  }
  
  async processBatchedChanges() {
    if (this.reloadQueue.length === 0) return;
    
    console.log(chalk.blue(`🔄 Processing ${this.reloadQueue.length} file changes...`));
    
    const startTime = Date.now();
    const changes = [...this.reloadQueue];
    this.reloadQueue = [];
    
    try {
      // Group changes by type and file
      const groupedChanges = this.groupChanges(changes);
      
      // Analyze change impact
      const changeAnalysis = await this.analyzeChangeImpact(groupedChanges);
      
      // Generate preview updates
      const previewUpdates = await this.generatePreviewUpdates(changeAnalysis);
      
      // Apply hot reload
      await this.applyHotReload(previewUpdates);
      
      // Update statistics
      const reloadTime = Date.now() - startTime;
      this.updateReloadStats(true, reloadTime);
      
      console.log(chalk.green(`✅ Hot reload completed in ${reloadTime}ms`));
      
      this.emit('hot-reload-complete', {
        changes: changes.length,
        reloadTime,
        previewUpdates
      });
      
    } catch (error) {
      console.error(chalk.red('❌ Hot reload failed:'), error.message);
      this.updateReloadStats(false);
      
      this.emit('hot-reload-failed', {
        changes: changes.length,
        error: error.message
      });
    }
  }
  
  groupChanges(changes) {
    const grouped = {
      modified: new Set(),
      added: new Set(),
      removed: new Set(),
      renamed: new Map()
    };
    
    changes.forEach(change => {
      switch (change.eventType) {
        case 'change':
          grouped.modified.add(change.filePath);
          break;
        case 'rename':
          // Handle renames (simplified)
          if (existsSync(change.filePath)) {
            grouped.added.add(change.filePath);
          } else {
            grouped.removed.add(change.filePath);
          }
          break;
        default:
          grouped.modified.add(change.filePath);
      }
    });
    
    return grouped;
  }
  
  async analyzeChangeImpact(groupedChanges) {
    const impact = {
      affectedFiles: new Set(),
      dependentFiles: new Set(),
      requiresFullReload: false,
      requiresPartialReload: false,
      canHotReload: true,
      changeTypes: new Set()
    };
    
    // Analyze modified files
    for (const filePath of groupedChanges.modified) {
      impact.affectedFiles.add(filePath);
      
      // Check dependencies
      const dependents = this.dependencyGraph.get(filePath) || [];
      dependents.forEach(dep => impact.dependentFiles.add(dep));
      
      // Determine change type
      const changeType = await this.determineChangeType(filePath);
      impact.changeTypes.add(changeType);
      
      // Check if hot reload is possible
      if (!this.canHotReload(filePath, changeType)) {
        impact.canHotReload = false;
        impact.requiresFullReload = true;
      }
    }
    
    // Analyze added/removed files
    if (groupedChanges.added.size > 0 || groupedChanges.removed.size > 0) {
      impact.requiresPartialReload = true;
    }
    
    return impact;
  }
  
  async determineChangeType(filePath) {
    const extension = extname(filePath).toLowerCase();
    const fileName = basename(filePath);
    
    // Configuration files
    if (fileName.includes('config') || fileName.includes('settings')) {
      return 'configuration';
    }
    
    // Style files
    if (['.css', '.scss', '.sass', '.less'].includes(extension)) {
      return 'styles';
    }
    
    // Layout files
    if (fileName.includes('layout') || extension === '.json') {
      return 'layout';
    }
    
    // Asset files
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(extension)) {
      return 'assets';
    }
    
    // Content files
    if (['.md', '.txt', '.html', '.htm'].includes(extension)) {
      return 'content';
    }
    
    return 'unknown';
  }
  
  canHotReload(filePath, changeType) {
    // Some change types can be hot reloaded, others require full reload
    const hotReloadableTypes = ['styles', 'assets', 'content'];
    return hotReloadableTypes.includes(changeType);
  }
  
  // === PREVIEW GENERATION ===
  
  async generatePreviewUpdates(changeAnalysis) {
    const updates = {
      type: changeAnalysis.canHotReload ? 'hot-reload' : 'full-reload',
      affectedFiles: Array.from(changeAnalysis.affectedFiles),
      dependentFiles: Array.from(changeAnalysis.dependentFiles),
      previewData: null,
      timestamp: Date.now()
    };
    
    try {
      if (changeAnalysis.canHotReload) {
        // Generate incremental preview updates
        updates.previewData = await this.generateIncrementalPreview(changeAnalysis);
      } else {
        // Generate full preview
        updates.previewData = await this.generateFullPreview(changeAnalysis);
      }
      
      return updates;
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to generate preview updates:'), error.message);
      throw error;
    }
  }
  
  async generateIncrementalPreview(changeAnalysis) {
    console.log(chalk.cyan('⚡ Generating incremental preview updates...'));
    
    const incrementalData = {
      changes: [],
      patches: [],
      optimized: true
    };
    
    // Process each affected file
    for (const filePath of changeAnalysis.affectedFiles) {
      const changeType = await this.determineChangeType(filePath);
      
      switch (changeType) {
        case 'styles':
          incrementalData.changes.push(await this.generateStyleUpdate(filePath));
          break;
          
        case 'assets':
          incrementalData.changes.push(await this.generateAssetUpdate(filePath));
          break;
          
        case 'content':
          incrementalData.changes.push(await this.generateContentUpdate(filePath));
          break;
          
        default:
          console.log(chalk.yellow(`⚠️  Unknown change type for incremental update: ${changeType}`));
      }
    }
    
    return incrementalData;
  }
  
  async generateFullPreview(changeAnalysis) {
    console.log(chalk.blue('🔄 Generating full preview...'));
    
    // This would integrate with the existing preview generation system
    const fullPreview = {
      type: 'full-preview',
      html: await this.generateHTMLPreview(changeAnalysis),
      styles: await this.generateStylesPreview(changeAnalysis),
      scripts: await this.generateScriptsPreview(changeAnalysis),
      assets: await this.generateAssetsPreview(changeAnalysis),
      layout: await this.generateLayoutPreview(changeAnalysis)
    };
    
    return fullPreview;
  }
  
  async generateStyleUpdate(filePath) {
    return {
      type: 'style-update',
      filePath,
      content: `/* Hot-reloaded: ${filePath} */`,
      timestamp: Date.now()
    };
  }
  
  async generateAssetUpdate(filePath) {
    return {
      type: 'asset-update',
      filePath,
      url: `/assets/${basename(filePath)}`,
      timestamp: Date.now()
    };
  }
  
  async generateContentUpdate(filePath) {
    return {
      type: 'content-update',
      filePath,
      content: 'Updated content placeholder',
      timestamp: Date.now()
    };
  }
  
  // === DEPENDENCY TRACKING ===
  
  setupDependencyTracking() {
    this.dependencyTracker = {
      scanForImports: this.scanForImports.bind(this),
      scanForAssetReferences: this.scanForAssetReferences.bind(this),
      scanForConfigReferences: this.scanForConfigReferences.bind(this)
    };
  }
  
  async buildDependencyGraph(projectPath) {
    console.log(chalk.blue('🕸️  Building dependency graph...'));
    
    let dependenciesCount = 0;
    
    for (const filePath of this.watchedFiles) {
      const dependencies = await this.analyzeDependencies(filePath);
      
      if (dependencies.length > 0) {
        this.dependencyGraph.set(filePath, dependencies);
        dependenciesCount += dependencies.length;
      }
    }
    
    this.reloadStats.dependenciesTracked = dependenciesCount;
    console.log(chalk.green(`✅ Dependency graph built: ${dependenciesCount} dependencies`));
  }
  
  async analyzeDependencies(filePath) {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf8');
      const dependencies = [];
      
      // Scan for different types of dependencies
      dependencies.push(...await this.scanForImports(content, filePath));
      dependencies.push(...await this.scanForAssetReferences(content, filePath));
      dependencies.push(...await this.scanForConfigReferences(content, filePath));
      
      return [...new Set(dependencies)]; // Remove duplicates
      
    } catch (error) {
      // File might not be readable or might be binary
      return [];
    }
  }
  
  async scanForImports(content, filePath) {
    const imports = [];
    
    // JavaScript/TypeScript imports
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(this.resolveImportPath(match[1], filePath));
    }
    
    // CSS imports
    const cssImportRegex = /@import\s+['"`]([^'"`]+)['"`]/g;
    while ((match = cssImportRegex.exec(content)) !== null) {
      imports.push(this.resolveImportPath(match[1], filePath));
    }
    
    return imports.filter(Boolean);
  }
  
  async scanForAssetReferences(content, filePath) {
    const assets = [];
    
    // Image references
    const imageRegex = /(?:src|href)\s*=\s*['"`]([^'"`]+\.(png|jpg|jpeg|gif|svg|webp))['"`]/gi;
    let match;
    
    while ((match = imageRegex.exec(content)) !== null) {
      assets.push(this.resolveAssetPath(match[1], filePath));
    }
    
    // CSS background images
    const bgImageRegex = /background-image:\s*url\(['"`]?([^'"`\)]+)['"`]?\)/gi;
    while ((match = bgImageRegex.exec(content)) !== null) {
      assets.push(this.resolveAssetPath(match[1], filePath));
    }
    
    return assets.filter(Boolean);
  }
  
  async scanForConfigReferences(content, filePath) {
    const configs = [];
    
    // Configuration file references
    const configRegex = /['"`]([^'"`]*config[^'"`]*)['"`]/gi;
    let match;
    
    while ((match = configRegex.exec(content)) !== null) {
      const configPath = this.resolveConfigPath(match[1], filePath);
      if (configPath) {
        configs.push(configPath);
      }
    }
    
    return configs;
  }
  
  resolveImportPath(importPath, fromFile) {
    // Simplified path resolution
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      return join(dirname(fromFile), importPath);
    }
    return null; // External module
  }
  
  resolveAssetPath(assetPath, fromFile) {
    if (assetPath.startsWith('./') || assetPath.startsWith('../')) {
      return join(dirname(fromFile), assetPath);
    }
    return assetPath; // Absolute or external
  }
  
  resolveConfigPath(configPath, fromFile) {
    if (configPath.includes('config') && (configPath.endsWith('.json') || configPath.endsWith('.js'))) {
      return join(dirname(fromFile), configPath);
    }
    return null;
  }
  
  // === HOT RELOAD APPLICATION ===
  
  async applyHotReload(previewUpdates) {
    console.log(chalk.magenta(`🔥 Applying ${previewUpdates.type}...`));
    
    if (previewUpdates.type === 'hot-reload') {
      await this.applyIncrementalUpdates(previewUpdates.previewData);
    } else {
      await this.applyFullReload(previewUpdates.previewData);
    }
    
    // Update current preview
    this.currentPreview = previewUpdates;
    
    // Add to preview history
    this.previewHistory.push({
      timestamp: Date.now(),
      type: previewUpdates.type,
      changes: previewUpdates.affectedFiles.length
    });
    
    // Keep history limited
    if (this.previewHistory.length > 50) {
      this.previewHistory = this.previewHistory.slice(-50);
    }
  }
  
  async applyIncrementalUpdates(previewData) {
    for (const change of previewData.changes) {
      switch (change.type) {
        case 'style-update':
          await this.updateStyles(change);
          break;
          
        case 'asset-update':
          await this.updateAsset(change);
          break;
          
        case 'content-update':
          await this.updateContent(change);
          break;
          
        default:
          console.log(chalk.yellow(`⚠️  Unknown change type: ${change.type}`));
      }
    }
  }
  
  async applyFullReload(previewData) {
    // Cache the new preview
    this.previewCache.set('current', previewData);
    
    // Notify connected clients
    this.notifyClients('full-reload', previewData);
  }
  
  // === PREVIEW OPTIMIZATION ===
  
  setupPreviewOptimization() {
    this.optimizationStrategies = {
      'incremental-updates': this.enableIncrementalUpdates.bind(this),
      'lazy-loading': this.enableLazyLoading.bind(this),
      'preview-caching': this.enablePreviewCaching.bind(this),
      'diff-generation': this.enableDiffGeneration.bind(this)
    };
  }
  
  enableIncrementalUpdates() {
    // Strategy for faster updates by only changing what's necessary
    return true;
  }
  
  enableLazyLoading() {
    // Strategy for loading preview components on demand
    return true;
  }
  
  enablePreviewCaching() {
    // Strategy for caching preview components
    return true;
  }
  
  enableDiffGeneration() {
    // Strategy for generating diffs between preview versions
    return true;
  }
  
  // === UTILITY METHODS ===
  
  shouldIgnoreFile(filename, excludePatterns) {
    return excludePatterns.some(pattern => {
      // Simple pattern matching - could be enhanced with glob patterns
      if (pattern.includes('**')) {
        const regex = new RegExp(pattern.replace('**', '.*').replace('*', '[^/]*'));
        return regex.test(filename);
      }
      return filename.includes(pattern.replace('*', ''));
    });
  }
  
  async calculateFileChecksum(filePath) {
    try {
      const fs = await import('fs/promises');
      const crypto = await import('crypto');
      
      const content = await fs.readFile(filePath);
      return crypto.createHash('md5').update(content).digest('hex');
      
    } catch (error) {
      return null;
    }
  }
  
  async detectChecksumChanges(filePath) {
    const currentChecksum = await this.calculateFileChecksum(filePath);
    const previousChecksum = this.fileChecksums.get(filePath);
    
    if (currentChecksum && currentChecksum !== previousChecksum) {
      this.fileChecksums.set(filePath, currentChecksum);
      return true;
    }
    
    return false;
  }
  
  async detectTimestampChanges(filePath) {
    try {
      const stats = await stat(filePath);
      const lastModified = stats.mtime.getTime();
      const previousTime = this.changeDetector.lastScan;
      
      return lastModified > previousTime;
    } catch (error) {
      return false;
    }
  }
  
  async detectSizeChanges(filePath) {
    try {
      const stats = await stat(filePath);
      const currentSize = stats.size;
      const previousSize = this.fileSizes?.get(filePath);
      
      if (previousSize !== undefined && currentSize !== previousSize) {
        this.fileSizes?.set(filePath, currentSize);
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }
  
  async detectContentChanges(filePath) {
    // For now, use checksum detection
    return this.detectChecksumChanges(filePath);
  }
  
  updateReloadStats(success, reloadTime = 0) {
    this.reloadStats.totalReloads++;
    
    if (success) {
      this.reloadStats.successfulReloads++;
      
      if (reloadTime > 0) {
        const totalTime = this.reloadStats.averageReloadTime * (this.reloadStats.successfulReloads - 1) + reloadTime;
        this.reloadStats.averageReloadTime = totalTime / this.reloadStats.successfulReloads;
      }
    } else {
      this.reloadStats.failedReloads++;
    }
    
    this.reloadStats.lastReloadTime = Date.now();
  }
  
  notifyClients(eventType, data) {
    // Simplified client notification - would integrate with actual WebSocket server
    this.emit('client-notification', { eventType, data });
  }
  
  async updateStyles(change) {
    console.log(chalk.cyan(`🎨 Updating styles: ${basename(change.filePath)}`));
    this.notifyClients('style-update', change);
  }
  
  async updateAsset(change) {
    console.log(chalk.blue(`🖼️  Updating asset: ${basename(change.filePath)}`));
    this.notifyClients('asset-update', change);
  }
  
  async updateContent(change) {
    console.log(chalk.green(`📝 Updating content: ${basename(change.filePath)}`));
    this.notifyClients('content-update', change);
  }
  
  // === PREVIEW GENERATORS (PLACEHOLDERS) ===
  
  async generateHTMLPreview(changeAnalysis) {
    return '<html><body>Hot-reloaded preview</body></html>';
  }
  
  async generateStylesPreview(changeAnalysis) {
    return '/* Hot-reloaded styles */';
  }
  
  async generateScriptsPreview(changeAnalysis) {
    return '// Hot-reloaded scripts';
  }
  
  async generateAssetsPreview(changeAnalysis) {
    return { assets: [] };
  }
  
  async generateLayoutPreview(changeAnalysis) {
    return { layout: 'hot-reloaded' };
  }
  
  // === PUBLIC API ===
  
  async stopWatching() {
    if (!this.isWatching) return;
    
    console.log(chalk.yellow('⏹️  Stopping file watching...'));
    
    // Close all watchers
    for (const [path, watcher] of this.watchers) {
      try {
        await watcher.return();
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Error closing watcher for ${path}:`, error.message));
      }
    }
    
    this.watchers.clear();
    this.watchedFiles.clear();
    this.isWatching = false;
    
    console.log(chalk.green('✅ File watching stopped'));
    this.emit('watching-stopped');
  }
  
  getReloadStats() {
    return {
      ...this.reloadStats,
      isWatching: this.isWatching,
      watchedFiles: this.watchedFiles.size,
      dependenciesTracked: this.dependencyGraph.size,
      successRate: this.reloadStats.totalReloads > 0 
        ? this.reloadStats.successfulReloads / this.reloadStats.totalReloads 
        : 0
    };
  }
  
  getPreviewHistory() {
    return this.previewHistory.slice(-10); // Last 10 previews
  }
  
  getCurrentPreview() {
    return this.currentPreview;
  }
  
  printReloadReport() {
    const stats = this.getReloadStats();
    
    console.log(chalk.blue('\n🔥 Hot-Reload Preview System Report'));
    console.log(chalk.blue('====================================='));
    
    console.log(chalk.cyan('\n📊 Reload Statistics:'));
    console.log(`Total Reloads: ${stats.totalReloads}`);
    console.log(`Successful: ${stats.successfulReloads}`);
    console.log(`Failed: ${stats.failedReloads}`);
    console.log(`Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
    console.log(`Average Reload Time: ${stats.averageReloadTime.toFixed(2)}ms`);
    
    console.log(chalk.cyan('\n👁️  Watching Statistics:'));
    console.log(`Files Watched: ${stats.watchedFiles}`);
    console.log(`Dependencies Tracked: ${stats.dependenciesTracked}`);
    console.log(`Currently Watching: ${stats.isWatching ? 'Yes' : 'No'}`);
    
    if (this.previewHistory.length > 0) {
      console.log(chalk.cyan('\n📜 Recent Preview History:'));
      this.previewHistory.slice(-5).forEach(preview => {
        const timeAgo = Math.round((Date.now() - preview.timestamp) / 1000);
        console.log(`  ${preview.type}: ${preview.changes} changes (${timeAgo}s ago)`);
      });
    }
    
    console.log(chalk.green('\n✅ Hot-reload report complete'));
  }
  
  // === CLEANUP ===
  
  async dispose() {
    console.log(chalk.yellow('🧹 Disposing Hot-Reload Preview System...'));
    
    await this.stopWatching();
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    this.previewCache.clear();
    this.fileChecksums.clear();
    this.dependencyGraph.clear();
    this.removeAllListeners();
    
    console.log(chalk.green('✅ Hot-reload system disposed'));
  }
}

export default HotReloadPreviewSystem;