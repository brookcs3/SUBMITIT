/**
 * Memoized Ink Rendering - Prevent unnecessary re-renders of hot components
 */
import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { createHash } from 'crypto';

export class MemoizedInkRenderer {
  constructor() {
    this.componentCache = new Map();
    this.renderMetrics = {
      totalRenders: 0,
      cachedRenders: 0,
      memoHits: 0
    };
  }

  /**
   * Create a memoized version of an Ink component
   */
  createMemoizedComponent(Component, compareProps = null) {
    const MemoizedComponent = memo(Component, compareProps || this.defaultPropsComparison);
    
    // Add render tracking
    const TrackedComponent = (props) => {
      const renderCount = useRef(0);
      const lastRenderTime = useRef(Date.now());
      
      useEffect(() => {
        renderCount.current++;
        lastRenderTime.current = Date.now();
        this.renderMetrics.totalRenders++;
      });

      return React.createElement(MemoizedComponent, {
        ...props,
        __renderCount: renderCount.current,
        __lastRender: lastRenderTime.current
      });
    };

    TrackedComponent.displayName = `Memoized(${Component.displayName || Component.name})`;
    return TrackedComponent;
  }

  /**
   * Default props comparison for memoization
   */
  defaultPropsComparison(prevProps, nextProps) {
    // Quick reference check
    if (prevProps === nextProps) {
      this.renderMetrics.memoHits++;
      return true;
    }

    // Check prop keys
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    if (prevKeys.length !== nextKeys.length) {
      return false;
    }

    // Deep comparison for specific props
    for (const key of prevKeys) {
      if (key.startsWith('__')) continue; // Skip internal props
      
      if (!this.deepEquals(prevProps[key], nextProps[key])) {
        return false;
      }
    }

    this.renderMetrics.memoHits++;
    return true;
  }

  /**
   * Deep equality check for props
   */
  deepEquals(a, b) {
    if (a === b) return true;
    
    if (a == null || b == null) return a === b;
    
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      
      if (Array.isArray(a)) {
        if (a.length !== b.length) return false;
        return a.every((item, index) => this.deepEquals(item, b[index]));
      }
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      return keysA.every(key => this.deepEquals(a[key], b[key]));
    }
    
    return a === b;
  }

  /**
   * Create a component with custom memoization strategy
   */
  createCustomMemoComponent(Component, memoStrategy) {
    const strategies = {
      // Only re-render if specified props change
      propsWhitelist: (whitelist) => (prevProps, nextProps) => {
        return whitelist.every(prop => 
          this.deepEquals(prevProps[prop], nextProps[prop])
        );
      },
      
      // Re-render if any of these props change
      propsBlacklist: (blacklist) => (prevProps, nextProps) => {
        return !blacklist.some(prop => 
          !this.deepEquals(prevProps[prop], nextProps[prop])
        );
      },
      
      // Hash-based comparison
      hash: () => (prevProps, nextProps) => {
        const prevHash = this.hashProps(prevProps);
        const nextHash = this.hashProps(nextProps);
        return prevHash === nextHash;
      },
      
      // Never re-render (for static components)
      never: () => () => true,
      
      // Always re-render (for dynamic components)
      always: () => () => false
    };

    const compareFunction = strategies[memoStrategy.type]?.(memoStrategy.config);
    return this.createMemoizedComponent(Component, compareFunction);
  }

  /**
   * Hash props for comparison
   */
  hashProps(props) {
    const cleanProps = { ...props };
    // Remove functions and internal props
    Object.keys(cleanProps).forEach(key => {
      if (typeof cleanProps[key] === 'function' || key.startsWith('__')) {
        delete cleanProps[key];
      }
    });
    
    return createHash('md5')
      .update(JSON.stringify(cleanProps, Object.keys(cleanProps).sort()))
      .digest('hex');
  }

  /**
   * Create a hook for memoized values
   */
  useMemoizedValue(factory, deps, key) {
    return useMemo(() => {
      const cached = this.componentCache.get(key);
      if (cached && this.deepEquals(cached.deps, deps)) {
        this.renderMetrics.cachedRenders++;
        return cached.value;
      }
      
      const value = factory();
      this.componentCache.set(key, { value, deps: [...deps] });
      return value;
    }, deps);
  }

  /**
   * Create a memoized callback
   */
  useMemoizedCallback(callback, deps, key) {
    return useCallback(() => {
      const cached = this.componentCache.get(key);
      if (cached && this.deepEquals(cached.deps, deps)) {
        this.renderMetrics.cachedRenders++;
        return cached.callback;
      }
      
      const memoizedCallback = callback;
      this.componentCache.set(key, { callback: memoizedCallback, deps: [...deps] });
      return memoizedCallback;
    }, deps);
  }

  /**
   * Hot component wrapper - for frequently updating components
   */
  createHotComponent(Component, hotConfig = {}) {
    const {
      updateInterval = 100,     // Throttle updates
      maxRenderRate = 60,       // Max FPS
      enableBatching = true     // Batch rapid updates
    } = hotConfig;

    let lastRender = 0;
    let pendingUpdate = null;
    let updateQueue = [];

    const HotComponent = (props) => {
      const [, forceUpdate] = React.useState({});
      const propsRef = useRef(props);
      
      // Throttle updates for hot components
      const throttledUpdate = useCallback(() => {
        const now = Date.now();
        const timeSinceLastRender = now - lastRender;
        const minInterval = 1000 / maxRenderRate;
        
        if (timeSinceLastRender >= minInterval) {
          lastRender = now;
          forceUpdate({});
        } else if (enableBatching && !pendingUpdate) {
          pendingUpdate = setTimeout(() => {
            pendingUpdate = null;
            lastRender = Date.now();
            forceUpdate({});
          }, minInterval - timeSinceLastRender);
        }
      }, []);

      // Update props ref and trigger throttled update
      useEffect(() => {
        if (!this.deepEquals(propsRef.current, props)) {
          propsRef.current = props;
          if (enableBatching) {
            updateQueue.push(props);
            if (updateQueue.length === 1) {
              setTimeout(() => {
                updateQueue = [];
                throttledUpdate();
              }, updateInterval);
            }
          } else {
            throttledUpdate();
          }
        }
      }, [props, throttledUpdate]);

      return React.createElement(Component, propsRef.current);
    };

    HotComponent.displayName = `Hot(${Component.displayName || Component.name})`;
    return HotComponent;
  }

  /**
   * Performance monitoring for renders
   */
  getPerformanceMetrics() {
    const memoHitRatio = this.renderMetrics.totalRenders > 0 
      ? this.renderMetrics.memoHits / this.renderMetrics.totalRenders 
      : 0;

    return {
      ...this.renderMetrics,
      memoHitRatio,
      cachedComponents: this.componentCache.size,
      efficiency: memoHitRatio * 100
    };
  }

  /**
   * Clear component cache
   */
  clearCache() {
    this.componentCache.clear();
    this.renderMetrics = {
      totalRenders: 0,
      cachedRenders: 0,
      memoHits: 0
    };
  }

  /**
   * Debug render performance
   */
  debugRenderPerformance() {
    const metrics = this.getPerformanceMetrics();
    
    console.log('🎭 Ink Render Performance:');
    console.log(`  Total renders: ${metrics.totalRenders}`);
    console.log(`  Memo hits: ${metrics.memoHits} (${metrics.efficiency.toFixed(1)}%)`);
    console.log(`  Cached renders: ${metrics.cachedRenders}`);
    console.log(`  Cached components: ${metrics.cachedComponents}`);
    
    if (metrics.efficiency < 50) {
      console.log('⚠️  Low memoization efficiency - consider optimizing component props');
    } else if (metrics.efficiency > 80) {
      console.log('✅ Excellent memoization efficiency');
    }
  }
}

// Global memoized renderer instance
export const globalMemoRenderer = new MemoizedInkRenderer();

// Export convenience functions
export const createMemoComponent = (Component, compareProps) => 
  globalMemoRenderer.createMemoizedComponent(Component, compareProps);

export const createHotComponent = (Component, config) => 
  globalMemoRenderer.createHotComponent(Component, config);

export default MemoizedInkRenderer;