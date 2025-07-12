import { createWriteStream, createReadStream } from 'fs';
import { readdir, stat, mkdir, writeFile } from 'fs/promises';
import { join, basename } from 'path';
import archiver from 'archiver';
import { execa } from 'execa';
import chalk from 'chalk';

export class PackageManager {
  constructor() {
    this.excludePatterns = [
      /node_modules/,
      /\.git/,
      /\.DS_Store/,
      /Thumbs\.db/,
      /\.tmp/,
      /\.cache/
    ];
  }

  async exportProject(config, options, onProgress) {
    const outputDir = options.outputPath || join(process.cwd(), 'output');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Support custom naming patterns
    const customName = options.customName || options.name;
    let filename;
    
    if (customName) {
      // Replace placeholders in custom name
      filename = customName
        .replace('{name}', config.name)
        .replace('{timestamp}', timestamp)
        .replace('{date}', new Date().toISOString().split('T')[0])
        .replace('{time}', new Date().toTimeString().split(' ')[0].replace(/:/g, '-'))
        .replace('{theme}', config.theme)
        .replace('{files}', config.files.length);
    } else {
      filename = `${config.name}_${timestamp}`;
    }
    
    // Add extension if not provided
    const format = options.format || 'zip';
    if (!filename.includes('.')) {
      filename += `.${format}`;
    }
    
    const outputPath = join(outputDir, filename);

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Support multiple formats
    switch (format.toLowerCase()) {
      case 'zip':
        return await this.createZipPackage(config, outputPath, onProgress);
      case 'tar':
      case 'tar.gz':
      case 'tgz':
        return await this.createTarPackage(config, outputPath, onProgress);
      case 'rar':
        return await this.createRarPackage(config, outputPath, onProgress);
      case 'iso':
        return await this.createIsoPackage(config, outputPath, onProgress);
      case '7z':
        return await this.create7zPackage(config, outputPath, onProgress);
      default:
        throw new Error(`Unsupported format: ${format}. Supported formats: zip, tar, rar, iso, 7z`);
    }
  }

  async createZipPackage(config, outputPath, onProgress) {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      let totalSize = 0;
      let processedSize = 0;

      archive.on('progress', (progress) => {
        processedSize = progress.fs.processedBytes;
        if (onProgress) {
          onProgress({
            percent: totalSize > 0 ? Math.round((processedSize / totalSize) * 100) : 0,
            processedBytes: processedSize,
            totalBytes: totalSize
          });
        }
      });

      archive.on('error', (error) => {
        reject(error);
      });

      output.on('close', () => {
        resolve({
          path: outputPath,
          size: archive.pointer(),
          format: 'zip'
        });
      });

      archive.pipe(output);

      // Add content directory
      const contentDir = join(process.cwd(), 'content');
      this.addDirectoryToArchive(archive, contentDir, 'content/')
        .then(() => {
          // Add configuration files
          archive.file(join(process.cwd(), 'submitit.config.json'), { name: 'submitit.config.json' });
          archive.file(join(process.cwd(), 'layout.json'), { name: 'layout.json' });

          // Add generated preview (if exists)
          const astroDir = join(process.cwd(), 'astro');
          return this.addDirectoryToArchive(archive, astroDir, 'preview/', true);
        })
        .then(() => {
          // Add manifest
          const manifest = this.generateManifest(config);
          archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

          // Add README
          const readme = this.generateReadme(config);
          archive.append(readme, { name: 'README.md' });

          archive.finalize();
        })
        .catch(reject);
    });
  }

  async createTarPackage(config, outputPath, onProgress) {
    // For simplicity, we'll use the system tar command
    // In a production environment, you might want to use a Node.js tar library
    
    const tempDir = join(process.cwd(), '.tmp-package');
    await mkdir(tempDir, { recursive: true });

    try {
      // Copy files to temp directory
      await this.copyProjectFiles(config, tempDir);

      // Create tar archive
      await execa('tar', ['-czf', outputPath, '-C', tempDir, '.']);

      // Get file size
      const stats = await stat(outputPath);

      return {
        path: outputPath,
        size: stats.size,
        format: 'tar'
      };

    } finally {
      // Clean up temp directory
      await execa('rm', ['-rf', tempDir]);
    }
  }

  async addDirectoryToArchive(archive, dirPath, archivePath, optional = false) {
    try {
      const files = await readdir(dirPath, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = join(dirPath, file.name);
        const archiveFilePath = join(archivePath, file.name);

        if (this.shouldExclude(filePath)) {
          continue;
        }

        if (file.isDirectory()) {
          await this.addDirectoryToArchive(archive, filePath, archiveFilePath);
        } else {
          archive.file(filePath, { name: archiveFilePath });
        }
      }
    } catch (error) {
      if (!optional) {
        throw error;
      }
    }
  }

  shouldExclude(filePath) {
    return this.excludePatterns.some(pattern => pattern.test(filePath));
  }

  async copyProjectFiles(config, destDir) {
    // Copy content directory
    const contentDir = join(process.cwd(), 'content');
    await execa('cp', ['-r', contentDir, join(destDir, 'content')]);

    // Copy configuration files
    await execa('cp', [
      join(process.cwd(), 'submitit.config.json'),
      join(destDir, 'submitit.config.json')
    ]);

    await execa('cp', [
      join(process.cwd(), 'layout.json'),
      join(destDir, 'layout.json')
    ]);

    // Generate and save manifest
    const manifest = this.generateManifest(config);
    await writeFile(
      join(destDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    // Generate and save README
    const readme = this.generateReadme(config);
    await writeFile(join(destDir, 'README.md'), readme);
  }

  generateManifest(config) {
    return {
      project: config.name,
      version: '1.0.0',
      exported: new Date().toISOString(),
      theme: config.theme,
      metadata: config.metadata,
      files: config.files.map(file => ({
        name: file.name,
        type: file.type,
        role: file.role,
        size: file.size,
        added: file.added
      })),
      layout: config.layout,
      generator: {
        name: 'submitit',
        version: '1.0.0',
        url: 'https://github.com/cameronbrooks/submitit'
      }
    };
  }

  generateReadme(config) {
    const files = config.files || [];
    
    return `# ${config.name}

${config.metadata?.description || 'Created with submitit'}

## Project Information

- **Created**: ${new Date(config.created).toLocaleDateString()}
- **Theme**: ${config.theme}
- **Files**: ${files.length}
- **Author**: ${config.metadata?.author || 'Unknown'}

## Contents

${files.map(file => `- **${file.name}** (${file.type}) - ${file.size}`).join('\n')}

## File Structure

\`\`\`
${config.name}/
├── content/          # Project files
├── manifest.json     # Project metadata
├── layout.json       # Layout configuration
├── submitit.config.json # Project configuration
└── README.md         # This file
\`\`\`

## About submitit

This package was created using [submitit](https://github.com/cameronbrooks/submitit), a CLI tool that transforms deliverable packaging into a polished, intentional ritual.

---

*Generated on ${new Date().toISOString()}*
`;
  }

  async calculateTotalSize(directory) {
    let totalSize = 0;
    
    try {
      const files = await readdir(directory, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = join(directory, file.name);
        
        if (this.shouldExclude(filePath)) {
          continue;
        }
        
        if (file.isDirectory()) {
          totalSize += await this.calculateTotalSize(filePath);
        } else {
          const stats = await stat(filePath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Directory might not exist, that's okay
    }
    
    return totalSize;
  }

  async createRarPackage(config, outputPath, onProgress) {
    // RAR packaging using system command
    const tempDir = join(process.cwd(), '.tmp-rar-package');
    await mkdir(tempDir, { recursive: true });

    try {
      // Copy files to temp directory
      await this.copyProjectFiles(config, tempDir);

      // Create RAR archive - requires WinRAR/rar command
      try {
        await execa('rar', ['a', '-r', outputPath, '.'], { cwd: tempDir });
      } catch (error) {
        // Fallback: create zip and rename (not ideal but functional)
        console.log('RAR command not available, creating ZIP instead...');
        const zipPath = outputPath.replace('.rar', '.zip');
        const result = await this.createZipPackage(config, zipPath, onProgress);
        return { ...result, format: 'zip (rar unavailable)' };
      }

      // Get file size
      const stats = await stat(outputPath);

      return {
        path: outputPath,
        size: stats.size,
        format: 'rar'
      };

    } finally {
      // Clean up temp directory
      await execa('rm', ['-rf', tempDir]).catch(() => {});
    }
  }

  async createIsoPackage(config, outputPath, onProgress) {
    // ISO packaging using system command
    const tempDir = join(process.cwd(), '.tmp-iso-package');
    await mkdir(tempDir, { recursive: true });

    try {
      // Copy files to temp directory
      await this.copyProjectFiles(config, tempDir);

      // Create ISO archive - requires mkisofs or genisoimage
      try {
        await execa('mkisofs', [
          '-o', outputPath,
          '-J', '-r', '-V', config.name.substring(0, 16),
          tempDir
        ]);
      } catch (error) {
        try {
          await execa('genisoimage', [
            '-o', outputPath,
            '-J', '-r', '-V', config.name.substring(0, 16),
            tempDir
          ]);
        } catch (error2) {
          // Fallback: create zip
          console.log('ISO tools not available, creating ZIP instead...');
          const zipPath = outputPath.replace('.iso', '.zip');
          const result = await this.createZipPackage(config, zipPath, onProgress);
          return { ...result, format: 'zip (iso unavailable)' };
        }
      }

      // Get file size
      const stats = await stat(outputPath);

      return {
        path: outputPath,
        size: stats.size,
        format: 'iso'
      };

    } finally {
      // Clean up temp directory
      await execa('rm', ['-rf', tempDir]).catch(() => {});
    }
  }

  async create7zPackage(config, outputPath, onProgress) {
    // 7z packaging using system command
    const tempDir = join(process.cwd(), '.tmp-7z-package');
    await mkdir(tempDir, { recursive: true });

    try {
      // Copy files to temp directory
      await this.copyProjectFiles(config, tempDir);

      // Create 7z archive - requires 7z command
      try {
        await execa('7z', ['a', '-r', outputPath, '.'], { cwd: tempDir });
      } catch (error) {
        // Fallback: create zip
        console.log('7z command not available, creating ZIP instead...');
        const zipPath = outputPath.replace('.7z', '.zip');
        const result = await this.createZipPackage(config, zipPath, onProgress);
        return { ...result, format: 'zip (7z unavailable)' };
      }

      // Get file size
      const stats = await stat(outputPath);

      return {
        path: outputPath,
        size: stats.size,
        format: '7z'
      };

    } finally {
      // Clean up temp directory
      await execa('rm', ['-rf', tempDir]).catch(() => {});
    }
  }

  // Enhanced naming pattern support
  getAvailableNamingPatterns() {
    return [
      '{name}_{timestamp}',
      '{name}_{date}_{time}',
      '{name}_{theme}_{files}files',
      '{name}_v{timestamp}',
      'submitit_{name}_{date}',
      '{theme}_{name}_{files}items',
      'delivery_{name}_{date}',
      'package_{name}_{timestamp}'
    ];
  }

  // Format availability check
  async checkFormatAvailability() {
    const formats = {
      zip: true, // Always available (built-in)
      tar: true, // Always available (built-in)
      rar: false,
      iso: false,
      '7z': false
    };

    // Check for external tools
    try {
      await execa('rar', ['--version'], { stdio: 'ignore' });
      formats.rar = true;
    } catch (error) {
      // RAR not available
    }

    try {
      await execa('mkisofs', ['--version'], { stdio: 'ignore' });
      formats.iso = true;
    } catch (error) {
      try {
        await execa('genisoimage', ['--version'], { stdio: 'ignore' });
        formats.iso = true;
      } catch (error2) {
        // ISO tools not available
      }
    }

    try {
      await execa('7z', ['--version'], { stdio: 'ignore' });
      formats['7z'] = true;
    } catch (error) {
      // 7z not available
    }

    return formats;
  }
}