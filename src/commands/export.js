import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';
import { PackageManager } from '../lib/PackageManager.js';
import { EnhancedYogaLayoutEngine } from '../lib/EnhancedYogaLayoutEngine.js';
import { PreviewManager } from '../lib/PreviewManager.js';

export function createExportCommand(program) {
  program
    .command('export')
    .description('Export your project as a deliverable package')
    .option('-o, --output <path>', 'Output path for the export')
    .option('-f, --format <format>', 'Export format (zip, tar)', 'zip')
    .option('-n, --name <name>', 'Custom name for the export')
    .action((options) => {
      exportProject(options);
    });
}

export async function exportProject(options) {
  try {
    console.log(chalk.green('📦 Exporting project...'));
    
    // Check if we're in a submitit project
    const configPath = join(process.cwd(), 'submitit.config.json');
    let config;
    
    try {
      const configData = await readFile(configPath, 'utf8');
      config = JSON.parse(configData);
    } catch (error) {
      console.error(chalk.red('❌ Not in a submitit project directory. Run "submitit init <name>" first.'));
      process.exit(1);
    }
    
    console.log(chalk.blue('⚡ Initializing layout engine for export optimization...'));
    const layoutEngine = new EnhancedYogaLayoutEngine();
    const layoutData = await layoutEngine.generateLayoutData(config);
    
    console.log(chalk.blue('🎨 Generating preview for export...'));
    const previewManager = new PreviewManager();
    await previewManager.initialize(layoutData);
    
    const packageManager = new PackageManager();
    
    const exportOptions = {
      outputPath: options.output || join(process.cwd(), 'output'),
      format: options.format || 'zip',
      customName: options.name,
      includeSource: true,
      includePreview: true,
      layoutData: layoutData,
      optimizeForDelivery: true
    };
    
    console.log(chalk.yellow('📦 Packaging files...'));
    
    const result = await packageManager.exportProject(config, exportOptions, (progress) => {
      const percent = Math.round(progress.percent);
      console.log(chalk.blue(`📊 Progress: ${percent}% (${progress.processedBytes}/${progress.totalBytes} bytes)`));
    });
    
    // Generate manifest with layout optimization data
    const manifest = {
      project: config.name,
      exported: new Date().toISOString(),
      files: config.files.map(f => ({
        name: f.name,
        type: f.type,
        role: f.role,
        size: f.size
      })),
      theme: config.theme,
      format: exportOptions.format,
      packageSize: result.size,
      packagePath: result.path,
      layoutOptimization: {
        strategy: layoutData.strategy,
        performance: layoutData.performance,
        responsiveBreakpoints: layoutData.responsiveBreakpoints,
        optimizedForTerminal: true,
        yogaEngineVersion: '2.0.1'
      },
      deliveryMetrics: {
        compressionRatio: result.compressionRatio || 1,
        totalProcessingTime: result.processingTime || 0,
        filesProcessed: config.files.length
      }
    };
    
    await writeFile(
      join(exportOptions.outputPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log(chalk.green('🎉 Export complete!'));
    console.log(chalk.cyan(`📁 Package: ${result.path}`));
    console.log(chalk.cyan(`📊 Size: ${formatFileSize(result.size)}`));
    console.log(chalk.cyan(`📝 Manifest: ${join(exportOptions.outputPath, 'manifest.json')}`));
    
    // Celebration animation
    console.log(chalk.green('🧘 Submission Complete. You may now step away from the terminal.'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error exporting project:'), error.message);
    process.exit(1);
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}