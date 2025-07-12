/**
 * Project Data Access Layer
 * 
 * This is the Foundation of our temple - where all project data is stored, retrieved,
 * and managed with sacred reverence. Every file interaction becomes a ritual,
 * every data operation a ceremony of intention.
 */

import { AbstractDataAccess } from '../core/AbstractLayers.js';
import { FileValidator } from '../lib/FileValidator.js';
import { StreamingFileOperations } from '../lib/StreamingFileOperations.js';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';

export class ProjectDataAccess extends AbstractDataAccess {
  constructor(context) {
    super(context);
    this.projectRoot = null;
    this.fileValidator = new FileValidator();
    this.streamingOps = new StreamingFileOperations();
    this.projectManifest = null;
    this.fileRegistry = new Map();
    this.metadataCache = new Map();
  }

  // === SACRED INITIALIZATION ===

  async establishConnection() {
    try {
      this.logger.debug('Establishing connection to project data foundation');
      
      // Initialize project root directory
      if (!this.projectRoot) {
        this.projectRoot = process.cwd();
      }
      
      // Ensure project structure exists
      await this.createProjectStructure();
      
      // Load existing manifest if available
      await this.loadProjectManifest();
      
      this.logger.info('Project data foundation established', {
        projectRoot: this.projectRoot,
        manifestExists: !!this.projectManifest
      });
      
    } catch (error) {
      this.logger.error('Failed to establish project data connection', error);
      throw error;
    }
  }

  async validateIntegrity() {
    try {
      this.logger.debug('Validating project data integrity');
      
      // Check project structure
      const structureValid = await this.validateProjectStructure();
      if (!structureValid) {
        throw new Error('Project structure integrity compromised');
      }
      
      // Validate manifest consistency
      if (this.projectManifest) {
        const manifestValid = await this.validateManifestConsistency();
        if (!manifestValid) {
          throw new Error('Project manifest integrity compromised');
        }
      }
      
      this.logger.info('Project data integrity validated');
      return true;
      
    } catch (error) {
      this.logger.error('Project data integrity validation failed', error);
      throw error;
    }
  }

  // === SACRED OPERATIONS ===

  async executeRitual(operation, data, options = {}) {
    switch (operation) {
      case 'create-project':
        return await this.createProjectRitual(data, options);
      
      case 'add-file':
        return await this.addFileRitual(data, options);
      
      case 'remove-file':
        return await this.removeFileRitual(data, options);
      
      case 'get-project':
        return await this.getProjectRitual(data, options);
      
      case 'get-file':
        return await this.getFileRitual(data, options);
      
      case 'update-manifest':
        return await this.updateManifestRitual(data, options);
      
      case 'export-project':
        return await this.exportProjectRitual(data, options);
      
      case 'validate-files':
        return await this.validateFilesRitual(data, options);
      
      default:
        throw new Error(`Unknown data operation: ${operation}`);
    }
  }

  // === PROJECT MANAGEMENT RITUALS ===

  async createProjectRitual(projectData, options) {
    const { name, description, theme, outputDir } = projectData;
    
    // Create project manifest
    const manifest = {
      name,
      description,
      theme: theme || 'modern',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '1.0.0',
      files: [],
      metadata: {
        outputDir: outputDir || join(this.projectRoot, 'dist'),
        buildSettings: {
          compression: true,
          optimization: true,
          validation: true
        }
      }
    };
    
    // Set project root if specified
    if (options.projectRoot) {
      this.projectRoot = options.projectRoot;
      await this.createProjectStructure();
    }
    
    // Save manifest
    await this.saveProjectManifest(manifest);
    this.projectManifest = manifest;
    
    this.logger.info('Project creation ritual completed', {
      name,
      projectRoot: this.projectRoot
    });
    
    return {
      success: true,
      manifest,
      projectRoot: this.projectRoot
    };
  }

  async addFileRitual(fileData, options) {
    const { filePath, role, metadata } = fileData;
    
    // Validate file with full pipeline
    const validation = await this.fileValidator.validateFile(filePath);
    if (!validation.isValid) {
      throw new Error(`File validation failed: ${validation.reason || validation.error}`);
    }
    
    // Generate file ID
    const fileId = this.generateFileId(filePath);
    
    // Create file registry entry
    const fileEntry = {
      id: fileId,
      path: filePath,
      role: role || 'content',
      added: new Date().toISOString(),
      validation,
      metadata: {
        ...validation.metadata,
        ...metadata
      }
    };
    
    // Store in registry
    this.fileRegistry.set(fileId, fileEntry);
    
    // Add to manifest
    if (this.projectManifest) {
      this.projectManifest.files.push({
        id: fileId,
        path: filePath,
        role: fileEntry.role,
        size: validation.stats.size,
        mimeType: validation.contentAnalysis.mimeType,
        added: fileEntry.added
      });
      
      this.projectManifest.modified = new Date().toISOString();
      await this.saveProjectManifest(this.projectManifest);
    }
    
    this.logger.info('File addition ritual completed', {
      fileId,
      filePath,
      role: fileEntry.role,
      validation: validation.qualityAssessment.overall
    });
    
    return {
      success: true,
      fileId,
      fileEntry,
      validation
    };
  }

  async removeFileRitual(fileData, options) {
    const { fileId, filePath } = fileData;
    
    // Find file by ID or path
    const targetId = fileId || this.findFileIdByPath(filePath);
    if (!targetId) {
      throw new Error('File not found in project');
    }
    
    // Remove from registry
    const fileEntry = this.fileRegistry.get(targetId);
    this.fileRegistry.delete(targetId);
    
    // Remove from manifest
    if (this.projectManifest) {
      this.projectManifest.files = this.projectManifest.files.filter(f => f.id !== targetId);
      this.projectManifest.modified = new Date().toISOString();
      await this.saveProjectManifest(this.projectManifest);
    }
    
    this.logger.info('File removal ritual completed', {
      fileId: targetId,
      filePath: fileEntry?.path
    });
    
    return {
      success: true,
      fileId: targetId,
      removedFile: fileEntry
    };
  }

  async getProjectRitual(data, options) {
    if (!this.projectManifest) {
      throw new Error('No project manifest loaded');
    }
    
    const projectData = {
      manifest: this.projectManifest,
      files: Array.from(this.fileRegistry.values()),
      stats: {
        totalFiles: this.fileRegistry.size,
        totalSize: this.calculateTotalSize(),
        lastModified: this.projectManifest.modified
      }
    };
    
    return {
      success: true,
      project: projectData
    };
  }

  async getFileRitual(fileData, options) {
    const { fileId, filePath } = fileData;
    
    // Find file by ID or path
    const targetId = fileId || this.findFileIdByPath(filePath);
    if (!targetId) {
      throw new Error('File not found in project');
    }
    
    const fileEntry = this.fileRegistry.get(targetId);
    
    // Load file content if requested
    if (options.includeContent) {
      try {
        const content = await fs.readFile(fileEntry.path);
        fileEntry.content = content;
      } catch (error) {
        this.logger.warn('Failed to load file content', {
          fileId: targetId,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      file: fileEntry
    };
  }

  async updateManifestRitual(manifestData, options) {
    if (!this.projectManifest) {
      throw new Error('No project manifest to update');
    }
    
    // Update manifest fields
    const updatedManifest = {
      ...this.projectManifest,
      ...manifestData,
      modified: new Date().toISOString()
    };
    
    // Save updated manifest
    await this.saveProjectManifest(updatedManifest);
    this.projectManifest = updatedManifest;
    
    this.logger.info('Manifest update ritual completed');
    
    return {
      success: true,
      manifest: updatedManifest
    };
  }

  async exportProjectRitual(exportData, options) {
    const { outputPath, format } = exportData;
    
    if (!this.projectManifest) {
      throw new Error('No project to export');
    }
    
    // Use streaming operations for memory efficiency
    const exportResult = await this.streamingOps.streamCopyBatch(
      this.projectManifest.files.map(file => ({
        source: file.path,
        dest: join(outputPath, file.id),
        id: file.id
      })),
      {
        onProgress: (progress) => {
          this.emit('export-progress', progress);
        }
      }
    );
    
    // Create export manifest
    const exportManifest = {
      ...this.projectManifest,
      exported: new Date().toISOString(),
      exportPath: outputPath,
      format,
      files: exportResult.map(result => ({
        ...this.projectManifest.files.find(f => f.id === result.operation.id),
        exportPath: result.destPath,
        exported: result.success
      }))
    };
    
    // Save export manifest
    await fs.writeFile(
      join(outputPath, 'submitit-manifest.json'),
      JSON.stringify(exportManifest, null, 2)
    );
    
    this.logger.info('Project export ritual completed', {
      outputPath,
      filesExported: exportResult.length
    });
    
    return {
      success: true,
      manifest: exportManifest,
      exportResult
    };
  }

  async validateFilesRitual(data, options) {
    const validationResults = [];
    
    for (const [fileId, fileEntry] of this.fileRegistry) {
      try {
        const validation = await this.fileValidator.validateFile(fileEntry.path);
        validationResults.push({
          fileId,
          path: fileEntry.path,
          validation
        });
      } catch (error) {
        validationResults.push({
          fileId,
          path: fileEntry.path,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      results: validationResults,
      stats: {
        total: validationResults.length,
        valid: validationResults.filter(r => r.validation?.isValid).length,
        invalid: validationResults.filter(r => !r.validation?.isValid || r.error).length
      }
    };
  }

  // === UTILITY METHODS ===

  async createProjectStructure() {
    const dirs = [
      join(this.projectRoot, '.submitit'),
      join(this.projectRoot, '.submitit', 'cache'),
      join(this.projectRoot, '.submitit', 'temp'),
      join(this.projectRoot, 'dist')
    ];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        if (error.code !== 'EEXIST') {
          throw error;
        }
      }
    }
  }

  async loadProjectManifest() {
    try {
      const manifestPath = join(this.projectRoot, '.submitit', 'manifest.json');
      const manifestData = await fs.readFile(manifestPath, 'utf8');
      this.projectManifest = JSON.parse(manifestData);
      
      // Rebuild file registry from manifest
      if (this.projectManifest.files) {
        for (const file of this.projectManifest.files) {
          this.fileRegistry.set(file.id, {
            id: file.id,
            path: file.path,
            role: file.role,
            added: file.added,
            size: file.size,
            mimeType: file.mimeType
          });
        }
      }
      
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.warn('Failed to load project manifest', error);
      }
    }
  }

  async saveProjectManifest(manifest) {
    const manifestPath = join(this.projectRoot, '.submitit', 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  }

  async validateProjectStructure() {
    try {
      const requiredDirs = [
        join(this.projectRoot, '.submitit'),
        join(this.projectRoot, '.submitit', 'cache'),
        join(this.projectRoot, '.submitit', 'temp')
      ];
      
      for (const dir of requiredDirs) {
        await fs.access(dir);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async validateManifestConsistency() {
    try {
      // Check if all files in manifest exist
      for (const file of this.projectManifest.files) {
        await fs.access(file.path);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  generateFileId(filePath) {
    const hash = require('crypto').createHash('md5');
    hash.update(filePath + Date.now());
    return hash.digest('hex').substring(0, 8);
  }

  findFileIdByPath(filePath) {
    for (const [id, entry] of this.fileRegistry) {
      if (entry.path === filePath) {
        return id;
      }
    }
    return null;
  }

  calculateTotalSize() {
    return Array.from(this.fileRegistry.values())
      .reduce((total, file) => total + (file.size || 0), 0);
  }

  // === HEALTH CHECK ===

  async healthCheck() {
    try {
      const isConnected = !!this.projectRoot;
      const manifestLoaded = !!this.projectManifest;
      const structureValid = await this.validateProjectStructure();
      
      return {
        status: isConnected && structureValid ? 'healthy' : 'degraded',
        details: {
          connected: isConnected,
          manifestLoaded,
          structureValid,
          filesRegistered: this.fileRegistry.size,
          projectRoot: this.projectRoot
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
      // Clear caches
      this.fileRegistry.clear();
      this.metadataCache.clear();
      
      // Clean up streaming operations
      if (this.streamingOps) {
        await this.streamingOps.cleanup();
      }
      
      this.logger.info('Project data access cleanup completed');
    } catch (error) {
      this.logger.error('Project data access cleanup failed', error);
    }
  }
}