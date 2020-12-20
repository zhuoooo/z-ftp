/**
 * @file ftp 二次封装功能
 */
import Uploader, { IUploader } from '../class/uploader';
import { FtpConnectOptions } from '../type/common';
export default class Ftp extends Uploader implements IUploader {
    constructor(opt: FtpConnectOptions);
    init(opt: any): void;
    private retryConnect;
    connect(): Promise<Record<string, any>>;
    download(): void;
    delete(file: string): Promise<unknown>;
    /**
     * 上传本地文件到服务器
     * @param [curPath] 上传文件的路径
     */
    upload(curPath: string, remoteDir?: string): Promise<{}>;
    put(currentFile: string, remoteFile: string): Promise<unknown>;
    batchMkdir(remote: string[]): void;
    /**
     * 创建服务器上的文件目录
     * @param {String} remote 目录
     * @memberof Ftp
     */
    mkdir(remote: string, cb?: Function): void;
    /**
     * 查看文件夹文件
     * @param r 查看服务器上的指定的文件夹
     */
    list(r?: string): Promise<unknown>;
    close(): Promise<void>;
    /**
     * 退出登录
     */
    logout(): Promise<void>;
    onBeforeDestroy(): void;
    onDestroyed(): void;
}
