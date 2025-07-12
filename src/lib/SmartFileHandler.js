import { readFile, writeFile, stat, readdir, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { createHash } from 'crypto';
import chalk from 'chalk';
import { EnhancedYogaLayoutEngine } from './EnhancedYogaLayoutEngine.js';

export class SmartFileHandler {
  constructor() {
    this.layoutEngine = new EnhancedYogaLayoutEngine();
    this.cache = new Map();
    this.dependencyGraph = new Map();
    this.processingQueue = [];
    this.isProcessing = false;
  }

  async initialize() {
    await this.layoutEngine.initializeEngine();
    await this.loadDependencyCache();
  }

  // Conductor-driven incremental orchestration
  async processFiles(files, options = {}) {
    console.log(chalk.green('🎼 Orchestrating smart file processing...'));
    
    // Orchestrate content relationships and dependencies
    const dependencyGraph = await this.buildDependencyGraph(files);
    
    // Conductor's tempo: detect content changes with precision timing
    const changedFiles = await this.detectChanges(files);
    
    // Process only changed files and their dependents (incremental processing)
    const processQueue = this.calculateProcessingQueue(changedFiles, dependencyGraph);
    
    console.log(chalk.yellow(`📊 Processing ${processQueue.length} files (${changedFiles.length} changed)`));
    
    // Process files in dependency order
    const results = await this.processInOrder(processQueue, options);
    
    // Update cache with new hashes
    await this.updateCache(files);
    
    console.log(chalk.green('🎼 Content orchestration complete!'));
    return results;
  }

  async buildDependencyGraph(files) {
    const graph = new Map();
    
    for (const file of files) {
      const filePath = typeof file === 'string' ? file : file.path;
      const dependencies = await this.analyzeDependencies({ path: filePath });
      graph.set(filePath, dependencies);
    }
    
    return graph;
  }

  async analyzeDependencies(file) {
    const dependencies = [];
    const ext = extname(file.path).toLowerCase();
    
    try {
      switch (ext) {
        case '.js':
        case '.ts':
          // Analyze JavaScript/TypeScript imports
          const jsContent = await readFile(file.path, 'utf8');
          const importMatches = jsContent.match(/import.*from\s+['"]([^'"]+)['"]/g);
          if (importMatches) {
            importMatches.forEach(match => {
              const importPath = match.match(/['"]([^'"]+)['"]/)[1];
              dependencies.push(importPath);
            });
          }
          break;
          
        case '.css':
          // Analyze CSS @import statements
          const cssContent = await readFile(file.path, 'utf8');
          const cssImports = cssContent.match(/@import\s+['"]([^'"]+)['"]/g);
          if (cssImports) {
            cssImports.forEach(match => {
              const importPath = match.match(/['"]([^'"]+)['"]/)[1];
              dependencies.push(importPath);
            });
          }
          break;
          
        case '.md':
          // Analyze Markdown image/link references
          const mdContent = await readFile(file.path, 'utf8');
          const mdRefs = mdContent.match(/[!]?\[.*\]\(([^)]+)\)/g);
          if (mdRefs) {
            mdRefs.forEach(match => {
              const refPath = match.match(/\(([^)]+)\)/)[1];
              if (!refPath.startsWith('http')) {
                dependencies.push(refPath);
              }
            });
          }
          break;
      }
    } catch (error) {
      // File might not exist or be readable
    }
    
    return dependencies;
  }

  async detectChanges(files) {
    const changedFiles = [];
    
    for (const file of files) {
      const filePath = typeof file === 'string' ? file : file.path;
      const currentHash = await this.calculateFileHash(filePath);
      const cachedHash = this.cache.get(filePath);
      
      if (currentHash !== cachedHash) {
        changedFiles.push(typeof file === 'string' ? { path: file } : file);
      }
    }
    
    return changedFiles;
  }

  async calculateFileHash(filePath) {
    try {
      const stats = await stat(filePath);
      const content = await readFile(filePath);
      
      // Create hash from content + mtime for fast change detection
      const hash = createHash('md5');
      hash.update(content);
      hash.update(stats.mtime.toISOString());
      
      return hash.digest('hex');
    } catch (error) {
      return null;
    }
  }

  calculateProcessingQueue(changedFiles, dependencyGraph) {
    const queue = new Set();
    const visited = new Set();
    
    // Add changed files to queue
    changedFiles.forEach(file => {
      const filePath = typeof file === 'string' ? file : file.path;
      queue.add(filePath);
    });
    
    // Add dependent files (files that depend on changed files)
    const addDependents = (filePath) => {
      if (visited.has(filePath)) return;
      visited.add(filePath);
      
      for (const [file, dependencies] of dependencyGraph.entries()) {
        if (dependencies.includes(filePath)) {
          queue.add(file);
          addDependents(file);
        }
      }
    };
    
    changedFiles.forEach(file => {
      const filePath = typeof file === 'string' ? file : file.path;
      addDependents(filePath);
    });
    
    return Array.from(queue);
  }

  async processInOrder(files, options) {
    const results = [];
    
    for (const file of files) {
      const result = await this.processFile(file, options);
      results.push(result);
    }
    
    return results;
  }

  async processFile(file, options) {
    const startTime = Date.now();
    const filePath = typeof file === 'string' ? file : file.path;
    
    try {
      // Smart processing based on file type
      const processor = this.getProcessorForFile({ path: filePath });
      const result = await processor({ path: filePath }, options);
      
      const processingTime = Date.now() - startTime;
      
      return {
        file: filePath,
        success: true,
        processingTime,
        ...result
      };
    } catch (error) {
      return {
        file: filePath,
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }

  getProcessorForFile(file) {
    const ext = extname(file.path).toLowerCase();
    
    const processors = {
      '.js': this.processJavaScript.bind(this),
      '.ts': this.processTypeScript.bind(this),
      '.css': this.processCSS.bind(this),
      '.md': this.processMarkdown.bind(this),
      '.json': this.processJSON.bind(this),
      '.html': this.processHTML.bind(this),
      '.jpg': this.processImage.bind(this),
      '.jpeg': this.processImage.bind(this),
      '.png': this.processImage.bind(this),
      '.gif': this.processImage.bind(this),
      '.svg': this.processImage.bind(this),
      '.mp4': this.processVideo.bind(this),
      '.mov': this.processVideo.bind(this),
      '.pdf': this.processPDF.bind(this),
      '.zip': this.processArchive.bind(this),
      '.tar': this.processArchive.bind(this),
      '.rar': this.processArchive.bind(this)
    };
    
    return processors[ext] || this.processGeneric.bind(this);
  }

  async processJavaScript(file, options) {
    const content = await readFile(file.path, 'utf8');
    const lines = content.split('\n').length;
    const functions = (content.match(/function\s+\w+/g) || []).length;
    const imports = (content.match(/import.*from/g) || []).length;
    
    return {
      type: 'javascript',
      lines,
      functions,
      imports,
      complexity: this.calculateComplexity(content)
    };
  }

  async processTypeScript(file, options) {
    const content = await readFile(file.path, 'utf8');
    const lines = content.split('\n').length;
    const interfaces = (content.match(/interface\s+\w+/g) || []).length;
    const types = (content.match(/type\s+\w+/g) || []).length;
    
    return {
      type: 'typescript',
      lines,
      interfaces,
      types,
      complexity: this.calculateComplexity(content)
    };
  }

  async processCSS(file, options) {
    const content = await readFile(file.path, 'utf8');
    const rules = (content.match(/[^{}]+\{[^}]*\}/g) || []).length;
    const selectors = (content.match(/[^{}]+(?=\{)/g) || []).length;
    
    return {
      type: 'css',
      rules,
      selectors,
      size: Buffer.byteLength(content)
    };
  }

  async processMarkdown(file, options) {
    const content = await readFile(file.path, 'utf8');
    const headers = (content.match(/^#+\s+/gm) || []).length;
    const links = (content.match(/\[.*\]\(.*\)/g) || []).length;
    const images = (content.match(/!\[.*\]\(.*\)/g) || []).length;
    const words = content.split(/\s+/).length;
    
    return {
      type: 'markdown',
      headers,
      links,
      images,
      words,
      readingTime: Math.ceil(words / 200) // Approximate reading time
    };
  }

  async processJSON(file, options) {
    const content = await readFile(file.path, 'utf8');
    const data = JSON.parse(content);
    
    return {
      type: 'json',
      keys: Object.keys(data).length,
      nested: this.countNestedObjects(data),
      size: Buffer.byteLength(content)
    };
  }

  async processHTML(file, options) {
    const content = await readFile(file.path, 'utf8');
    const elements = (content.match(/<\w+/g) || []).length;
    const links = (content.match(/<a\s+[^>]*href/g) || []).length;
    const images = (content.match(/<img\s+[^>]*src/g) || []).length;
    
    return {
      type: 'html',
      elements,
      links,
      images,
      size: Buffer.byteLength(content)
    };
  }

  async processImage(file, options) {
    const stats = await stat(file.path);
    
    return {
      type: 'image',
      size: stats.size,
      format: extname(file.path).substring(1),
      lastModified: stats.mtime
    };
  }

  async processVideo(file, options) {
    const stats = await stat(file.path);
    
    return {
      type: 'video',
      size: stats.size,
      format: extname(file.path).substring(1),
      lastModified: stats.mtime
    };
  }

  async processPDF(file, options) {
    const stats = await stat(file.path);
    
    return {
      type: 'pdf',
      size: stats.size,
      lastModified: stats.mtime
    };
  }

  async processArchive(file, options) {
    const stats = await stat(file.path);
    
    return {
      type: 'archive',
      size: stats.size,
      format: extname(file.path).substring(1),
      lastModified: stats.mtime
    };
  }

  async processGeneric(file, options) {
    const stats = await stat(file.path);
    
    return {
      type: 'generic',
      size: stats.size,
      extension: extname(file.path),
      lastModified: stats.mtime
    };
  }

  calculateComplexity(content) {
    // Simple complexity calculation
    const cycles = (content.match(/\b(for|while|if|switch)\b/g) || []).length;
    const functions = (content.match(/function\s+\w+/g) || []).length;
    const lines = content.split('\n').length;
    
    return Math.round((cycles + functions) / lines * 100);
  }

  countNestedObjects(obj, depth = 0) {
    if (depth > 10) return 0; // Prevent infinite recursion
    
    let count = 0;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count += 1 + this.countNestedObjects(obj[key], depth + 1);
      }
    }
    return count;
  }

  async updateCache(files) {
    for (const file of files) {
      const filePath = typeof file === 'string' ? file : file.path;
      const hash = await this.calculateFileHash(filePath);
      this.cache.set(filePath, hash);
    }
    
    await this.saveDependencyCache();
  }

  async loadDependencyCache() {
    try {
      const cacheDir = join(process.cwd(), '.submitit');
      const cacheFile = join(cacheDir, 'file-cache.json');
      
      // Create cache directory if it doesn't exist
      try {
        await mkdir(cacheDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }
      
      const cacheData = await readFile(cacheFile, 'utf8');
      const parsed = JSON.parse(cacheData);
      
      this.cache = new Map(parsed.cache || []);
      this.dependencyGraph = new Map(parsed.dependencyGraph || []);
    } catch (error) {
      // Cache file doesn't exist or is invalid - start fresh
      this.cache = new Map();
      this.dependencyGraph = new Map();
    }
  }

  async saveDependencyCache() {
    try {
      const cacheDir = join(process.cwd(), '.submitit');
      const cacheFile = join(cacheDir, 'file-cache.json');
      
      // Create cache directory if it doesn't exist
      try {
        await mkdir(cacheDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }
      
      const cacheData = {
        cache: Array.from(this.cache.entries()),
        dependencyGraph: Array.from(this.dependencyGraph.entries()),
        lastUpdated: new Date().toISOString()
      };
      
      await writeFile(cacheFile, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      // Cache save failed - continue without caching
    }
  }

  // Performance statistics
  getPerformanceStats() {
    return {
      cacheSize: this.cache.size,
      dependencyGraphSize: this.dependencyGraph.size,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
  }
}