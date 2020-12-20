/**
 * @file 全局的声明
 */


// 连接配置
export interface ServerInitOptions {

    host: string;
    port?: string | number;
    root?: string;
    retries?: number;
    factor?: number;
    minTimeout?: number;
}

// ftp 连接配置
export interface FtpConnectOptions extends ServerInitOptions {

    user?: string;
    secure?: boolean;
    username?: string;
    password?: string;
    secureOptions?: Record<string, any>;
    connTimeout?: number;
    pasvTimeout?: number;
    keepalive?: number;
}

// sftp 连接配置
export interface SftpConnedtOptions extends ServerInitOptions {

    username: string;
    password: string;
    forceIPv4?: boolean;
    forceIPv6?: boolean;
    agent?: string;
    privateKey?: string;
    passpahrase?: string;
    readyTimeout?: number;
    strictVendor?: boolean;
    debug?: Function;
}

