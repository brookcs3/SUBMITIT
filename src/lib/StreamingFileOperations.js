/**
 * Streaming File Operations
 * 
 * This handles large file operations with grace and intelligence,
 * providing smooth progress tracking and memory-efficient processing.
 */

import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { createHash } from 'crypto';
import { stat, mkdir, copyFile } from 'fs/promises';
import { join, dirname } from 'path';
import pRetry from 'p-retry';

export class StreamingFileOperations {
  constructor(options = {}) {
    this.options = options;
    this.maxRetries = options.maxRetries || 3;
    this.chunkSize = options.chunkSize || 64 * 1024; // 64KB chunks
    this.concurrency = options.concurrency || 4;
    this.activeOperations = new Map();
    this.operationId = 0;
  }

  // === STREAMING COPY OPERATIONS ===

  async streamCopy(sourcePath, destPath, options = {}) {
    const operationId = ++this.operationId;
    const operation = {
      id: operationId,
      type: 'copy',
      source: sourcePath,
      dest: destPath,
      startTime: Date.now(),
      status: 'running'
    };

    this.activeOperations.set(operationId, operation);

    try {
      const result = await pRetry(
        () => this.performStreamCopy(sourcePath, destPath, options, operationId),
        {
          retries: this.maxRetries,
          onFailedAttempt: (error) => {
            options.onRetry?.(error, operationId);
          }
        }
      );

      operation.status = 'completed';
      operation.endTime = Date.now();
      operation.result = result;

      return result;

    } catch (error) {
      operation.status = 'failed';
      operation.error = error.message;
      throw error;

    } finally {
      // Clean up after a delay to allow monitoring
      setTimeout(() => {
        this.activeOperations.delete(operationId);
      }, 10000);
    }
  }

  async performStreamCopy(sourcePath, destPath, options, operationId) {
    const stats = await stat(sourcePath);
    const totalSize = stats.size;
    let processedSize = 0;

    // Ensure destination directory exists
    await mkdir(dirname(destPath), { recursive: true });

    // Create streams
    const readStream = createReadStream(sourcePath, {
      highWaterMark: this.chunkSize
    });

    const writeStream = createWriteStream(destPath);

    // Create progress tracking transform
    const progressTracker = new Transform({
      transform(chunk, encoding, callback) {
        processedSize += chunk.length;
        
        const progress = {
          operationId,
          processedBytes: processedSize,
          totalBytes: totalSize,
          percentage: Math.round((processedSize / totalSize) * 100),
          speed: this.calculateSpeed(processedSize, operation.startTime)
        };

        options.onProgress?.(progress);
        
        callback(null, chunk);
      }
    });

    // Create hash calculator for integrity verification
    const hashCalculator = options.verifyIntegrity ? 
      this.createHashCalculator(options.algorithm || 'sha256') : null;

    // Build pipeline
    const streams = [readStream, progressTracker];
    if (hashCalculator) {
      streams.push(hashCalculator);
    }
    streams.push(writeStream);

    // Execute pipeline
    await pipeline(...streams);

    // Verify integrity if requested
    if (options.verifyIntegrity && hashCalculator) {
      const sourceHash = await this.calculateFileHash(sourcePath, options.algorithm || 'sha256');
      const destHash = hashCalculator.digest('hex');
      
      if (sourceHash !== destHash) {
        throw new Error('File integrity verification failed');
      }
    }

    return {
      operationId,
      sourcePath,
      destPath,
      bytesProcessed: processedSize,
      duration: Date.now() - this.activeOperations.get(operationId).startTime,
      verified: !!options.verifyIntegrity
    };
  }

  // === BATCH OPERATIONS ===

  async streamCopyBatch(operations, options = {}) {
    const batchId = ++this.operationId;
    const batchOperation = {
      id: batchId,
      type: 'batch',
      operations: operations.length,
      startTime: Date.now(),
      status: 'running',
      completed: 0,
      failed: 0
    };

    this.activeOperations.set(batchId, batchOperation);

    try {
      const results = await this.processBatchWithConcurrency(
        operations,
        options,
        batchId
      );

      batchOperation.status = 'completed';
      batchOperation.endTime = Date.now();
      batchOperation.results = results;

      return results;

    } catch (error) {
      batchOperation.status = 'failed';
      batchOperation.error = error.message;
      throw error;

    } finally {
      setTimeout(() => {
        this.activeOperations.delete(batchId);
      }, 10000);
    }
  }

  async processBatchWithConcurrency(operations, options, batchId) {
    const results = [];
    const queue = [...operations];
    const running = new Set();

    while (queue.length > 0 || running.size > 0) {
      // Start new operations up to concurrency limit
      while (running.size < this.concurrency && queue.length > 0) {
        const operation = queue.shift();
        const promise = this.streamCopy(operation.source, operation.dest, {
          ...options,
          onProgress: (progress) => {
            options.onProgress?.({
              ...progress,
              batchId,
              operation: operation.id || operation.source
            });
          }
        });

        running.add(promise);

        promise
          .then((result) => {
            results.push({ ...result, operation });
            this.activeOperations.get(batchId).completed++;
          })
          .catch((error) => {
            results.push({ error: error.message, operation });
            this.activeOperations.get(batchId).failed++;
          })
          .finally(() => {
            running.delete(promise);
          });
      }

      // Wait for at least one operation to complete
      if (running.size > 0) {
        await Promise.race(running);
      }
    }

    return results;
  }

  // === COMPRESSION STREAMING ===

  async streamCompress(sourcePath, destPath, options = {}) {
    const zlib = await import('zlib');
    const compression = options.compression || 'gzip';
    
    let compressor;
    switch (compression) {
      case 'gzip':
        compressor = zlib.createGzip({ level: options.level || 6 });
        break;
      case 'deflate':
        compressor = zlib.createDeflate({ level: options.level || 6 });
        break;
      case 'brotli':
        compressor = zlib.createBrotliCompress();
        break;
      default:
        throw new Error(`Unsupported compression: ${compression}`);
    }

    const stats = await stat(sourcePath);
    let processedSize = 0;

    const readStream = createReadStream(sourcePath, {
      highWaterMark: this.chunkSize
    });

    const writeStream = createWriteStream(destPath);

    const progressTracker = new Transform({
      transform(chunk, encoding, callback) {
        processedSize += chunk.length;
        
        options.onProgress?.({
          processedBytes: processedSize,
          totalBytes: stats.size,
          percentage: Math.round((processedSize / stats.size) * 100),
          compressionRatio: processedSize / stats.size
        });
        
        callback(null, chunk);
      }
    });

    await pipeline(readStream, progressTracker, compressor, writeStream);

    const destStats = await stat(destPath);
    
    return {
      sourcePath,
      destPath,
      originalSize: stats.size,
      compressedSize: destStats.size,
      compressionRatio: destStats.size / stats.size,
      compressionType: compression
    };
  }

  // === SMART CHUNKING ===

  async streamProcessWithChunks(filePath, processor, options = {}) {
    const stats = await stat(filePath);
    const totalSize = stats.size;
    const chunkSize = options.chunkSize || this.chunkSize;
    
    let processedSize = 0;
    let chunkIndex = 0;
    const results = [];

    const readStream = createReadStream(filePath, {
      highWaterMark: chunkSize
    });

    for await (const chunk of readStream) {
      try {
        const chunkResult = await processor(chunk, {
          index: chunkIndex,
          offset: processedSize,
          size: chunk.length,
          isLast: processedSize + chunk.length >= totalSize
        });

        results.push(chunkResult);
        processedSize += chunk.length;
        chunkIndex++;

        options.onProgress?.({
          processedBytes: processedSize,
          totalBytes: totalSize,
          percentage: Math.round((processedSize / totalSize) * 100),
          chunkIndex,
          chunkResult
        });

      } catch (error) {
        if (options.continueOnError) {
          results.push({ error: error.message, chunkIndex });
        } else {
          throw error;
        }
      }
    }

    return {
      totalChunks: chunkIndex,
      totalSize,
      processedSize,
      results
    };
  }

  // === MEMORY-EFFICIENT OPERATIONS ===

  async streamTransform(sourcePath, destPath, transformer, options = {}) {
    const stats = await stat(sourcePath);
    let processedSize = 0;

    const readStream = createReadStream(sourcePath, {
      highWaterMark: this.chunkSize
    });

    const writeStream = createWriteStream(destPath);

    const transformStream = new Transform({
      transform(chunk, encoding, callback) {
        try {
          const transformedChunk = transformer(chunk, {
            processedSize,
            totalSize: stats.size,
            percentage: Math.round((processedSize / stats.size) * 100)
          });

          processedSize += chunk.length;
          
          options.onProgress?.({
            processedBytes: processedSize,
            totalBytes: stats.size,
            percentage: Math.round((processedSize / stats.size) * 100)
          });

          callback(null, transformedChunk);

        } catch (error) {
          callback(error);
        }
      }
    });

    await pipeline(readStream, transformStream, writeStream);

    return {
      sourcePath,
      destPath,
      bytesProcessed: processedSize,
      originalSize: stats.size
    };
  }

  // === UTILITY METHODS ===

  createHashCalculator(algorithm) {
    const hash = createHash(algorithm);
    
    return new Transform({
      transform(chunk, encoding, callback) {
        hash.update(chunk);
        callback(null, chunk);
      },
      flush(callback) {
        this.digest = hash.digest.bind(hash);
        callback();
      }
    });
  }

  async calculateFileHash(filePath, algorithm = 'sha256') {
    const hash = createHash(algorithm);
    const stream = createReadStream(filePath);

    for await (const chunk of stream) {
      hash.update(chunk);
    }

    return hash.digest('hex');
  }

  calculateSpeed(processedBytes, startTime) {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const bytesPerSecond = processedBytes / elapsedSeconds;
    
    return {
      bytesPerSecond,
      humanReadable: this.formatSpeed(bytesPerSecond)
    };
  }

  formatSpeed(bytesPerSecond) {
    const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    let value = bytesPerSecond;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(1)} ${units[unitIndex]}`;
  }

  // === MONITORING AND CONTROL ===

  getActiveOperations() {
    return Array.from(this.activeOperations.values());
  }

  getOperationStatus(operationId) {
    return this.activeOperations.get(operationId);
  }

  async cancelOperation(operationId) {
    const operation = this.activeOperations.get(operationId);
    if (operation) {
      operation.status = 'cancelled';
      // In a real implementation, you'd need to track and cancel the actual streams
      return true;
    }
    return false;
  }

  // === PERFORMANCE OPTIMIZATION ===

  optimizeForFileSize(fileSize) {
    // Adjust chunk size based on file size
    if (fileSize < 1024 * 1024) { // < 1MB
      this.chunkSize = 8 * 1024; // 8KB
    } else if (fileSize < 100 * 1024 * 1024) { // < 100MB
      this.chunkSize = 64 * 1024; // 64KB
    } else if (fileSize < 1024 * 1024 * 1024) { // < 1GB
      this.chunkSize = 256 * 1024; // 256KB
    } else {
      this.chunkSize = 1024 * 1024; // 1MB
    }
  }

  // === CLEANUP ===

  async cleanup() {
    // Cancel all active operations
    const operations = Array.from(this.activeOperations.keys());
    await Promise.all(operations.map(id => this.cancelOperation(id)));
    
    // Clear tracking
    this.activeOperations.clear();
  }

  // === ADVANCED FILE OPERATIONS ===

  async streamDeduplicate(files, options = {}) {
    const hashMap = new Map();
    const duplicates = [];
    const unique = [];

    for (const file of files) {
      const hash = await this.calculateFileHash(file.path, options.algorithm || 'sha256');
      
      if (hashMap.has(hash)) {
        duplicates.push({
          file,
          duplicateOf: hashMap.get(hash)
        });
      } else {
        hashMap.set(hash, file);
        unique.push(file);
      }
    }

    return {
      unique,
      duplicates,
      stats: {
        totalFiles: files.length,
        uniqueFiles: unique.length,
        duplicateFiles: duplicates.length,
        spaceWasted: duplicates.reduce((sum, dup) => sum + dup.file.size, 0)
      }
    };
  }

  async streamSplit(filePath, chunkSize, options = {}) {
    const stats = await stat(filePath);
    const totalSize = stats.size;
    const numberOfChunks = Math.ceil(totalSize / chunkSize);
    const chunks = [];

    const readStream = createReadStream(filePath, {
      highWaterMark: chunkSize
    });

    let chunkIndex = 0;
    let processedSize = 0;

    for await (const chunk of readStream) {
      const chunkPath = `${filePath}.part${chunkIndex.toString().padStart(3, '0')}`;
      
      await this.streamCopy(
        { stream: chunk },
        chunkPath,
        {
          onProgress: (progress) => {
            options.onProgress?.({
              ...progress,
              chunkIndex,
              totalChunks: numberOfChunks
            });
          }
        }
      );

      chunks.push({
        index: chunkIndex,
        path: chunkPath,
        size: chunk.length
      });

      processedSize += chunk.length;
      chunkIndex++;
    }

    return {
      originalFile: filePath,
      totalSize,
      chunks,
      numberOfChunks: chunkIndex
    };
  }

  async streamMerge(chunkPaths, outputPath, options = {}) {
    const writeStream = createWriteStream(outputPath);
    let totalProcessed = 0;

    for (let i = 0; i < chunkPaths.length; i++) {
      const chunkPath = chunkPaths[i];
      const readStream = createReadStream(chunkPath);
      
      for await (const chunk of readStream) {
        writeStream.write(chunk);
        totalProcessed += chunk.length;
        
        options.onProgress?.({
          processedBytes: totalProcessed,
          chunkIndex: i,
          totalChunks: chunkPaths.length
        });
      }
    }

    writeStream.end();
    
    return {
      outputPath,
      totalBytes: totalProcessed,
      chunksProcessed: chunkPaths.length
    };
  }
}