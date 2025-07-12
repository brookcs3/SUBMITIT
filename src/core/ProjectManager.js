/**
 * ProjectManager - Register files, infer roles, manage config
 */
import { readFile, writeFile, readdir, stat, mkdir } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { globalErrorHandler } from './ErrorHandler.js';
import { createHash } from 'crypto';

export class ProjectManager {
  constructor() {
    this.config = null;
    this.files = new Map(); // filePath -> fileInfo
    this.roles = new Map(); // role -> [filePaths]
    this.dependencies = new Map(); // filePath -> [dependencies]
    this.configPath = 'submitit.config.json';
  }

  /**
   * Initialize or load existing project
   */
  async initializeProject(projectPath = './', config = {}) {
    try {
      const configFilePath = join(projectPath, this.configPath);
      
      // Try to load existing config
      try {
        const configData = await readFile(configFilePath, 'utf8');
        this.config = { ...JSON.parse(configData), ...config };
      } catch (error) {
        // Create new config
        this.config = {
          name: config.name || 'Submitit Project',
          version: '1.0.0',
          theme: config.theme || 'neon',
          layout: {
            width: 80,
            responsive: true,
            breakpoints: ['mobile', 'desktop']
          },
          roles: {
            hero: { maxFiles: 1, extensions: ['.md', '.txt'] },
            bio: { maxFiles: 1, extensions: ['.md'] },
            resume: { maxFiles: 1, extensions: ['.pdf', '.md'] },
            gallery: { maxFiles: 50, extensions: ['.jpg', '.png', '.gif', '.webp'] },
            projects: { maxFiles: 20, extensions: ['.md', '.json'] },
            contact: { maxFiles: 1, extensions: ['.md', '.json'] },
            styles: { maxFiles: 10, extensions: ['.css', '.scss'] },
            scripts: { maxFiles: 10, extensions: ['.js', '.ts'] }
          },
          build: {
            incremental: true,
            ninja: {
              enabled: true,
              cacheDir: '.submitit/cache'
            },
            output: './dist'
          },
          ...config
        };
        
        await this.saveConfig(projectPath);
      }
      
      // Scan project files
      await this.scanProjectFiles(projectPath);
      
      return this.config;
      
    } catch (error) {
      throw globalErrorHandler.createError(
        'PROJECT_INIT_ERROR',
        `Failed to initialize project: ${error.message}`,
        { projectPath, config }
      );
    }
  }

  /**
   * Scan project directory and register files
   */
  async scanProjectFiles(projectPath) {
    try {
      const entries = await readdir(projectPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && !entry.name.startsWith('.') && !entry.name.startsWith('node_modules')) {
          const filePath = join(projectPath, entry.name);
          await this.registerFile(filePath);
        } else if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('node_modules')) {
          // Recursively scan subdirectories
          const subPath = join(projectPath, entry.name);
          await this.scanProjectFiles(subPath);
        }
      }
      
    } catch (error) {
      throw globalErrorHandler.createError(
        'FILE_SCAN_ERROR',
        `Failed to scan project files: ${error.message}`,
        { projectPath }
      );
    }
  }

  /**
   * Register a file and infer its role
   */
  async registerFile(filePath, explicitRole = null) {
    try {
      const stats = await stat(filePath);
      const content = await readFile(filePath, 'utf8').catch(() => null);
      
      const fileInfo = {
        path: filePath,
        name: basename(filePath),
        extension: extname(filePath),
        size: stats.size,
        mtime: stats.mtime,
        content,
        contentHash: content ? createHash('md5').update(content).digest('hex') : null,
        role: explicitRole || this.inferFileRole(filePath, content),
        metadata: await this.extractMetadata(filePath, content)
      };
      
      this.files.set(filePath, fileInfo);
      
      // Add to role mapping
      if (fileInfo.role) {
        if (!this.roles.has(fileInfo.role)) {
          this.roles.set(fileInfo.role, []);
        }
        this.roles.get(fileInfo.role).push(filePath);
      }
      
      // Detect dependencies
      if (content) {
        const deps = this.detectDependencies(content, filePath);
        this.dependencies.set(filePath, deps);
      }
      
      return fileInfo;
      
    } catch (error) {
      throw globalErrorHandler.createError(
        'FILE_REGISTER_ERROR',
        `Failed to register file: ${error.message}`,
        { filePath, explicitRole }
      );
    }
  }

  /**
   * Infer file role based on name and content
   */
  inferFileRole(filePath, content) {
    const fileName = basename(filePath, extname(filePath)).toLowerCase();
    const extension = extname(filePath).toLowerCase();
    
    // Rule-based role inference
    const roleRules = [
      // Exact matches
      { condition: () => fileName === 'readme', role: 'hero' },
      { condition: () => fileName === 'bio', role: 'bio' },
      { condition: () => fileName === 'about', role: 'bio' },
      { condition: () => fileName === 'resume', role: 'resume' },
      { condition: () => fileName === 'cv', role: 'resume' },
      { condition: () => fileName === 'contact', role: 'contact' },
      { condition: () => fileName === 'projects', role: 'projects' },
      { condition: () => fileName === 'portfolio', role: 'projects' },
      { condition: () => fileName === 'gallery', role: 'gallery' },
      { condition: () => fileName === 'index', role: 'hero' },
      
      // Extension-based
      { condition: () => ['.jpg', '.png', '.gif', '.webp', '.svg'].includes(extension), role: 'gallery' },
      { condition: () => ['.css', '.scss', '.less'].includes(extension), role: 'styles' },
      { condition: () => ['.js', '.ts', '.mjs'].includes(extension), role: 'scripts' },
      { condition: () => extension === '.pdf', role: 'resume' },
      
      // Content-based (if available)
      { condition: () => content && this.containsContactInfo(content), role: 'contact' },
      { condition: () => content && this.containsProjectInfo(content), role: 'projects' },
      { condition: () => content && this.containsBioKeywords(content), role: 'bio' },
      
      // Directory-based
      { condition: () => filePath.includes('/images/') || filePath.includes('/gallery/'), role: 'gallery' },
      { condition: () => filePath.includes('/css/') || filePath.includes('/styles/'), role: 'styles' },
      { condition: () => filePath.includes('/js/') || filePath.includes('/scripts/'), role: 'scripts' }
    ];
    
    for (const rule of roleRules) {
      if (rule.condition()) {
        return rule.role;
      }
    }
    
    // Default role based on extension
    if (['.md', '.txt', '.html'].includes(extension)) {
      return 'content';
    }
    
    return 'unknown';
  }

  /**
   * Content analysis helpers
   */
  containsContactInfo(content) {
    const contactPatterns = [
      /email|mail|contact/i,
      /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      /phone|tel|mobile/i,
      /linkedin|twitter|github/i
    ];
    return contactPatterns.some(pattern => pattern.test(content));
  }

  containsProjectInfo(content) {
    const projectPatterns = [
      /project|portfolio/i,
      /github\.com|gitlab\.com/i,
      /demo|live|website/i,
      /technology|tech stack/i
    ];
    return projectPatterns.some(pattern => pattern.test(content));
  }

  containsBioKeywords(content) {
    const bioPatterns = [
      /about me|biography|bio/i,
      /my name is|i am|i'm/i,
      /experience|background/i,
      /passion|love|enjoy/i
    ];
    return bioPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Extract metadata from file content
   */
  async extractMetadata(filePath, content) {
    const metadata = {
      wordCount: 0,
      lineCount: 0,
      images: [],
      links: []
    };
    
    if (!content) return metadata;
    
    // Basic stats
    metadata.wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    metadata.lineCount = content.split('\n').length;
    
    // Extract markdown images
    const imageMatches = content.match(/!\[.*?\]\((.*?)\)/g);
    if (imageMatches) {
      metadata.images = imageMatches.map(match => {
        const urlMatch = match.match(/!\[.*?\]\((.*?)\)/);
        return urlMatch ? urlMatch[1] : null;
      }).filter(Boolean);
    }
    
    // Extract links
    const linkMatches = content.match(/\[.*?\]\((.*?)\)/g);
    if (linkMatches) {
      metadata.links = linkMatches.map(match => {
        const urlMatch = match.match(/\[.*?\]\((.*?)\)/);
        return urlMatch ? urlMatch[1] : null;
      }).filter(Boolean);
    }
    
    // Extract frontmatter (YAML)
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      try {
        // Simple YAML-like parsing
        const yamlContent = frontmatterMatch[1];
        const yamlLines = yamlContent.split('\n');
        const frontmatter = {};
        
        yamlLines.forEach(line => {
          const colonIndex = line.indexOf(':');
          if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
            frontmatter[key] = value;
          }
        });
        
        metadata.frontmatter = frontmatter;
      } catch (error) {
        // Ignore YAML parsing errors
      }
    }
    
    return metadata;
  }

  /**
   * Detect file dependencies
   */
  detectDependencies(content, filePath) {
    const dependencies = [];
    
    // Markdown image references
    const imageRefs = content.match(/!\[.*?\]\((?!http)(.*?)\)/g);
    if (imageRefs) {
      imageRefs.forEach(ref => {
        const pathMatch = ref.match(/!\[.*?\]\((.*?)\)/);
        if (pathMatch) {
          const imagePath = join(dirname(filePath), pathMatch[1]);
          dependencies.push(imagePath);
        }
      });
    }
    
    // CSS imports
    const cssImports = content.match(/@import\s+["']([^"']+)["']/g);
    if (cssImports) {
      cssImports.forEach(imp => {
        const pathMatch = imp.match(/@import\s+["']([^"']+)["']/);
        if (pathMatch) {
          const cssPath = join(dirname(filePath), pathMatch[1]);
          dependencies.push(cssPath);
        }
      });
    }
    
    // JavaScript imports
    const jsImports = content.match(/(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g);
    if (jsImports) {
      jsImports.forEach(imp => {
        const pathMatch = imp.match(/["']([^"']+)["']/);
        if (pathMatch && !pathMatch[1].startsWith('http') && !pathMatch[1].startsWith('node_modules')) {
          const jsPath = join(dirname(filePath), pathMatch[1]);
          dependencies.push(jsPath);
        }
      });
    }
    
    return dependencies;
  }

  /**
   * Get files by role
   */
  getFilesByRole(role) {
    const filePaths = this.roles.get(role) || [];
    return filePaths.map(path => this.files.get(path)).filter(Boolean);
  }

  /**
   * Get all roles
   */
  getAllRoles() {
    return Array.from(this.roles.keys());
  }

  /**
   * Validate role constraints
   */
  validateRoleConstraints() {
    const violations = [];
    
    for (const [role, config] of Object.entries(this.config.roles)) {
      const files = this.getFilesByRole(role);
      
      if (files.length > config.maxFiles) {
        violations.push({
          role,
          issue: 'too_many_files',
          current: files.length,
          max: config.maxFiles
        });
      }
      
      for (const file of files) {
        if (!config.extensions.includes(file.extension)) {
          violations.push({
            role,
            issue: 'invalid_extension',
            file: file.path,
            extension: file.extension,
            allowed: config.extensions
          });
        }
      }
    }
    
    return violations;
  }

  /**
   * Save configuration
   */
  async saveConfig(projectPath = './') {
    try {
      const configFilePath = join(projectPath, this.configPath);
      await writeFile(configFilePath, JSON.stringify(this.config, null, 2), 'utf8');
    } catch (error) {
      throw globalErrorHandler.createError(
        'CONFIG_SAVE_ERROR',
        `Failed to save configuration: ${error.message}`,
        { projectPath }
      );
    }
  }

  /**
   * Get project statistics
   */
  getProjectStats() {
    const totalFiles = this.files.size;
    const roleStats = {};
    
    for (const role of this.getAllRoles()) {
      const files = this.getFilesByRole(role);
      roleStats[role] = {
        count: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        extensions: [...new Set(files.map(file => file.extension))]
      };
    }
    
    return {
      totalFiles,
      roles: roleStats,
      dependencies: this.dependencies.size,
      lastScan: new Date().toISOString()
    };
  }

  /**
   * Get files that need processing (changed since last build)
   */
  getChangedFiles(lastBuildTime) {
    const changed = [];
    
    for (const [path, fileInfo] of this.files) {
      if (!lastBuildTime || fileInfo.mtime > lastBuildTime) {
        changed.push(fileInfo);
      }
    }
    
    return changed;
  }

  /**
   * Update file content and metadata
   */
  async updateFile(filePath, newContent) {
    try {
      await writeFile(filePath, newContent, 'utf8');
      await this.registerFile(filePath); // Re-register to update metadata
      return this.files.get(filePath);
    } catch (error) {
      throw globalErrorHandler.createError(
        'FILE_UPDATE_ERROR',
        `Failed to update file: ${error.message}`,
        { filePath }
      );
    }
  }
}

export default ProjectManager;