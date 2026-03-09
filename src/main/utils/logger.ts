/**
 * Logger utility for the main process.
 *
 * Writes structured log lines to both the console and a rotating log file so
 * that production issues can be diagnosed even after the console is gone.
 *
 * File rotation strategy:
 *  - A new log file is created each calendar day.
 *  - Files older than MAX_LOG_FILES days are automatically deleted.
 *  - Each line is JSON-formatted for easy parsing by log-aggregation tools.
 */

import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

const LEVEL_RANK: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

/** Maximum number of daily log files to keep. */
const MAX_LOG_FILES = 7;

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private logDir: string | null = null;

  /**
   * Call once after the Electron app is ready so that we have a valid user
   * data directory to write logs into.
   */
  setLogDirectory(dir: string): void {
    this.logDir = path.join(dir, 'logs');
    try {
      fs.mkdirSync(this.logDir, { recursive: true });
    } catch {
      // If we can't create the directory, fall back to console-only logging.
      this.logDir = null;
    }
    this.pruneOldLogs();
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  debug(message: string, ...args: unknown[]): void {
    this.emit(LogLevel.DEBUG, message, args);
  }

  info(message: string, ...args: unknown[]): void {
    this.emit(LogLevel.INFO, message, args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.emit(LogLevel.WARN, message, args);
  }

  error(message: string, error?: Error, ...args: unknown[]): void {
    this.emit(LogLevel.ERROR, message, [error, ...args].filter(Boolean));
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_RANK[level] >= LEVEL_RANK[this.logLevel];
  }

  private emit(level: LogLevel, message: string, args: unknown[]): void {
    if (!this.shouldLog(level)) return;

    const entry = this.buildEntry(level, message, args);
    this.writeToConsole(level, entry);
    this.writeToFile(entry);
  }

  private buildEntry(level: LogLevel, message: string, args: unknown[]): string {
    const record: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (args.length > 0) {
      // Serialize errors specially so their stack traces survive JSON.stringify
      record['details'] = args.map((a) => {
        if (a instanceof Error) {
          return { name: a.name, message: a.message, stack: a.stack };
        }
        return a;
      });
    }

    return JSON.stringify(record);
  }

  private writeToConsole(level: LogLevel, entry: string): void {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(entry);
        break;
      case LogLevel.WARN:
        console.warn(entry);
        break;
      case LogLevel.ERROR:
        console.error(entry);
        break;
      default:
        console.log(entry);
    }
  }

  private writeToFile(entry: string): void {
    if (!this.logDir) return;

    const filename = `miniGamba-${this.todayString()}.log`;
    const filePath = path.join(this.logDir, filename);

    try {
      fs.appendFileSync(filePath, entry + '\n', 'utf8');
    } catch {
      // Silently swallow write errors — we must never crash the app over logging.
    }
  }

  private todayString(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /** Remove log files older than MAX_LOG_FILES days. */
  private pruneOldLogs(): void {
    if (!this.logDir) return;

    try {
      const files = fs
        .readdirSync(this.logDir)
        .filter((f) => f.startsWith('miniGamba-') && f.endsWith('.log'))
        .sort(); // ISO date prefix → lexicographic sort = chronological order

      const excess = files.length - MAX_LOG_FILES;
      for (let i = 0; i < excess; i++) {
        fs.unlinkSync(path.join(this.logDir!, files[i]));
      }
    } catch {
      // Ignore cleanup errors.
    }
  }
}

export const logger = new Logger();
