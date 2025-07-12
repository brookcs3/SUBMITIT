/**
 * PackageManager - Export project output and generate distribution manifests
 */
import { writeFile, mkdir, copyFile, readFile, stat } from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { createHash } from 'crypto';
import { globalErrorHandler } from './ErrorHandler.js';
import { pipeline } from 'stream/promises';

export class PackageManager {
  constructor(outputDir = './dist') {
    this.outputDir = outputDir;
    this.manifest = {
      version: '1.0.0',
      generated: null,
      project: null,
      files: [],
      roles: {},
      assets: [],
      dependencies: {},
      buildInfo: {}
    };
    this.compressionLevel = 6;
    this.streamChunkSize = 64 * 1024; // 64KB chunks for streaming
  }

  /**
   * Initialize package manager and create output directory
   */
  async initialize(projectConfig) {
    try {
      await mkdir(this.outputDir, { recursive: true });
      await mkdir(join(this.outputDir, 'assets'), { recursive: true });
      await mkdir(join(this.outputDir, 'content'), { recursive: true });
      
      this.manifest.project = {
        name: projectConfig.name,
        version: projectConfig.version,
        theme: projectConfig.theme,
        layout: projectConfig.layout
      };
      
      return true;
    } catch (error) {
      throw globalErrorHandler.createError(
        'PACKAGE_INIT_ERROR',
        `Failed to initialize package manager: ${error.message}`,
        { outputDir: this.outputDir }
      );
    }
  }

  /**
   * Export project files with role-based organization
   */
  async exportProject(projectFiles, options = {}) {
    try {
      console.log(`📦 Exporting ${projectFiles.length} files...`);
      
      const { streaming = true, compress = false, minify = false } = options;
      const exportedFiles = [];
      const assets = [];
      
      // Group files by role for organized export
      const filesByRole = this.groupFilesByRole(projectFiles);
      
      for (const [role, files] of Object.entries(filesByRole)) {
        console.log(`📂 Processing ${role}: ${files.length} files`);
        
        const roleDir = join(this.outputDir, 'content', role);
        await mkdir(roleDir, { recursive: true });
        
        for (const file of files) {
          if (streaming) {
            const result = await this.streamFile(file, roleDir, { compress, minify });
            exportedFiles.push(result);
          } else {
            const result = await this.copyFile(file, roleDir, { compress, minify });
            exportedFiles.push(result);
          }
          
          // Extract assets (images, etc.)
          if (file.metadata?.images) {
            for (const imagePath of file.metadata.images) {
              const asset = await this.processAsset(imagePath);
              if (asset) assets.push(asset);
            }
          }
        }
        
        // Create role index
        await this.createRoleIndex(role, files, roleDir);
      }
      
      // Update manifest
      this.manifest.files = exportedFiles;
      this.manifest.assets = assets;
      this.manifest.roles = this.generateRoleStats(filesByRole);
      this.manifest.generated = new Date().toISOString();
      
      // Save manifest
      await this.saveManifest();
      
      // Generate additional outputs
      if (options.generateIndex) {
        await this.generateProjectIndex(filesByRole);
      }
      
      if (options.generateSitemap) {
        await this.generateSitemap(exportedFiles);
      }
      
      console.log(`✅ Export complete: ${exportedFiles.length} files, ${assets.length} assets`);
      
      return {
        files: exportedFiles,
        assets,
        manifest: this.manifest,
        outputDir: this.outputDir
      };
      
    } catch (error) {
      throw globalErrorHandler.createError(
        'EXPORT_ERROR',
        `Failed to export project: ${error.message}`,
        { projectFiles: projectFiles.length, options }
      );
    }
  }

  /**
   * Stream file for memory-efficient copying
   */
  async streamFile(file, targetDir, options = {}) {
    try {
      const targetPath = join(targetDir, basename(file.path));
      const stats = await stat(file.path);
      
      if (stats.size > this.streamChunkSize) {
        // Use streaming for large files
        const readStream = createReadStream(file.path, { 
          highWaterMark: this.streamChunkSize 
        });
        const writeStream = createWriteStream(targetPath);
        
        await pipeline(readStream, writeStream);
      } else {
        // Direct copy for small files
        await copyFile(file.path, targetPath);
      }
      
      // Calculate file hash
      const content = await readFile(targetPath, 'utf8').catch(() => null);
      const hash = content ? createHash('md5').update(content).digest('hex') : null;
      
      return {
        originalPath: file.path,
        exportPath: targetPath,
        relativePath: join('content', file.role, basename(file.path)),
        role: file.role,
        size: stats.size,
        hash,
        exported: new Date().toISOString(),
        streaming: stats.size > this.streamChunkSize
      };
      
    } catch (error) {
      throw globalErrorHandler.createError(
        'STREAM_FILE_ERROR',
        `Failed to stream file: ${error.message}`,
        { filePath: file.path, targetDir }
      );
    }
  }

  /**
   * Copy file (non-streaming)
   */
  async copyFile(file, targetDir, options = {}) {
    try {
      const targetPath = join(targetDir, basename(file.path));
      await copyFile(file.path, targetPath);
      
      const stats = await stat(targetPath);
      const content = await readFile(targetPath, 'utf8').catch(() => null);
      const hash = content ? createHash('md5').update(content).digest('hex') : null;
      
      return {
        originalPath: file.path,
        exportPath: targetPath,
        relativePath: join('content', file.role, basename(file.path)),
        role: file.role,
        size: stats.size,
        hash,
        exported: new Date().toISOString(),
        streaming: false
      };
      
    } catch (error) {
      throw globalErrorHandler.createError(
        'COPY_FILE_ERROR',
        `Failed to copy file: ${error.message}`,
        { filePath: file.path, targetDir }
      );
    }
  }

  /**
   * Process asset files (images, etc.)
   */
  async processAsset(assetPath) {
    try {
      const stats = await stat(assetPath).catch(() => null);
      if (!stats) return null;
      
      const assetName = basename(assetPath);
      const targetPath = join(this.outputDir, 'assets', assetName);
      
      if (stats.size > this.streamChunkSize) {
        // Stream large assets
        const readStream = createReadStream(assetPath);
        const writeStream = createWriteStream(targetPath);
        await pipeline(readStream, writeStream);
      } else {
        await copyFile(assetPath, targetPath);
      }
      
      return {
        originalPath: assetPath,
        exportPath: targetPath,
        relativePath: join('assets', assetName),
        size: stats.size,
        type: this.getAssetType(extname(assetName)),
        exported: new Date().toISOString()
      };
      
    } catch (error) {
      console.warn(`Warning: Could not process asset ${assetPath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Group files by their assigned roles
   */
  groupFilesByRole(projectFiles) {
    const grouped = {};
    
    for (const file of projectFiles) {
      const role = file.role || 'content';
      if (!grouped[role]) grouped[role] = [];
      grouped[role].push(file);
    }
    
    return grouped;
  }

  /**
   * Generate role-based statistics
   */
  generateRoleStats(filesByRole) {
    const stats = {};
    
    for (const [role, files] of Object.entries(filesByRole)) {
      stats[role] = {
        count: files.length,
        totalSize: files.reduce((sum, file) => sum + (file.size || 0), 0),
        extensions: [...new Set(files.map(file => file.extension))],
        lastModified: Math.max(...files.map(file => 
          file.mtime ? new Date(file.mtime).getTime() : 0
        ))
      };
    }
    
    return stats;
  }

  /**
   * Create index file for each role
   */
  async createRoleIndex(role, files, roleDir) {
    const indexData = {
      role,
      count: files.length,
      files: files.map(file => ({
        name: basename(file.path),
        size: file.size,
        metadata: file.metadata,
        hash: file.contentHash
      })),
      generated: new Date().toISOString()
    };
    
    const indexPath = join(roleDir, 'index.json');
    await writeFile(indexPath, JSON.stringify(indexData, null, 2));
  }

  /**
   * Generate main project index
   */
  async generateProjectIndex(filesByRole) {
    const index = {
      project: this.manifest.project,
      structure: {},
      navigation: [],
      statistics: {
        totalFiles: 0,
        totalSize: 0,
        roles: Object.keys(filesByRole).length
      }
    };
    
    for (const [role, files] of Object.entries(filesByRole)) {
      index.structure[role] = files.map(file => ({
        name: basename(file.path),
        path: join('content', role, basename(file.path)),
        size: file.size,
        type: this.getFileType(file.extension)
      }));
      
      index.navigation.push({
        role,
        label: this.getRoleLabel(role),
        icon: this.getRoleIcon(role),
        count: files.length,
        path: `content/${role}/`
      });
      
      index.statistics.totalFiles += files.length;
      index.statistics.totalSize += files.reduce((sum, file) => sum + (file.size || 0), 0);
    }
    
    const indexPath = join(this.outputDir, 'index.json');
    await writeFile(indexPath, JSON.stringify(index, null, 2));
  }

  /**
   * Generate sitemap for exported content
   */
  async generateSitemap(exportedFiles) {
    const sitemap = {
      version: '1.0',
      generated: new Date().toISOString(),
      urls: exportedFiles.map(file => ({
        path: file.relativePath,
        role: file.role,
        lastmod: file.exported,
        size: file.size
      }))
    };
    
    const sitemapPath = join(this.outputDir, 'sitemap.json');
    await writeFile(sitemapPath, JSON.stringify(sitemap, null, 2));
  }

  /**
   * Save manifest file
   */
  async saveManifest() {
    const manifestPath = join(this.outputDir, 'manifest.json');
    await writeFile(manifestPath, JSON.stringify(this.manifest, null, 2));
  }

  /**
   * Create distribution package
   */
  async createDistributionPackage(options = {}) {
    try {
      const { format = 'zip', includeSource = false } = options;
      
      // This would integrate with archival libraries
      console.log(`📦 Creating ${format} distribution package...`);
      
      const packageInfo = {
        format,
        includeSource,
        created: new Date().toISOString(),
        size: await this.calculatePackageSize(),
        files: this.manifest.files.length,
        assets: this.manifest.assets.length
      };
      
      // Save package info
      const packagePath = join(this.outputDir, 'package.json');
      await writeFile(packagePath, JSON.stringify(packageInfo, null, 2));
      
      return packageInfo;
      
    } catch (error) {
      throw globalErrorHandler.createError(
        'PACKAGE_CREATE_ERROR',
        `Failed to create distribution package: ${error.message}`,
        { options }
      );
    }
  }

  /**
   * Calculate total package size
   */
  async calculatePackageSize() {
    let totalSize = 0;
    
    for (const file of this.manifest.files) {
      totalSize += file.size || 0;
    }
    
    for (const asset of this.manifest.assets) {
      totalSize += asset.size || 0;
    }
    
    return totalSize;
  }

  /**
   * Get asset type from extension
   */
  getAssetType(extension) {
    const types = {
      '.jpg': 'image',
      '.jpeg': 'image',
      '.png': 'image',
      '.gif': 'image',
      '.webp': 'image',
      '.svg': 'image',
      '.mp3': 'audio',
      '.wav': 'audio',
      '.mp4': 'video',
      '.mov': 'video',
      '.css': 'style',
      '.js': 'script',
      '.pdf': 'document'
    };
    return types[extension] || 'file';
  }

  /**
   * Get file type from extension
   */
  getFileType(extension) {
    const types = {
      '.md': 'markdown',
      '.txt': 'text',
      '.html': 'html',
      '.json': 'data',
      '.yaml': 'data',
      '.yml': 'data'
    };
    return types[extension] || 'file';
  }

  /**
   * Get role display label
   */
  getRoleLabel(role) {
    const labels = {
      hero: 'Hero Content',
      bio: 'Biography',
      resume: 'Resume',
      projects: 'Projects',
      gallery: 'Gallery',
      contact: 'Contact',
      styles: 'Stylesheets',
      scripts: 'Scripts',
      content: 'Content'
    };
    return labels[role] || role.charAt(0).toUpperCase() + role.slice(1);
  }

  /**
   * Get role icon
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
   * Get export statistics
   */
  getExportStats() {
    return {
      totalFiles: this.manifest.files.length,
      totalAssets: this.manifest.assets.length,
      totalSize: this.manifest.files.reduce((sum, file) => sum + (file.size || 0), 0),
      roles: Object.keys(this.manifest.roles).length,
      generated: this.manifest.generated,
      outputDir: this.outputDir
    };
  }

  /**
   * Clean output directory
   */
  async clean() {
    try {
      const { rm } = await import('fs/promises');
      await rm(this.outputDir, { recursive: true, force: true });
      await mkdir(this.outputDir, { recursive: true });
      
      // Reset manifest
      this.manifest = {
        version: '1.0.0',
        generated: null,
        project: null,
        files: [],
        roles: {},
        assets: [],
        dependencies: {},
        buildInfo: {}
      };
      
    } catch (error) {
      throw globalErrorHandler.createError(
        'CLEAN_ERROR',
        `Failed to clean output directory: ${error.message}`,
        { outputDir: this.outputDir }
      );
    }
  }
}

export default PackageManager;