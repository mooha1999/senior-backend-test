import type { ILogger, LogContext } from "../interfaces/logger.interface";

class StructuredLogger implements ILogger {
  info(context: LogContext): void {
    const entry = JSON.stringify({
      level: "info",
      timestamp: new Date().toISOString(),
      ...context,
    });
    process.stdout.write(entry + "\n");
  }

  warn(context: LogContext): void {
    const entry = JSON.stringify({
      level: "warn",
      timestamp: new Date().toISOString(),
      ...context,
    });
    process.stderr.write(entry + "\n");
  }

  error(context: LogContext): void {
    const entry = JSON.stringify({
      level: "error",
      timestamp: new Date().toISOString(),
      ...context,
    });
    process.stderr.write(entry + "\n");
  }

  debug(context: LogContext): void {
    const entry = JSON.stringify({
      level: "debug",
      timestamp: new Date().toISOString(),
      ...context,
    });
    process.stdout.write(entry + "\n");
  }
}

export { StructuredLogger };
