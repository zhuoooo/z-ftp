/**
 * @file ftp 二次封装功能
 */

import ftp from 'ftp';
import path from 'path';
import retry from 'retry';

import Uploader, { IUploader } from '../class/uploader';
import { FtpConnectOptions } from '../type/common';
import { logger } from '../util/log';
import { getFiles, getDirectory, parseFiles, existFile } from '../util/util';

export default class Ftp extends Uploader implements IUploader {
    constructor(opt: FtpConnectOptions) {
        super(opt);

        this.client = new ftp();

        this.retryOperation = retry.operation({
            retries: this.options.retries,
            factor: this.options.factor,
            minTimeout: this.options.minTimeout
        });

        this.client.on('ready', () => {
            // this.onReady();
            logger.info('ftp 连接成功');
            this.emit('ftp:connected');
        });
        this.client.on('close', () => {
            logger.info('ftp 服务关闭');
            this.emit('ftp:close');
        });
        this.client.on('end', () => {
            logger.info('ftp 服务结束');
            this.emit('ftp:end');
        });
        this.client.on('error', (err) => {
            this.emit('ftp:error', err);
            // logger.error('ftp 出错: ' + JSON.stringify(err));
        });
    }

    init(opt) {

        // username用来打印日志，连接还是需要user字段
        opt.user = opt.username;

        super.init(opt);
    }

    private retryConnect() {

        logger.info('正在连接服务器 ------>');
        this.client.connect(this.options);

        return new Promise((resolve, reject) => {
            this.once('ftp:connected', () => {
                resolve({
                    code: 0
                });
            });

            this.once('ftp:error', (err) => {

                reject(err);
            });
        });
    }

    public connect(): Promise<Record<string, any>> {

        this.retryOperation.attempt((curAttempt) => {

            // 如果报错，就进行重新连接
            this.retryConnect().then(() => {

                return this.options;
            }).catch((err) => {
                if (this.retryOperation.retry(err)) {
                    logger.warn(`连接出错，正在尝试再次连接。尝试第${curAttempt}次重新连接`);
                    return;
                }

                logger.error(`无法与服务器建立连接！`);
                logger.trace(`连接配置：${JSON.stringify(this.options)}`);
            });
        });

        return new Promise((resolve) => {

            this.on('ftp:connected', () => {
                resolve(this.options);
            });
        });
    }

    // 先写着接口，要不要再说
    public download() {

    }

    public async delete(file: string) {

        return new Promise((resolve, reject) => {

            this.client.delete(file, err => {
                logger.error(err);
                reject(err);
            });

            logger.info(`${file} 文件删除成功`);
            resolve({
                code: 0,
                file
            });
        })
    }

    /**
     * 上传本地文件到服务器
     * @param [curPath] 上传文件的路径
     */
    public async upload(curPath: string, remoteDir?: string): Promise<{}> {
        let remote = remoteDir ?? this.options.root;

        let files = parseFiles(curPath),
            dirList: string[] = getDirectory(files, remote),
            fileList: string[] = getFiles(files),
            uploadList: Record<string, any>[] = [];

        this.batchMkdir(dirList);

        fileList.forEach(file => {
            let p = path.join(process.cwd(), file);
            let re = path.join(remote, file);
            uploadList.push(this.put(p, re));
        });

        return Promise.all(uploadList);
    }

    public async put(currentFile: string, remoteFile: string) {

        if (!existFile(currentFile)) {
            logger.error(`不存在当前路径的文件：${currentFile}`);
            throw new Error(`不存在当前路径的文件：${currentFile}！`);
        }

        return new Promise((resolve, reject) => {
            this.onFileUpload(currentFile);
            this.client.put(currentFile, remoteFile, (err) => {
                if (err) {
                    this.onFailure(err);
                    reject(err);
                }

                this.onSuccess(remoteFile);
                resolve({
                    code: 0,
                    file: currentFile
                });
            })
        })
    }

    public batchMkdir(remote: string[]) {
        remote.forEach(dir => {
            this.mkdir(dir);
        });
    }

    /**
     * 创建服务器上的文件目录
     * @param {String} remote 目录
     * @memberof Ftp
     */
    public mkdir(remote: string, cb?: Function) {
        this.client.mkdir(remote, (err) => {
            cb?.(err);
            if (err?.code === 550) {
                logger.warn(`${remote} 目录已存在`);
                return;
            }
            if (err) {
                logger.error(err);
                return;
            }
            logger.info(`${remote} 目录创建成功`);
        });
    }

    /**
     * 查看文件夹文件
     * @param r 查看服务器上的指定的文件夹
     */
    public async list(r?: string) {
        let root = r ?? this.options.root;

        return new Promise((resolve, reject) => {
            this.client.list(root, (err, list) => {
                if (err) {
                    logger.error(err);
                    reject(err);
                }

                logger.info(`查看 ${root} 目录`);
                resolve(list);
            });
        });
    }

    public async close() {
        this.client.end();
    }

    /**
     * 退出登录
     */
    public async logout() {
        this.client.end();
        this.destroy();
    }

    public onBeforeDestroy() {
        this.emit('ftp:beforedestroy');
    }

    public onDestroyed() {
        if (this.client) {
            this.client = null;
        }
        this.emit('ftp:destroy');
    }
}
