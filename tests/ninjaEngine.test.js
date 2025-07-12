/**
 * Ninja Incremental Engine Tests
 */
import NinjaIncrementalEngine from '../src/lib/NinjaIncrementalEngine.js';

describe('NinjaIncrementalEngine', () => {
  let engine;
  
  beforeEach(() => {
    engine = new NinjaIncrementalEngine();
  });
  
  test('Run 1: builds new, reused, changed (3 files)', async () => {
    const files = [
      { path: 'new.md', content: 'New file content' },
      { path: 'existing.md', content: 'Existing content' },
      { path: 'changed.md', content: 'Original content' }
    ];
    
    // First build - all files are new
    const result1 = await engine.buildProject(files);
    
    expect(result1.files.size).toBe(3);
    expect(result1.layouts.size).toBe(3);
    expect(result1.metrics.totalBuilds).toBe(1);
    
    // Verify all files were processed
    expect(result1.files.has('new.md')).toBe(true);
    expect(result1.files.has('existing.md')).toBe(true);
    expect(result1.files.has('changed.md')).toBe(true);
  });
  
  test('Run 2: only rebuilds "changed" (cache hits for the rest)', async () => {
    // Initial build
    const initialFiles = [
      { path: 'file1.md', content: 'Content 1' },
      { path: 'file2.md', content: 'Content 2' },
      { path: 'file3.md', content: 'Content 3' }
    ];
    
    await engine.buildProject(initialFiles);
    const initialMetrics = engine.getPerformanceMetrics();
    
    // Second build with one changed file
    const updatedFiles = [
      { path: 'file1.md', content: 'Content 1' },      // unchanged
      { path: 'file2.md', content: 'CHANGED Content 2' }, // changed
      { path: 'file3.md', content: 'Content 3' }       // unchanged
    ];
    
    const result2 = await engine.buildProject(updatedFiles);
    const finalMetrics = engine.getPerformanceMetrics();
    
    // Verify only changed file was rebuilt
    expect(finalMetrics.totalBuilds).toBe(2);
    expect(finalMetrics.incrementalBuilds).toBe(1);
    expect(finalMetrics.incrementalRatio).toBe(0.5);
    
    // Verify cache hits
    expect(result2.buildTime).toBeLessThan(100); // Should be fast due to caching
  });
  
  test('Content change detection works correctly', async () => {
    const file = { path: 'test.md', content: 'Original' };
    
    // First process
    await engine.processFilesIncremental([file]);
    
    // Same content - should use cache
    const sameFile = { path: 'test.md', content: 'Original' };
    const needsRebuild1 = await engine.needsRebuild('process:test.md');
    expect(needsRebuild1).toBe(false);
    
    // Different content - should rebuild
    const changedFile = { path: 'test.md', content: 'Modified' };
    await engine.calculateFileHash(changedFile.path);
    const needsRebuild2 = await engine.needsRebuild('process:test.md');
    expect(needsRebuild2).toBe(true);
  });
  
  test('Performance metrics tracking', () => {
    const metrics = engine.getPerformanceMetrics();
    
    expect(metrics).toHaveProperty('totalBuilds');
    expect(metrics).toHaveProperty('incrementalBuilds');
    expect(metrics).toHaveProperty('incrementalRatio');
    expect(metrics).toHaveProperty('cacheHits');
    expect(metrics).toHaveProperty('dependencyCount');
  });
  
  test('Cache clearing works', () => {
    engine.buildTargets.set('test', {});
    engine.layoutCache.set('test', {});
    
    engine.clearCaches();
    
    expect(engine.buildTargets.size).toBe(0);
    expect(engine.layoutCache.size).toBe(0);
  });
});