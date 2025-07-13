import { join } from 'path';
import chalk from 'chalk';
import React from 'react';
import { render } from 'ink';
import FileStagingModule from '../modules/FileStagingModule/FileStagingModule.js';
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
      
      // Render the File Staging Module with Ink
      const { waitUntilExit } = render(
        <FileStagingModule 
          initialPath={join(process.cwd(), options.path || '.')}
          theme={neonTheme}
          onComplete={(files) => {
            console.log(chalk.green(`✅ Successfully staged ${files.length} files`));
            process.exit(0);
          }}
          onCancel={() => {
            console.log(chalk.yellow('❌ File staging cancelled'));
            process.exit(1);
          }}
        />
      );

      // Wait for the component to unmount
      await waitUntilExit();
      
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
    .action(async (path = '.', cmd) => {
      // The container parameter is intentionally unused but kept for future dependency injection
      // Prefix with underscore to indicate it's intentionally unused
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _unusedContainer = container;
      try {
        const stageCommand = createStageCommand(container);
        await stageCommand({
          path,
          maxSize: parseInt(cmd.maxSize, 10) * 1024 * 1024, // Convert MB to bytes
          extensions: cmd.extensions,
          recursive: cmd.recursive
        });
      } catch (error) {
        // Handle both Error objects and other thrown values
        const errorMessage = error && typeof error === 'object' && 'message' in error 
          ? error.message 
          : String(error);
        console.error(chalk.red('❌ Failed to execute stage command:'), errorMessage);
        
        // Log stack trace if available
        if (error && typeof error === 'object' && 'stack' in error) {
          console.error(chalk.gray(error.stack));
        }
        process.exit(1);
      }
    });
}
