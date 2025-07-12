import { readFile } from 'fs/promises';
import { join } from 'path';
import { execa } from 'execa';
import chalk from 'chalk';
import waitPort from 'wait-port';
import { PreviewManager as LegacyPreviewManager } from '../lib/PreviewManager.js';
import { EnhancedYogaLayoutEngine } from '../lib/EnhancedYogaLayoutEngine.js';
import ProjectManager from '../core/ProjectManager.js';
import PreviewManager from '../core/PreviewManager.js';
import SmartFileHandler from '../ninja/SmartFileHandler.js';
import IncrementalYogaDiffing from '../ninja/IncrementalYogaDiffing.js';

export function createPreviewCommand(program) {
  program
    .command('preview')
    .description('Preview your project with hot reload')
    .option('-p, --port <port>', 'Port to run preview server on', '3000')
    .option('--no-open', 'Don\'t open browser automatically')
    .action((options) => {
      preview(options);
    });
}

export async function preview(options) {
  try {
    console.log(chalk.green('🌟 Starting Submitit preview with hot reload...'));
    
    // Initialize integrated systems
    const projectManager = new ProjectManager();
    const previewManager = new PreviewManager();
    const smartHandler = new SmartFileHandler();
    const yogaDiffing = new IncrementalYogaDiffing();
    
    console.log(chalk.blue('⚡ Initializing project systems...'));
    
    // Initialize all systems in parallel
    await Promise.all([
      projectManager.initializeProject('./'),
      previewManager.initialize('./'),
      smartHandler.initialize(),
      yogaDiffing.initializeEngine()
    ]);
    
    const config = projectManager.config;
    console.log(chalk.cyan(`📋 Project: ${config.name} (${config.theme} theme)`));
    
    // Get all project files
    const allFiles = Array.from(projectManager.files.values());
    console.log(chalk.blue(`📁 Found ${allFiles.length} files across ${projectManager.getAllRoles().length} roles`));
    
    // Show role distribution
    const roleStats = projectManager.getProjectStats();
    console.log(chalk.cyan('🎭 Content by role:'));
    for (const [role, stats] of Object.entries(roleStats.roles)) {
      const icon = getRoleIcon(role);
      console.log(chalk.gray(`   ${icon} ${role}: ${stats.count} files`));
    }
    
    // Process files with smart caching
    console.log(chalk.yellow('⚡ Processing files with Ninja-style caching...'));
    
    const fileProcessor = async (content, filePath) => {
      const fileInfo = projectManager.files.get(filePath);
      return {
        role: fileInfo?.role,
        metadata: fileInfo?.metadata,
        content: content,
        processed: true
      };
    };
    
    const processingResult = await smartHandler.processFiles(
      allFiles.map(f => f.path),
      fileProcessor,
      { incremental: true }
    );
    
    const metrics = smartHandler.getMetrics();
    console.log(chalk.green(`✅ Cache: ${(metrics.cacheHitRatio * 100).toFixed(1)}% hits`));
    
    // Calculate layouts with incremental diffing
    console.log(chalk.blue('🧘 Calculating layouts with Yoga incremental diffing...'));
    
    for (const file of allFiles) {
      const layoutProps = {
        width: getLayoutWidth(file.role),
        height: 'auto',
        padding: 1,
        role: file.role
      };
      
      await yogaDiffing.calculateIncrementalLayout(
        `preview-${file.path}`,
        layoutProps,
        `role-${file.role}`
      );
    }
    
    const yogaMetrics = yogaDiffing.getMetrics();
    console.log(chalk.green(`✅ Layout: ${(yogaMetrics.cacheHitRatio * 100).toFixed(1)}% cache hits`));
    
    // Start preview based on mode
    const previewOptions = {
      theme: options.theme || config.theme,
      mode: options.mode || 'desktop',
      enableBrowsh: options.ascii || options.terminal
    };
    
    if (options.ascii || options.terminal) {
      console.log(chalk.yellow('🖥️  Launching terminal preview with Browsh...'));
      previewOptions.enableBrowsh = true;
    } else {
      console.log(chalk.yellow('🌐 Launching web preview with hot reload...'));
    }
    
    const previewResult = await previewManager.startPreview(allFiles, previewOptions);
    
    console.log(chalk.green(`\n🎉 Preview is live!`));
    console.log(chalk.cyan(`   🌐 Web: ${previewResult.astroUrl}`));
    
    if (previewResult.browshUrl) {
      console.log(chalk.cyan(`   🖥️  Terminal: ${previewResult.browshUrl}`));
    }
    
    console.log(chalk.gray(`   🎨 Theme: ${previewResult.theme}`));
    console.log(chalk.gray(`   📱 Mode: ${previewResult.mode}`));
    
    // Auto-open if requested
    if (options.open) {
      console.log(chalk.blue('🚀 Opening preview in browser...'));
      const { spawn } = await import('child_process');
      spawn('open', [previewResult.astroUrl], { detached: true });
    }
    
    // Watch for changes if not in single-shot mode
    if (!options.build && !options.static) {
      console.log(chalk.yellow('\n👀 Watching for changes... Press Ctrl+C to stop.'));
      
      // Set up file watcher for hot reload
      const { watch } = await import('chokidar');
      const watcher = watch(['./content/**/*', './styles/**/*', './scripts/**/*'], {
        ignored: /node_modules|\..+/,
        persistent: true
      });
      
      watcher.on('change', async (filePath) => {
        console.log(chalk.blue(`🔄 File changed: ${filePath}`));
        
        try {
          // Re-register changed file
          await projectManager.registerFile(filePath);
          
          // Update preview
          const updatedFiles = Array.from(projectManager.files.values());
          await previewManager.updatePreview(updatedFiles, previewOptions);
          
          console.log(chalk.green('✅ Preview updated'));
        } catch (error) {
          console.error(chalk.red('❌ Error updating preview:'), error.message);
        }
      });
      
      // Graceful shutdown
      process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n🛑 Shutting down preview...'));
        await watcher.close();
        await previewManager.stopPreview();
        console.log(chalk.green('✅ Preview stopped'));
        process.exit(0);
      });
    }
    
    if (options.debug) {
      console.log('\n🔍 Debug Information:');
      console.log('Smart Handler Metrics:', metrics);
      console.log('Yoga Metrics:', yogaMetrics);
      console.log('Project Stats:', roleStats);
      console.log('Preview Status:', previewManager.getStatus());
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error starting preview:'), error.message);
    if (options.debug) {
      console.error(error.stack);
    }
    process.exit(1);
  }
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