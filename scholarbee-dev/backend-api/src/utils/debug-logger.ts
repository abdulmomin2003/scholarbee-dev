import * as fs from 'fs';
import * as path from 'path';

export class DebugLogger {
  private static logFile = path.join(process.cwd(), 'debug-refresh-token.log');
  private static isInitialized = false;

  static initialize() {
    if (!this.isInitialized) {
      // Clear the log file on startup
      fs.writeFileSync(this.logFile, '');
      this.isInitialized = true;
    }
  }

  static log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;

    if (data) {
      const dataStr =
        typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
      fs.appendFileSync(this.logFile, `${logEntry}\n${dataStr}\n\n`);
    } else {
      fs.appendFileSync(this.logFile, `${logEntry}\n`);
    }

    // Also log to console for immediate feedback
    console.log(logEntry, data || '');
  }

  static logTokenComparison(
    requestNumber: number,
    token: string,
    hash: string,
    storedHash: string,
  ) {
    this.log(`=== TOKEN COMPARISON REQUEST #${requestNumber} ===`, {
      tokenStart: token.substring(0, 50),
      tokenEnd: token.substring(token.length - 20),
      tokenLength: token.length,
      incomingHashStart: hash.substring(0, 20),
      incomingHashEnd: hash.substring(hash.length - 20),
      storedHashStart: storedHash.substring(0, 20),
      storedHashEnd: storedHash.substring(storedHash.length - 20),
      hashesMatch: hash === storedHash,
    });
  }
}
