/**
 * Submitit Build Command with Ninja Incremental Engine
 */
import NinjaIncrementalEngine from '../lib/NinjaIncrementalEngine.js';
import IncrementalYogaDiffing from '../ninja/IncrementalYogaDiffing.js';
import { buildProgressBar, trackFileProgress } from '../ui/buildProgress.js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { globalErrorHandler } from '../core/ErrorHandler.js';
import ProjectManager from '../core/ProjectManager.js';
import SmartFileHandler from '../ninja/SmartFileHandler.js';
import PackageManager from '../core/PackageManager.js';
import chalk from 'chalk';

export async function buildCommand(options = {}) {
  const engine = new NinjaIncrementalEngine();
  const yogaDiffing = new IncrementalYogaDiffing();
  const projectManager = new ProjectManager();
  const smartHandler = new SmartFileHandler();
  const packageManager = new PackageManager(options.outputDir || './dist');
  const progress = buildProgressBar();
  
  try {
    console.log(chalk.green('🚀 Building project with integrated systems...'));
    
    // Initialize all systems
    console.log(chalk.blue('⚡ Initializing build systems...'));
    await Promise.all([
      projectManager.initializeProject('./'),
      smartHandler.initialize(),
      yogaDiffing.initializeEngine()
    ]);
    
    const config = projectManager.config;
    await packageManager.initialize(config);
    
    console.log(chalk.cyan(`📋 Project: ${config.name} (${config.theme} theme)`));
    
    // Get all project files
    const allFiles = Array.from(projectManager.files.values());
    console.log(chalk.blue(`📁 Found ${allFiles.length} files across ${projectManager.getAllRoles().length} roles`));
    
    progress.start(allFiles.length);
    
    // Track file progress with engine events
    trackFileProgress(engine, progress);
    
    // Build with integrated engine
    const result = await globalErrorHandler.wrapAsync(
      'build-project',
      'build',
      async () => {
        const startTime = Date.now();
        
        // Smart file processing with caching
        console.log(chalk.yellow('⚡ Processing files with Ninja-style caching...'));
        
        const fileProcessor = async (content, filePath) => {
          const fileInfo = projectManager.files.get(filePath);
          return {
            content,
            role: fileInfo?.role,
            metadata: fileInfo?.metadata,
            processed: true
          };
        };
        
        const processingResult = await smartHandler.processFiles(
          allFiles.map(f => f.path),
          fileProcessor,
          { incremental: true }
        );
        
        const smartMetrics = smartHandler.getMetrics();
        console.log(chalk.green(`✅ Cache: ${(smartMetrics.cacheHitRatio * 100).toFixed(1)}% hits`));
        
        // Calculate layouts with incremental Yoga diffing
        console.log(chalk.blue('🧘 Calculating layouts with incremental diffing...'));
        const layoutResults = new Map();
        
        for (const file of allFiles) {
          const layoutProps = {
            width: getLayoutWidth(file.role),
            height: 'auto',
            padding: 1,
            role: file.role,
            content: file.content?.substring(0, 200) || ''
          };
          
          const layoutResult = await yogaDiffing.calculateIncrementalLayout(
            `build-${file.path}`,
            layoutProps,
            `role-${file.role}`
          );
          
          layoutResults.set(file.path, layoutResult);
          progress.update(allFiles.findIndex(f => f.path === file.path) + 1, 'processed');
        }
        
        const yogaMetrics = yogaDiffing.getMetrics();
        console.log(chalk.green(`✅ Layout: ${(yogaMetrics.cacheHitRatio * 100).toFixed(1)}% cache hits`));
        
        // Export with PackageManager
        console.log(chalk.magenta('📦 Exporting project with role-based organization...'));
        
        const exportResult = await packageManager.exportProject(allFiles, {
          streaming: options.streaming !== false,
          compress: options.compress,
          generateIndex: true,
          generateSitemap: true
        });
        
        const buildTime = Date.now() - startTime;
        
        // Legacy format for compatibility
        const legacyFiles = new Map();
        for (const file of allFiles) {
          legacyFiles.set(file.path, {
            content: file.content,
            role: file.role,
            metadata: file.metadata
          });
        }
        
        return {
          buildTime,
          files: legacyFiles,
          layouts: layoutResults,
          metrics: {
            incrementalRatio: smartMetrics.cacheHitRatio,
            processedFiles: smartMetrics.filesProcessed,
            cacheHits: smartMetrics.cacheHits
          },
          yogaMetrics,
          exportResult,
          smartMetrics
        };
      }
    );
    
    progress.complete();
    
    // Display comprehensive results
    console.log(chalk.green(`\n🎉 Build completed in ${result.buildTime}ms`));
    console.log(chalk.cyan(`📊 Processing: ${(result.metrics.incrementalRatio * 100).toFixed(1)}% incremental`));
    console.log(chalk.cyan(`🧘 Layout: ${(result.yogaMetrics.cacheHitRatio * 100).toFixed(1)}% cache hits`));
    console.log(chalk.cyan(`📦 Export: ${result.exportResult.files.length} files, ${result.exportResult.assets.length} assets`));
    
    // Show role distribution
    const roleStats = projectManager.getProjectStats();
    console.log(chalk.blue('\n📋 Build Summary:'));
    for (const [role, stats] of Object.entries(roleStats.roles)) {
      const icon = getRoleIcon(role);
      console.log(chalk.gray(`   ${icon} ${role}: ${stats.count} files (${formatFileSize(stats.totalSize)})`));
    }
    
    console.log(chalk.green(`\n📁 Output: ${packageManager.outputDir}`));
    
    // Validate role constraints
    const violations = projectManager.validateRoleConstraints();
    if (violations.length > 0) {
      console.log(chalk.yellow('\n⚠️  Role Constraint Warnings:'));
      violations.forEach(v => {
        if (v.issue === 'too_many_files') {
          console.log(chalk.yellow(`   ${v.role}: ${v.current}/${v.max} files (exceeds limit)`));
        }
      });
    }
    
    if (options.debug || options.debugBuild) {
      console.log(chalk.gray('\n🔍 Debug Information:'));
      console.log('Smart Handler Metrics:', result.smartMetrics);
      console.log('Yoga Layout Metrics:', result.yogaMetrics);
      console.log('Export Stats:', packageManager.getExportStats());
      
      if (options.debugLayout) {
        console.log('\n📐 Yoga Layout Tree:');
        yogaDiffing.debugLayoutTree();
      }
      
      if (options.debugCache) {
        console.log('\n💾 Cache Debug:');
        smartHandler.debugCache();
      }
    }
    
    return result;
    
  } catch (error) {
    progress.error();
    globalErrorHandler.handle(error, 'build-command');
    throw error;
  }
}

async function loadProjectFiles(dir) {
  const files = [];
  const entries = await readdir(dir);
  
  for (const entry of entries) {
    if (entry.endsWith('.md') || entry.endsWith('.txt')) {
      const path = join(dir, entry);
      const content = await readFile(path, 'utf8');
      files.push({ path, content });
    }
  }
  
  return files;
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

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// CLI usage snippet
export function registerBuildCommand(program) {
  program
    .command('build')
    .description('Build project with incremental optimization')
    .option('-d, --debug', 'Show debug information')
    .action(async (options) => {
      await buildCommand(options);
    });
}