/**
 * @file 日志工具函数
 */

import { configure, getLogger } from 'log4js';

configure({
    appenders: {

        // 输出到控制台
        out: {
            type: 'stdout',

            layout: {
                type: 'pattern',
                pattern: "[%d] [%p] [%c] [用户名:%X{username}] [服务器:%X{host}] - %m"
            }
        },

        // 输入到日志
        operate: {
            type: 'file',
            filename: 'system.log',
            layout: {                         // 配置输出格式
                type: "pattern",
                pattern: "[%d] [%p] [%c] [用户名:%X{username}] [服务器:%X{host}] - %l %o %m%n"
            }
        }
    },
    categories: {
        default: {
            appenders: ['out', 'operate'],
            level: 'info'
        },

        dev: {
            appenders: ['operate'],
            level: 'all' // 输出级别从低到高 all -> trace -> debug -> info ... -> off
        }
    }
});

class Logger {
    private clientLogger;
    private devLogger;

    constructor() {
        this.clientLogger = getLogger();
        this.devLogger = getLogger('dev');
    }

    public trace(message: string, ...args: any[]) {
        this.devLogger.trace(message, ...args);
    }

    public debug(message: string, ...args: any[]) {
        this.devLogger.debug(message, ...args);
    }

    public info(message: string, ...args: any[]) {
        this.clientLogger.info(message, ...args);
    }

    public warn(message: string, ...args: any[]) {
        this.clientLogger.warn(message, ...args);
    }

    public error(message: string, ...args: any[]) {
        this.clientLogger.error(message, ...args);
    }

    public fatal(message: string, ...args: any[]) {
        this.clientLogger.fatal(message, ...args);
    }

    public mark(message: string, ...args: any[]) {
        this.clientLogger.mark(message, ...args);
    }

    addContext(key, value) {
        this.clientLogger.addContext(key, value);
        this.devLogger.addContext(key, value);
    }
}

let logger = new Logger();

function setLogInfo(opt) {
    Object.keys(opt).forEach(item => {
        logger.addContext(item, opt[item]);
    });
}

export {
    logger,
    setLogInfo
}
