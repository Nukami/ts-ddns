import * as fs from "fs";
import { dump, formatTime } from "../utils";

export const LogLevelString = [
  "DISABLE",
  "ERROR",
  "WARN",
  "INFO",
  "DEBUG",
] as const;

export enum LogLevel {
  DISABLE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
}

export class Logger {
  private __level: LogLevel;
  private __output: string | undefined;

  constructor(level: LogLevel = LogLevel.INFO, output?: string) {
    this.__level = level;
    this.__output = output;
    if (this.__output)
      fs.mkdirSync(`${this.__output}/dumps`, { recursive: true });
  }

  setLogLevel(level: LogLevel) {
    this.__level = level;
  }

  getLogLevel(): LogLevel {
    return this.__level;
  }

  setOutput(output?: string) {
    this.__output = output;
    if (this.__output)
      fs.mkdirSync(`${this.__output}/dumps`, { recursive: true });
  }

  getOutput(): string | undefined {
    return this.__output;
  }

  log(level: LogLevel, message: string, obj?: any) {
    if (level > this.__level) return;
    const logTime = new Date();
    const dumpFileName = `${logTime.getTime()}.json`;
    if (obj && this.__output)
      fs.writeFileSync(
        `${this.__output}/dumps/${dumpFileName}`,
        JSON.stringify(dump(obj), null, 2)
      );

    const msg = `[${LogLevelString[level]}][${formatTime(logTime)}]${
      obj ? `(${dumpFileName})` : ""
    }: ${message}`;
    console.log(msg);
    if (this.__output)
      fs.appendFileSync(`${this.__output}/ts-ddns.log`, `${msg}\n`);
  }

  d(message: string, obj?: any) {
    this.log(LogLevel.DEBUG, message, obj);
  }
  i(message: string) {
    this.log(LogLevel.INFO, message);
  }
  w(message: string) {
    this.log(LogLevel.WARN, message);
  }
  e(message: string) {
    this.log(LogLevel.ERROR, message);
  }
}
