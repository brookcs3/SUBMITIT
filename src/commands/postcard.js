import { readFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';
import { PostCardGenerator } from '../lib/PostCardGenerator.js';

export function createPostcardCommand(program) {
  program
    .command('postcard')
    .description('Generate a post card preview')
    .option('-o, --output <path>', 'Output path for the post card')
    .option('-f, --format <format>', 'Output format (png, svg, html)', 'png')
    .action((options) => {
      postcard(options);
    });
}

export async function postcard(options) {
  try {
    console.log(chalk.green('📬 Generating Post Card...'));
    
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
    
    // Load layout data if available
    let layoutData = null;
    try {
      const layoutPath = join(process.cwd(), 'layout.json');
      const layoutContent = await readFile(layoutPath, 'utf8');
      layoutData = JSON.parse(layoutContent);
      console.log(chalk.green('🧘 Using Yoga layout engine data'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ No layout.json found, using basic layout'));
    }
    
    const generator = new PostCardGenerator();
    
    const postCardOptions = {
      outputDir: options.output || join(process.cwd(), 'postcards'),
      format: options.format || 'html',
      compact: options.compact || false
    };
    
    console.log(chalk.yellow('🎨 Creating polished post card deliverable...'));
    
    if (options.all) {
      // Generate all variations
      const results = await generator.generatePostCardVariations(config, layoutData, postCardOptions.outputDir);
      
      console.log(chalk.green('🎉 Post card variations generated!'));
      results.forEach(result => {
        console.log(chalk.cyan(`📄 ${result.format.toUpperCase()}: ${result.path}`));
        console.log(chalk.gray(`   Size: ${formatFileSize(result.size)} • ${result.dimensions.width}x${result.dimensions.height}px`));
        if (result.note) {
          console.log(chalk.yellow(`   Note: ${result.note}`));
        }
      });
    } else {
      // Generate single post card
      const result = await generator.generatePostCard(config, layoutData, postCardOptions);
      
      console.log(chalk.green('🎉 Post card generated!'));
      console.log(chalk.cyan(`📄 Format: ${result.format.toUpperCase()}`));
      console.log(chalk.cyan(`📁 Path: ${result.path}`));
      console.log(chalk.cyan(`📊 Size: ${formatFileSize(result.size)}`));
      console.log(chalk.cyan(`📐 Dimensions: ${result.dimensions.width}x${result.dimensions.height}px`));
      
      if (result.note) {
        console.log(chalk.yellow(`💡 ${result.note}`));
      }
      
      if (result.instructionsPath) {
        console.log(chalk.cyan(`📝 Instructions: ${result.instructionsPath}`));
      }
    }
    
    // Post card celebration
    console.log(chalk.green('📬 Post Card Complete! A polished, intentional deliverable.'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error generating post card:'), error.message);
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