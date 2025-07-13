/**
 * Type definitions for YogaMemoryOptimizer
 */

declare module './YogaMemoryOptimizer' {
  /**
   * Memory usage statistics
   */
  export interface MemoryStats {
    /** Heap used in bytes */
    heapUsed: number;
    /** Heap total in bytes */
    heapTotal: number;
    /** External memory in bytes */
    external: number;
    /** Array buffers in bytes */
    arrayBuffers: number;
    /** RSS (Resident Set Size) in bytes */
    rss: number;
  }

  /**
   * Memory optimization options
   */
  export interface OptimizationOptions {
    /** Enable garbage collection (default: true) */
    gc?: boolean;
    /** Enable memory usage monitoring (default: true) */
    monitor?: boolean;
    /** Enable leak detection (default: false) */
    detectLeaks?: boolean;
    /** Enable memory compression (default: false) */
    compressMemory?: boolean;
    /** Memory usage threshold in MB (default: 100) */
    memoryThreshold?: number;
    /** Check interval in milliseconds (default: 5000) */
    checkInterval?: number;
    /** Maximum number of snapshots to keep (default: 10) */
    maxSnapshots?: number;
    /** Enable detailed logging (default: false) */
    verbose?: boolean;
  }

  /**
   * Memory leak information
   */
  export interface LeakInfo {
    /** Leak detection timestamp */
    timestamp: number;
    /** Duration of the leak check in ms */
    duration: number;
    /** Number of potential leaks found */
    leakCount: number;
    /** Details about potential leaks */
    leaks: Array<{
      /** Type of the leaked object */
      type: string;
      /** Number of instances */
      count: number;
      /** Size in bytes */
      size: number;
      /** Stack trace where the objects were allocated */
      stack: string[];
    }>;
    /** Memory stats at the time of detection */
    memory: MemoryStats;
  }

  /**
   * Memory snapshot
   */
  export interface MemorySnapshot {
    /** Snapshot timestamp */
    timestamp: number;
    /** Memory usage statistics */
    memory: MemoryStats;
    /** Node.js version */
    nodeVersion: string;
    /** Process arguments */
    execArgv: string[];
    /** Process title */
    title: string;
    /** Process uptime in seconds */
    uptime: number;
    /** Process resource usage */
    resourceUsage: NodeJS.ResourceUsage;
  }

  /**
   * A utility for optimizing and monitoring memory usage in Yoga layouts
   */
  export default class YogaMemoryOptimizer {
    /**
     * Create a new memory optimizer
     * @param options Optimization options
     */
    constructor(options?: OptimizationOptions);

    /**
     * Start memory monitoring
     */
    startMonitoring(): void;

    /**
     * Stop memory monitoring
     */
    stopMonitoring(): void;

    /**
     * Force garbage collection
     */
    forceGC(): void;

    /**
     * Take a memory snapshot
     */
    takeSnapshot(): Promise<MemorySnapshot>;

    /**
     * Compare two memory snapshots
     * @param snapshot1 First snapshot
     * @param snapshot2 Second snapshot
     */
    compareSnapshots(snapshot1: MemorySnapshot, snapshot2: MemorySnapshot): {
      /** Difference in heap used in bytes */
      heapUsedDiff: number;
      /** Difference in heap total in bytes */
      heapTotalDiff: number;
      /** Difference in external memory in bytes */
      externalDiff: number;
      /** Difference in array buffers in bytes */
      arrayBuffersDiff: number;
      /** Difference in RSS in bytes */
      rssDiff: number;
      /** Time difference in milliseconds */
      timeDiff: number;
    };

    /**
     * Check for memory leaks
     */
    checkForLeaks(): Promise<LeakInfo>;

    /**
     * Get current memory usage
     */
    getMemoryUsage(): MemoryStats;

    /**
     * Get memory usage as a human-readable string
     */
    getMemoryUsageString(): string;

    /**
     * Optimize memory usage
     */
    optimize(): Promise<void>;

    /**
     * Reset the optimizer
     */
    reset(): void;

    /**
     * Get all memory snapshots
     */
    getSnapshots(): MemorySnapshot[];

    /**
     * Clear all memory snapshots
     */
    clearSnapshots(): void;

    /**
     * Get the last memory snapshot
     */
    getLastSnapshot(): MemorySnapshot | null;

    /**
     * Get the first memory snapshot
     */
    getFirstSnapshot(): MemorySnapshot | null;

    /**
     * Get the maximum memory usage
     */
    getMaxMemoryUsage(): MemoryStats;

    /**
     * Get the minimum memory usage
     */
    getMinMemoryUsage(): MemoryStats;

    /**
     * Get the average memory usage
     */
    getAverageMemoryUsage(): MemoryStats;
  }
}
