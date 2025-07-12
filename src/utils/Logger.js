/**
 * Simple Logger Implementation
 */

export class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.context = options.context || 'submitit';
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }

  debug(message, ...args) {
    if (this.levels[this.level] <= this.levels.debug) {
      console.log(`[${this.context}] DEBUG:`, message, ...args);
    }
  }

  info(message, ...args) {
    if (this.levels[this.level] <= this.levels.info) {
      console.log(`[${this.context}] INFO:`, message, ...args);
    }
  }

  warn(message, ...args) {
    if (this.levels[this.level] <= this.levels.warn) {
      console.warn(`[${this.context}] WARN:`, message, ...args);
    }
  }

  error(message, ...args) {
    if (this.levels[this.level] <= this.levels.error) {
      console.error(`[${this.context}] ERROR:`, message, ...args);
    }
  }
}