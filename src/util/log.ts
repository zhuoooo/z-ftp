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
                pattern: "[%d] [%p] [%c] [用户名:%X{user}] [服务器:%X{host}] - %l　%m%n"
            }
        },

        // 输入到日志
        operate: {
            type: 'file',
            filename: 'operate.log',
            layout: {                         // 配置输出格式
                type: "pattern",
                pattern: "[%d] [%p] [%c] [用户名:%X{user}] [服务器:%X{host}] - %l　%m%n"
            }
        }
    },
    categories: {
        default: {
            appenders: ['out', 'operate'],
            level: 'all'
        }
    }
});

const logger = getLogger('operate');

function setLogInfo (opt) {
    Object.keys(opt).forEach(item => {
        logger.addContext(item, opt[item]);
    });
}

export {
    logger,
    setLogInfo
}
