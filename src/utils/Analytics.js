/**
 * Simple Analytics Implementation
 */

export class Analytics {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.anonymous = options.anonymous !== false;
    this.events = [];
  }

  track(event, data = {}) {
    if (!this.enabled) return;

    this.events.push({
      event,
      data: this.anonymous ? this.anonymizeData(data) : data,
      timestamp: Date.now()
    });
  }

  anonymizeData(data) {
    // Simple anonymization - remove sensitive fields
    const anonymized = { ...data };
    const sensitiveFields = ['path', 'filename', 'user', 'email'];
    
    sensitiveFields.forEach(field => {
      if (anonymized[field]) {
        delete anonymized[field];
      }
    });
    
    return anonymized;
  }

  async flush() {
    // In a real implementation, this would send events to analytics service
    if (this.events.length > 0) {
      console.log(`[Analytics] Flushing ${this.events.length} events`);
      this.events = [];
    }
  }
}