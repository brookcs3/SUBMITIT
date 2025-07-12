/**
 * Project Business Logic Layer
 * 
 * This is the Inner Sanctum of our temple - where the actual transformation happens.
 * Here, intent becomes reality, files become presentations, chaos becomes order.
 * This layer orchestrates the sacred dance of project creation and transformation.
 */

import { AbstractBusinessLogic } from '../core/AbstractLayers.js';
import { ProjectManager } from '../core/ProjectManager.js';
import { PreviewManager } from '../core/PreviewManager.js';
import { PackageManager } from '../core/PackageManager.js';
import { EnhancedYogaLayoutEngine } from '../lib/EnhancedYogaLayoutEngine.js';
import { DynamicAstroGenerator } from '../lib/DynamicAstroGenerator.js';
import { NoMoreSecretsIntegration } from '../lib/NoMoreSecretsIntegration.js';

export class ProjectBusinessLogic extends AbstractBusinessLogic {
  constructor(context) {
    super(context);
    this.projectManager = new ProjectManager(context);
    this.previewManager = new PreviewManager(context);
    this.packageManager = new PackageManager(context);
    this.layoutEngine = new EnhancedYogaLayoutEngine();
    this.astroGenerator = new DynamicAstroGenerator();
    this.nmsIntegration = new NoMoreSecretsIntegration();
    this.currentProject = null;
  }

  // === SACRED INITIALIZATION ===

  async establishWisdom() {
    try {
      this.logger.debug('Establishing inner sanctum wisdom');
      
      // Initialize all transformation engines
      await this.initializeTransformationEngines();
      
      // Load any existing project context
      await this.loadProjectContext();
      
      this.logger.info('Inner sanctum wisdom established');
      
    } catch (error) {
      this.logger.error('Failed to establish inner sanctum wisdom', error);
      throw error;
    }
  }

  async prepareTransformations() {
    try {
      this.logger.debug('Preparing transformation strategies');
      
      // Register transformation strategies for different project phases
      this.registerTransformationStrategy('genesis', this.handleGenesisTransformation.bind(this));
      this.registerTransformationStrategy('integration', this.handleIntegrationTransformation.bind(this));
      this.registerTransformationStrategy('manifestation', this.handleManifestationTransformation.bind(this));
      this.registerTransformationStrategy('transcendence', this.handleTranscendenceTransformation.bind(this));
      
      // Register specialized transformation strategies
      this.registerTransformationStrategy('validation', this.handleValidationTransformation.bind(this));
      this.registerTransformationStrategy('optimization', this.handleOptimizationTransformation.bind(this));
      this.registerTransformationStrategy('celebration', this.handleCelebrationTransformation.bind(this));
      
      this.logger.info('Transformation strategies prepared', {
        strategiesCount: this.transformationStrategies.size
      });
      
    } catch (error) {
      this.logger.error('Failed to prepare transformations', error);
      throw error;
    }
  }

  // === TRANSFORMATION STRATEGIES ===

  async handleGenesisTransformation(intent, context) {
    this.logger.info('Beginning genesis transformation - project creation');
    
    try {
      // Show preparation phase
      await this.showPhase('preparation', 'Preparing project foundation...');
      
      // Create project through data layer
      const projectData = await this.dataLayer.performRitual('create-project', {
        name: intent.name,
        description: intent.description,
        theme: intent.theme || 'modern',
        outputDir: intent.outputDir
      });
      
      // Store current project reference
      this.currentProject = projectData.manifest;
      
      // Initialize project manager with new project
      await this.projectManager.initializeProject(projectData.manifest);
      
      // Show creation phase
      await this.showPhase('creation', 'Project foundation established...');
      
      // Generate initial layout strategy
      const layoutStrategy = await this.layoutEngine.generateOptimalStrategy(
        [], // No files yet
        { theme: this.currentProject.theme }
      );
      
      return {
        success: true,
        project: projectData.manifest,
        layoutStrategy,
        message: `Project "${intent.name}" created successfully`
      };
      
    } catch (error) {
      this.logger.error('Genesis transformation failed', error);
      throw error;
    }
  }

  async handleIntegrationTransformation(intent, context) {
    this.logger.info('Beginning integration transformation - file addition');
    
    try {
      if (!this.currentProject) {
        throw new Error('No active project for integration');
      }
      
      // Show preparation phase
      await this.showPhase('preparation', 'Preparing file integration...');
      
      // Add file through data layer with full validation
      const fileData = await this.dataLayer.performRitual('add-file', {
        filePath: intent.filePath,
        role: intent.role || 'content',
        metadata: intent.metadata || {}
      });
      
      // Update project manager
      await this.projectManager.addFile(fileData.fileEntry);
      
      // Show creation phase
      await this.showPhase('creation', 'Integrating file into project...');
      
      // Recalculate layout strategy with new file
      const currentFiles = await this.getCurrentProjectFiles();
      const layoutStrategy = await this.layoutEngine.generateOptimalStrategy(
        currentFiles,
        { theme: this.currentProject.theme }
      );
      
      // Update project layout
      await this.dataLayer.performRitual('update-manifest', {
        layout: layoutStrategy,
        modified: new Date().toISOString()
      });
      
      return {
        success: true,
        file: fileData.fileEntry,
        validation: fileData.validation,
        layoutStrategy,
        message: `File integrated successfully with ${fileData.validation.qualityAssessment.overall}% quality`
      };
      
    } catch (error) {
      this.logger.error('Integration transformation failed', error);
      throw error;
    }
  }

  async handleManifestationTransformation(intent, context) {
    this.logger.info('Beginning manifestation transformation - preview generation');
    
    try {
      if (!this.currentProject) {
        throw new Error('No active project for manifestation');
      }
      
      // Show preparation phase
      await this.showPhase('preparation', 'Preparing project manifestation...');
      
      // Get current project data
      const projectData = await this.dataLayer.performRitual('get-project');
      
      // Generate optimal layout for preview
      const layoutStrategy = await this.layoutEngine.generateOptimalStrategy(
        projectData.project.files,
        { 
          theme: this.currentProject.theme,
          viewport: intent.viewport || 'desktop'
        }
      );
      
      // Show creation phase
      await this.showPhase('creation', 'Generating preview manifestation...');
      
      // Generate Astro site with sophisticated theme system
      const astroSite = await this.astroGenerator.generateAstroSite(
        {
          ...this.currentProject,
          files: projectData.project.files,
          layout: layoutStrategy
        },
        intent.outputDir || './preview',
        {
          theme: this.currentProject.theme,
          responsive: true,
          optimization: intent.optimization !== false
        }
      );
      
      // Create preview through preview manager
      const preview = await this.previewManager.generatePreview(astroSite);
      
      return {
        success: true,
        preview,
        astroSite,
        layoutStrategy,
        message: `Preview generated with ${astroSite.pages.length} pages`
      };
      
    } catch (error) {
      this.logger.error('Manifestation transformation failed', error);
      throw error;
    }
  }

  async handleTranscendenceTransformation(intent, context) {
    this.logger.info('Beginning transcendence transformation - final export');
    
    try {
      if (!this.currentProject) {
        throw new Error('No active project for transcendence');
      }
      
      // Show preparation phase
      await this.showPhase('preparation', 'Preparing project transcendence...');
      
      // Get current project data
      const projectData = await this.dataLayer.performRitual('get-project');
      
      // Generate final layout strategy
      const layoutStrategy = await this.layoutEngine.generateOptimalStrategy(
        projectData.project.files,
        { 
          theme: this.currentProject.theme,
          optimization: 'production'
        }
      );
      
      // Show creation phase
      await this.showPhase('creation', 'Transcending project to final form...');
      
      // Generate final Astro site
      const astroSite = await this.astroGenerator.generateAstroSite(
        {
          ...this.currentProject,
          files: projectData.project.files,
          layout: layoutStrategy
        },
        intent.outputDir || './dist',
        {
          theme: this.currentProject.theme,
          responsive: true,
          optimization: true,
          production: true
        }
      );
      
      // Create final package
      const packageResult = await this.packageManager.createPackage(
        astroSite,
        {
          format: intent.format || 'zip',
          compression: intent.compression !== false,
          includeSource: intent.includeSource === true
        }
      );
      
      // Export project data
      const exportResult = await this.dataLayer.performRitual('export-project', {
        outputPath: packageResult.outputPath,
        format: intent.format || 'zip'
      });
      
      // Show celebration phase with dramatic reveal
      await this.showPhase('celebration', 'Project transcendence complete!');
      
      // Create revealable manifest for NMS integration
      const revealableManifest = await this.nmsIntegration.createRevealableManifest({
        project: this.currentProject.name,
        exported: new Date().toISOString(),
        packagePath: packageResult.packagePath,
        packageSize: this.formatFileSize(packageResult.packageSize),
        theme: this.currentProject.theme,
        files: projectData.project.files.map(file => ({
          name: file.path.split('/').pop(),
          size: this.formatFileSize(file.size),
          type: this.mapMimeTypeToCategory(file.mimeType),
          role: file.role
        }))
      });
      
      return {
        success: true,
        package: packageResult,
        export: exportResult,
        astroSite,
        layoutStrategy,
        revealableManifest,
        message: `Project transcended to ${packageResult.packagePath}`
      };
      
    } catch (error) {
      this.logger.error('Transcendence transformation failed', error);
      throw error;
    }
  }

  async handleValidationTransformation(intent, context) {
    this.logger.info('Beginning validation transformation');
    
    try {
      if (!this.currentProject) {
        throw new Error('No active project for validation');
      }
      
      // Show preparation phase
      await this.showPhase('preparation', 'Preparing comprehensive validation...');
      
      // Validate all files through data layer
      const validationResult = await this.dataLayer.performRitual('validate-files');
      
      // Show creation phase
      await this.showPhase('creation', 'Analyzing project integrity...');
      
      // Generate validation report
      const validationReport = {
        overall: validationResult.stats.valid === validationResult.stats.total ? 'EXCELLENT' : 
                 validationResult.stats.valid / validationResult.stats.total > 0.8 ? 'GOOD' : 'NEEDS_ATTENTION',
        stats: validationResult.stats,
        issues: validationResult.results.filter(r => !r.validation?.isValid || r.error),
        recommendations: this.generateValidationRecommendations(validationResult.results)
      };
      
      return {
        success: true,
        validation: validationReport,
        message: `Validation complete: ${validationReport.overall}`
      };
      
    } catch (error) {
      this.logger.error('Validation transformation failed', error);
      throw error;
    }
  }

  async handleOptimizationTransformation(intent, context) {
    this.logger.info('Beginning optimization transformation');
    
    try {
      if (!this.currentProject) {
        throw new Error('No active project for optimization');
      }
      
      // Show preparation phase
      await this.showPhase('preparation', 'Preparing project optimization...');
      
      // Get current project data
      const projectData = await this.dataLayer.performRitual('get-project');
      
      // Analyze optimization opportunities
      const optimizationAnalysis = await this.analyzeOptimizationOpportunities(projectData.project.files);
      
      // Show creation phase
      await this.showPhase('creation', 'Optimizing project configuration...');
      
      // Generate optimized layout strategy
      const optimizedLayout = await this.layoutEngine.generateOptimalStrategy(
        projectData.project.files,
        { 
          theme: this.currentProject.theme,
          optimization: 'aggressive',
          performance: true
        }
      );
      
      // Update project with optimizations
      await this.dataLayer.performRitual('update-manifest', {
        layout: optimizedLayout,
        optimization: optimizationAnalysis,
        modified: new Date().toISOString()
      });
      
      return {
        success: true,
        optimization: optimizationAnalysis,
        layout: optimizedLayout,
        message: `Optimization complete: ${optimizationAnalysis.improvements.length} improvements applied`
      };
      
    } catch (error) {
      this.logger.error('Optimization transformation failed', error);
      throw error;
    }
  }

  async handleCelebrationTransformation(intent, context) {
    this.logger.info('Beginning celebration transformation');
    
    try {
      // Show preparation phase
      await this.showPhase('preparation', 'Preparing celebration...');
      
      // Generate celebration data
      const celebrationData = {
        achievement: intent.achievement || 'Project Completion',
        progress: '100%',
        quality: intent.quality || 'Excellent',
        timestamp: new Date().toISOString(),
        project: this.currentProject?.name || 'Unknown Project'
      };
      
      // Show creation phase
      await this.showPhase('creation', 'Generating celebration...');
      
      // Create revealable celebration for NMS integration
      const revealableCelebration = await this.nmsIntegration.revealCelebration(celebrationData);
      
      return {
        success: true,
        celebration: celebrationData,
        reveal: revealableCelebration,
        message: `Celebration complete: ${celebrationData.achievement}`
      };
      
    } catch (error) {
      this.logger.error('Celebration transformation failed', error);
      throw error;
    }
  }

  // === UTILITY METHODS ===

  async initializeTransformationEngines() {
    // Initialize layout engine with project-specific settings
    await this.layoutEngine.initializeEngine({
      cacheSize: 100,
      enableOptimization: true,
      enableResponsive: true
    });
    
    // Initialize Astro generator
    this.astroGenerator.options = {
      ...this.astroGenerator.options,
      enableAdvancedFeatures: true,
      enableThemeSystem: true
    };
    
    // Initialize NMS integration
    await this.nmsIntegration.checkAvailability();
  }

  async loadProjectContext() {
    try {
      // Try to load existing project through data layer
      const projectData = await this.dataLayer.performRitual('get-project');
      if (projectData.success) {
        this.currentProject = projectData.project.manifest;
        this.logger.info('Loaded existing project context', {
          name: this.currentProject.name,
          filesCount: projectData.project.files.length
        });
      }
    } catch (error) {
      // No existing project - this is fine
      this.logger.debug('No existing project context to load');
    }
  }

  async getCurrentProjectFiles() {
    if (!this.currentProject) return [];
    
    const projectData = await this.dataLayer.performRitual('get-project');
    return projectData.project.files || [];
  }

  async analyzeOptimizationOpportunities(files) {
    const opportunities = [];
    const improvements = [];
    
    // Analyze file sizes
    const largeFiles = files.filter(file => file.size > 5 * 1024 * 1024); // > 5MB
    if (largeFiles.length > 0) {
      opportunities.push({
        type: 'FILE_SIZE',
        description: `${largeFiles.length} files are quite large`,
        files: largeFiles,
        recommendation: 'Consider compression or optimization'
      });
    }
    
    // Analyze file types
    const fileTypes = files.reduce((acc, file) => {
      const type = file.mimeType.split('/')[0];
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    if (fileTypes.image && fileTypes.image > 10) {
      opportunities.push({
        type: 'IMAGE_OPTIMIZATION',
        description: `${fileTypes.image} images could benefit from optimization`,
        recommendation: 'Use WebP format and progressive loading'
      });
    }
    
    // Generate improvements
    if (opportunities.length === 0) {
      improvements.push('Project is well-optimized');
    } else {
      improvements.push(`${opportunities.length} optimization opportunities identified`);
    }
    
    return {
      opportunities,
      improvements,
      score: Math.max(0, 100 - (opportunities.length * 10))
    };
  }

  generateValidationRecommendations(validationResults) {
    const recommendations = [];
    
    const issues = validationResults.filter(r => !r.validation?.isValid || r.error);
    
    if (issues.length === 0) {
      recommendations.push('All files are valid and well-formatted');
    } else {
      recommendations.push(`${issues.length} files need attention`);
      
      // Group issues by type
      const issueTypes = {};
      issues.forEach(issue => {
        const type = issue.validation?.code || 'UNKNOWN';
        issueTypes[type] = (issueTypes[type] || 0) + 1;
      });
      
      Object.entries(issueTypes).forEach(([type, count]) => {
        recommendations.push(`${count} files have ${type} issues`);
      });
    }
    
    return recommendations;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  mapMimeTypeToCategory(mimeType) {
    const type = mimeType.split('/')[0];
    const categoryMap = {
      'image': 'image',
      'video': 'video',
      'audio': 'audio',
      'text': 'text',
      'application': 'document'
    };
    return categoryMap[type] || 'document';
  }

  // === HEALTH CHECK ===

  async healthCheck() {
    try {
      const engines = {
        projectManager: !!this.projectManager,
        previewManager: !!this.previewManager,
        packageManager: !!this.packageManager,
        layoutEngine: !!this.layoutEngine,
        astroGenerator: !!this.astroGenerator,
        nmsIntegration: !!this.nmsIntegration
      };
      
      const strategiesCount = this.transformationStrategies.size;
      const hasActiveProject = !!this.currentProject;
      
      const allEnginesReady = Object.values(engines).every(Boolean);
      
      return {
        status: allEnginesReady && strategiesCount > 0 ? 'healthy' : 'degraded',
        details: {
          engines,
          strategiesCount,
          hasActiveProject,
          currentProject: this.currentProject?.name || null
        }
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // === CLEANUP ===

  async cleanup() {
    try {
      // Clear current project reference
      this.currentProject = null;
      
      // Clear transformation strategies
      this.transformationStrategies.clear();
      
      // Clean up engines
      if (this.layoutEngine && typeof this.layoutEngine.cleanup === 'function') {
        await this.layoutEngine.cleanup();
      }
      
      this.logger.info('Project business logic cleanup completed');
    } catch (error) {
      this.logger.error('Project business logic cleanup failed', error);
    }
  }
}