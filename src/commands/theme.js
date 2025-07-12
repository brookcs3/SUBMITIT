import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

const AVAILABLE_THEMES = {
  'default': {
    name: 'Default',
    description: 'Clean, simple styling with good contrast',
    colors: ['#333333', '#666666', '#999999'],
    typography: 'system-ui'
  },
  'noir': {
    name: 'Noir',
    description: 'Dark, sophisticated styling with high contrast',
    colors: ['#000000', '#333333', '#ffffff'],
    typography: 'serif'
  },
  'academic': {
    name: 'Academic',
    description: 'Professional layout suitable for academic work',
    colors: ['#2c3e50', '#34495e', '#7f8c8d'],
    typography: 'serif'
  },
  'brutalist': {
    name: 'Brutalist',
    description: 'Bold, geometric design with strong typography',
    colors: ['#ff0000', '#000000', '#ffffff'],
    typography: 'monospace'
  },
  'modern': {
    name: 'Modern',
    description: 'Clean, minimalist design with subtle animations',
    colors: ['#667eea', '#764ba2', '#f093fb'],
    typography: 'sans-serif'
  }
};

export function createThemeCommand(program) {
  program
    .command('theme [name]')
    .description('Set or list available themes')
    .action((name) => {
      if (name) {
        setTheme(name);
      } else {
        listThemes();
      }
    });
}

export async function setTheme(themeName) {
  try {
    console.log(chalk.green('🎨 Setting project theme...'));
    
    // Check if theme exists
    if (!AVAILABLE_THEMES[themeName]) {
      console.error(chalk.red(`❌ Theme "${themeName}" not found.`));
      console.log(chalk.yellow('Available themes:'));
      Object.entries(AVAILABLE_THEMES).forEach(([key, theme]) => {
        console.log(chalk.cyan(`  ${key}: ${theme.description}`));
      });
      process.exit(1);
    }
    
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
    
    // Update theme
    config.theme = themeName;
    config.themeConfig = AVAILABLE_THEMES[themeName];
    config.updated = new Date().toISOString();
    
    await writeFile(configPath, JSON.stringify(config, null, 2));
    
    const theme = AVAILABLE_THEMES[themeName];
    console.log(chalk.green(`✅ Theme set to: ${theme.name}`));
    console.log(chalk.gray(`   ${theme.description}`));
    console.log(chalk.cyan(`   Colors: ${theme.colors.join(', ')}`));
    console.log(chalk.cyan(`   Typography: ${theme.typography}`));
    
    console.log(chalk.yellow('💡 Run "submitit preview" to see your theme in action.'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error setting theme:'), error.message);
    process.exit(1);
  }
}

export function listThemes() {
  console.log(chalk.green('🎨 Available themes:'));
  Object.entries(AVAILABLE_THEMES).forEach(([key, theme]) => {
    console.log(chalk.cyan(`  ${key}: ${theme.name}`));
    console.log(chalk.gray(`    ${theme.description}`));
  });
}