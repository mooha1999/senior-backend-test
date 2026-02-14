interface LogContext {
  message: string;
  [key: string]: unknown;
}

interface ILogger {
  info(context: LogContext): void;
  warn(context: LogContext): void;
  error(context: LogContext): void;
  debug(context: LogContext): void;
}

export type { ILogger, LogContext };
