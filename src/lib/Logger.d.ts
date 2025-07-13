/**
 * Type definitions for Logger
 */

declare module './Logger' {
  /**
   * Log levels
   */
  export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

  /**
   * Log entry
   */
  export interface LogEntry {
    /** Log level */
    level: LogLevel;
    /** Log message */
    message: string;
    /** Optional data to log */
    data?: any;
    /** Timestamp of the log entry */
    timestamp: Date;
    /** Optional namespace/category for the log entry */
    namespace?: string;
    /** Optional error object */
    error?: Error;
  }

  /**
   * Logger configuration
   */
  export interface LoggerConfig {
    /** Minimum log level to output */
    level?: LogLevel;
    /** Whether to enable colors in the output */
    colors?: boolean;
    /** Whether to show timestamps */
    timestamps?: boolean;
    /** Whether to show log levels */
    showLevel?: boolean;
    /** Whether to show the namespace */
    showNamespace?: boolean;
    /** Whether to output to the console */
    console?: boolean;
    /** Whether to write to a file */
    file?: boolean | string;
    /** Custom log format function */
    format?: (entry: LogEntry) => string;
    /** Custom log transport functions */
    transports?: Array<(entry: LogEntry) => void>;
  }

  /**
   * A flexible logging utility
   */
  export default class Logger {
    /**
     * Create a new logger instance
     * @param namespace Optional namespace for the logger
     * @param config Logger configuration
     */
    constructor(namespace?: string, config?: LoggerConfig);

    /**
     * Log an error message
     * @param message Message to log
     * @param data Optional data to include
     */
    error(message: string, data?: any): void;

    /**
     * Log a warning message
     * @param message Message to log
     * @param data Optional data to include
     */
    warn(message: string, data?: any): void;

    /**
     * Log an informational message
     * @param message Message to log
     * @param data Optional data to include
     */
    info(message: string, data?: any): void;

    /**
     * Log a debug message
     * @param message Message to log
     * @param data Optional data to include
     */
    debug(message: string, data?: any): void;

    /**
     * Log a trace message
     * @param message Message to log
     * @param data Optional data to include
     */
    trace(message: string, data?: any): void;

    /**
     * Log a message at the specified level
     * @param level Log level
     * @param message Message to log
     * @param data Optional data to include
     */
    log(level: LogLevel, message: string, data?: any): void;

    /**
     * Create a child logger with a sub-namespace
     * @param namespace Sub-namespace to append
     */
    child(namespace: string): Logger;

    /**
     * Set the log level
     * @param level New log level
     */
    setLevel(level: LogLevel): void;

    /**
     * Enable the logger
     */
    enable(): void;

    /**
     * Disable the logger
     */
    disable(): void;

    /**
     * Add a custom transport
     * @param transport Transport function
     */
    addTransport(transport: (entry: LogEntry) => void): void;

    /**
     * Remove a transport
     * @param transport Transport function to remove
     */
    removeTransport(transport: (entry: LogEntry) => void): void;

    /**
     * Create a new logger with the specified configuration
     * @param config Logger configuration
     */
    static create(config?: LoggerConfig): Logger;

    /**
     * Get the global logger instance
     */
    static getLogger(): Logger;

    /**
     * Configure the global logger
     * @param config Logger configuration
     */
    static configure(config: LoggerConfig): void;
  }
}
