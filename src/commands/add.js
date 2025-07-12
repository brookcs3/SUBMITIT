import { readFile, writeFile, copyFile, stat } from 'fs/promises';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { globby } from 'globby';
import { EnhancedYogaLayoutEngine } from '../lib/EnhancedYogaLayoutEngine.js';
import { SmartFileHandlerSimple } from '../lib/SmartFileHandlerSimple.js';
import ProjectManager from '../core/ProjectManager.js';
import SmartFileHandler from '../ninja/SmartFileHandler.js';
import IncrementalYogaDiffing from '../ninja/IncrementalYogaDiffing.js';
import PreviewManager from '../core/PreviewManager.js';

export async function addContent(files, options) {
  try {
    console.log(chalk.green('🚀 Adding content with semantic role detection...'));
    
    // Initialize project manager
    const projectManager = new ProjectManager();
    const smartHandler = new SmartFileHandler();
    const yogaDiffing = new IncrementalYogaDiffing();
    const previewManager = new PreviewManager();
    
    // Initialize systems
    await Promise.all([
      projectManager.initializeProject('./'),
      smartHandler.initialize(),
      yogaDiffing.initializeEngine(),
      previewManager.initialize('./')
    ]);
    
    const config = projectManager.config;
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
        
      } catch (error) {
        console.error(chalk.red(`❌ Error adding ${fileName}:`, error.message));
      }
    }
    
    // Save updated configuration
    await projectManager.saveConfig('./');
    
    // Smart file processing with Ninja-style caching
    console.log(chalk.yellow('⚡ Processing files with Ninja-style incremental engine...'));
    
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
    
    const processingResult = await smartHandler.processFiles(
      fileInfos.map(f => f.path),
      fileProcessor,
      { incremental: true, continueOnError: true }
    );
    
    // Show processing metrics
    const metrics = smartHandler.getMetrics();
    console.log(chalk.cyan(`📊 Processed ${processingResult.results.length}/${fileInfos.length} files`));
    console.log(chalk.cyan(`⚡ Cache: ${(metrics.cacheHitRatio * 100).toFixed(1)}% hits (${metrics.cacheSize} entries)`));
    
    if (processingResult.errors.length > 0) {
      console.log(chalk.yellow(`⚠️  ${processingResult.errors.length} files had processing errors`));
    }
    
    // Update layout using incremental Yoga diffing
    console.log(chalk.blue('🧘 Calculating layout with incremental Yoga diffing...'));
    
    const layoutUpdates = new Map();
    for (const fileInfo of fileInfos) {
      const layoutProps = {
        width: getLayoutWidth(fileInfo.role),
        height: 'auto',
        padding: 1,
        role: fileInfo.role,
        content: fileInfo.content?.substring(0, 200) || ''
      };
      
      const layoutResult = await yogaDiffing.calculateIncrementalLayout(
        `file-${fileInfo.path}`,
        layoutProps,
        `role-${fileInfo.role}`
      );
      
      layoutUpdates.set(fileInfo.path, layoutResult);
    }
    
    const yogaMetrics = yogaDiffing.getMetrics();
    console.log(chalk.green(`✅ Layout: ${(yogaMetrics.cacheHitRatio * 100).toFixed(1)}% cache hits`));
    
    // Generate preview if requested
    if (options.preview) {
      console.log(chalk.magenta('🌐 Generating live preview...'));
      
      const previewResult = await previewManager.startPreview(fileInfos, {
        theme: config.theme,
        mode: 'desktop'
      });
      
      console.log(chalk.green(`🎉 Preview available at: ${previewResult.astroUrl}`));
      
      // Auto-open if specified
      if (options.open) {
        const { spawn } = await import('child_process');
        spawn('open', [previewResult.astroUrl], { detached: true });
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
    console.error(chalk.red('❌ Error adding content:'), error.message);
    process.exit(1);
  }
}

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

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function updateLayoutWithYoga(config) {
  const layoutPath = join(process.cwd(), 'layout.json');
  
  // Initialize Yoga layout engine
  const layoutEngine = new EnhancedYogaLayoutEngine();
  await layoutEngine.initializeEngine();
  
  console.log(chalk.blue('🧘 Calculating optimal layout with Yoga...'));
  
  // Generate responsive layout using Yoga
  const layout = await layoutEngine.generateResponsiveLayout(config.files, {
    theme: config.theme,
    responsive: true,
    optimize: true
  });
  
  // Save the generated layout
  await writeFile(layoutPath, JSON.stringify({ 
    layout: layout,
    generated: Date.now(),
    engine: 'yoga'
  }, null, 2));
  
  console.log(chalk.green('✅ Layout optimized using Yoga flexbox engine'));
}

async function processFilesWithSmartHandler(config, addedFiles) {
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

// Export factory function for CLI integration
export function createAddCommand(container) {
  return async (files, options) => {
    return await addContent(files, options);
  };
}