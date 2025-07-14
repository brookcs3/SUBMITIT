/**
 * Type definitions for Logger
 */

declare module './Logger.js' {
  /**
   * Log levels
   */
  export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

  /**
   * Logger configuration
   */
  export interface LoggerOptions {
    level?: LogLevel;
    context?: string;
  }

  /**
   * A simple logging utility
   */
  export class Logger {
    constructor(options?: LoggerOptions);
    
    /** Log level */
    level: LogLevel;
    
    /** Log context */
    context: string;
    
    /** Log levels mapping */
    levels: {
      debug: number;
      info: number;
      warn: number;
      error: number;
    };

    /**
     * Log a debug message
     * @param message Message to log
     * @param args Additional arguments
     */
    debug(message: string, ...args: any[]): void;
    
    /**
     * Log an info message
     * @param message Message to log
     * @param args Additional arguments
     */
    info(message: string, ...args: any[]): void;
    
    /**
     * Log a warning message
     * @param message Message to log
     * @param args Additional arguments
     */
    warn(message: string, ...args: any[]): void;
    
    /**
     * Log an error message
     * @param message Message to log
     * @param args Additional arguments
     */
    error(message: string, ...args: any[]): void;
  }
}

export {};
