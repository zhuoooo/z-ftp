import Uploader, { IUploader } from '../class/uploader';
import { SftpConnedtOptions } from '../type/common';
export default class Sftp extends Uploader implements IUploader {
    constructor(opt: SftpConnedtOptions);
    init(opt: any): void;
    connect(): Promise<Record<string, any>>;
    download(): void;
    delete(remoteFile: any): Promise<any>;
    /**
     * 上传本地文件到服务器
     * @param curPath 上传文件的路径
     */
    upload(curPath: any, remoteDir?: any): Promise<{}>;
    put(currentFile: string, remoteFile: string): Promise<any>;
    batchMkdir(remote: string[]): Promise<Record<string, any>[]>;
    /**
     * 创建服务器上的文件目录
     * @param {String} remote 目录
     */
    mkdir(remote: string): Promise<any>;
    /**
     * 查看文件夹文件
     * @param r 查看服务器上的指定的文件夹
     */
    list(r?: string): Promise<any>;
    close(): void;
    /**
     * 退出登录
     */
    logout(): Promise<void>;
    onBeforeDestroy(): void;
    onDestroyed(): void;
}
