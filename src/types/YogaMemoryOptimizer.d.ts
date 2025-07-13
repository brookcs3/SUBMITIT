// Type definitions for YogaMemoryOptimizer
declare module '../lib/YogaMemoryOptimizer' {
  interface NodePoolConfig {
    initialSize?: number;
    maxSize?: number;
    shrinkThreshold?: number;
  }

  interface MemoryStats {
    totalNodes: number;
    activeNodes: number;
    cachedNodes: number;
    memoryUsage: number;
    cacheHits: number;
    cacheMisses: number;
    cacheEfficiency: number;
  }

  interface NodeEntry {
    id: string;
    type: string;
    lastUsed: number;
    size: number;
    config: Record<string, any>;
  }

  class AdvancedNodePool {
    constructor(config?: NodePoolConfig);
    
    acquire(type: string, config?: Record<string, any>): any;
    release(node: any): void;
    clear(): void;
    stats(): { size: number; available: number; inUse: number };
  }

  class YogaMemoryOptimizer {
    constructor(options?: {
      maxPoolSize?: number;
      gcInterval?: number;
      memoryReportInterval?: number;
      leakDetectionInterval?: number;
    });

    static createNode(type: string, config?: Record<string, any>): any;
    static destroyNode(node: any): void;
    
    acquireNode(type: string, config?: Record<string, any>): any;
    releaseNode(node: any): void;
    
    startGC(interval?: number): void;
    stopGC(): void;
    
    startMemoryReporting(interval?: number): void;
    stopMemoryReporting(): void;
    
    startLeakDetection(interval?: number): void;
    stopLeakDetection(): void;
    
    getStats(): MemoryStats;
    getNodePoolStats(type?: string): Record<string, any>;
    
    private nodePools: Record<string, AdvancedNodePool>;
    private gcInterval?: NodeJS.Timeout;
    private memoryReportInterval?: NodeJS.Timeout;
    private leakDetectionInterval?: NodeJS.Timeout;
    private nodeRegistry: Map<string, NodeEntry>;
  }

  export default YogaMemoryOptimizer;
}
