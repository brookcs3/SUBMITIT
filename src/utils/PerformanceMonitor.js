/**
 * Simple Performance Monitor Implementation
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTimes = new Map();
  }

  start(operation) {
    this.startTimes.set(operation, Date.now());
  }

  end(operation) {
    const startTime = this.startTimes.get(operation);
    if (startTime) {
      const duration = Date.now() - startTime;
      
      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, []);
      }
      
      this.metrics.get(operation).push(duration);
      this.startTimes.delete(operation);
      
      return duration;
    }
    return 0;
  }

  getReport() {
    const report = {};
    
    for (const [operation, durations] of this.metrics) {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const max = Math.max(...durations);
      const min = Math.min(...durations);
      
      report[operation] = {
        count: durations.length,
        average: Math.round(avg),
        max,
        min,
        total: durations.reduce((a, b) => a + b, 0)
      };
    }
    
    return report;
  }
}