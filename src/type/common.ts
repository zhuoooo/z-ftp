/**
 * @file 全局的声明
 */

// 上传模式
export type UploadMode = 'parallel' | 'serial';

// 操作后的结果
export interface OprStatus {
    code: number;
    msg?: string;
    [propName: string]: any;
}

// 连接配置
export interface ServerInitOptions {

    host: string;
    port?: string | number;
    root?: string;
    retries?: number;
    factor?: number;
    minTimeout?: number;
    mode?: UploadMode;
    concurrency?: number;
    ext?: string[]
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

