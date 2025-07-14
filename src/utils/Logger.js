/**
 * Simple Logger Implementation
 * @module Logger
 */

/**
 * Available log levels
 * @typedef {'error' | 'warn' | 'info' | 'debug'} LogLevel
 */

/**
 * Logger configuration options
 * @typedef {Object} LoggerOptions
 * @property {LogLevel} [level=info] - The minimum log level to display
 * @property {string} [context=submitit] - The context prefix for log messages
 */

/** @type {LogLevel} */
const DEFAULT_LEVEL = 'info';

/** @type {Required<LoggerOptions>} */
const DEFAULT_OPTIONS = {
  level: DEFAULT_LEVEL,
  context: 'submitit'
};

/**
 * A simple logging utility
 */
export class Logger {
  /**
   * Create a new Logger instance
   * @param {LoggerOptions} [options] - Logger options
   */
  constructor(options = {}) {
    const config = { ...DEFAULT_OPTIONS, ...options };
    
    /** @type {LogLevel} */
    this.level = config.level || DEFAULT_LEVEL;
    
    /** @type {string} */
    this.context = config.context || 'submitit';
    
    /** @type {Record<string, number>} */
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }

  /**
   * Log a debug message
   * @param {string} message - Message to log
   * @param {...unknown} args - Additional arguments to log
   * @returns {void}
   */
  debug(message, ...args) {
    if (this.levels[this.level] <= this.levels.debug) {
      console.log(`[${this.context}] DEBUG:`, message, ...args);
    }
  }

  /**
   * Log an info message
   * @param {string} message - Message to log
   * @param {...unknown} args - Additional arguments to log
   * @returns {void}
   */
  info(message, ...args) {
    if (this.levels[this.level] <= this.levels.info) {
      console.log(`[${this.context}] INFO:`, message, ...args);
    }
  }

  /**
   * Log a warning message
   * @param {string} message - Message to log
   * @param {...unknown} args - Additional arguments to log
   * @returns {void}
   */
  warn(message, ...args) {
    if (this.levels[this.level] <= this.levels.warn) {
      console.warn(`[${this.context}] WARN:`, message, ...args);
    }
  }

  /**
   * Log an error message
   * @param {string} message - Message to log
   * @param {Error|unknown} [error] - Optional error object
   * @param {...unknown} args - Additional arguments to log
   * @returns {void}
   */
  error(message, error, ...args) {
    if (this.levels[this.level] <= this.levels.error) {
      console.error(`[${this.context}] ERROR:`, message, ...args);
      if (error instanceof Error) {
        console.error(error.stack || error.message);
      } else if (error) {
        console.error(String(error));
      }
    }
  }

  /**
   * Set the log level
   * @param {LogLevel} level - The new log level
   * @returns {void}
   */
  setLevel(level) {
    if (Object.prototype.hasOwnProperty.call(this.levels, level)) {
      this.level = level;
    } else {
      this.warn(`Invalid log level: ${level}. Using 'info' instead.`);
      this.level = 'info';
    }
  }
}

// Create a default logger instance
export const logger = new Logger();

// Export the Logger class as default
export default Logger;