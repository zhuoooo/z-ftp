/**
 * @file ftp 二次封装功能
 */

import { ERROR_CODE, SUCCESS_CODE } from '../const/code';
import FtpNode from 'ftp';
import retry from 'retry';

import Uploader, { IUploader } from '../class/uploader';
import { FtpConnectOptions, OprStatus } from '../type/common';
import { logger } from '../util/log';

export default class Ftp extends Uploader implements IUploader {
    private client: FtpNode;

    constructor(opt: FtpConnectOptions) {
        super(opt);

        this.client = new FtpNode();

        this.retryOperation = retry.operation({
            retries: this.options.retries,
            factor: this.options.factor,
            minTimeout: this.options.minTimeout
        });

        this.client.on('ready', () => {
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
            this.once('connected', () => {
                resolve({
                    code: SUCCESS_CODE
                });
            });

            this.once('error', (err) => {

                reject(err);
            });
        });
    }

    public connect(): Promise<OprStatus> {

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

            this.on('connected', () => {
                resolve({
                    code: SUCCESS_CODE,
                    data: this.options
                });
            });
        });
    }

    public async delete(file: string): Promise<OprStatus> {

        return new Promise((resolve, reject) => {

            this.client.delete(file, err => {
                if (err) {
                    logger.error(err);
                    reject({
                        code: ERROR_CODE,
                        error: err
                    });
                }

                logger.info(`${file} 文件删除成功`);
                this.emit('ftp:delete', file);
                resolve({
                    code: SUCCESS_CODE,
                    data: file
                });
            });
        })
    }

    // overwrite
    public async put(currentFile: string, remoteFile: string): Promise<OprStatus> {

        return new Promise((resolve, reject) => {

            this.emit('ftp:uploading', currentFile);
            logger.info(`正在上传：${currentFile}`);

            this.client.put(currentFile, remoteFile, (err) => {
                if (err) {
                    logger.error(`上传失败：${err}`);
                    this.emit('ftp:uploadFailure', this.options, err);
                    reject({
                        code: ERROR_CODE,
                        error: err,
                        msg: `${currentFile} 文件上传失败`
                    });
                }

                logger.info(`上传成功：${remoteFile}`);
                this.emit('ftp:uploadSuccess', remoteFile);
                resolve({
                    code: SUCCESS_CODE,
                    data: currentFile
                });
            })
        })
    }

    /**
     * 创建服务器上的文件目录
     * @param {String} remote 目录
     * @memberof Ftp
     */
    public mkdir(remote: string): Promise<OprStatus> {

        return new Promise((resolve, reject) => {
            this.client.mkdir(remote, (err) => {
                if (err?.code === 550) {
                    logger.warn(`${remote} 目录已存在`);
                    return resolve({
                        code: SUCCESS_CODE
                    });
                } else if (err) {
                    logger.error(err);
                    reject({
                        code: ERROR_CODE,
                        msg: '${remote} 目录创建失败',
                        error: err
                    });
                }

                logger.info(`${remote} 目录创建成功`);
                this.emit('ftp:mkdirSuccess');
                resolve({
                    code: SUCCESS_CODE,
                    data: remote
                });
            });
        });
    }

    /**
     * 查看文件夹文件
     * @param r 查看服务器上的指定的文件夹
     */
    public async list(r?: string): Promise<OprStatus> {
        let root = r ?? this.options.root;

        return new Promise((resolve, reject) => {
            this.client.list(root, (err, list) => {
                if (err) {
                    logger.error(err);
                    reject({
                        code: ERROR_CODE,
                        error: err
                    });
                }

                logger.info(`查看 ${root} 目录`);
                this.emit('ftp:viewSuccess', root);
                resolve({
                    code: SUCCESS_CODE,
                    data: list
                });
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
