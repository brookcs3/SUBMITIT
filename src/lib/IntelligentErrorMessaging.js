/**
 * Intelligent Error Messaging System
 * 
 * Advanced error messaging with intelligent suggestions for common file format issues,
 * contextual help, and actionable solutions based on error patterns and user context.
 */

import { EventEmitter } from 'events';
import { stat, access } from 'fs/promises';
import { extname, basename, dirname } from 'path';
import chalk from 'chalk';

export class IntelligentErrorMessaging extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableIntelligentSuggestions: true,
      enableContextualHelp: true,
      enableErrorPatternMatching: true,
      enableActionableSolutions: true,
      enableLearningFromErrors: true,
      enableErrorCategories: true,
      enableSeverityScoring: true,
      maxSuggestions: 5,
      enableErrorHistory: true,
      enablePreventiveTips: true,
      ...options
    };
    
    // Error pattern recognition
    this.errorPatterns = new Map();
    this.fileFormatIssues = new Map();
    this.commonSolutions = new Map();
    this.errorHistory = [];
    
    // Error categorization
    this.errorCategories = new Map();
    this.severityLevels = new Map();
    this.contextualHints = new Map();
    
    // Learning and analytics
    this.errorFrequency = new Map();
    this.solutionEffectiveness = new Map();
    this.userFeedback = new Map();
    
    // Performance tracking
    this.messagingStats = {
      totalErrors: 0,
      resolvedErrors: 0,
      suggestionsProvided: 0,
      successfulSuggestions: 0,
      averageResolutionTime: 0
    };
    
    this.initialize();
  }
  
  // === INITIALIZATION ===
  
  initialize() {
    console.log(chalk.blue('🧠 Initializing Intelligent Error Messaging...'));
    
    // Set up error patterns
    this.setupErrorPatterns();
    
    // Set up file format issue detection
    this.setupFileFormatIssues();
    
    // Set up common solutions
    this.setupCommonSolutions();
    
    // Set up error categories
    this.setupErrorCategories();
    
    // Set up contextual hints
    this.setupContextualHints();
    
    console.log(chalk.green('✅ Intelligent error messaging initialized'));
    this.emit('messaging-ready');
  }
  
  setupErrorPatterns() {
    // File not found patterns
    this.errorPatterns.set('ENOENT', {
      category: 'file-not-found',
      severity: 'high',
      patterns: [
        /no such file or directory/i,
        /cannot find the file/i,
        /file not found/i,
        /ENOENT/
      ],
      suggestions: this.getFileNotFoundSuggestions.bind(this)
    });
    
    // Permission denied patterns
    this.errorPatterns.set('EACCES', {
      category: 'permission-denied',
      severity: 'medium',
      patterns: [
        /permission denied/i,
        /access denied/i,
        /EACCES/,
        /insufficient privileges/i
      ],
      suggestions: this.getPermissionDeniedSuggestions.bind(this)
    });
    
    // File format patterns
    this.errorPatterns.set('INVALID_FORMAT', {
      category: 'file-format',
      severity: 'medium',
      patterns: [
        /invalid file format/i,
        /unsupported format/i,
        /corrupt file/i,
        /malformed/i,
        /unexpected file type/i
      ],
      suggestions: this.getFileFormatSuggestions.bind(this)
    });
    
    // Size limit patterns
    this.errorPatterns.set('FILE_TOO_LARGE', {
      category: 'size-limit',
      severity: 'medium',
      patterns: [
        /file too large/i,
        /exceeds maximum size/i,
        /size limit exceeded/i,
        /out of space/i,
        /ENOSPC/
      ],
      suggestions: this.getSizeLimitSuggestions.bind(this)
    });
    
    // Encoding patterns
    this.errorPatterns.set('ENCODING_ERROR', {
      category: 'encoding',
      severity: 'low',
      patterns: [
        /encoding error/i,
        /invalid character/i,
        /utf-8/i,
        /charset/i,
        /malformed utf/i
      ],
      suggestions: this.getEncodingSuggestions.bind(this)
    });
    
    // Network patterns
    this.errorPatterns.set('NETWORK_ERROR', {
      category: 'network',
      severity: 'high',
      patterns: [
        /network error/i,
        /connection refused/i,
        /timeout/i,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /dns lookup failed/i
      ],
      suggestions: this.getNetworkSuggestions.bind(this)
    });
    
    // Memory patterns
    this.errorPatterns.set('MEMORY_ERROR', {
      category: 'memory',
      severity: 'high',
      patterns: [
        /out of memory/i,
        /heap overflow/i,
        /ENOMEM/,
        /maximum call stack/i,
        /memory limit/i
      ],
      suggestions: this.getMemorySuggestions.bind(this)
    });
  }
  
  setupFileFormatIssues() {
    // Image format issues
    this.fileFormatIssues.set('.jpg', {
      commonIssues: [
        'Corrupted JPEG header',
        'Invalid EXIF data',
        'Unsupported JPEG variant',
        'File actually PNG with wrong extension'
      ],
      solutions: [
        'Try opening in image editor and re-saving',
        'Use image conversion tool',
        'Check file integrity',
        'Rename with correct extension'
      ]
    });
    
    this.fileFormatIssues.set('.png', {
      commonIssues: [
        'Invalid PNG signature',
        'Corrupted chunk data',
        'Unsupported color depth',
        'File actually JPEG with wrong extension'
      ],
      solutions: [
        'Re-export from original source',
        'Use PNG repair tool',
        'Convert to supported color depth',
        'Check and correct file extension'
      ]
    });
    
    // Document format issues
    this.fileFormatIssues.set('.pdf', {
      commonIssues: [
        'Password protected PDF',
        'Corrupted PDF structure',
        'PDF version too new/old',
        'Encrypted PDF content'
      ],
      solutions: [
        'Remove password protection',
        'Use PDF repair tool',
        'Convert to compatible PDF version',
        'Use PDF unlocker tool'
      ]
    });
    
    // Archive format issues
    this.fileFormatIssues.set('.zip', {
      commonIssues: [
        'Corrupted ZIP header',
        'Password protected archive',
        'Incomplete download',
        'Unsupported compression method'
      ],
      solutions: [
        'Re-download the file',
        'Use archive repair tool',
        'Extract with different tool',
        'Remove password protection'
      ]
    });
    
    // Text format issues
    this.fileFormatIssues.set('.txt', {
      commonIssues: [
        'Incorrect text encoding',
        'Binary data in text file',
        'Line ending issues',
        'BOM (Byte Order Mark) issues'
      ],
      solutions: [
        'Convert to UTF-8 encoding',
        'Remove binary data',
        'Normalize line endings',
        'Remove or add BOM as needed'
      ]
    });
    
    // Video format issues
    this.fileFormatIssues.set('.mp4', {
      commonIssues: [
        'Corrupted video header',
        'Unsupported codec',
        'Incomplete file',
        'DRM protected content'
      ],
      solutions: [
        'Re-encode with standard codec',
        'Use video repair tool',
        'Re-download complete file',
        'Remove DRM protection (if legal)'
      ]
    });
  }
  
  setupCommonSolutions() {
    // File path solutions
    this.commonSolutions.set('file-path', [
      'Check if file path contains special characters',
      'Verify file path length (Windows has 260 char limit)',
      'Use absolute path instead of relative path',
      'Check for spaces or unicode characters in path',
      'Ensure file is not in a restricted directory'
    ]);
    
    // File permissions solutions
    this.commonSolutions.set('permissions', [
      'Run command with elevated privileges (sudo/admin)',
      'Change file permissions using chmod',
      'Check if file is currently open in another program',
      'Verify you have read/write access to the directory',
      'Restart application with administrator rights'
    ]);
    
    // File format solutions
    this.commonSolutions.set('format', [
      'Convert file to supported format',
      'Update application to support newer formats',
      'Use specialized tool for this file type',
      'Check if file extension matches actual format',
      'Try opening with different application'
    ]);
    
    // Network solutions
    this.commonSolutions.set('network', [
      'Check internet connection',
      'Verify server/service is accessible',
      'Check firewall and proxy settings',
      'Try again later (temporary network issue)',
      'Use alternative network connection'
    ]);
    
    // Memory solutions
    this.commonSolutions.set('memory', [
      'Close other applications to free memory',
      'Process files in smaller batches',
      'Increase system virtual memory',
      'Use 64-bit version of application',
      'Consider using streaming operations'
    ]);
  }
  
  setupErrorCategories() {
    this.errorCategories.set('file-not-found', {
      name: 'File Not Found',
      description: 'The specified file or directory could not be located',
      icon: '📁',
      color: chalk.red,
      urgency: 'high'
    });
    
    this.errorCategories.set('permission-denied', {
      name: 'Permission Denied',
      description: 'Insufficient permissions to access the file or directory',
      icon: '🔒',
      color: chalk.yellow,
      urgency: 'medium'
    });
    
    this.errorCategories.set('file-format', {
      name: 'File Format Issue',
      description: 'Problem with file format, encoding, or structure',
      icon: '📄',
      color: chalk.cyan,
      urgency: 'medium'
    });
    
    this.errorCategories.set('size-limit', {
      name: 'Size Limit',
      description: 'File exceeds maximum allowed size',
      icon: '📏',
      color: chalk.magenta,
      urgency: 'low'
    });
    
    this.errorCategories.set('network', {
      name: 'Network Error',
      description: 'Problem with network connectivity or remote service',
      icon: '🌐',
      color: chalk.blue,
      urgency: 'high'
    });
    
    this.errorCategories.set('memory', {
      name: 'Memory Issue',
      description: 'Insufficient memory or memory-related problem',
      icon: '🧠',
      color: chalk.red,
      urgency: 'high'
    });
  }
  
  setupContextualHints() {
    this.contextualHints.set('image-files', [
      'Images should be in common formats (JPG, PNG, GIF, WebP)',
      'Large images may need compression before processing',
      'Check image dimensions and color depth',
      'Ensure images are not corrupted or incomplete'
    ]);
    
    this.contextualHints.set('document-files', [
      'PDFs may be password protected or encrypted',
      'Check document version compatibility',
      'Ensure text encoding is UTF-8 when possible',
      'Large documents may need to be split into smaller parts'
    ]);
    
    this.contextualHints.set('archive-files', [
      'Archives should not be password protected',
      'Check archive integrity before processing',
      'Large archives may exceed memory limits',
      'Ensure archive is completely downloaded'
    ]);
    
    this.contextualHints.set('media-files', [
      'Media files may require specific codecs',
      'Check file integrity and completeness',
      'Large media files may need compression',
      'Ensure media is not DRM protected'
    ]);
  }
  
  // === CORE ERROR ANALYSIS ===
  
  async analyzeError(error, context = {}) {
    const startTime = Date.now();
    this.messagingStats.totalErrors++;
    
    try {
      // Extract error information
      const errorInfo = await this.extractErrorInfo(error, context);
      
      // Classify error
      const classification = await this.classifyError(errorInfo);
      
      // Generate suggestions
      const suggestions = await this.generateSuggestions(errorInfo, classification, context);
      
      // Create intelligent message
      const intelligentMessage = await this.createIntelligentMessage(
        errorInfo,
        classification,
        suggestions,
        context
      );
      
      // Record for learning
      this.recordError(errorInfo, classification, suggestions);
      
      // Update statistics
      const analysisTime = Date.now() - startTime;
      this.updateMessagingStats(true, suggestions.length, analysisTime);
      
      this.emit('error-analyzed', {
        errorInfo,
        classification,
        suggestions,
        message: intelligentMessage
      });
      
      return intelligentMessage;
      
    } catch (analysisError) {
      console.error(chalk.red('❌ Error analysis failed:'), analysisError.message);
      
      // Fallback to basic error message
      return this.createBasicErrorMessage(error, context);
    }
  }
  
  async extractErrorInfo(error, context) {
    const errorInfo = {
      message: error.message || error.toString(),
      code: error.code || 'UNKNOWN',
      stack: error.stack,
      timestamp: Date.now(),
      context: { ...context }
    };
    
    // Extract file information if available
    if (context.filePath) {
      errorInfo.file = await this.analyzeFileContext(context.filePath);
    }
    
    // Extract operation context
    if (context.operation) {
      errorInfo.operation = {
        type: context.operation,
        stage: context.stage || 'unknown',
        parameters: context.parameters || {}
      };
    }
    
    // Extract system context
    errorInfo.system = {
      platform: process.platform,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      workingDirectory: process.cwd()
    };
    
    return errorInfo;
  }
  
  async analyzeFileContext(filePath) {
    const fileInfo = {
      path: filePath,
      name: basename(filePath),
      extension: extname(filePath).toLowerCase(),
      directory: dirname(filePath)
    };
    
    try {
      // Check if file exists
      await access(filePath);
      fileInfo.exists = true;
      
      // Get file stats
      const stats = await stat(filePath);
      fileInfo.size = stats.size;
      fileInfo.isDirectory = stats.isDirectory();
      fileInfo.modified = stats.mtime;
      fileInfo.permissions = stats.mode;
      
    } catch (error) {
      fileInfo.exists = false;
      fileInfo.accessError = error.message;
    }
    
    return fileInfo;
  }
  
  async classifyError(errorInfo) {
    const classification = {
      category: 'unknown',
      severity: 'medium',
      patterns: [],
      confidence: 0
    };
    
    // Try to match error patterns
    for (const [patternName, pattern] of this.errorPatterns) {
      const matchScore = this.calculatePatternMatch(errorInfo.message, pattern.patterns);
      
      if (matchScore > 0.5) {
        classification.category = pattern.category;
        classification.severity = pattern.severity;
        classification.patterns.push({
          name: patternName,
          score: matchScore
        });
        classification.confidence = Math.max(classification.confidence, matchScore);
      }
    }
    
    // Enhanced classification based on context
    if (errorInfo.file) {
      const fileBasedClassification = this.classifyByFileContext(errorInfo.file);
      if (fileBasedClassification.confidence > classification.confidence) {
        Object.assign(classification, fileBasedClassification);
      }
    }
    
    return classification;
  }
  
  calculatePatternMatch(message, patterns) {
    let maxMatch = 0;
    
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        // Simple scoring - could be enhanced with fuzzy matching
        const match = pattern.source.length / message.length;
        maxMatch = Math.max(maxMatch, Math.min(1, match * 2));
      }
    }
    
    return maxMatch;
  }
  
  classifyByFileContext(fileInfo) {
    const classification = {
      category: 'file-format',
      severity: 'medium',
      confidence: 0.7
    };
    
    // File doesn't exist
    if (!fileInfo.exists) {
      classification.category = 'file-not-found';
      classification.severity = 'high';
      classification.confidence = 0.9;
      return classification;
    }
    
    // File size issues
    if (fileInfo.size > 100 * 1024 * 1024) { // > 100MB
      classification.category = 'size-limit';
      classification.severity = 'medium';
      classification.confidence = 0.6;
    }
    
    // Directory when file expected
    if (fileInfo.isDirectory) {
      classification.category = 'file-not-found';
      classification.severity = 'medium';
      classification.confidence = 0.8;
    }
    
    return classification;
  }
  
  // === SUGGESTION GENERATION ===
  
  async generateSuggestions(errorInfo, classification, context) {
    const suggestions = [];
    
    // Pattern-based suggestions
    const pattern = Array.from(this.errorPatterns.values())
      .find(p => p.category === classification.category);
    
    if (pattern && pattern.suggestions) {
      const patternSuggestions = await pattern.suggestions(errorInfo, context);
      suggestions.push(...patternSuggestions);
    }
    
    // File format specific suggestions
    if (errorInfo.file && this.fileFormatIssues.has(errorInfo.file.extension)) {
      const formatSuggestions = this.getFileFormatSpecificSuggestions(errorInfo.file);
      suggestions.push(...formatSuggestions);
    }
    
    // Context-based suggestions
    const contextSuggestions = this.getContextualSuggestions(errorInfo, context);
    suggestions.push(...contextSuggestions);
    
    // Common solutions
    const commonSuggestions = this.getCommonSolutions(classification.category);
    suggestions.push(...commonSuggestions);
    
    // Rank and limit suggestions
    const rankedSuggestions = this.rankSuggestions(suggestions, errorInfo, classification);
    
    return rankedSuggestions.slice(0, this.options.maxSuggestions);
  }
  
  async getFileNotFoundSuggestions(errorInfo, context) {
    const suggestions = [];
    
    if (errorInfo.file) {
      const filePath = errorInfo.file.path;
      
      suggestions.push({
        type: 'check-path',
        priority: 'high',
        action: 'Verify file path',
        description: `Check if '${filePath}' exists and is spelled correctly`,
        command: `ls -la "${dirname(filePath)}"`,
        automated: false
      });
      
      suggestions.push({
        type: 'check-permissions',
        priority: 'medium',
        action: 'Check directory permissions',
        description: 'Ensure you have read access to the parent directory',
        command: `ls -ld "${dirname(filePath)}"`,
        automated: false
      });
      
      // Suggest similar files
      if (errorInfo.file.directory) {
        suggestions.push({
          type: 'find-similar',
          priority: 'medium',
          action: 'Look for similar files',
          description: 'Search for files with similar names in the directory',
          command: `find "${errorInfo.file.directory}" -name "*${errorInfo.file.name.slice(0, -3)}*"`,
          automated: true
        });
      }
    }
    
    return suggestions;
  }
  
  async getPermissionDeniedSuggestions(errorInfo, context) {
    return [
      {
        type: 'elevate-privileges',
        priority: 'high',
        action: 'Run with elevated privileges',
        description: 'Try running the command with sudo or as administrator',
        command: process.platform === 'win32' ? 'Run as Administrator' : 'sudo <command>',
        automated: false
      },
      {
        type: 'change-permissions',
        priority: 'medium',
        action: 'Change file permissions',
        description: 'Grant read/write permissions to the file or directory',
        command: errorInfo.file ? `chmod 644 "${errorInfo.file.path}"` : 'chmod 644 <file>',
        automated: true
      },
      {
        type: 'check-ownership',
        priority: 'medium',
        action: 'Check file ownership',
        description: 'Verify you own the file or have appropriate group access',
        command: errorInfo.file ? `ls -la "${errorInfo.file.path}"` : 'ls -la <file>',
        automated: false
      }
    ];
  }
  
  async getFileFormatSuggestions(errorInfo, context) {
    const suggestions = [];
    
    if (errorInfo.file) {
      const extension = errorInfo.file.extension;
      
      suggestions.push({
        type: 'verify-format',
        priority: 'high',
        action: 'Verify file format',
        description: `Check if the file is actually a ${extension.slice(1).toUpperCase()} file`,
        command: `file "${errorInfo.file.path}"`,
        automated: true
      });
      
      suggestions.push({
        type: 'convert-format',
        priority: 'medium',
        action: 'Convert to supported format',
        description: 'Use a file converter to change the format',
        automated: false
      });
      
      if (extension === '.jpg' || extension === '.png') {
        suggestions.push({
          type: 'image-conversion',
          priority: 'medium',
          action: 'Convert image format',
          description: 'Use an image editor to save in the correct format',
          automated: false
        });
      }
    }
    
    return suggestions;
  }
  
  async getSizeLimitSuggestions(errorInfo, context) {
    const suggestions = [
      {
        type: 'compress-file',
        priority: 'high',
        action: 'Compress the file',
        description: 'Reduce file size using compression',
        automated: true
      },
      {
        type: 'split-file',
        priority: 'medium',
        action: 'Split into smaller files',
        description: 'Divide the file into smaller, manageable parts',
        automated: true
      },
      {
        type: 'increase-limit',
        priority: 'low',
        action: 'Increase size limit',
        description: 'Configure the application to allow larger files',
        automated: false
      }
    ];
    
    if (errorInfo.file && errorInfo.file.size) {
      const sizeMB = (errorInfo.file.size / (1024 * 1024)).toFixed(2);
      suggestions[0].description += ` (current size: ${sizeMB}MB)`;
    }
    
    return suggestions;
  }
  
  async getEncodingSuggestions(errorInfo, context) {
    return [
      {
        type: 'convert-encoding',
        priority: 'high',
        action: 'Convert to UTF-8',
        description: 'Convert file encoding to UTF-8',
        command: errorInfo.file ? `iconv -f auto -t UTF-8 "${errorInfo.file.path}" -o "${errorInfo.file.path}.utf8"` : null,
        automated: true
      },
      {
        type: 'detect-encoding',
        priority: 'medium',
        action: 'Detect current encoding',
        description: 'Determine the current file encoding',
        command: errorInfo.file ? `file -bi "${errorInfo.file.path}"` : null,
        automated: true
      },
      {
        type: 'remove-bom',
        priority: 'low',
        action: 'Remove Byte Order Mark',
        description: 'Remove BOM if present in the file',
        automated: true
      }
    ];
  }
  
  async getNetworkSuggestions(errorInfo, context) {
    return [
      {
        type: 'check-connection',
        priority: 'high',
        action: 'Check internet connection',
        description: 'Verify network connectivity',
        command: 'ping google.com',
        automated: true
      },
      {
        type: 'retry-operation',
        priority: 'high',
        action: 'Retry the operation',
        description: 'Network issues are often temporary',
        automated: true
      },
      {
        type: 'check-firewall',
        priority: 'medium',
        action: 'Check firewall settings',
        description: 'Ensure the application is allowed through firewall',
        automated: false
      },
      {
        type: 'use-proxy',
        priority: 'low',
        action: 'Configure proxy settings',
        description: 'Set up proxy if required by your network',
        automated: false
      }
    ];
  }
  
  async getMemorySuggestions(errorInfo, context) {
    const memoryUsage = errorInfo.system.memoryUsage;
    const usedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
    
    return [
      {
        type: 'free-memory',
        priority: 'high',
        action: 'Free up memory',
        description: `Close other applications (current usage: ${usedMB}MB)`,
        automated: false
      },
      {
        type: 'process-smaller-batches',
        priority: 'high',
        action: 'Process in smaller batches',
        description: 'Reduce the number of files processed at once',
        automated: true
      },
      {
        type: 'increase-heap',
        priority: 'medium',
        action: 'Increase heap size',
        description: 'Run with --max-old-space-size=8192',
        command: 'node --max-old-space-size=8192 <script>',
        automated: false
      },
      {
        type: 'use-streaming',
        priority: 'medium',
        action: 'Use streaming operations',
        description: 'Process files using streaming to reduce memory usage',
        automated: true
      }
    ];
  }
  
  getFileFormatSpecificSuggestions(fileInfo) {
    const formatIssue = this.fileFormatIssues.get(fileInfo.extension);
    if (!formatIssue) return [];
    
    return formatIssue.solutions.map((solution, index) => ({
      type: 'format-specific',
      priority: index === 0 ? 'high' : 'medium',
      action: solution,
      description: `Common issue: ${formatIssue.commonIssues[index] || 'Format-related problem'}`,
      automated: false
    }));
  }
  
  getContextualSuggestions(errorInfo, context) {
    const suggestions = [];
    
    // Operation-specific suggestions
    if (context.operation) {
      switch (context.operation) {
        case 'file-validation':
          suggestions.push({
            type: 'skip-validation',
            priority: 'low',
            action: 'Skip validation',
            description: 'Proceed without strict validation (use with caution)',
            automated: true
          });
          break;
          
        case 'file-export':
          suggestions.push({
            type: 'change-export-format',
            priority: 'medium',
            action: 'Try different export format',
            description: 'Export in a different file format',
            automated: false
          });
          break;
          
        case 'file-sharing':
          suggestions.push({
            type: 'use-different-platform',
            priority: 'medium',
            action: 'Try different sharing platform',
            description: 'Use an alternative file sharing service',
            automated: true
          });
          break;
      }
    }
    
    return suggestions;
  }
  
  getCommonSolutions(category) {
    const solutions = this.commonSolutions.get(category) || [];
    
    return solutions.map((solution, index) => ({
      type: 'common-solution',
      priority: index < 2 ? 'medium' : 'low',
      action: solution,
      description: 'General solution for this type of issue',
      automated: false
    }));
  }
  
  rankSuggestions(suggestions, errorInfo, classification) {
    // Score suggestions based on various factors
    const scoredSuggestions = suggestions.map(suggestion => {
      let score = 0;
      
      // Priority scoring
      switch (suggestion.priority) {
        case 'high': score += 10; break;
        case 'medium': score += 5; break;
        case 'low': score += 1; break;
      }
      
      // Automation scoring
      if (suggestion.automated) score += 3;
      
      // Context relevance scoring
      if (suggestion.type.includes('format') && classification.category === 'file-format') {
        score += 5;
      }
      
      // Historical effectiveness scoring
      const effectiveness = this.solutionEffectiveness.get(suggestion.type) || 0.5;
      score += effectiveness * 3;
      
      return { ...suggestion, score };
    });
    
    // Sort by score (descending)
    return scoredSuggestions.sort((a, b) => b.score - a.score);
  }
  
  // === MESSAGE CREATION ===
  
  async createIntelligentMessage(errorInfo, classification, suggestions, context) {
    const category = this.errorCategories.get(classification.category) || 
                    { name: 'Unknown Error', icon: '❓', color: chalk.white };
    
    const message = {
      type: 'intelligent-error',
      timestamp: Date.now(),
      error: {
        original: errorInfo.message,
        category: classification.category,
        severity: classification.severity,
        confidence: classification.confidence
      },
      display: {
        title: this.createErrorTitle(category, errorInfo),
        description: this.createErrorDescription(errorInfo, classification, context),
        suggestions: this.formatSuggestions(suggestions),
        actions: this.createActionableSteps(suggestions),
        tips: this.getPreventiveTips(classification.category, context)
      },
      technical: {
        errorCode: errorInfo.code,
        stack: errorInfo.stack,
        context: errorInfo.context,
        patterns: classification.patterns
      }
    };
    
    return message;
  }
  
  createErrorTitle(category, errorInfo) {
    const icon = category.icon || '❓';
    const title = `${icon} ${category.name}`;
    
    if (errorInfo.file) {
      return `${title}: ${errorInfo.file.name}`;
    }
    
    return title;
  }
  
  createErrorDescription(errorInfo, classification, context) {
    let description = errorInfo.message;
    
    // Add context-specific information
    if (errorInfo.file) {
      if (!errorInfo.file.exists) {
        description += `\n\nThe file '${errorInfo.file.path}' could not be found.`;
      } else if (errorInfo.file.size) {
        const sizeMB = (errorInfo.file.size / (1024 * 1024)).toFixed(2);
        description += `\n\nFile size: ${sizeMB}MB`;
      }
    }
    
    // Add operation context
    if (errorInfo.operation) {
      description += `\n\nOperation: ${errorInfo.operation.type}`;
      if (errorInfo.operation.stage) {
        description += ` (${errorInfo.operation.stage})`;
      }
    }
    
    return description;
  }
  
  formatSuggestions(suggestions) {
    return suggestions.map(suggestion => {
      const priorityIcon = suggestion.priority === 'high' ? '🔥' :
                          suggestion.priority === 'medium' ? '💡' : '💭';
      
      const automatedIcon = suggestion.automated ? '🤖' : '👤';
      
      return {
        icon: `${priorityIcon} ${automatedIcon}`,
        action: suggestion.action,
        description: suggestion.description,
        command: suggestion.command,
        automated: suggestion.automated,
        priority: suggestion.priority,
        type: suggestion.type
      };
    });
  }
  
  createActionableSteps(suggestions) {
    const highPriority = suggestions.filter(s => s.priority === 'high');
    const automated = suggestions.filter(s => s.automated);
    
    const steps = [];
    
    if (automated.length > 0) {
      steps.push({
        type: 'automated',
        title: 'Quick Fixes (Automated)',
        actions: automated.slice(0, 2).map(s => ({
          description: s.action,
          command: s.command,
          automated: true
        }))
      });
    }
    
    if (highPriority.length > 0) {
      steps.push({
        type: 'manual',
        title: 'Recommended Actions',
        actions: highPriority.slice(0, 3).map(s => ({
          description: s.action,
          command: s.command,
          automated: false
        }))
      });
    }
    
    return steps;
  }
  
  getPreventiveTips(category, context) {
    const tips = [];
    
    // Category-specific tips
    switch (category) {
      case 'file-not-found':
        tips.push('Use absolute paths when possible');
        tips.push('Double-check file names for typos');
        break;
        
      case 'file-format':
        tips.push('Verify file formats before processing');
        tips.push('Keep backup copies of original files');
        break;
        
      case 'permission-denied':
        tips.push('Check file permissions before operations');
        tips.push('Avoid running as admin unless necessary');
        break;
        
      case 'size-limit':
        tips.push('Compress large files before sharing');
        tips.push('Monitor file sizes during operations');
        break;
    }
    
    // Context-specific tips
    if (context.filePath && this.contextualHints.has('image-files')) {
      const extension = extname(context.filePath).toLowerCase();
      if (['.jpg', '.png', '.gif', '.webp'].includes(extension)) {
        tips.push(...this.contextualHints.get('image-files').slice(0, 2));
      }
    }
    
    return tips.slice(0, 3); // Limit to 3 tips
  }
  
  createBasicErrorMessage(error, context) {
    return {
      type: 'basic-error',
      timestamp: Date.now(),
      error: {
        original: error.message || error.toString(),
        category: 'unknown',
        severity: 'medium',
        confidence: 0
      },
      display: {
        title: '❓ Unknown Error',
        description: error.message || error.toString(),
        suggestions: [],
        actions: [],
        tips: ['Check the error message for clues', 'Try the operation again', 'Contact support if the issue persists']
      },
      technical: {
        errorCode: error.code || 'UNKNOWN',
        stack: error.stack,
        context
      }
    };
  }
  
  // === LEARNING AND ANALYTICS ===
  
  recordError(errorInfo, classification, suggestions) {
    const errorRecord = {
      timestamp: Date.now(),
      category: classification.category,
      severity: classification.severity,
      confidence: classification.confidence,
      suggestionsCount: suggestions.length,
      context: errorInfo.context
    };
    
    this.errorHistory.push(errorRecord);
    
    // Update frequency tracking
    const frequency = this.errorFrequency.get(classification.category) || 0;
    this.errorFrequency.set(classification.category, frequency + 1);
    
    // Keep history limited
    if (this.errorHistory.length > 1000) {
      this.errorHistory = this.errorHistory.slice(-1000);
    }
  }
  
  recordSuggestionSuccess(suggestionType, wasSuccessful) {
    const current = this.solutionEffectiveness.get(suggestionType) || 0.5;
    const adjustment = wasSuccessful ? 0.1 : -0.05;
    const newEffectiveness = Math.max(0, Math.min(1, current + adjustment));
    
    this.solutionEffectiveness.set(suggestionType, newEffectiveness);
  }
  
  updateMessagingStats(success, suggestionsCount, analysisTime) {
    if (success) {
      this.messagingStats.suggestionsProvided += suggestionsCount;
    }
    
    // Update average analysis time (simplified)
    const totalTime = this.messagingStats.averageResolutionTime * (this.messagingStats.totalErrors - 1) + analysisTime;
    this.messagingStats.averageResolutionTime = totalTime / this.messagingStats.totalErrors;
  }
  
  // === PUBLIC API ===
  
  async handleError(error, context = {}) {
    try {
      const intelligentMessage = await this.analyzeError(error, context);
      this.displayIntelligentMessage(intelligentMessage);
      return intelligentMessage;
    } catch (handlingError) {
      console.error(chalk.red('❌ Error handling failed:'), handlingError.message);
      // Fallback to basic error display
      console.error(chalk.red(error.message || error.toString()));
      return null;
    }
  }
  
  displayIntelligentMessage(message) {
    const category = this.errorCategories.get(message.error.category) || 
                    { color: chalk.white };
    
    console.log('\n' + category.color('═'.repeat(60)));
    console.log(category.color(message.display.title));
    console.log(category.color('═'.repeat(60)));
    
    console.log('\n' + chalk.white(message.display.description));
    
    if (message.display.suggestions.length > 0) {
      console.log('\n' + chalk.cyan('💡 Suggestions:'));
      message.display.suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion.icon} ${suggestion.action}`);
        console.log(`   ${chalk.gray(suggestion.description)}`);
        if (suggestion.command) {
          console.log(`   ${chalk.blue(`Command: ${suggestion.command}`)}`);
        }
      });
    }
    
    if (message.display.tips.length > 0) {
      console.log('\n' + chalk.yellow('💭 Tips for the future:'));
      message.display.tips.forEach(tip => {
        console.log(`• ${tip}`);
      });
    }
    
    console.log('\n' + category.color('═'.repeat(60)));
  }
  
  getMessagingStats() {
    return {
      ...this.messagingStats,
      errorFrequency: Object.fromEntries(this.errorFrequency),
      solutionEffectiveness: Object.fromEntries(this.solutionEffectiveness),
      totalPatterns: this.errorPatterns.size,
      categoriesSupported: this.errorCategories.size
    };
  }
  
  getErrorHistory(limit = 20) {
    return this.errorHistory.slice(-limit);
  }
  
  printMessagingReport() {
    const stats = this.getMessagingStats();
    
    console.log(chalk.blue('\n🧠 Intelligent Error Messaging Report'));
    console.log(chalk.blue('======================================'));
    
    console.log(chalk.cyan('\n📊 Messaging Statistics:'));
    console.log(`Total Errors: ${stats.totalErrors}`);
    console.log(`Resolved Errors: ${stats.resolvedErrors}`);
    console.log(`Suggestions Provided: ${stats.suggestionsProvided}`);
    console.log(`Successful Suggestions: ${stats.successfulSuggestions}`);
    console.log(`Average Resolution Time: ${stats.averageResolutionTime.toFixed(2)}ms`);
    
    console.log(chalk.cyan('\n🏷️  Error Categories:'));
    console.log(`Patterns Supported: ${stats.totalPatterns}`);
    console.log(`Categories Supported: ${stats.categoriesSupported}`);
    
    if (Object.keys(stats.errorFrequency).length > 0) {
      console.log(chalk.cyan('\n📈 Most Common Error Types:'));
      Object.entries(stats.errorFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([category, count]) => {
          const categoryInfo = this.errorCategories.get(category);
          const icon = categoryInfo ? categoryInfo.icon : '❓';
          console.log(`  ${icon} ${category}: ${count} occurrences`);
        });
    }
    
    if (Object.keys(stats.solutionEffectiveness).length > 0) {
      console.log(chalk.cyan('\n🎯 Most Effective Solutions:'));
      Object.entries(stats.solutionEffectiveness)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([solution, effectiveness]) => {
          console.log(`  ${solution}: ${(effectiveness * 100).toFixed(1)}% effective`);
        });
    }
    
    console.log(chalk.green('\n✅ Error messaging report complete'));
  }
  
  // === CLEANUP ===
  
  dispose() {
    console.log(chalk.yellow('🧹 Disposing Intelligent Error Messaging...'));
    
    this.errorHistory = [];
    this.errorFrequency.clear();
    this.solutionEffectiveness.clear();
    this.removeAllListeners();
    
    console.log(chalk.green('✅ Error messaging system disposed'));
  }
}

export default IntelligentErrorMessaging;