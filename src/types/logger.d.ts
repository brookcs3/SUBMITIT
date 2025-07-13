// Type definitions for the Logger utility
declare module '../utils/Logger' {
  type LogLevel = 'debug' | 'info' | 'warn' | 'error';
  
  interface LogContext {
    level: LogLevel;
    context: string;
  }

  interface LoggerOptions {
    level?: LogLevel;
    context?: string;
    format?: (level: LogLevel, message: string, context?: string) => string;
  }

  class Logger {
    constructor(options?: LoggerOptions);
    
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    
    setLevel(level: LogLevel): void;
    setContext(context: string): void;
    
    static createLogger(options?: LoggerOptions): Logger;
  }

  export default Logger;
}
