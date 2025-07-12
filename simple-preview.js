#!/usr/bin/env node

/**
 * Simple preview command that actually works
 * No Astro, no hot reload, just serve the HTML file
 */

import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import chalk from 'chalk';

export async function simplePreview(options = {}) {
  const port = options.port || 3000;
  
  try {
    console.log(chalk.green('🌐 Starting preview server...'));
    
    // Check if build exists
    const htmlPath = join(process.cwd(), 'output', 'index.html');
    try {
      await stat(htmlPath);
    } catch (error) {
      console.error(chalk.red('❌ No build found. Run build command first.'));
      console.log(chalk.yellow('💡 Try: node ../simple-build.js build'));
      process.exit(1);
    }
    
    const server = createServer(async (req, res) => {
      try {
        let filePath;
        
        if (req.url === '/' || req.url === '/index.html') {
          filePath = htmlPath;
        } else {
          // Serve other files from output directory
          filePath = join(process.cwd(), 'output', req.url.slice(1));
        }
        
        const content = await readFile(filePath, 'utf8');
        const contentType = getContentType(filePath);
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        
        console.log(chalk.blue(`📄 Served ${req.url}`));
        
      } catch (error) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>404 Not Found</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 2rem;">
              <h1>404 - File Not Found</h1>
              <p>The requested file could not be found.</p>
              <a href="/">← Back to home</a>
            </body>
          </html>
        `);
        console.log(chalk.red(`❌ 404: ${req.url}`));
      }
    });
    
    server.listen(port, () => {
      console.log(chalk.green('🚀 Preview server running!'));
      console.log(chalk.cyan(`📱 Local: http://localhost:${port}`));
      console.log(chalk.yellow('👀 Press Ctrl+C to stop'));
    });
    
    // Handle shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛑 Shutting down preview server...'));
      server.close(() => {
        console.log(chalk.green('✅ Server stopped'));
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error(chalk.red('❌ Preview error:'), error.message);
    process.exit(1);
  }
}

function getContentType(filePath) {
  const ext = extname(filePath).toLowerCase();
  
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  
  return types[ext] || 'text/plain';
}

// If run directly
if (process.argv[2] === 'preview') {
  simplePreview({ port: process.argv[3] || 3000 });
}