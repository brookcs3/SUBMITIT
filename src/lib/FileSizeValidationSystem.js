/**
 * File Size and Dimension Validation System
 * 
 * Advanced file validation with intelligent size analysis, dimension detection,
 * automatic optimization suggestions, and comprehensive file health reporting.
 */

import { EventEmitter } from 'events';
import { stat, access } from 'fs/promises';
import { extname, basename, dirname } from 'path';
import { spawn, exec } from 'child_process';
import chalk from 'chalk';

export class FileSizeValidationSystem extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableSizeValidation: true,
      enableDimensionValidation: true,
      enableOptimizationSuggestions: true,
      enableAutomaticOptimization: false,
      enableHealthReporting: true,
      enableBatchValidation: true,
      enableProgressiveValidation: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB default
      maxImageDimensions: { width: 8192, height: 8192 },
      maxVideoDuration: 3600, // 1 hour in seconds
      compressionThresholds: {
        images: 1024 * 1024, // 1MB
        videos: 50 * 1024 * 1024, // 50MB
        archives: 10 * 1024 * 1024 // 10MB
      },
      ...options
    };
    
    // Validation state
    this.isInitialized = false;
    this.validationHistory = [];
    this.optimizationQueue = new Map();
    this.validationCache = new Map();
    
    // File type configurations
    this.fileTypeValidators = new Map();
    this.optimizationStrategies = new Map();
    this.dimensionReaders = new Map();
    
    // Performance tracking
    this.validationStats = {
      totalValidations: 0,
      passedValidations: 0,
      failedValidations: 0,
      optimizationsSuggested: 0,
      optimizationsApplied: 0,
      averageValidationTime: 0,
      sizeSavings: 0
    };
    
    // Health metrics
    this.healthMetrics = {
      oversizedFiles: new Map(),
      compressionOpportunities: new Map(),
      dimensionIssues: new Map(),
      formatRecommendations: new Map()
    };
    
    this.initialize();
  }
  
  // === INITIALIZATION ===
  
  initialize() {
    console.log(chalk.blue('📏 Initializing File Size & Dimension Validation System...'));
    
    // Set up file type validators
    this.setupFileTypeValidators();
    
    // Set up optimization strategies
    this.setupOptimizationStrategies();
    
    // Set up dimension readers
    this.setupDimensionReaders();
    
    // Set up validation rules
    this.setupValidationRules();
    
    this.isInitialized = true;
    console.log(chalk.green('✅ File size and dimension validation system initialized'));
    this.emit('validation-system-ready');
  }
  
  setupFileTypeValidators() {
    // Image validation
    this.fileTypeValidators.set('image', {
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff'],
      maxSize: 20 * 1024 * 1024, // 20MB
      validate: this.validateImageFile.bind(this),
      getDimensions: this.getImageDimensions.bind(this),
      suggestOptimizations: this.suggestImageOptimizations.bind(this)
    });
    
    // Video validation
    this.fileTypeValidators.set('video', {
      extensions: ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm'],
      maxSize: 500 * 1024 * 1024, // 500MB
      validate: this.validateVideoFile.bind(this),
      getDimensions: this.getVideoDimensions.bind(this),
      suggestOptimizations: this.suggestVideoOptimizations.bind(this)
    });
    
    // Audio validation
    this.fileTypeValidators.set('audio', {
      extensions: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'],
      maxSize: 50 * 1024 * 1024, // 50MB
      validate: this.validateAudioFile.bind(this),
      getDimensions: this.getAudioDimensions.bind(this),
      suggestOptimizations: this.suggestAudioOptimizations.bind(this)
    });
    
    // Document validation
    this.fileTypeValidators.set('document', {
      extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
      maxSize: 25 * 1024 * 1024, // 25MB
      validate: this.validateDocumentFile.bind(this),
      getDimensions: this.getDocumentDimensions.bind(this),
      suggestOptimizations: this.suggestDocumentOptimizations.bind(this)
    });
    
    // Archive validation
    this.fileTypeValidators.set('archive', {
      extensions: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
      maxSize: 100 * 1024 * 1024, // 100MB
      validate: this.validateArchiveFile.bind(this),
      getDimensions: this.getArchiveDimensions.bind(this),
      suggestOptimizations: this.suggestArchiveOptimizations.bind(this)
    });
    
    // Code validation
    this.fileTypeValidators.set('code', {
      extensions: ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.html', '.css'],
      maxSize: 5 * 1024 * 1024, // 5MB
      validate: this.validateCodeFile.bind(this),
      getDimensions: this.getCodeDimensions.bind(this),
      suggestOptimizations: this.suggestCodeOptimizations.bind(this)
    });
  }
  
  setupOptimizationStrategies() {
    // Image optimization strategies
    this.optimizationStrategies.set('image-compression', {
      name: 'Image Compression',
      description: 'Reduce image file sizes through lossless/lossy compression',
      applicableTypes: ['image'],
      estimatedSaving: 0.3, // 30% average
      tools: ['imagemagick', 'optipng', 'jpegoptim'],
      apply: this.applyImageCompression.bind(this)
    });
    
    // Video optimization strategies
    this.optimizationStrategies.set('video-compression', {
      name: 'Video Compression',
      description: 'Optimize video files with efficient codecs and bitrates',
      applicableTypes: ['video'],
      estimatedSaving: 0.5, // 50% average
      tools: ['ffmpeg'],
      apply: this.applyVideoCompression.bind(this)
    });
    
    // Format conversion strategies
    this.optimizationStrategies.set('format-conversion', {
      name: 'Format Conversion',
      description: 'Convert files to more efficient formats',
      applicableTypes: ['image', 'video', 'audio'],
      estimatedSaving: 0.4, // 40% average
      tools: ['imagemagick', 'ffmpeg'],
      apply: this.applyFormatConversion.bind(this)
    });
    
    // Dimension optimization
    this.optimizationStrategies.set('dimension-optimization', {
      name: 'Dimension Optimization',
      description: 'Resize images and videos to optimal dimensions',
      applicableTypes: ['image', 'video'],
      estimatedSaving: 0.6, // 60% average for oversized content
      tools: ['imagemagick', 'ffmpeg'],
      apply: this.applyDimensionOptimization.bind(this)
    });
  }
  
  setupDimensionReaders() {
    // Image dimension readers
    this.dimensionReaders.set('image', {
      command: 'identify',
      args: ['-format', '%wx%h', '{file}'],
      parser: this.parseImageDimensions.bind(this)
    });
    
    // Video dimension readers
    this.dimensionReaders.set('video', {
      command: 'ffprobe',
      args: ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', '{file}'],
      parser: this.parseVideoDimensions.bind(this)
    });
  }
  
  setupValidationRules() {
    this.validationRules = {
      // Size-based rules
      'oversized-file': {
        check: (file, stats) => stats.size > this.options.maxFileSize,
        severity: 'high',
        message: 'File exceeds maximum allowed size',
        suggestions: ['compress-file', 'split-file', 'format-conversion']
      },
      
      // Dimension-based rules
      'oversized-dimensions': {
        check: (file, stats, dimensions) => {
          if (!dimensions) return false;
          return dimensions.width > this.options.maxImageDimensions.width ||
                 dimensions.height > this.options.maxImageDimensions.height;
        },
        severity: 'medium',
        message: 'Image dimensions exceed recommended limits',
        suggestions: ['resize-image', 'dimension-optimization']
      },
      
      // Format efficiency rules
      'inefficient-format': {
        check: (file, stats) => {
          const ext = extname(file).toLowerCase();
          const inefficientFormats = ['.bmp', '.tiff', '.wav'];
          return inefficientFormats.includes(ext);
        },
        severity: 'low',
        message: 'File format is not storage-efficient',
        suggestions: ['format-conversion']
      },
      
      // Compression opportunity rules
      'compression-opportunity': {
        check: (file, stats) => {
          const ext = extname(file).toLowerCase();
          const threshold = this.options.compressionThresholds.images;
          return ['.jpg', '.png'].includes(ext) && stats.size > threshold;
        },
        severity: 'low',
        message: 'File could benefit from compression',
        suggestions: ['image-compression']
      }
    };
  }
  
  // === CORE VALIDATION METHODS ===
  
  async validateFile(filePath, options = {}) {
    const startTime = Date.now();
    
    const validationOptions = {
      enableOptimizationSuggestions: this.options.enableOptimizationSuggestions,
      enableDimensionAnalysis: this.options.enableDimensionValidation,
      enableHealthCheck: this.options.enableHealthReporting,
      cacheKey: null,
      ...options
    };
    
    this.validationStats.totalValidations++;
    
    try {
      // Check cache first
      if (validationOptions.cacheKey && this.validationCache.has(validationOptions.cacheKey)) {
        console.log(chalk.green('📦 Using cached validation result'));
        return this.validationCache.get(validationOptions.cacheKey);
      }
      
      // Validate file existence
      await access(filePath);
      
      // Get file statistics
      const stats = await stat(filePath);
      
      // Determine file type
      const fileType = this.determineFileType(filePath);
      
      // Get file dimensions if applicable
      const dimensions = await this.getFileDimensions(filePath, fileType);
      
      // Run validation checks
      const validationResult = await this.runValidationChecks(filePath, stats, dimensions, fileType);
      
      // Generate optimization suggestions
      const optimizations = await this.generateOptimizationSuggestions(filePath, stats, dimensions, fileType, validationResult);
      
      // Create comprehensive validation report
      const report = {
        filePath,
        fileName: basename(filePath),
        fileType,
        size: stats.size,
        sizeFormatted: this.formatFileSize(stats.size),
        dimensions,
        validationResult,
        optimizations,
        healthScore: this.calculateHealthScore(validationResult, optimizations),
        timestamp: Date.now(),
        validationTime: Date.now() - startTime
      };
      
      // Cache the result
      if (validationOptions.cacheKey) {
        this.validationCache.set(validationOptions.cacheKey, report);
      }
      
      // Update statistics
      this.updateValidationStats(report, Date.now() - startTime);
      
      // Add to history
      this.addToValidationHistory(report);
      
      // Update health metrics
      this.updateHealthMetrics(report);
      
      console.log(chalk.green(`✅ File validation completed (${Date.now() - startTime}ms)`));
      
      this.emit('file-validated', report);
      
      return report;
      
    } catch (error) {
      const validationTime = Date.now() - startTime;
      this.validationStats.failedValidations++;
      
      console.error(chalk.red('❌ File validation failed:'), error.message);
      
      this.emit('validation-failed', {
        filePath,
        error: error.message,
        validationTime
      });
      
      throw error;
    }
  }
  
  async validateBatch(filePaths, options = {}) {
    console.log(chalk.blue(`📋 Starting batch validation of ${filePaths.length} files...`));
    
    const batchOptions = {
      concurrency: 3,
      continueOnError: true,
      progressCallback: null,
      ...options
    };
    
    const results = [];
    const errors = [];
    
    // Process files in batches for memory efficiency
    const batches = this.createBatches(filePaths, batchOptions.concurrency);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      console.log(chalk.cyan(`Processing batch ${i + 1}/${batches.length} (${batch.length} files)`));
      
      const batchPromises = batch.map(async (filePath) => {
        try {
          const result = await this.validateFile(filePath, options);
          return { success: true, result };
        } catch (error) {
          if (batchOptions.continueOnError) {
            errors.push({ filePath, error: error.message });
            return { success: false, error: error.message };
          } else {
            throw error;
          }
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Progress callback
      if (batchOptions.progressCallback) {
        batchOptions.progressCallback({
          completed: results.length,
          total: filePaths.length,
          currentBatch: i + 1,
          totalBatches: batches.length
        });
      }
    }
    
    const batchReport = {
      totalFiles: filePaths.length,
      successfulValidations: results.filter(r => r.success).length,
      failedValidations: errors.length,
      results: results.map(r => r.result).filter(Boolean),
      errors,
      batchStats: this.calculateBatchStats(results),
      timestamp: Date.now()
    };
    
    console.log(chalk.green(`✅ Batch validation completed: ${batchReport.successfulValidations}/${batchReport.totalFiles} files validated`));
    
    this.emit('batch-validated', batchReport);
    
    return batchReport;
  }
  
  // === FILE TYPE VALIDATION METHODS ===
  
  async validateImageFile(filePath, stats, dimensions) {
    const issues = [];
    const imageValidator = this.fileTypeValidators.get('image');
    
    // Size validation
    if (stats.size > imageValidator.maxSize) {
      issues.push({
        type: 'size',
        severity: 'high',
        message: `Image size ${this.formatFileSize(stats.size)} exceeds limit ${this.formatFileSize(imageValidator.maxSize)}`
      });
    }
    
    // Dimension validation
    if (dimensions) {
      if (dimensions.width > this.options.maxImageDimensions.width || 
          dimensions.height > this.options.maxImageDimensions.height) {
        issues.push({
          type: 'dimensions',
          severity: 'medium',
          message: `Image dimensions ${dimensions.width}x${dimensions.height} exceed recommended limits`
        });
      }
      
      // Aspect ratio validation
      const aspectRatio = dimensions.width / dimensions.height;
      if (aspectRatio > 10 || aspectRatio < 0.1) {
        issues.push({
          type: 'aspect-ratio',
          severity: 'low',
          message: 'Unusual aspect ratio detected - may cause display issues'
        });
      }
    }
    
    return issues;
  }
  
  async validateVideoFile(filePath, stats, dimensions) {
    const issues = [];
    const videoValidator = this.fileTypeValidators.get('video');
    
    // Size validation
    if (stats.size > videoValidator.maxSize) {
      issues.push({
        type: 'size',
        severity: 'high',
        message: `Video size ${this.formatFileSize(stats.size)} exceeds limit ${this.formatFileSize(videoValidator.maxSize)}`
      });
    }
    
    // Duration validation (if available in dimensions)
    if (dimensions && dimensions.duration > this.options.maxVideoDuration) {
      issues.push({
        type: 'duration',
        severity: 'medium',
        message: `Video duration ${Math.round(dimensions.duration)}s exceeds limit ${this.options.maxVideoDuration}s`
      });
    }
    
    return issues;
  }
  
  async validateAudioFile(filePath, stats, dimensions) {
    const issues = [];
    const audioValidator = this.fileTypeValidators.get('audio');
    
    // Size validation
    if (stats.size > audioValidator.maxSize) {
      issues.push({
        type: 'size',
        severity: 'medium',
        message: `Audio size ${this.formatFileSize(stats.size)} exceeds limit ${this.formatFileSize(audioValidator.maxSize)}`
      });
    }
    
    return issues;
  }
  
  async validateDocumentFile(filePath, stats, dimensions) {
    const issues = [];
    const docValidator = this.fileTypeValidators.get('document');
    
    // Size validation
    if (stats.size > docValidator.maxSize) {
      issues.push({
        type: 'size',
        severity: 'medium',
        message: `Document size ${this.formatFileSize(stats.size)} exceeds limit ${this.formatFileSize(docValidator.maxSize)}`
      });
    }
    
    return issues;
  }
  
  async validateArchiveFile(filePath, stats, dimensions) {
    const issues = [];
    const archiveValidator = this.fileTypeValidators.get('archive');
    
    // Size validation
    if (stats.size > archiveValidator.maxSize) {
      issues.push({
        type: 'size',
        severity: 'high',
        message: `Archive size ${this.formatFileSize(stats.size)} exceeds limit ${this.formatFileSize(archiveValidator.maxSize)}`
      });
    }
    
    return issues;
  }
  
  async validateCodeFile(filePath, stats, dimensions) {
    const issues = [];
    const codeValidator = this.fileTypeValidators.get('code');
    
    // Size validation
    if (stats.size > codeValidator.maxSize) {
      issues.push({
        type: 'size',
        severity: 'low',
        message: `Code file size ${this.formatFileSize(stats.size)} is unusually large`
      });
    }
    
    return issues;
  }
  
  // === DIMENSION DETECTION METHODS ===
  
  async getFileDimensions(filePath, fileType) {
    try {
      const validator = this.fileTypeValidators.get(fileType);
      if (!validator || !validator.getDimensions) {
        return null;
      }
      
      return await validator.getDimensions(filePath);
      
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Could not get dimensions for ${basename(filePath)}:`, error.message));
      return null;
    }
  }
  
  async getImageDimensions(filePath) {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync(`identify -format "%wx%h" "${filePath}"`);
      return this.parseImageDimensions(stdout.trim());
      
    } catch (error) {
      // Fallback to basic file analysis
      return await this.getBasicImageDimensions(filePath);
    }
  }
  
  async getVideoDimensions(filePath) {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync(`ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`);
      return this.parseVideoDimensions(stdout);
      
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Could not get video dimensions:`, error.message));
      return null;
    }
  }
  
  async getAudioDimensions(filePath) {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync(`ffprobe -v quiet -print_format json -show_format "${filePath}"`);
      const data = JSON.parse(stdout);
      
      return {
        duration: parseFloat(data.format.duration) || 0,
        bitrate: parseInt(data.format.bit_rate) || 0,
        format: data.format.format_name
      };
      
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Could not get audio dimensions:`, error.message));
      return null;
    }
  }
  
  async getDocumentDimensions(filePath) {
    // For documents, we return page count and other metadata
    try {
      const ext = extname(filePath).toLowerCase();
      
      if (ext === '.pdf') {
        return await this.getPDFDimensions(filePath);
      }
      
      // For other document types, return basic info
      return {
        type: 'document',
        format: ext.substring(1).toUpperCase()
      };
      
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Could not get document dimensions:`, error.message));
      return null;
    }
  }
  
  async getArchiveDimensions(filePath) {
    // For archives, return compressed/uncompressed sizes
    try {
      const ext = extname(filePath).toLowerCase();
      
      if (ext === '.zip') {
        return await this.getZipDimensions(filePath);
      }
      
      return {
        type: 'archive',
        format: ext.substring(1).toUpperCase()
      };
      
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Could not get archive dimensions:`, error.message));
      return null;
    }
  }
  
  async getCodeDimensions(filePath) {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf8');
      
      return {
        lines: content.split('\n').length,
        characters: content.length,
        type: 'code'
      };
      
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Could not get code dimensions:`, error.message));
      return null;
    }
  }
  
  // === DIMENSION PARSERS ===
  
  parseImageDimensions(output) {
    const match = output.match(/(\d+)x(\d+)/);
    if (match) {
      return {
        width: parseInt(match[1]),
        height: parseInt(match[2]),
        type: 'image'
      };
    }
    return null;
  }
  
  parseVideoDimensions(jsonOutput) {
    try {
      const data = JSON.parse(jsonOutput);
      const videoStream = data.streams.find(s => s.codec_type === 'video');
      
      if (videoStream) {
        return {
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          duration: parseFloat(data.format.duration) || 0,
          bitrate: parseInt(data.format.bit_rate) || 0,
          format: data.format.format_name,
          codec: videoStream.codec_name,
          type: 'video'
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
  
  // === OPTIMIZATION SUGGESTION METHODS ===
  
  async generateOptimizationSuggestions(filePath, stats, dimensions, fileType, validationResult) {
    const suggestions = [];
    
    // Get validator for this file type
    const validator = this.fileTypeValidators.get(fileType);
    if (!validator || !validator.suggestOptimizations) {
      return suggestions;
    }
    
    // Get type-specific suggestions
    const typeSuggestions = await validator.suggestOptimizations(filePath, stats, dimensions, validationResult);
    suggestions.push(...typeSuggestions);
    
    // Add general optimization suggestions
    const generalSuggestions = await this.suggestGeneralOptimizations(filePath, stats, dimensions, fileType);
    suggestions.push(...generalSuggestions);
    
    // Sort by potential impact
    return suggestions.sort((a, b) => b.impact - a.impact);
  }
  
  async suggestImageOptimizations(filePath, stats, dimensions, validationResult) {
    const suggestions = [];
    const ext = extname(filePath).toLowerCase();
    
    // Compression suggestions
    if (stats.size > this.options.compressionThresholds.images) {
      suggestions.push({
        type: 'compression',
        strategy: 'image-compression',
        description: 'Compress image to reduce file size',
        estimatedSaving: Math.floor(stats.size * 0.3),
        impact: 8,
        tools: ['imagemagick', 'optipng'],
        command: this.generateCompressionCommand(filePath, 'image')
      });
    }
    
    // Format conversion suggestions
    if (['.bmp', '.tiff'].includes(ext)) {
      suggestions.push({
        type: 'format',
        strategy: 'format-conversion',
        description: `Convert ${ext} to more efficient format (PNG/JPEG)`,
        estimatedSaving: Math.floor(stats.size * 0.6),
        impact: 9,
        tools: ['imagemagick'],
        command: this.generateFormatConversionCommand(filePath, 'png')
      });
    }
    
    // Dimension optimization
    if (dimensions && (dimensions.width > 2048 || dimensions.height > 2048)) {
      suggestions.push({
        type: 'resize',
        strategy: 'dimension-optimization',
        description: 'Resize image to more reasonable dimensions',
        estimatedSaving: Math.floor(stats.size * 0.7),
        impact: 7,
        tools: ['imagemagick'],
        command: this.generateResizeCommand(filePath, { maxWidth: 2048, maxHeight: 2048 })
      });
    }
    
    return suggestions;
  }
  
  async suggestVideoOptimizations(filePath, stats, dimensions, validationResult) {
    const suggestions = [];
    
    // Video compression
    if (stats.size > this.options.compressionThresholds.videos) {
      suggestions.push({
        type: 'compression',
        strategy: 'video-compression',
        description: 'Compress video with efficient codec (H.264/H.265)',
        estimatedSaving: Math.floor(stats.size * 0.5),
        impact: 9,
        tools: ['ffmpeg'],
        command: this.generateVideoCompressionCommand(filePath)
      });
    }
    
    // Resolution optimization
    if (dimensions && dimensions.width > 1920) {
      suggestions.push({
        type: 'resize',
        strategy: 'dimension-optimization',
        description: 'Reduce video resolution to 1080p or lower',
        estimatedSaving: Math.floor(stats.size * 0.6),
        impact: 8,
        tools: ['ffmpeg'],
        command: this.generateVideoResizeCommand(filePath, '1920x1080')
      });
    }
    
    return suggestions;
  }
  
  async suggestAudioOptimizations(filePath, stats, dimensions, validationResult) {
    const suggestions = [];
    const ext = extname(filePath).toLowerCase();
    
    // Format conversion for uncompressed formats
    if (['.wav', '.flac'].includes(ext) && stats.size > 10 * 1024 * 1024) {
      suggestions.push({
        type: 'format',
        strategy: 'format-conversion',
        description: 'Convert to compressed format (MP3/AAC)',
        estimatedSaving: Math.floor(stats.size * 0.8),
        impact: 9,
        tools: ['ffmpeg'],
        command: this.generateAudioConversionCommand(filePath, 'mp3')
      });
    }
    
    return suggestions;
  }
  
  async suggestDocumentOptimizations(filePath, stats, dimensions, validationResult) {
    const suggestions = [];
    
    // PDF compression
    if (extname(filePath).toLowerCase() === '.pdf' && stats.size > 5 * 1024 * 1024) {
      suggestions.push({
        type: 'compression',
        strategy: 'document-compression',
        description: 'Compress PDF to reduce file size',
        estimatedSaving: Math.floor(stats.size * 0.4),
        impact: 7,
        tools: ['ghostscript'],
        command: this.generatePDFCompressionCommand(filePath)
      });
    }
    
    return suggestions;
  }
  
  async suggestArchiveOptimizations(filePath, stats, dimensions, validationResult) {
    const suggestions = [];
    const ext = extname(filePath).toLowerCase();
    
    // Better compression algorithms
    if (['.zip'].includes(ext) && stats.size > this.options.compressionThresholds.archives) {
      suggestions.push({
        type: 'recompression',
        strategy: 'archive-recompression',
        description: 'Recompress with better algorithm (7z)',
        estimatedSaving: Math.floor(stats.size * 0.3),
        impact: 6,
        tools: ['7zip'],
        command: this.generateArchiveRecompressionCommand(filePath)
      });
    }
    
    return suggestions;
  }
  
  async suggestCodeOptimizations(filePath, stats, dimensions, validationResult) {
    const suggestions = [];
    
    // Minification for web assets
    const ext = extname(filePath).toLowerCase();
    if (['.js', '.css', '.html'].includes(ext) && stats.size > 100 * 1024) {
      suggestions.push({
        type: 'minification',
        strategy: 'code-minification',
        description: 'Minify code to reduce file size',
        estimatedSaving: Math.floor(stats.size * 0.2),
        impact: 5,
        tools: ['terser', 'csso'],
        command: this.generateMinificationCommand(filePath)
      });
    }
    
    return suggestions;
  }
  
  async suggestGeneralOptimizations(filePath, stats, dimensions, fileType) {
    const suggestions = [];
    
    // Large file warning
    if (stats.size > 50 * 1024 * 1024) {
      suggestions.push({
        type: 'split',
        strategy: 'file-splitting',
        description: 'Consider splitting large file into smaller chunks',
        estimatedSaving: 0,
        impact: 4,
        tools: ['split'],
        command: this.generateFileSplitCommand(filePath)
      });
    }
    
    return suggestions;
  }
  
  // === UTILITY METHODS ===
  
  determineFileType(filePath) {
    const ext = extname(filePath).toLowerCase();
    
    for (const [type, validator] of this.fileTypeValidators) {
      if (validator.extensions.includes(ext)) {
        return type;
      }
    }
    
    return 'unknown';
  }
  
  formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
  
  calculateHealthScore(validationResult, optimizations) {
    let score = 100;
    
    // Deduct points for issues
    validationResult.forEach(issue => {
      switch (issue.severity) {
        case 'high': score -= 30; break;
        case 'medium': score -= 20; break;
        case 'low': score -= 10; break;
      }
    });
    
    // Deduct points for optimization opportunities
    optimizations.forEach(opt => {
      score -= Math.min(opt.impact, 15);
    });
    
    return Math.max(0, score);
  }
  
  async runValidationChecks(filePath, stats, dimensions, fileType) {
    const issues = [];
    
    // Get type-specific validator
    const validator = this.fileTypeValidators.get(fileType);
    if (validator && validator.validate) {
      const typeIssues = await validator.validate(filePath, stats, dimensions);
      issues.push(...typeIssues);
    }
    
    // Run general validation rules
    for (const [ruleName, rule] of Object.entries(this.validationRules)) {
      if (rule.check(filePath, stats, dimensions)) {
        issues.push({
          rule: ruleName,
          severity: rule.severity,
          message: rule.message,
          suggestions: rule.suggestions
        });
      }
    }
    
    return issues;
  }
  
  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
  
  updateValidationStats(report, validationTime) {
    if (report.validationResult.length === 0) {
      this.validationStats.passedValidations++;
    }
    
    if (report.optimizations.length > 0) {
      this.validationStats.optimizationsSuggested++;
    }
    
    // Update average validation time
    const totalTime = this.validationStats.averageValidationTime * (this.validationStats.totalValidations - 1) + validationTime;
    this.validationStats.averageValidationTime = totalTime / this.validationStats.totalValidations;
  }
  
  addToValidationHistory(report) {
    this.validationHistory.push({
      filePath: report.filePath,
      fileType: report.fileType,
      size: report.size,
      healthScore: report.healthScore,
      issueCount: report.validationResult.length,
      optimizationCount: report.optimizations.length,
      timestamp: report.timestamp
    });
    
    // Keep history limited
    if (this.validationHistory.length > 1000) {
      this.validationHistory = this.validationHistory.slice(-1000);
    }
  }
  
  updateHealthMetrics(report) {
    // Track oversized files
    if (report.size > this.options.maxFileSize) {
      this.healthMetrics.oversizedFiles.set(report.filePath, report.size);
    }
    
    // Track compression opportunities
    if (report.optimizations.some(opt => opt.type === 'compression')) {
      this.healthMetrics.compressionOpportunities.set(report.filePath, report.optimizations);
    }
    
    // Track dimension issues
    if (report.validationResult.some(issue => issue.type === 'dimensions')) {
      this.healthMetrics.dimensionIssues.set(report.filePath, report.dimensions);
    }
  }
  
  calculateBatchStats(results) {
    const successfulResults = results.filter(r => r.success && r.result);
    
    return {
      averageFileSize: successfulResults.reduce((sum, r) => sum + r.result.size, 0) / successfulResults.length,
      averageHealthScore: successfulResults.reduce((sum, r) => sum + r.result.healthScore, 0) / successfulResults.length,
      totalOptimizationsSuggested: successfulResults.reduce((sum, r) => sum + r.result.optimizations.length, 0),
      fileTypeDistribution: this.calculateFileTypeDistribution(successfulResults)
    };
  }
  
  calculateFileTypeDistribution(results) {
    const distribution = new Map();
    
    results.forEach(r => {
      if (r.result) {
        const count = distribution.get(r.result.fileType) || 0;
        distribution.set(r.result.fileType, count + 1);
      }
    });
    
    return Object.fromEntries(distribution);
  }
  
  // === COMMAND GENERATORS ===
  
  generateCompressionCommand(filePath, type) {
    const outputPath = filePath.replace(/(\.[^.]+)$/, '_compressed$1');
    
    switch (type) {
      case 'image':
        return `convert "${filePath}" -quality 85 -strip "${outputPath}"`;
      default:
        return null;
    }
  }
  
  generateFormatConversionCommand(filePath, targetFormat) {
    const outputPath = filePath.replace(/\.[^.]+$/, `.${targetFormat}`);
    return `convert "${filePath}" "${outputPath}"`;
  }
  
  generateResizeCommand(filePath, dimensions) {
    const outputPath = filePath.replace(/(\.[^.]+)$/, '_resized$1');
    return `convert "${filePath}" -resize ${dimensions.maxWidth}x${dimensions.maxHeight}> "${outputPath}"`;
  }
  
  generateVideoCompressionCommand(filePath) {
    const outputPath = filePath.replace(/(\.[^.]+)$/, '_compressed$1');
    return `ffmpeg -i "${filePath}" -c:v libx264 -crf 23 -c:a aac -b:a 128k "${outputPath}"`;
  }
  
  generateVideoResizeCommand(filePath, resolution) {
    const outputPath = filePath.replace(/(\.[^.]+)$/, '_resized$1');
    return `ffmpeg -i "${filePath}" -vf scale=${resolution} "${outputPath}"`;
  }
  
  generateAudioConversionCommand(filePath, format) {
    const outputPath = filePath.replace(/\.[^.]+$/, `.${format}`);
    return `ffmpeg -i "${filePath}" -ab 192k "${outputPath}"`;
  }
  
  generatePDFCompressionCommand(filePath) {
    const outputPath = filePath.replace(/(\.[^.]+)$/, '_compressed$1');
    return `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${filePath}"`;
  }
  
  generateArchiveRecompressionCommand(filePath) {
    const outputPath = filePath.replace(/\.[^.]+$/, '.7z');
    return `7z a -mx=9 "${outputPath}" "${filePath}"`;
  }
  
  generateMinificationCommand(filePath) {
    const ext = extname(filePath).toLowerCase();
    const outputPath = filePath.replace(/(\.[^.]+)$/, '.min$1');
    
    switch (ext) {
      case '.js':
        return `terser "${filePath}" -o "${outputPath}"`;
      case '.css':
        return `csso "${filePath}" --output "${outputPath}"`;
      default:
        return null;
    }
  }
  
  generateFileSplitCommand(filePath) {
    return `split -b 10M "${filePath}" "${filePath}.part_"`;
  }
  
  // === PUBLIC API ===
  
  getValidationStats() {
    return {
      ...this.validationStats,
      cacheSize: this.validationCache.size,
      historySize: this.validationHistory.length,
      healthMetrics: {
        oversizedFiles: this.healthMetrics.oversizedFiles.size,
        compressionOpportunities: this.healthMetrics.compressionOpportunities.size,
        dimensionIssues: this.healthMetrics.dimensionIssues.size
      }
    };
  }
  
  getHealthMetrics() {
    return {
      oversizedFiles: Object.fromEntries(this.healthMetrics.oversizedFiles),
      compressionOpportunities: Object.fromEntries(this.healthMetrics.compressionOpportunities),
      dimensionIssues: Object.fromEntries(this.healthMetrics.dimensionIssues),
      formatRecommendations: Object.fromEntries(this.healthMetrics.formatRecommendations)
    };
  }
  
  getValidationHistory(limit = 50) {
    return this.validationHistory.slice(-limit);
  }
  
  printValidationReport() {
    const stats = this.getValidationStats();
    
    console.log(chalk.blue('\n📏 File Size & Dimension Validation Report'));
    console.log(chalk.blue('==========================================='));
    
    console.log(chalk.cyan('\n📊 Validation Statistics:'));
    console.log(`Total Validations: ${stats.totalValidations}`);
    console.log(`Passed: ${stats.passedValidations}`);
    console.log(`Failed: ${stats.failedValidations}`);
    console.log(`Success Rate: ${((stats.passedValidations / stats.totalValidations) * 100).toFixed(1)}%`);
    console.log(`Average Validation Time: ${stats.averageValidationTime.toFixed(2)}ms`);
    
    console.log(chalk.cyan('\n🔧 Optimization Statistics:'));
    console.log(`Optimizations Suggested: ${stats.optimizationsSuggested}`);
    console.log(`Optimizations Applied: ${stats.optimizationsApplied}`);
    console.log(`Total Size Savings: ${this.formatFileSize(stats.sizeSavings)}`);
    
    console.log(chalk.cyan('\n🏥 Health Metrics:'));
    console.log(`Oversized Files: ${stats.healthMetrics.oversizedFiles}`);
    console.log(`Compression Opportunities: ${stats.healthMetrics.compressionOpportunities}`);
    console.log(`Dimension Issues: ${stats.healthMetrics.dimensionIssues}`);
    
    console.log(chalk.cyan('\n📦 System Status:'));
    console.log(`Cache Size: ${stats.cacheSize} entries`);
    console.log(`History Size: ${stats.historySize} records`);
    
    console.log(chalk.green('\n✅ Validation report complete'));
  }
  
  clearCache() {
    this.validationCache.clear();
    console.log(chalk.green('✅ Validation cache cleared'));
  }
  
  // === CLEANUP ===
  
  dispose() {
    console.log(chalk.yellow('🧹 Disposing File Size & Dimension Validation System...'));
    
    this.validationCache.clear();
    this.validationHistory = [];
    this.optimizationQueue.clear();
    this.fileTypeValidators.clear();
    this.optimizationStrategies.clear();
    this.dimensionReaders.clear();
    this.removeAllListeners();
    
    console.log(chalk.green('✅ File validation system disposed'));
  }
}

export default FileSizeValidationSystem;