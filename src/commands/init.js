import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { EnhancedYogaLayoutEngine } from '../lib/EnhancedYogaLayoutEngine.js';

// ESM compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @typedef {Object} InitOptions
 * @property {string} [theme] - Theme for the project
 * @property {string} [author] - Author of the project
 * @property {boolean} [typescript] - Whether to use TypeScript
 */

/**
 * @typedef {Object} ProjectConfig
 * @property {string} name - Project name
 * @property {string} theme - Theme name
 * @property {string} created - ISO timestamp of creation
 * @property {Object} layout - Layout configuration
 * @property {string} layout.type - Layout type (e.g., 'column')
 * @property {Array} [layout.children] - Child elements
 * @property {Array} files - Project files
 * @property {Object} metadata - Project metadata
 * @property {string} metadata.title - Project title
 * @property {string} metadata.description - Project description
 * @property {string} metadata.author - Project author
 */

// Container-style export for DI integration
/**
 * Create an init command function
 * @param {Object} container - Dependency injection container
 * @returns {Function} Init command function
 */
export function createInitCommand(container) {
  return async (name, options) => {
    return await initProject(name, options);
  };
}

/**
 * Initialize a new submitit project
 * @param {string} name - Project name
 * @param {InitOptions} options - Initialization options
 * @returns {Promise<void>}
 */
export async function initProject(name, options = {}) {
  if (!name || typeof name !== 'string') {
    throw new Error('Project name is required and must be a string');
  }

  const projectPath = join(process.cwd(), name);
  
  try {
    // Validate options
    const validatedOptions = {
      theme: options.theme || 'default',
      author: options.author || process.env.USER || 'Unknown',
      typescript: Boolean(options.typescript)
    };
    console.log(chalk.green('🧘 Initializing new submitit project...'));
    
    // Create project directory
    await mkdir(projectPath, { recursive: true });
    
    // Create subdirectories
    await mkdir(join(projectPath, 'content'), { recursive: true });
    await mkdir(join(projectPath, 'output'), { recursive: true });
    await mkdir(join(projectPath, 'astro'), { recursive: true });
    
    // Initialize Yoga layout engine
    const layoutEngine = new EnhancedYogaLayoutEngine();
    await layoutEngine.initializeEngine();
    
    /** @type {ProjectConfig} */
    const config = {
      name,
      theme: validatedOptions.theme,
      created: new Date().toISOString(),
      layout: {
        type: 'column',
        children: []
      },
      files: [],
      metadata: {
        title: name,
        description: `${name} - Created with submitit`,
        author: validatedOptions.author
      }
    };
    
    await writeFile(
      join(projectPath, 'submitit.config.json'),
      JSON.stringify(config, null, 2)
    );
    
    // Create layout file
    await writeFile(
      join(projectPath, 'layout.json'),
      JSON.stringify({ layout: config.layout }, null, 2)
    );
    
    console.log(chalk.green('✅ Project initialized successfully!'));
    console.log(chalk.cyan(`📁 Project created at: ${projectPath}`));
    console.log(chalk.yellow('🎯 Next steps:'));
    console.log(chalk.white('  1. cd ' + name));
    console.log(chalk.white('  2. submitit add <files>'));
    console.log(chalk.white('  3. submitit preview'));
    console.log(chalk.white('  4. submitit export'));
    
  } catch (/** @type {any} */ error) {
    console.error(chalk.red('❌ Error initializing project:'), error?.message || 'Unknown error');
    // @ts-ignore - stack is optional but commonly available
    if (error?.stack) console.error(chalk.gray(error.stack));
    process.exit(1);
  }
}