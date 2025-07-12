#!/usr/bin/env node

/**
 * Simple build command that actually works
 * No Ninja, no incremental diffing, just read files and generate HTML
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

export async function simpleBuild(options = {}) {
  try {
    console.log(chalk.green('🔨 Building project...'));
    
    // Read config
    const configPath = join(process.cwd(), 'submitit.config.json');
    let config;
    
    try {
      const configData = await readFile(configPath, 'utf8');
      config = JSON.parse(configData);
    } catch (error) {
      console.error(chalk.red('❌ Not in a submitit project. Run submitit init first.'));
      process.exit(1);
    }
    
    // Create output directory
    await mkdir(join(process.cwd(), 'output'), { recursive: true });
    
    // Read all content files
    const content = {};
    for (const file of config.files) {
      try {
        const filePath = join(process.cwd(), 'content', file.name);
        const fileContent = await readFile(filePath, 'utf8');
        content[file.role] = {
          content: fileContent,
          type: file.type,
          name: file.name
        };
        console.log(chalk.blue(`📄 Read ${file.name}`));
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Could not read ${file.name}`));
      }
    }
    
    // Generate simple HTML
    const html = generateHTML(config, content);
    
    // Write HTML file
    const outputPath = join(process.cwd(), 'output', 'index.html');
    await writeFile(outputPath, html);
    
    console.log(chalk.green('✅ Build complete!'));
    console.log(chalk.cyan(`📁 Output: ${outputPath}`));
    console.log(chalk.cyan(`🎨 Theme: ${config.theme}`));
    console.log(chalk.cyan(`📄 Files: ${config.files.length}`));
    
  } catch (error) {
    console.error(chalk.red('❌ Build error:'), error.message);
    process.exit(1);
  }
}

function generateHTML(config, content) {
  const theme = getThemeCSS(config.theme);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.name}</title>
  <style>${theme}</style>
</head>
<body>
  <div class="container">
    <header class="hero">
      ${renderContent(content.hero)}
    </header>
    
    <main class="content">
      ${renderContent(content.bio)}
      ${renderContent(content.projects)}
      ${renderContent(content.resume)}
      
      ${Object.entries(content)
        .filter(([role]) => !['hero', 'bio', 'projects', 'resume'].includes(role))
        .map(([role, data]) => `<section class="${role}">${renderContent(data)}</section>`)
        .join('')}
    </main>
    
    <footer class="contact">
      ${renderContent(content.contact)}
    </footer>
  </div>
</body>
</html>`;
}

function renderContent(data) {
  if (!data) return '';
  
  if (data.type === 'markdown') {
    // Simple markdown to HTML conversion
    return data.content
      .replace(/^# (.*)/gm, '<h1>$1</h1>')
      .replace(/^## (.*)/gm, '<h2>$1</h2>')
      .replace(/^### (.*)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<h|<\/p>)(.+)/gm, '<p>$1')
      .replace(/<p><\/p>/g, '');
  }
  
  return `<div>${data.content}</div>`;
}

function getThemeCSS(theme) {
  const themes = {
    default: `
      body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; background: #fff; }
      .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
      .hero { text-align: center; margin-bottom: 3rem; }
      .content section { margin-bottom: 2rem; }
      h1 { color: #2c3e50; }
      h2 { color: #3498db; border-bottom: 2px solid #ecf0f1; }
    `,
    neon: `
      body { font-family: 'Courier New', monospace; background: #0d1117; color: #8fbfff; }
      .container { max-width: 800px; margin: 0 auto; padding: 2rem; border: 1px solid #6aa9ff; }
      .hero { text-align: center; margin-bottom: 3rem; border: 1px solid #4d7dff; padding: 1rem; }
      h1 { color: #8fbfff; text-shadow: 0 0 10px #6aa9ff; }
      h2 { color: #6aa9ff; border-bottom: 1px solid #4d7dff; }
      a { color: #4d7dff; }
    `,
    crt: `
      body { font-family: 'Courier New', monospace; background: #00110a; color: #35ff6d; }
      .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
      .hero { text-align: center; margin-bottom: 3rem; border: 1px solid #00ff41; padding: 1rem; }
      h1 { color: #35ff6d; text-shadow: 0 0 10px #00ff41; }
      h2 { color: #00ff41; }
    `
  };
  
  return themes[theme] || themes.default;
}

// If run directly
if (process.argv[2] === 'build') {
  simpleBuild();
}