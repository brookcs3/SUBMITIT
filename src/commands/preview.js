import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';
import chalk from 'chalk';
import waitPort from 'wait-port';
import { PreviewManager as LegacyPreviewManager } from '../lib/PreviewManager.js';
import { EnhancedYogaLayoutEngine } from '../lib/EnhancedYogaLayoutEngine.js';
import ProjectManager from '../core/ProjectManager.js';
import PreviewManager from '../core/PreviewManager.js';
import SmartFileHandler from '../ninja/SmartFileHandler.js';
import IncrementalYogaDiffing from '../ninja/IncrementalYogaDiffing.js';

// ESM compatible __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @typedef {Object} PreviewOptions
 * @property {string} [port] - Port to run the preview server on
 * @property {boolean} [open] - Whether to open browser automatically
 * @property {string} [host] - Host to bind the server to
 * @property {boolean} [https] - Whether to use HTTPS
 * @property {string} [cert] - Path to SSL certificate
 * @property {string} [key] - Path to SSL key
 */

/**
 * @typedef {Object} FileInfo
 * @property {string} path - File path
 * @property {string} role - File role
 * @property {Object} [metadata] - File metadata
 * @property {string} [content] - File content
 */

/**
 * @typedef {Object} ProcessedFile
 * @property {string} [role] - File role
 * @property {Object} [metadata] - File metadata
 * @property {string} [content] - File content
 * @property {boolean} processed - Whether the file was processed
 */

/**
 * @typedef {Object} ProcessingMetrics
 * @property {number} cacheHitRatio - Cache hit ratio (0-1)
 * @property {number} totalFiles - Total files processed
 * @property {number} cacheHits - Number of cache hits
 * @property {number} cacheMisses - Number of cache misses
 */

/**
 * @typedef {Object} LayoutMetrics
 * @property {number} cacheHitRatio - Layout cache hit ratio (0-1)
 * @property {number} totalLayouts - Total layouts calculated
 * @property {number} cacheHits - Number of layout cache hits
 * @property {number} cacheMisses - Number of layout cache misses
 */

/**
 * Create a preview command for the CLI
 * @param {import('commander').Command} program - Commander program instance
 * @returns {import('commander').Command} Configured command
 */
export function createPreviewCommand(program) {
  return program
    .command('preview')
    .description('Preview your project with hot reload')
    .option('-p, --port <port>', 'Port to run preview server on', '3000')
    .option('--no-open', 'Don\'t open browser automatically')
    .option('--host <host>', 'Host to bind the server to', 'localhost')
    .option('--https', 'Enable HTTPS')
    .option('--cert <path>', 'Path to SSL certificate')
    .option('--key <path>', 'Path to SSL key')
    .action((options) => {
      preview(options).catch(error => {
        console.error(chalk.red('❌ Preview failed:'), error.message);
        process.exit(1);
      });
    });
}

/**
 * Preview the project with hot reload
 * @param {PreviewOptions} options - Preview options
 * @returns {Promise<void>}
 */
export async function preview(options) {
  try {
    console.log(chalk.green('🌟 Starting Submitit preview with hot reload...'));
    
    // Initialize integrated systems
    /** @type {ProjectManager} */
    const projectManager = new ProjectManager();
    /** @type {PreviewManager} */
    const previewManager = new PreviewManager();
    /** @type {SmartFileHandler} */
    const smartHandler = new SmartFileHandler();
    /** @type {IncrementalYogaDiffing} */
    const yogaDiffing = new IncrementalYogaDiffing();
    
    console.log(chalk.blue('⚡ Initializing project systems...'));
    
    try {
      // Initialize all systems in parallel
      await Promise.all([
        projectManager.initializeProject('./'),
        previewManager.initialize('./'),
        smartHandler.initialize(),
        yogaDiffing.initializeEngine()
      ]);
      
      const config = projectManager.config;
      if (!config) {
        throw new Error('Failed to load project configuration');
      }
      
      console.log(chalk.cyan(`📋 Project: ${config.name || 'Unnamed Project'} (${config.theme || 'default'} theme)`));
      
      // Get all project files
      const allFiles = Array.from(projectManager.files?.values() || []);
      console.log(chalk.blue(`📁 Found ${allFiles.length} files across ${projectManager.getAllRoles?.()?.length || 0} roles`));
      
      // Show role distribution if available
      const roleStats = projectManager.getProjectStats?.() || { roles: {} };
      if (roleStats?.roles) {
        console.log(chalk.cyan('🎭 Content by role:'));
        for (const [role, stats] of Object.entries(roleStats.roles)) {
          const icon = getRoleIcon(role);
          console.log(chalk.gray(`   ${icon} ${role}: ${stats?.count || 0} files`));
        }
      }
      
      // Process files with smart caching if we have files
      if (allFiles.length > 0) {
        console.log(chalk.yellow('⚡ Processing files with Ninja-style caching...'));
        
        /**
         * Process a single file
         * @param {string} content - File content
         * @param {string} filePath - File path
         * @returns {Promise<ProcessedFile>} Processed file info
         */
        const fileProcessor = async (content, filePath) => {
          const fileInfo = projectManager.files?.get(filePath);
          return {
            role: fileInfo?.role,
            metadata: fileInfo?.metadata,
            content: content,
            processed: true
          };
        };
        
        await smartHandler.processFiles(
          allFiles.map(f => f.path).filter(Boolean),
          fileProcessor,
          { incremental: true }
        );
        
        const metrics = smartHandler.getMetrics?.() || { cacheHitRatio: 0 };
        console.log(chalk.green(`✅ Cache: ${((metrics.cacheHitRatio || 0) * 100).toFixed(1)}% hits`));
        
        // Calculate layouts with incremental diffing if available
        if (yogaDiffing.calculateIncrementalLayout) {
          console.log(chalk.blue('🧘 Calculating layouts with Yoga incremental diffing...'));
          
          for (const file of allFiles) {
            if (!file?.path || !file?.role) continue;
            
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
          
          const yogaMetrics = yogaDiffing.getMetrics?.() || { cacheHitRatio: 0 };
          console.log(chalk.green(`✅ Layout: ${((yogaMetrics.cacheHitRatio || 0) * 100).toFixed(1)}% cache hits`));
        }
    
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
  
  // Start the preview server
  const port = parseInt(options.port || 3000, 10);
  const host = options.host || 'localhost';
  
  console.log(chalk.blue(`\n🌍 Starting preview server on ${host}:${port}...`));
  
  try {
    const serverProcess = execa('node', [
      '--experimental-json-modules',
      join(__dirname, '../server.js'),
      '--port', port.toString(),
      '--host', host,
      ...(options.https ? ['--https'] : []),
      ...(options.cert ? ['--cert', options.cert] : []),
      ...(options.key ? ['--key', options.key] : []),
      '--hot'
    ], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        ENABLE_HOT_RELOAD: 'true'
      }
    });

    // Handle server process exit
    serverProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(chalk.red(`❌ Preview server exited with code ${code}`));
      } else {
        console.log(chalk.green('\n👋 Preview server stopped'));
      }
    });

    // Wait for server to start
    await waitPort({
      port: port,
      host: host,
      timeout: 15000 // Increased timeout for slower systems
    });

    // Open browser if not disabled
    if (options.open !== false) {
      try {
        const open = (await import('open')).default;
        const protocol = options.https ? 'https' : 'http';
        await open(`${protocol}://${host}:${port}`);
      } catch (openError) {
        console.warn(chalk.yellow('⚠️  Could not open browser automatically'));
        console.warn(chalk.gray(`   You can access the preview at: ${options.https ? 'https' : 'http'}://${host}:${port}`));
      }
    } else {
      console.log(chalk.cyan(`\n🔗 Preview available at: ${options.https ? 'https' : 'http'}://${host}:${port}`));
    }

    // Handle process termination
    const shutdown = () => {
      console.log(chalk.yellow('\n🛑 Stopping preview server...'));
      serverProcess.kill('SIGTERM', {
        forceKillAfterTimeout: 2000
      });
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Keep the process alive
    await new Promise(() => {});
    
  } catch (serverError) {
    console.error(chalk.red('❌ Failed to start preview server:'), serverError.message);
    throw serverError;
  }
}

/**
 * Get an icon for a given role
 * @param {string} role - Role name
 * @returns {string} Icon for the role
 */
function getRoleIcon(role) {
  const icons = new Map([
    ['header', '📜'],
    ['footer', '👣'],
    ['sidebar', '📌'],
    ['content', '📝'],
    ['navigation', '🧭'],
    ['meta', '🏷️'],
    ['asset', '🖼️'],
    ['style', '🎨'],
    ['script', '📜'],
    ['template', '📋'],
    ['config', '⚙️'],
    ['test', '🧪'],
    ['documentation', '📚'],
    ['i18n', '🌐']
  ]);
  
  return icons.get(role) || '📄';
}

/**
 * Get the layout width for a given role
 * @param {string} role - Role name
 * @returns {string} CSS width value
 */
function getLayoutWidth(role) {
  const widths = new Map([
    ['header', '100%'],
    ['footer', '100%'],
    ['sidebar', '250px'],
    ['content', '1fr'],
    ['navigation', '100%']
  ]);
  
  return widths.get(role) || '1fr';
}