import { writeFile, copyFile, stat } from 'node:fs/promises';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { globby } from 'globby';
import { EnhancedYogaLayoutEngine } from '../lib/EnhancedYogaLayoutEngine.js';
import { SmartFileHandlerSimple } from '../lib/SmartFileHandlerSimple.js';
import { Logger } from '../lib/Logger.js';
import SmartFileHandler from '../ninja/SmartFileHandler.js';
import IncrementalYogaDiffing from '../ninja/IncrementalYogaDiffing.js';
import PreviewManager from '../core/PreviewManager.js';

// Get directory name for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Type imports - using module path as declared in types.d.ts
/** @typedef {import('../types').FileInfo} FileInfo */
/** @typedef {import('../types').ProjectConfig} ProjectConfig */
/** @typedef {import('../types').ProcessingResult} ProcessingResult */
/** @typedef {import('../types').LayoutResult} LayoutResult */
/** @typedef {import('../types').AddOptions} AddOptions */
/** @typedef {import('../types/smart-file-handler').ProcessFileOptions} ProcessFileOptions */
/** @typedef {import('../types/smart-file-handler').ProcessFilesResult} ProcessFilesResult */

/**
 * Adds content to the project with semantic role detection
 * @param {string[]} files - Array of file paths to add
 * @param {AddOptions} [options={}] - Options for adding content
 * @returns {Promise<void>}
 * @throws {Error} If there's an error adding content
 */
export async function addContent(files, options = {}) {
  try {
    console.log(chalk.green('🚀 Adding content with semantic role detection...'));
    
    // Initialize project manager
      const projectManager = new ProjectManager();
    const smartHandler = new SmartFileHandler();
    const yogaDiffing = new IncrementalYogaDiffing();
    const previewManager = new PreviewManager();
    
    // Initialize systems with proper error handling
    try {
      await Promise.all([
        projectManager.initializeProject('./').catch(err => {
          console.error(chalk.red('❌ Failed to initialize project:'), err.message);
          throw err;
        }),
        smartHandler.initialize().catch(err => {
          console.error(chalk.red('❌ Failed to initialize SmartFileHandler:'), err.message);
          throw err;
        }),
        yogaDiffing.initializeEngine().catch(err => {
          console.error(chalk.red('❌ Failed to initialize Yoga engine:'), err.message);
          throw err;
        }),
        previewManager.initialize('./').catch(err => {
          console.error(chalk.red('❌ Failed to initialize PreviewManager:'), err.message);
          throw err;
        })
      ]);

      const config = projectManager.config || {};
    console.log(chalk.cyan(`📋 Project: ${config.name} (${config.theme} theme)`));
    
    // Expand glob patterns
    const expandedFiles = await globby(files, { absolute: true });
    
    if (expandedFiles.length === 0) {
      console.error(chalk.red('❌ No files found matching the specified patterns.'));
      process.exit(1);
    }
    
    console.log(chalk.blue(`🔍 Found ${expandedFiles.length} files to process`));
    
    const contentDir = join(process.cwd(), 'content');
    const addedFiles = [];
    const fileInfos = [];
    
    for (const filePath of expandedFiles) {
      const fileName = basename(filePath);
      const targetPath = join(contentDir, fileName);
      
      try {
        const stats = await stat(filePath);
        
        // Copy file to content directory
        await copyFile(filePath, targetPath);
        
        // Register file with ProjectManager for intelligent role detection
        const fileInfo = await projectManager.registerFile(targetPath, options.role);
        
        // Add to legacy format for compatibility
        const legacyInfo = {
          name: fileName,
          originalPath: filePath,
          type: getFileType(fileInfo.extension),
          role: fileInfo.role,
          size: formatFileSize(stats.size),
          added: new Date().toISOString()
        };
        
        addedFiles.push(legacyInfo);
        fileInfos.push(fileInfo);
        config.files = config.files || [];
        config.files.push(legacyInfo);
        
        console.log(chalk.green(`✅ ${fileName} → ${fileInfo.role} ${getRoleIcon(fileInfo.role)} (${legacyInfo.type})`));
        
        // Show role inference reasoning if verbose
        if (options.verbose && fileInfo.metadata) {
          console.log(chalk.gray(`   📊 ${fileInfo.metadata.wordCount} words, ${fileInfo.metadata.lineCount} lines`));
          if (fileInfo.metadata.images?.length > 0) {
            console.log(chalk.gray(`   🖼️  ${fileInfo.metadata.images.length} images`));
          }
        }
        
      } catch (/** @type {any} */ error) {
        console.error(chalk.red(`❌ Error adding ${fileName}:`), error?.message || 'Unknown error');
      }
    }
    
    // Save updated configuration
    await projectManager.saveConfig('./');
    
    // Smart file processing with Ninja-style caching
    console.log(chalk.yellow('⚡ Processing files with Ninja-style incremental engine...'));
    
    /**
     * @param {string} content
     * @param {string} filePath
     * @returns {Promise<{processed: boolean, role?: string, metadata?: any, dependencies: string[], content: string}>}
     */
    const fileProcessor = async (content, filePath) => {
      const fileInfo = fileInfos.find(f => f.path === filePath);
      return {
        processed: true,
        role: fileInfo?.role,
        metadata: fileInfo?.metadata,
        dependencies: fileInfo ? projectManager.dependencies.get(filePath) : [],
        content: content.substring(0, 500) // Sample for preview
      };
    };
    
    /** @type {ProcessFilesResult} */
    const processingResult = await smartHandler.processFiles(
      fileInfos.map(f => f.path),
      fileProcessor,
      { incremental: true, continueOnError: true }
    );
    
    // Show processing metrics
    const metrics = smartHandler.getMetrics();
    const processedCount = processingResult.results?.filter(r => r.success).length || 0;
    const errorCount = processingResult.errors?.length || 0;
    const totalFiles = fileInfos.length;
    
    console.log(chalk.cyan(`📊 Processed ${processedCount}/${totalFiles} files`));
    console.log(chalk.cyan(`⚡ Cache: ${(metrics.cacheHitRatio * 100).toFixed(1)}% hits (${metrics.cacheSize} entries)`));
    
    if (errorCount > 0) {
      console.log(chalk.yellow(`⚠️  ${errorCount} files had processing errors`));
      if (options.verbose) {
        processingResult.errors.forEach((error, index) => {
          const err = /** @type {Error} */ (error);
          console.log(chalk.yellow(`   ${index + 1}. ${err.message || 'Unknown error'}`));
          if ('stack' in err && options.debug) {
            console.log(chalk.gray(`      ${String(err.stack).split('\n').slice(0, 3).join('\n      ')}`));
          }
        });
      }
    }
    
    // Update layout using incremental Yoga diffing
    console.log(chalk.blue('🧘 Calculating layout with incremental Yoga diffing...'));
    
    /** @type {Map<string, import('../types').LayoutResult>} */
    const layoutUpdates = new Map();
    
    try {
      for (const fileInfo of fileInfos) {
        if (!fileInfo.path) {
          console.warn(chalk.yellow(`⚠️  Skipping file with missing path`));
          continue;
        }
        
        const layoutProps = {
          width: getLayoutWidth(fileInfo.role),
          height: 'auto',
          padding: 1,
          role: fileInfo.role,
          content: fileInfo.content?.substring(0, 200) || ''
        };
        
        try {
          const layoutResult = await yogaDiffing.calculateIncrementalLayout(
            `file-${fileInfo.path}`,
            layoutProps,
            `role-${fileInfo.role}`
          );
          
          if (layoutResult) {
            layoutUpdates.set(fileInfo.path, layoutResult);
          } else {
            console.warn(chalk.yellow(`⚠️  No layout result for ${fileInfo.path}`));
          }
        } catch (error) {
          const err = /** @type {Error} */ (error);
          console.error(chalk.red(`❌ Error calculating layout for ${fileInfo.path}:`), err.message);
          if (options.debug && 'stack' in err) {
            console.error(chalk.gray(String(err.stack)));
          }
        }
      }
    } catch (error) {
      const err = /** @type {Error} */ (error);
      console.error(chalk.red('❌ Error during layout calculation:'), err.message);
      if (options.debug && 'stack' in err) {
        console.error(chalk.gray(String(err.stack)));
      }
    }
    
    const yogaMetrics = yogaDiffing.getMetrics();
    console.log(chalk.green(`✅ Layout: ${(yogaMetrics.cacheHitRatio * 100).toFixed(1)}% cache hits`));
    
    // Generate preview if requested
    if (options.preview) {
      console.log(chalk.magenta('🌐 Generating live preview...'));
      
      try {
        const previewResult = await previewManager.startPreview(fileInfos, {
          theme: config?.theme || 'default',
          mode: 'desktop'
        });
        
        if (previewResult?.astroUrl) {
          console.log(chalk.green(`🎉 Preview available at: ${previewResult.astroUrl}`));
          
          // Auto-open if specified
          if (options.open) {
            try {
              const { spawn } = await import('node:child_process');
              spawn('open', [previewResult.astroUrl], { 
                detached: true,
                stdio: 'ignore'
              }).unref();
            } catch (openError) {
              const openErr = /** @type {Error} */ (openError);
              console.warn(chalk.yellow(`⚠️  Could not open preview in browser: ${openErr.message}`));
            }
          }
        } else {
          console.warn(chalk.yellow('⚠️  Preview URL not available'));
        }
      } catch (previewError) {
        const prevErr = /** @type {Error} */ (previewError);
        console.error(chalk.red('❌ Error generating preview:'), prevErr.message);
        if (options.debug && 'stack' in prevErr) {
          console.error(chalk.gray(String(prevErr.stack)));
        }
      }
    }
    
    // Show role distribution
    const roleStats = projectManager.getProjectStats();
    console.log(chalk.cyan('\n📋 Role Distribution:'));
    for (const [role, stats] of Object.entries(roleStats.roles)) {
      console.log(chalk.gray(`   ${getRoleIcon(role)} ${role}: ${stats.count} files (${formatFileSize(stats.totalSize)})`));
    }
    
    // Validate role constraints
    const violations = projectManager.validateRoleConstraints();
    if (violations.length > 0) {
      console.log(chalk.yellow('\n⚠️  Role Constraint Warnings:'));
      violations.forEach(v => {
        if (v.issue === 'too_many_files') {
          console.log(chalk.yellow(`   ${v.role}: ${v.current}/${v.max} files (exceeds limit)`));
        } else if (v.issue === 'invalid_extension') {
          console.log(chalk.yellow(`   ${v.file}: ${v.extension} not allowed for ${v.role}`));
        }
      });
    }
    
    console.log(chalk.green(`\n🎉 Successfully added ${addedFiles.length} files!`));
    console.log(chalk.yellow('💡 Run "submitit preview" to see your updated project.'));
    
    if (options.debug) {
      console.log('\n🔍 Debug Information:');
      console.log('Smart Handler Metrics:', metrics);
      console.log('Yoga Layout Metrics:', yogaMetrics);
      console.log('Project Stats:', roleStats);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red('❌ Error adding content:'), errorMessage);
    if (error instanceof Error && error.stack) {
      console.error(chalk.gray(error.stack));
    }
    throw error;
  }
}

/**
 * Determines the file type based on the extension
 * @param {string} extension - File extension (with or without dot)
 * @returns {string} File type category (image, video, document, etc.)
 */
function getFileType(extension) {
  const types = {
    '.pdf': 'document',
    '.doc': 'document',
    '.docx': 'document',
    '.txt': 'text',
    '.md': 'text',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.webp': 'image',
    '.mp3': 'audio',
    '.wav': 'audio',
    '.mp4': 'video',
    '.mov': 'video',
    '.avi': 'video'
  };
  
  return types[extension] || 'file';
}

/**
 * @param {string} type
 * @returns {string}
 */
function getDefaultRole(type) {
  const roles = {
    'image': 'gallery',
    'document': 'document',
    'text': 'about',
    'audio': 'media',
    'video': 'media'
  };

  return roles[type] || 'content';
}

/**
 * @param {number} bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * @param {ProjectConfig} config
 */
async function updateLayoutWithYoga(config) {
  const layoutPath = join(process.cwd(), 'layout.json');

  // Initialize Yoga layout engine
  const layoutEngine = new EnhancedYogaLayoutEngine();

  console.log(chalk.blue('🧘 Calculating optimal layout with Yoga...'));

  // Calculate layout using Yoga
  const layout = await layoutEngine.calculateLayout(1200, 800);

  if (layout) {
    // Save the generated layout
    await writeFile(layoutPath, JSON.stringify({
      layout: layout,
      generated: Date.now(),
      engine: 'yoga'
    }, null, 2));

    console.log(chalk.green('✅ Layout optimized using Yoga flexbox engine'));
  } else {
    console.log(chalk.yellow('⚠️  No layout generated'));
  }
}

/**
 * Processes files using the SmartFileHandler
 * @param {string[]} addedFiles - Array of file paths to process
 * @returns {Promise<ProcessFilesResult>} Processing results
 * @throws {Error} If processing fails
 */
async function processFilesWithSmartHandler(addedFiles) {
  console.log(chalk.yellow('[CONDUCTOR] Initializing file orchestration...'));

  const smartHandler = new SmartFileHandlerSimple();

  // Convert added files to format expected by SmartFileHandler
  const fileObjects = addedFiles.map(fileName => ({
    path: join(process.cwd(), 'content', fileName),
    name: fileName
  }));

  console.log(chalk.yellow('[CONDUCTOR] Mapping content symphony...'));
  const startTime = Date.now();

  // Process files with incremental change detection
  const results = await smartHandler.processFiles(fileObjects, {
    incremental: true,
    cache: true,
    analysis: true
  });

  const processingTime = Date.now() - startTime;

  // Report processing results
  console.log(chalk.green(`[CONDUCTOR] Orchestrated ${results.length} files in ${processingTime}ms`));

  // Show processing insights
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  if (successful > 0) {
    console.log(chalk.green(`🚀 ${successful} files processed successfully`));
  }

  if (failed > 0) {
    console.log(chalk.red(`❌ ${failed} files failed processing`));
  }

  // Show file type breakdown
  const typeBreakdown = results.reduce((acc, result) => {
    if (result.type) {
      acc[result.type] = (acc[result.type] || 0) + 1;
    }
    return acc;
  }, {});

  console.log(chalk.cyan('📊 File type analysis:'));
  Object.entries(typeBreakdown).forEach(([type, count]) => {
    console.log(chalk.gray(`   ${type}: ${count} files`));
  });

  // Performance stats
  const stats = smartHandler.getPerformanceStats();
  console.log(chalk.gray(`💾 Cache: ${stats.cacheSize} entries, Dependencies: ${stats.dependencyGraphSize} mappings`));
}

/**
 * @param {string} type
 * @returns {string}
 */
function getDefaultWidth(type) {
  const widths = {
    'image': '100%',
    'document': '800px',
    'text': '600px',
    'audio': '400px',
    'video': '800px'
  };

  return widths[type] || '100%';
}

/**
 * @param {string} type
 * @returns {string}
 */
function getDefaultHeight(type) {
  const heights = {
    'image': 'auto',
    'document': '600px',
    'text': 'auto',
    'audio': '60px',
    'video': '450px'
  };
  
  return heights[type] || 'auto';
}

/**
 * @param {string} role
 * @returns {string}
 */
function getRoleIcon(role) {
  const icons = {
    hero: '🌟',
    bio: '👤',
    resume: '📄',
    projects: '🛠️',
    gallery: '🖼️',
    contact: '📧',
    styles: '🎨',
    scripts: '⚙️',
    content: '📝',
    unknown: '❓'
  };
  return icons[role] || '📄';
}

/**
 * @param {string} role
 * @returns {number}
 */
function getLayoutWidth(role) {
  const widths = {
    hero: 100,
    bio: 80,
    resume: 90,
    projects: 85,
    gallery: 100,
    contact: 70,
    styles: 120,
    scripts: 120,
    content: 80
  };
  return widths[role] || 80;
}

/**
 * @param {any} container
 * @returns {(files: string[], options: AddOptions) => Promise<void>}
 */
export /**
 * Creates an add command function with dependency injection
 * @param {Object} container - Dependency injection container
 * @returns {(files: string[], options: AddOptions) => Promise<void>} The add command function
 */
function createAddCommand(container) {
  return async function addCommand(files = [], options = {}) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No files specified to add');
    }
    
    try {
      await addContent(files, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Add command failed:'), errorMessage);
      if (error instanceof Error && error.stack) {
        console.error(chalk.gray(error.stack));
      }
    }
  };
}

// Export the command function
export default createAddCommand({});

// Named exports for testing and other modules
export { createAddCommand };