/**
 * Type definitions for SmartFileHandler
 */

declare module '../ninja/SmartFileHandler' {
  export interface CacheInfo {
    hash: string;
    timestamp: number;
    dependencies: string[];
    metadata?: Record<string, any>;
  }

  export interface ProcessFileOptions {
    incremental?: boolean;
    continueOnError?: boolean;
    cache?: boolean;
    analysis?: boolean;
  }

  export interface ProcessFileResult<T = any> {
    filePath: string;
    success: boolean;
    result?: T;
    error?: Error;
    fromCache?: boolean;
  }

  export interface ProcessFilesResult<T = any> {
    results: ProcessFileResult<T>[];
    errors: Error[];
  }

  export interface Metrics {
    filesProcessed: number;
    cacheHits: number;
    cacheMisses: number;
    totalProcessingTime: number;
    cacheSize: number;
    cacheHitRatio: number;
  }

  export class SmartFileHandler {
    constructor(cacheDir?: string);
    
    cacheDir: string;
    fileCache: Map<string, CacheInfo>;
    dependencyGraph: Map<string, Set<string>>;
    reverseGraph: Map<string, Set<string>>;
    processingQueue: string[];
    metrics: Metrics;

    initialize(): Promise<void>;
    loadCacheIndex(): Promise<void>;
    saveCacheIndex(): Promise<void>;
    
    /**
     * Process multiple files with smart caching and dependency tracking
     */
    processFiles<T = any>(
      filePaths: string[], 
      processor: (content: string, filePath: string) => Promise<T> | T,
      options?: ProcessFileOptions
    ): Promise<ProcessFilesResult<T>>;

    /**
     * Process a single file with smart caching
     */
    processFile<T = any>(
      filePath: string, 
      processor: (content: string) => Promise<T> | T,
      options?: ProcessFileOptions
    ): Promise<ProcessFileResult<T>>;

    /**
     * Get processing metrics
     */
    getMetrics(): Metrics;

    /**
     * Clear the cache
     */
    clearCache(): Promise<void>;

    /**
     * Get cache information for a file
     */
    getCacheInfo(filePath: string): CacheInfo | undefined;

    /**
     * Invalidate cache for a file and its dependents
     */
    invalidateCache(filePath: string, recursive?: boolean): void;
  }

  export default SmartFileHandler;
}

export {};
