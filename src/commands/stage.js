import { join } from 'path';
import chalk from 'chalk';
import { FileStagingModule } from '../modules/FileStagingModule/FileStagingModule.js';
import { neonTheme } from '../themes/neonTheme.js';

/**
 * Creates the stage command for the CLI
 * @param {Object} container - The DI container
 * @returns {Function} The command handler function
 */
export function createStageCommand(container) {
  return async (options = {}) => {
    try {
      console.log(chalk.blue('🚀 Launching File Staging Module...'));
      
      // Initialize the File Staging Module with the Neon theme
      const fileStagingModule = new FileStagingModule({
        theme: neonTheme,
        maxFileSize: options.maxSize || 10 * 1024 * 1024, // 10MB default
        allowedExtensions: options.extensions ? options.extensions.split(',') : null,
        basePath: process.cwd(),
        logger: container.resolve('logger')
      });

      // Start the file staging interface
      await fileStagingModule.start();
      
      console.log(chalk.green('✅ File staging completed successfully'));
    } catch (error) {
      console.error(chalk.red('❌ Error in file staging module:'), error.message);
      process.exit(1);
    }
  };
}

/**
 * Registers the stage command with the Commander program
 * @param {Object} program - The Commander program instance
 * @param {Object} container - The DI container
 */
export function registerStageCommand(program, container) {
  program
    .command('stage [path]')
    .description('Stage files for submission with interactive preview and validation')
    .option('-s, --max-size <size>', 'Maximum file size in MB', '10')
    .option('-e, --extensions <extensions>', 'Comma-separated list of allowed file extensions')
    .option('-r, --recursive', 'Include files in subdirectories', false)
    .action(async (path = '.', options) => {
      try {
        const stageCommand = createStageCommand(container);
        await stageCommand({
          ...options,
          path: join(process.cwd(), path),
          maxSize: parseInt(options.maxSize, 10) * 1024 * 1024 // Convert MB to bytes
        });
      } catch (error) {
        console.error(chalk.red('❌ Failed to execute stage command:'), error.message);
        process.exit(1);
      }
    });
}
