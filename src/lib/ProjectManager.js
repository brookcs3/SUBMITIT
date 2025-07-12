import { readFile, writeFile, stat, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import chalk from 'chalk';
import { SmartFileHandlerSimple } from './SmartFileHandlerSimple.js';
import { EnhancedYogaLayoutEngine } from './EnhancedYogaLayoutEngine.js';

/**
 * ProjectManager - Complete project lifecycle management
 * Handles project creation, configuration, file operations, and validation
 */
export class ProjectManager {
  constructor(options = {}) {
    this.projects = new Map();
    this.currentProject = null;
    this.smartFileHandler = options.fileHandler || new SmartFileHandlerSimple();
    this.layoutEngine = options.layoutEngine || new EnhancedYogaLayoutEngine();
    this.errorHandler = options.errorHandler;
    this.validator = options.validator;
    this.projectPath = null;
    this.initialized = false;
    
    // Enhanced options
    this.options = {
      enableErrorHandling: true,
      enableRetries: true,
      enableGracefulDegradation: true,
      projectsDirectory: './projects',
      ...options
    };
  }

  async initialize() {
    if (!this.initialized) {
      await this.layoutEngine.initializeEngine();
      this.initialized = true;
    }
  }

  async loadProject(projectPath) {
    const loadOperation = async () => {
      console.log(chalk.blue(`📂 Loading project from ${projectPath}...`));
      
      const configPath = join(projectPath, 'submitit.config.json');
      const configContent = await readFile(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      return config;
    };

    try {
      let config;
      
      if (this.errorHandler && this.options.enableErrorHandling) {
        config = await this.errorHandler.executeWithErrorHandling(
          'load-project-config',
          loadOperation,
          {
            retryStrategy: 'exponential-backoff',
            fallbackStrategy: 'default-values',
            context: { projectPath }
          }
        );
      } else {
        config = await loadOperation();
      }
      
      // Validate project structure
      const layoutPath = join(projectPath, 'layout.json');
      let layout = null;
      
      try {
        const layoutContent = await readFile(layoutPath, 'utf8');
        layout = JSON.parse(layoutContent);
      } catch (error) {
        console.log(chalk.yellow('⚠️  No layout.json found, will generate when needed'));
      }
      
      const project = {
        name: config.name,
        theme: config.theme || 'default',
        files: config.files || [],
        layout: layout?.layout || { type: 'column', children: [] },
        created: config.created || Date.now(),
        lastModified: Date.now(),
        path: projectPath
      };
      
      this.projects.set(config.name, project);
      this.currentProject = project;
      this.projectPath = projectPath;
      
      console.log(chalk.green(`✅ Project "${config.name}" loaded successfully`));
      console.log(chalk.gray(`   Files: ${project.files.length}, Theme: ${project.theme}`));
      
      return project;
    } catch (error) {
      console.error(chalk.red(`❌ Error loading project: ${error.message}`));
      throw error;
    }
  }

  async saveProject(project = this.currentProject) {
    if (!project) {
      throw new Error('No project to save');
    }

    try {
      const projectPath = project.path || this.projectPath || process.cwd();
      
      // Save configuration
      const configPath = join(projectPath, 'submitit.config.json');
      const config = {
        name: project.name,
        theme: project.theme,
        files: project.files,
        created: project.created,
        lastModified: Date.now(),
        version: '1.0.0'
      };
      
      await writeFile(configPath, JSON.stringify(config, null, 2));
      
      // Save layout if it exists
      if (project.layout && Object.keys(project.layout).length > 0) {
        const layoutPath = join(projectPath, 'layout.json');
        const layoutData = {
          layout: project.layout,
          generated: Date.now(),
          engine: 'yoga'
        };
        
        await writeFile(layoutPath, JSON.stringify(layoutData, null, 2));
      }
      
      console.log(chalk.green(`💾 Project "${project.name}" saved successfully`));
      return true;
    } catch (error) {
      console.error(chalk.red(`❌ Error saving project: ${error.message}`));
      throw error;
    }
  }

  async createProject(name, options = {}) {
    try {
      await this.initialize();
      
      console.log(chalk.blue(`🎨 Creating new project "${name}"...`));
      
      const projectPath = join(process.cwd(), name);
      
      // Create project structure
      await mkdir(projectPath, { recursive: true });
      await mkdir(join(projectPath, 'content'), { recursive: true });
      await mkdir(join(projectPath, 'output'), { recursive: true });
      
      const project = {
        name,
        theme: options.theme || 'default',
        files: [],
        layout: { type: 'column', children: [] },
        created: Date.now(),
        lastModified: Date.now(),
        path: projectPath
      };
      
      this.projects.set(name, project);
      this.currentProject = project;
      this.projectPath = projectPath;
      
      // Save initial configuration
      await this.saveProject(project);
      
      console.log(chalk.green(`✅ Project "${name}" created successfully`));
      console.log(chalk.gray(`   Location: ${projectPath}`));
      console.log(chalk.gray(`   Theme: ${project.theme}`));
      
      return project;
    } catch (error) {
      console.error(chalk.red(`❌ Error creating project: ${error.message}`));
      throw error;
    }
  }

  async addFiles(files, options = {}) {
    if (!this.currentProject) {
      throw new Error('No current project. Initialize or load a project first.');
    }

    try {
      console.log(chalk.blue(`📁 Adding ${files.length} files to project...`));
      
      // Process files with smart handler
      const processingResults = await this.smartFileHandler.processFiles(files, options);
      
      // Add files to project
      const addedFiles = [];
      for (const result of processingResults) {
        if (result.success) {
          const fileInfo = {
            name: result.file.split('/').pop(),
            path: result.file,
            type: result.type,
            role: options.role || this.getDefaultRole(result.type),
            size: this.formatFileSize(result.size),
            added: new Date().toISOString(),
            ...result // Include processing results
          };
          
          this.currentProject.files.push(fileInfo);
          addedFiles.push(fileInfo);
        }
      }
      
      // Update layout
      await this.updateLayout();
      
      // Save project
      await this.saveProject();
      
      console.log(chalk.green(`✅ Added ${addedFiles.length} files successfully`));
      
      return addedFiles;
    } catch (error) {
      console.error(chalk.red(`❌ Error adding files: ${error.message}`));
      throw error;
    }
  }

  async removeFile(fileName) {
    if (!this.currentProject) {
      throw new Error('No current project');
    }

    const fileIndex = this.currentProject.files.findIndex(f => f.name === fileName);
    if (fileIndex === -1) {
      throw new Error(`File "${fileName}" not found in project`);
    }

    this.currentProject.files.splice(fileIndex, 1);
    await this.updateLayout();
    await this.saveProject();
    
    console.log(chalk.green(`🗑️  Removed file "${fileName}" from project`));
  }

  async updateLayout() {
    if (!this.currentProject) return;

    try {
      await this.initialize();
      
      console.log(chalk.blue('🧘 Updating layout with Yoga engine...'));
      
      const layout = await this.layoutEngine.generateResponsiveLayout(
        this.currentProject.files,
        {
          theme: this.currentProject.theme,
          responsive: true,
          optimize: true
        }
      );
      
      this.currentProject.layout = layout;
      this.currentProject.lastModified = Date.now();
      
      console.log(chalk.green('✅ Layout updated successfully'));
    } catch (error) {
      console.error(chalk.red(`❌ Error updating layout: ${error.message}`));
      throw error;
    }
  }

  async validateProject(project = this.currentProject) {
    if (!project) {
      throw new Error('No project to validate');
    }

    const validation = {
      valid: true,
      errors: [],
      warnings: [],
      stats: {
        totalFiles: project.files.length,
        fileTypes: {},
        totalSize: 0
      }
    };

    // Check project structure
    if (!project.name || project.name.length === 0) {
      validation.errors.push('Project name is required');
      validation.valid = false;
    }

    // Validate files
    for (const file of project.files) {
      if (!file.name || !file.type) {
        validation.errors.push(`Invalid file entry: ${JSON.stringify(file)}`);
        validation.valid = false;
      }

      // Track file types
      validation.stats.fileTypes[file.type] = (validation.stats.fileTypes[file.type] || 0) + 1;
      
      // Parse file size
      const sizeMatch = file.size?.match(/^([\d.]+)\s*(\w+)$/);
      if (sizeMatch) {
        const size = parseFloat(sizeMatch[1]);
        const unit = sizeMatch[2];
        const multiplier = { B: 1, KB: 1024, MB: 1024*1024, GB: 1024*1024*1024 }[unit] || 1;
        validation.stats.totalSize += size * multiplier;
      }
    }

    // Check for missing layout
    if (!project.layout || Object.keys(project.layout).length === 0) {
      validation.warnings.push('No layout defined - will be generated automatically');
    }

    return validation;
  }

  async getProjectStats(project = this.currentProject) {
    if (!project) {
      throw new Error('No project available');
    }

    const validation = await this.validateProject(project);
    
    return {
      name: project.name,
      theme: project.theme,
      created: new Date(project.created).toISOString(),
      lastModified: new Date(project.lastModified).toISOString(),
      files: validation.stats.totalFiles,
      fileTypes: validation.stats.fileTypes,
      totalSize: this.formatFileSize(validation.stats.totalSize),
      valid: validation.valid,
      errors: validation.errors.length,
      warnings: validation.warnings.length
    };
  }

  getCurrentProject() {
    return this.currentProject;
  }

  getFiles() {
    return this.currentProject?.files || [];
  }

  async setTheme(theme) {
    if (!this.currentProject) {
      throw new Error('No current project');
    }

    this.currentProject.theme = theme;
    await this.updateLayout();
    await this.saveProject();
    
    console.log(chalk.green(`🎨 Theme changed to "${theme}"`));
  }

  getDefaultRole(type) {
    const roles = {
      'image': 'gallery',
      'document': 'document',
      'text': 'about',
      'javascript': 'code',
      'css': 'style',
      'html': 'template',
      'json': 'data',
      'markdown': 'documentation',
      'audio': 'media',
      'video': 'media',
      'archive': 'package'
    };
    
    return roles[type] || 'content';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  async cleanup() {
    // Clean up resources
    this.projects.clear();
    this.currentProject = null;
    this.projectPath = null;
    this.initialized = false;
  }
}