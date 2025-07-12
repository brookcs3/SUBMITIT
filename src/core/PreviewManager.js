/**
 * PreviewManager - Launch Astro & Browsh previews with hot reload
 */
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile, mkdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { globalErrorHandler } from './ErrorHandler.js';
import { createMemoComponent } from '../ninja/MemoizedInkRenderer.js';

const execAsync = promisify(exec);

export class PreviewManager {
  constructor() {
    this.astroProcess = null;
    this.browshProcess = null;
    this.previewPort = 4321;
    this.browshPort = 8080;
    this.isRunning = false;
    this.hotReloadClients = new Set();
    this.previewCache = new Map();
    this.layoutModes = ['desktop', 'mobile', 'terminal'];
    this.currentMode = 'desktop';
  }

  /**
   * Initialize preview system
   */
  async initialize(projectPath = './') {
    try {
      await this.setupAstroProject(projectPath);
      await this.setupHotReload();
      return true;
    } catch (error) {
      throw globalErrorHandler.createError(
        'PREVIEW_INIT_ERROR',
        `Failed to initialize preview: ${error.message}`,
        { projectPath }
      );
    }
  }

  /**
   * Setup Astro project for previews
   */
  async setupAstroProject(projectPath) {
    const astroDir = join(projectPath, '.submitit', 'preview');
    await mkdir(astroDir, { recursive: true });

    // Create basic Astro config
    const astroConfig = `
import { defineConfig } from 'astro/config';

export default defineConfig({
  srcDir: './src',
  publicDir: './public',
  outDir: './dist',
  server: {
    port: ${this.previewPort},
    host: true
  },
  build: {
    assets: 'assets'
  },
  vite: {
    server: {
      watch: {
        usePolling: true
      }
    }
  }
});`;

    await writeFile(join(astroDir, 'astro.config.mjs'), astroConfig);

    // Create package.json for Astro
    const packageJson = {
      name: 'submitit-preview',
      type: 'module',
      scripts: {
        dev: 'astro dev',
        build: 'astro build',
        preview: 'astro preview'
      },
      dependencies: {
        astro: '^4.0.0',
        '@astrojs/node': '^8.0.0'
      }
    };

    await writeFile(
      join(astroDir, 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    );

    // Create basic layout template
    await this.createAstroTemplates(astroDir);
  }

  /**
   * Create Astro templates for different themes
   */
  async createAstroTemplates(astroDir) {
    const srcDir = join(astroDir, 'src');
    const layoutsDir = join(srcDir, 'layouts');
    const pagesDir = join(srcDir, 'pages');
    
    await mkdir(layoutsDir, { recursive: true });
    await mkdir(pagesDir, { recursive: true });

    // Base layout with theme support
    const baseLayout = `---
export interface Props {
  title: string;
  theme?: 'neon' | 'crt' | 'academic' | 'noir';
}

const { title, theme = 'neon' } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    :root {
      --bg: ${theme === 'neon' ? '#0d1117' : theme === 'crt' ? '#00110a' : '#1a1a1a'};
      --text: ${theme === 'neon' ? '#8fbfff' : theme === 'crt' ? '#35ff6d' : '#ffffff'};
      --border: ${theme === 'neon' ? '#6aa9ff' : theme === 'crt' ? '#00ff41' : '#333333'};
      --accent: ${theme === 'neon' ? '#4d7dff' : theme === 'crt' ? '#00ff41' : '#0066cc'};
    }
    
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Courier New', monospace;
      margin: 0;
      padding: 20px;
      line-height: 1.6;
    }
    
    .container {
      max-width: 80ch;
      margin: 0 auto;
      border: 2px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 0 20px var(--border);
    }
    
    h1, h2, h3 { color: var(--accent); }
    a { color: var(--accent); }
    
    .retro-frame {
      border: 1px solid var(--border);
      padding: 10px;
      margin: 10px 0;
      background: rgba(0,0,0,0.3);
    }
  </style>
  <script>
    // Hot reload client
    if (import.meta.hot) {
      import.meta.hot.accept();
    }
    
    // Connect to preview manager
    const ws = new WebSocket('ws://localhost:8081');
    ws.onmessage = (event) => {
      if (event.data === 'reload') {
        window.location.reload();
      }
    };
  </script>
</head>
<body>
  <div class="container">
    <slot />
  </div>
</body>
</html>`;

    await writeFile(join(layoutsDir, 'BaseLayout.astro'), baseLayout);

    // Index page template
    const indexPage = `---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Submitit Preview">
  <h1>🚀 Submitit Preview</h1>
  <div class="retro-frame">
    <p>Live preview will be generated here...</p>
    <p>Theme: <span id="current-theme">neon</span></p>
  </div>
</BaseLayout>`;

    await writeFile(join(pagesDir, 'index.astro'), indexPage);
  }

  /**
   * Setup hot reload WebSocket server
   */
  async setupHotReload() {
    try {
      // Simple WebSocket implementation for hot reload
      const { WebSocketServer } = await import('ws');
      
      this.hotReloadServer = new WebSocketServer({ port: 8081 });
      
      this.hotReloadServer.on('connection', (ws) => {
        this.hotReloadClients.add(ws);
        
        ws.on('close', () => {
          this.hotReloadClients.delete(ws);
        });
      });
      
    } catch (error) {
      // Fallback if WebSocket not available
      console.warn('WebSocket not available, hot reload disabled');
    }
  }

  /**
   * Start preview server
   */
  async startPreview(projectFiles, options = {}) {
    try {
      if (this.isRunning) {
        await this.stopPreview();
      }

      const { theme = 'neon', mode = 'desktop', enableBrowsh = false } = options;
      this.currentMode = mode;

      // Generate preview content
      await this.generatePreviewContent(projectFiles, { theme, mode });

      // Start Astro dev server
      await this.startAstroServer();

      if (enableBrowsh) {
        await this.startBrowshPreview();
      }

      this.isRunning = true;

      return {
        astroUrl: `http://localhost:${this.previewPort}`,
        browshUrl: enableBrowsh ? `http://localhost:${this.browshPort}` : null,
        mode,
        theme
      };

    } catch (error) {
      throw globalErrorHandler.createError(
        'PREVIEW_START_ERROR',
        `Failed to start preview: ${error.message}`,
        options
      );
    }
  }

  /**
   * Generate preview content from project files
   */
  async generatePreviewContent(projectFiles, options) {
    const { theme, mode } = options;
    const astroDir = join('.submitit', 'preview');
    const pagesDir = join(astroDir, 'src', 'pages');

    // Group files by role
    const filesByRole = {};
    for (const file of projectFiles) {
      const role = file.role || 'content';
      if (!filesByRole[role]) filesByRole[role] = [];
      filesByRole[role].push(file);
    }

    // Generate main page
    const mainPage = this.generateMainPage(filesByRole, theme, mode);
    await writeFile(join(pagesDir, 'index.astro'), mainPage);

    // Generate individual pages for each role
    for (const [role, files] of Object.entries(filesByRole)) {
      const rolePage = this.generateRolePage(role, files, theme, mode);
      await writeFile(join(pagesDir, `${role}.astro`), rolePage);
    }

    // Cache the generated content
    this.previewCache.set('content', { filesByRole, theme, mode, timestamp: Date.now() });
  }

  /**
   * Generate main preview page
   */
  generateMainPage(filesByRole, theme, mode) {
    const roles = Object.keys(filesByRole);
    
    return `---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Submitit Project" theme="${theme}">
  <div class="preview-header">
    <h1>✧ Project Preview ✧</h1>
    <div class="theme-info">Theme: ${theme} | Mode: ${mode}</div>
  </div>

  <nav class="role-navigation">
    ${roles.map(role => `
      <a href="/${role}" class="role-link">
        ${this.getRoleIcon(role)} ${role.charAt(0).toUpperCase() + role.slice(1)}
        <span class="file-count">(${filesByRole[role].length})</span>
      </a>
    `).join('\n    ')}
  </nav>

  <main class="content-grid">
    ${roles.slice(0, 3).map(role => `
      <div class="role-preview retro-frame">
        <h2>${this.getRoleIcon(role)} ${role.charAt(0).toUpperCase() + role.slice(1)}</h2>
        <div class="content-sample">
          ${this.generateContentSample(filesByRole[role][0])}
        </div>
        <a href="/${role}" class="view-all">View all ${role} →</a>
      </div>
    `).join('\n    ')}
  </main>

  <style>
    .preview-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .theme-info {
      color: var(--accent);
      font-size: 0.9em;
      margin-top: 0.5rem;
    }
    
    .role-navigation {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    
    .role-link {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      text-decoration: none;
      color: var(--text);
      transition: all 0.3s;
    }
    
    .role-link:hover {
      background: var(--accent);
      color: var(--bg);
    }
    
    .file-count {
      opacity: 0.7;
      font-size: 0.8em;
    }
    
    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    .role-preview h2 {
      margin-top: 0;
    }
    
    .content-sample {
      margin: 1rem 0;
      opacity: 0.9;
      max-height: 200px;
      overflow: hidden;
    }
    
    .view-all {
      color: var(--accent);
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</BaseLayout>`;
  }

  /**
   * Generate role-specific page
   */
  generateRolePage(role, files, theme, mode) {
    return `---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="${role.charAt(0).toUpperCase() + role.slice(1)} - Submitit" theme="${theme}">
  <div class="role-header">
    <h1>${this.getRoleIcon(role)} ${role.charAt(0).toUpperCase() + role.slice(1)}</h1>
    <div class="role-meta">${files.length} file${files.length !== 1 ? 's' : ''}</div>
  </div>

  <nav class="breadcrumb">
    <a href="/">← Back to Overview</a>
  </nav>

  <main class="role-content">
    ${files.map((file, index) => `
      <article class="file-content retro-frame">
        <header class="file-header">
          <h2>${file.name}</h2>
          <div class="file-meta">
            ${file.size} bytes • ${file.extension} • ${new Date(file.mtime).toLocaleDateString()}
          </div>
        </header>
        <div class="file-body">
          ${this.formatFileContent(file)}
        </div>
      </article>
    `).join('\n    ')}
  </main>

  <style>
    .role-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .role-meta {
      color: var(--accent);
      font-size: 0.9em;
    }
    
    .breadcrumb {
      margin-bottom: 2rem;
    }
    
    .breadcrumb a {
      color: var(--accent);
      text-decoration: none;
    }
    
    .file-content {
      margin-bottom: 2rem;
    }
    
    .file-header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .file-header h2 {
      margin: 0;
    }
    
    .file-meta {
      font-size: 0.8em;
      opacity: 0.7;
      margin-top: 0.5rem;
    }
    
    .file-body {
      line-height: 1.7;
    }
    
    .file-body pre {
      background: rgba(0,0,0,0.5);
      padding: 1rem;
      overflow-x: auto;
      border-left: 3px solid var(--accent);
    }
    
    .file-body img {
      max-width: 100%;
      height: auto;
      border: 1px solid var(--border);
    }
  </style>
</BaseLayout>`;
  }

  /**
   * Format file content for display
   */
  formatFileContent(file) {
    if (!file.content) return '<p><em>Binary file or no content available</em></p>';

    const content = file.content;
    const ext = file.extension.toLowerCase();

    if (['.md', '.txt'].includes(ext)) {
      // Simple markdown-like formatting
      return content
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
    }

    if (['.css', '.js', '.json', '.html'].includes(ext)) {
      return `<pre><code>${this.escapeHtml(content)}</code></pre>`;
    }

    return `<pre>${this.escapeHtml(content)}</pre>`;
  }

  /**
   * Get icon for role
   */
  getRoleIcon(role) {
    const icons = {
      hero: '🌟',
      bio: '👤',
      resume: '📄',
      projects: '🛠️',
      gallery: '🖼️',
      contact: '📧',
      styles: '🎨',
      scripts: '⚙️',
      content: '📝'
    };
    return icons[role] || '📄';
  }

  /**
   * Generate content sample for preview
   */
  generateContentSample(file) {
    if (!file || !file.content) return '<em>No content</em>';
    
    const content = file.content.substring(0, 200);
    return content.length < file.content.length ? content + '...' : content;
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Start Astro development server
   */
  async startAstroServer() {
    return new Promise((resolve, reject) => {
      const astroDir = join('.submitit', 'preview');
      
      this.astroProcess = spawn('npm', ['run', 'dev'], {
        cwd: astroDir,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let output = '';
      
      this.astroProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Local') || output.includes('ready')) {
          resolve();
        }
      });

      this.astroProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('EADDRINUSE')) {
          reject(new Error(`Port ${this.previewPort} already in use`));
        }
      });

      this.astroProcess.on('error', reject);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error('Astro server startup timeout'));
      }, 30000);
    });
  }

  /**
   * Start Browsh terminal preview
   */
  async startBrowshPreview() {
    try {
      // Check if browsh is available
      await execAsync('which browsh');
      
      this.browshProcess = spawn('browsh', [
        '--startup-url', `http://localhost:${this.previewPort}`,
        '--http-server-port', this.browshPort.toString()
      ], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

    } catch (error) {
      console.warn('Browsh not available, skipping terminal preview');
    }
  }

  /**
   * Trigger hot reload
   */
  triggerHotReload() {
    for (const client of this.hotReloadClients) {
      try {
        client.send('reload');
      } catch (error) {
        this.hotReloadClients.delete(client);
      }
    }
  }

  /**
   * Update preview with new content
   */
  async updatePreview(projectFiles, options = {}) {
    if (!this.isRunning) {
      return await this.startPreview(projectFiles, options);
    }

    try {
      await this.generatePreviewContent(projectFiles, options);
      this.triggerHotReload();
      
      return {
        updated: true,
        timestamp: Date.now()
      };
      
    } catch (error) {
      throw globalErrorHandler.createError(
        'PREVIEW_UPDATE_ERROR',
        `Failed to update preview: ${error.message}`,
        options
      );
    }
  }

  /**
   * Stop preview servers
   */
  async stopPreview() {
    try {
      if (this.astroProcess) {
        this.astroProcess.kill();
        this.astroProcess = null;
      }

      if (this.browshProcess) {
        this.browshProcess.kill();
        this.browshProcess = null;
      }

      if (this.hotReloadServer) {
        this.hotReloadServer.close();
      }

      this.isRunning = false;
      this.hotReloadClients.clear();

    } catch (error) {
      globalErrorHandler.handle(error, 'preview-stop');
    }
  }

  /**
   * Get preview status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      astroPort: this.previewPort,
      browshPort: this.browshPort,
      mode: this.currentMode,
      clients: this.hotReloadClients.size,
      cacheSize: this.previewCache.size
    };
  }

  /**
   * Test different layout modes
   */
  async testLayoutModes(projectFiles) {
    const results = {};
    
    for (const mode of this.layoutModes) {
      try {
        await this.generatePreviewContent(projectFiles, { 
          theme: 'neon', 
          mode 
        });
        
        results[mode] = {
          success: true,
          timestamp: Date.now()
        };
        
      } catch (error) {
        results[mode] = {
          success: false,
          error: error.message
        };
      }
    }
    
    return results;
  }
}

export default PreviewManager;