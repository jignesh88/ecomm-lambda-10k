export interface LogMetadata {
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  requestId?: string;
  userId?: string;
  correlationId?: string;
  duration?: number;
  [key: string]: any;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private metadata: LogMetadata = {};
  private requestId?: string;
  private correlationId?: string;
  private startTime?: number;

  constructor() {
    this.startTime = Date.now();
  }

  setRequestId(requestId: string) {
    this.requestId = requestId;
    this.metadata.requestId = requestId;
  }

  setCorrelationId(correlationId: string) {
    this.correlationId = correlationId;
    this.metadata.correlationId = correlationId;
  }

  setUserId(userId: string) {
    this.metadata.userId = userId;
  }

  addMetadata(meta: LogMetadata) {
    this.metadata = { ...this.metadata, ...meta };
  }

  private shouldLog(level: LogLevel): boolean {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...this.metadata,
    };

    if (this.startTime) {
      logEntry.duration = Date.now() - this.startTime;
    }

    if (data) {
      if (data instanceof Error) {
        logEntry.error = {
          name: data.name,
          message: data.message,
          stack: data.stack,
        };
      } else {
        Object.assign(logEntry, data);
      }
    }

    return logEntry;
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry = this.formatLog(level, message, data);
    
    // In Lambda, console.log outputs to CloudWatch
    console.log(JSON.stringify(logEntry));

    // In development, also log to console for better readability
    if (process.env.NODE_ENV === 'development') {
      const colorMap = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
      };
      const resetColor = '\x1b[0m';
      const color = colorMap[level] || '';
      
      console.log(
        `${color}[${level.toUpperCase()}]${resetColor} ${message}`,
        data ? data : ''
      );
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  child(metadata: LogMetadata): Logger {
    const childLogger = new Logger();
    childLogger.metadata = { ...this.metadata, ...metadata };
    childLogger.requestId = this.requestId;
    childLogger.correlationId = this.correlationId;
    childLogger.startTime = this.startTime;
    return childLogger;
  }

  timer(): { end: (message: string, data?: any) => void } {
    const startTime = Date.now();
    return {
      end: (message: string, data?: any) => {
        const duration = Date.now() - startTime;
        this.info(message, { ...data, duration });
      },
    };
  }

  // Performance logging
  logPerformance(operation: string, duration: number, metadata?: LogMetadata) {
    this.info(`Performance: ${operation}`, {
      operation,
      duration,
      ...metadata,
    });
  }

  // Database query logging
  logQuery(sql: string, params?: any[], duration?: number) {
    this.debug('Database query', {
      sql: sql.replace(/\s+/g, ' ').trim(),
      paramCount: params?.length || 0,
      duration,
    });
  }

  // Cache operation logging
  logCache(operation: 'get' | 'set' | 'del', key: string, hit?: boolean, ttl?: number) {
    this.debug(`Cache ${operation}`, {
      operation,
      key,
      hit,
      ttl,
    });
  }

  // API request logging
  logRequest(method: string, path: string, statusCode?: number, duration?: number) {
    this.info('API Request', {
      method,
      path,
      statusCode,
      duration,
    });
  }

  // Business event logging
  logEvent(event: string, data?: any) {
    this.info(`Event: ${event}`, {
      event,
      ...data,
    });
  }
}

// Global logger instance
export const logger = new Logger();

// Helper function to create request-scoped logger
export function createRequestLogger(requestId: string): Logger {
  const requestLogger = new Logger();
  requestLogger.setRequestId(requestId);
  return requestLogger;
}

// Helper function to measure execution time
export async function measureTime<T>(
  operation: string,
  fn: () => Promise<T>,
  logger?: Logger
): Promise<T> {
  const startTime = Date.now();
  const log = logger || new Logger();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    log.logPerformance(operation, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    log.error(`${operation} failed`, { duration, error });
    throw error;
  }
}
