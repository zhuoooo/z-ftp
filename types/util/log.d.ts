/**
 * @file 日志工具函数
 */
declare class Logger {
    private clientLogger;
    private devLogger;
    constructor();
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    fatal(message: string, ...args: any[]): void;
    mark(message: string, ...args: any[]): void;
    addContext(key: any, value: any): void;
}
declare let logger: Logger;
declare function setLogInfo(opt: any): void;
export { logger, setLogInfo };
