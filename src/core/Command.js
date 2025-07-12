/**
 * Command Pattern Implementation
 * 
 * This provides the foundation for submitit's ceremonial command structure,
 * where each command is a ritual with its own preparation, execution, and celebration phases.
 */

export class Command {
  constructor(context) {
    this.context = context;
    this.logger = context.logger;
    this.ui = context.ui;
    this.analytics = context.analytics;
    this.coordinator = context.coordinator;
  }

  async execute() {
    try {
      // Preparation phase - setup and validation
      await this.prepare();
      
      // Execution phase - the actual work
      const result = await this.perform();
      
      // Celebration phase - acknowledge completion
      await this.celebrate(result);
      
      return result;
    } catch (error) {
      await this.handleError(error);
      throw error;
    }
  }

  async prepare() {
    // Override in subclasses for command-specific preparation
    this.logger.debug(`Preparing ${this.constructor.name}`);
  }

  async perform() {
    // Override in subclasses for command-specific execution
    throw new Error('Command.perform() must be implemented in subclass');
  }

  async celebrate(result) {
    // Override in subclasses for command-specific celebration
    this.logger.debug(`Completed ${this.constructor.name}`);
  }

  async handleError(error) {
    // Override in subclasses for command-specific error handling
    this.logger.error(`Error in ${this.constructor.name}: ${error.message}`);
  }
}

export class InitCommand extends Command {
  constructor(context, name, options = {}) {
    super(context);
    this.name = name;
    this.options = options;
  }

  async prepare() {
    // Validate project name
    if (!this.name || typeof this.name !== 'string') {
      throw new Error('Project name is required and must be a string');
    }
    
    // Check if project already exists
    const projectPath = this.context.fs.join(process.cwd(), this.name);
    const exists = await this.context.fs.pathExists(projectPath);
    
    if (exists) {
      throw new Error(`Project "${this.name}" already exists in this directory`);
    }
    
    this.analytics.track('project_init_started', {
      name: this.name,
      theme: this.options.theme || 'default'
    });
  }

  async perform() {
    // Use the sacred architecture through the coordinator
    const result = await this.coordinator.executeIntent({
      type: 'init',
      name: this.name,
      description: this.options.description || 'A new submitit project',
      theme: this.options.theme || 'modern',
      outputDir: this.options.outputDir
    });
    
    return result;
  }

  async celebrate(result) {
    // Use the sacred architecture for celebration
    await this.coordinator.executeIntent({
      type: 'celebration',
      achievement: 'Project Created',
      description: `Project "${result.project.name}" has been successfully created`,
      stats: {
        'Project Name': result.project.name,
        'Theme': result.project.theme,
        'Files': result.project.files.length
      }
    });
    
    this.ui.showSuccess([
      `✨ Project "${result.project.name}" created successfully!`,
      `📁 Location: ${this.context.fs.join(process.cwd(), result.project.name)}`,
      `🎨 Theme: ${result.project.theme}`,
      '',
      '🎯 Next steps:',
      `  cd ${result.project.name}`,
      '  submitit add <files>',
      '  submitit preview',
      '  submitit export'
    ]);
    
    this.analytics.track('project_init_completed', {
      name: result.name,
      theme: result.theme
    });
  }
}

export class AddCommand extends Command {
  constructor(context, files, options = {}) {
    super(context);
    this.files = files;
    this.options = options;
  }

  async prepare() {
    this.ui.showRitualPhase('preparation', 'Examining your content with intention...');
    
    // Validate files
    if (!this.files || !Array.isArray(this.files) || this.files.length === 0) {
      throw new Error('At least one file must be specified');
    }
    
    // Expand glob patterns
    const globby = await import('globby');
    this.expandedFiles = await globby.globby(this.files, { absolute: true });
    
    if (this.expandedFiles.length === 0) {
      throw new Error('No files found matching the specified patterns');
    }
    
    // Check project context
    const projectExists = await this.context.projectManager.isInProject();
    if (!projectExists) {
      throw new Error('Not in a submitit project directory. Run "submitit init <name>" first.');
    }
    
    this.analytics.track('add_files_started', {
      fileCount: this.expandedFiles.length,
      patterns: this.files
    });
  }

  async perform() {
    const fileValidator = this.context.fileValidator;
    const projectManager = this.context.projectManager;
    
    const addedFiles = [];
    
    for (const filePath of this.expandedFiles) {
      this.ui.showProgress(`Processing ${this.context.fs.basename(filePath)}...`);
      
      // Validate file
      const validation = await fileValidator.validateFile(filePath);
      if (!validation.isValid) {
        this.ui.showWarning(`Skipping ${filePath}: ${validation.reason}`);
        continue;
      }
      
      // Add file to project
      const fileInfo = await projectManager.addFile(filePath, {
        role: this.options.role,
        type: this.options.as
      });
      
      addedFiles.push(fileInfo);
      
      this.ui.showSuccess(`✅ Added: ${fileInfo.name} (${fileInfo.type})`);
    }
    
    // Regenerate layout
    this.ui.showProgress('Recalculating layout with new content...');
    await projectManager.updateLayout();
    
    return addedFiles;
  }

  async celebrate(result) {
    this.ui.showRitualPhase('celebration', 'Your content has found its place!');
    
    this.ui.showSuccess([
      `🎉 Successfully added ${result.length} files!`,
      '',
      '📊 Content Summary:',
      ...result.map(f => `  ${this.getFileIcon(f.type)} ${f.name} (${f.size})`),
      '',
      '💡 Next: submitit preview to see your creation'
    ]);
    
    this.analytics.track('add_files_completed', {
      addedCount: result.length,
      totalSize: result.reduce((sum, f) => sum + f.sizeBytes, 0)
    });
  }

  getFileIcon(type) {
    const icons = {
      'document': '📄',
      'image': '🖼️',
      'text': '📝',
      'audio': '🎵',
      'video': '🎬'
    };
    return icons[type] || '📎';
  }
}

export class PreviewCommand extends Command {
  constructor(context, options = {}) {
    super(context);
    this.options = options;
  }

  async prepare() {
    this.ui.showRitualPhase('preparation', 'Preparing your preview experience...');
    
    // Check project context
    const projectExists = await this.context.projectManager.isInProject();
    if (!projectExists) {
      throw new Error('Not in a submitit project directory. Run "submitit init <name>" first.');
    }
    
    // Load project
    this.project = await this.context.projectManager.loadProject();
    
    if (!this.project.files || this.project.files.length === 0) {
      throw new Error('No files in project. Add some content first with "submitit add <files>"');
    }
    
    this.analytics.track('preview_started', {
      fileCount: this.project.files.length,
      theme: this.project.theme,
      asciiMode: this.options.ascii
    });
  }

  async perform() {
    const previewManager = this.context.previewManager;
    
    this.ui.showProgress('Generating preview with Astro...');
    
    if (this.options.ascii) {
      return await previewManager.startAsciiPreview(this.project, this.options);
    } else {
      return await previewManager.startWebPreview(this.project, this.options);
    }
  }

  async celebrate(result) {
    this.ui.showRitualPhase('celebration', 'Your preview is ready!');
    
    this.ui.showSuccess([
      `🚀 Preview ready at: ${result.url}`,
      `🎨 Theme: ${this.project.theme}`,
      `📁 Files: ${this.project.files.length}`,
      '',
      this.options.ascii ? 
        '🖼️ ASCII preview mode - navigate with arrow keys' :
        '🌐 Web preview opened in your browser'
    ]);
    
    this.analytics.track('preview_completed', {
      url: result.url,
      port: result.port
    });
  }
}

export class ExportCommand extends Command {
  constructor(context, options = {}) {
    super(context);
    this.options = options;
  }

  async prepare() {
    this.ui.showRitualPhase('preparation', 'Preparing your masterpiece for delivery...');
    
    // Check project context
    const projectExists = await this.context.projectManager.isInProject();
    if (!projectExists) {
      throw new Error('Not in a submitit project directory. Run "submitit init <name>" first.');
    }
    
    // Load project
    this.project = await this.context.projectManager.loadProject();
    
    if (!this.project.files || this.project.files.length === 0) {
      throw new Error('No files in project. Add some content first with "submitit add <files>"');
    }
    
    this.analytics.track('export_started', {
      fileCount: this.project.files.length,
      format: this.options.format || 'zip'
    });
  }

  async perform() {
    const packageManager = this.context.packageManager;
    
    this.ui.showProgress('🎼 Orchestrating your submission...');
    
    const result = await packageManager.exportProject(this.project, this.options, (progress) => {
      this.ui.showProgress(`📦 ${progress.percent}% complete (${progress.processedBytes}/${progress.totalBytes} bytes)`);
    });
    
    return result;
  }

  async celebrate(result) {
    this.ui.showRitualPhase('celebration', 'Your submission is complete!');
    
    // Dramatic reveal of the package
    this.ui.showCelebration([
      '',
      '🎉 SUBMISSION COMPLETE 🎉',
      '',
      `📦 Package: ${result.path}`,
      `📊 Size: ${this.formatFileSize(result.size)}`,
      `📝 Format: ${result.format}`,
      '',
      '🧘 Your work is now ready for the world.',
      'You may step away from the terminal with pride.',
      ''
    ]);
    
    this.analytics.track('export_completed', {
      path: result.path,
      size: result.size,
      format: result.format
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

export class CommandFactory {
  static create(commandName, context, ...args) {
    const commands = {
      'init': InitCommand,
      'add': AddCommand,
      'preview': PreviewCommand,
      'export': ExportCommand
    };
    
    const CommandClass = commands[commandName];
    if (!CommandClass) {
      throw new Error(`Unknown command: ${commandName}`);
    }
    
    return new CommandClass(context, ...args);
  }
}