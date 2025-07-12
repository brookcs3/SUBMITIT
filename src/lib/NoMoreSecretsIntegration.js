/**
 * No More Secrets Integration
 * 
 * This adds the dramatic "Hollywood hacker" reveal effect for file manifests
 * and other important announcements, creating peak ceremony moments.
 */

import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export class NoMoreSecretsIntegration {
  constructor(options = {}) {
    this.options = options;
    this.nmsPath = options.nmsPath || '/usr/local/bin/nms';
    this.isAvailable = null;
  }

  // === AVAILABILITY CHECK ===

  async checkAvailability() {
    if (this.isAvailable !== null) {
      return this.isAvailable;
    }

    try {
      const result = await this.executeCommand('which nms');
      this.isAvailable = result.code === 0;
      return this.isAvailable;
    } catch (error) {
      this.isAvailable = false;
      return false;
    }
  }

  // === DRAMATIC REVEALS ===

  async revealManifest(manifestData, options = {}) {
    const isAvailable = await this.checkAvailability();
    
    if (!isAvailable) {
      // Fallback to regular output
      return this.fallbackReveal(manifestData, options);
    }

    try {
      const manifestText = this.formatManifest(manifestData);
      return await this.dramaticReveal(manifestText, {
        autoDecrypt: true,
        clearScreen: true,
        ...options
      });
    } catch (error) {
      console.error('NMS reveal failed, falling back to regular output:', error.message);
      return this.fallbackReveal(manifestData, options);
    }
  }

  async revealSuccess(successData, options = {}) {
    const isAvailable = await this.checkAvailability();
    
    if (!isAvailable) {
      return this.fallbackSuccess(successData, options);
    }

    try {
      const successText = this.formatSuccess(successData);
      return await this.dramaticReveal(successText, {
        autoDecrypt: true,
        clearScreen: false,
        ...options
      });
    } catch (error) {
      console.error('NMS success reveal failed:', error.message);
      return this.fallbackSuccess(successData, options);
    }
  }

  async revealCelebration(celebrationData, options = {}) {
    const isAvailable = await this.checkAvailability();
    
    if (!isAvailable) {
      return this.fallbackCelebration(celebrationData, options);
    }

    try {
      const celebrationText = this.formatCelebration(celebrationData);
      return await this.dramaticReveal(celebrationText, {
        autoDecrypt: true,
        clearScreen: false,
        delay: 50, // Slower reveal for celebration
        ...options
      });
    } catch (error) {
      console.error('NMS celebration reveal failed:', error.message);
      return this.fallbackCelebration(celebrationData, options);
    }
  }

  // === CORE REVEAL ENGINE ===

  async dramaticReveal(text, options = {}) {
    const nmsArgs = this.buildNmsArgs(options);
    
    return new Promise((resolve, reject) => {
      const nmsProcess = spawn(this.nmsPath, nmsArgs, {
        stdio: ['pipe', 'inherit', 'inherit']
      });

      // Send the text to nms
      nmsProcess.stdin.write(text);
      nmsProcess.stdin.end();

      nmsProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, revealed: text });
        } else {
          reject(new Error(`NMS process exited with code ${code}`));
        }
      });

      nmsProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  buildNmsArgs(options) {
    const args = [];
    
    if (options.autoDecrypt) {
      args.push('-a');
    }
    
    if (options.clearScreen) {
      args.push('-c');
    }
    
    if (options.delay) {
      args.push('-d', options.delay.toString());
    }
    
    if (options.maskChar) {
      args.push('-m', options.maskChar);
    }
    
    return args;
  }

  // === FORMATTING FUNCTIONS ===

  formatManifest(manifestData) {
    const lines = [
      '═══════════════════════════════════════════════════════════',
      '                    SUBMITIT MANIFEST',
      '═══════════════════════════════════════════════════════════',
      '',
      `Project: ${manifestData.project}`,
      `Exported: ${new Date(manifestData.exported).toLocaleString()}`,
      `Package: ${manifestData.packagePath}`,
      `Size: ${manifestData.packageSize}`,
      `Theme: ${manifestData.theme}`,
      '',
      'FILES INCLUDED:',
      '─────────────────────────────────────────────────────────',
    ];

    manifestData.files.forEach((file, index) => {
      const fileIcon = this.getFileIcon(file.type);
      lines.push(`${fileIcon} ${file.name} (${file.size}) [${file.role}]`);
    });

    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('                MANIFEST COMPLETE');
    lines.push('═══════════════════════════════════════════════════════════');

    return lines.join('\n');
  }

  formatSuccess(successData) {
    const lines = [
      '🎉 SUBMITIT EXPORT COMPLETE 🎉',
      '',
      `✅ ${successData.message}`,
      `📦 Package: ${successData.packagePath || 'Ready'}`,
      `⏱️  Duration: ${successData.duration || 'Complete'}`,
      '',
      '🧘 Your submission awaits the world.',
      '   You may step away from the terminal with pride.'
    ];

    return lines.join('\n');
  }

  formatCelebration(celebrationData) {
    const lines = [
      '🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊',
      '                                                              ',
      '              ✨ CELEBRATION COMPLETE ✨                     ',
      '                                                              ',
      '🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊',
      '',
      `🏆 Achievement: ${celebrationData.achievement}`,
      `📈 Progress: ${celebrationData.progress || '100%'}`,
      `🎯 Quality: ${celebrationData.quality || 'Excellent'}`,
      '',
      '🎵 The ceremony is complete.',
      '🌟 Your work has been transformed.',
      '🚀 Ready for the world to see.',
      '',
      '🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊'
    ];

    return lines.join('\n');
  }

  // === FALLBACK METHODS ===

  fallbackReveal(manifestData, options) {
    const manifestText = this.formatManifest(manifestData);
    console.log(manifestText);
    return { success: true, revealed: manifestText };
  }

  fallbackSuccess(successData, options) {
    const successText = this.formatSuccess(successData);
    console.log(successText);
    return { success: true, revealed: successText };
  }

  fallbackCelebration(celebrationData, options) {
    const celebrationText = this.formatCelebration(celebrationData);
    console.log(celebrationText);
    return { success: true, revealed: celebrationText };
  }

  // === UTILITY METHODS ===

  getFileIcon(type) {
    const icons = {
      'document': '📄',
      'image': '🖼️',
      'text': '📝',
      'audio': '🎵',
      'video': '🎬',
      'archive': '🗂️',
      'code': '💻'
    };
    return icons[type] || '📎';
  }

  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      const process = spawn('sh', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  // === ADVANCED REVEAL MODES ===

  async revealWithCustomAnimation(text, animationConfig = {}) {
    const isAvailable = await this.checkAvailability();
    
    if (!isAvailable) {
      console.log(text);
      return { success: true, revealed: text };
    }

    const config = {
      delay: 25,
      maskChar: '█',
      autoDecrypt: true,
      clearScreen: false,
      ...animationConfig
    };

    return await this.dramaticReveal(text, config);
  }

  async revealStaged(textSections, options = {}) {
    const results = [];
    
    for (let i = 0; i < textSections.length; i++) {
      const section = textSections[i];
      const isLast = i === textSections.length - 1;
      
      const result = await this.dramaticReveal(section, {
        autoDecrypt: true,
        clearScreen: i === 0,
        delay: options.delay || 30,
        ...options
      });
      
      results.push(result);
      
      // Brief pause between sections
      if (!isLast && options.pauseBetween !== false) {
        await new Promise(resolve => setTimeout(resolve, options.pauseDuration || 1000));
      }
    }
    
    return results;
  }

  // === INTEGRATION HELPERS ===

  async createRevealableManifest(manifestData) {
    return {
      reveal: async (options = {}) => {
        return await this.revealManifest(manifestData, options);
      },
      fallback: () => {
        return this.fallbackReveal(manifestData, {});
      },
      data: manifestData
    };
  }

  async createRevealableSuccess(successData) {
    return {
      reveal: async (options = {}) => {
        return await this.revealSuccess(successData, options);
      },
      fallback: () => {
        return this.fallbackSuccess(successData, {});
      },
      data: successData
    };
  }

  // === PERFORMANCE MONITORING ===

  async measureRevealPerformance(text, options = {}) {
    const startTime = Date.now();
    
    try {
      const result = await this.dramaticReveal(text, options);
      const duration = Date.now() - startTime;
      
      return {
        ...result,
        performance: {
          duration,
          textLength: text.length,
          charactersPerSecond: text.length / (duration / 1000)
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      throw new Error(`NMS reveal failed after ${duration}ms: ${error.message}`);
    }
  }
}