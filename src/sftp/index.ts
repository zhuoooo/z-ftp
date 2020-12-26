import SftpClient from 'ssh2-sftp-client';

import { logger } from '../util/log';

import Uploader, { IUploader } from '../class/uploader';
import { SftpConnedtOptions, OprStatus } from '../type/common';
import { ERROR_CODE, SUCCESS_CODE } from '../const/code';

export default class Sftp extends Uploader implements IUploader {
    private client: SftpClient;

    constructor(opt: SftpConnedtOptions) {
        super(opt);
        this.client = new SftpClient();

        this.client.on('error', (err) => {
            logger.error('sftp 出错: ' + JSON.stringify(err));
            this.emit('sftp:error', err);
        });
    }

    public init(opt) {

        // sftp 本身支持重连机制，但是命名有点魔幻，所以这里处理一下
        opt.retry_factor = opt.factor ?? 2;
        opt.retry_minTimeout = opt.minTimeout ?? 1000;

        super.init(opt);
    }

    public connect(): Promise<OprStatus> {

        return this.client.connect(this.options)
            .then(() => {

                logger.info('连接成功');
                this.emit('sftp:connected');
                return {
                    code: SUCCESS_CODE,
                    data: this.options
                };
            }).catch((err) => {

                logger.error('连接失败');
                return {
                    code: ERROR_CODE,
                    error: err,
                    msg: '连接失败'
                }
            });
    }

    public async delete(remoteFile): Promise<OprStatus> {
        return this.client.delete(remoteFile)
            .then(() => {

                logger.info(`${remoteFile} 目录删除成功`);
                this.emit('sftp:delete', remoteFile);
                return {
                    code: SUCCESS_CODE,
                    data: remoteFile
                };
            }).catch((err) => {

                logger.error(`${remoteFile} 目录删除失败`);
                return {
                    code: ERROR_CODE,
                    error: err,
                    msg: `${remoteFile} 目录删除失败`
                }
            });
    }

    // overwrite
    public async put(currentFile: string, remoteFile: string): Promise<OprStatus> {

        this.emit('sftp:uploading', currentFile);
        logger.info(`正在上传：${currentFile}`);

        return this.client.fastPut(currentFile, remoteFile)
            .then(() => {
                logger.info(`上传成功：${currentFile}`);
                this.emit('sftp:uploadSuccess', currentFile);
                return {
                    code: SUCCESS_CODE,
                    file: currentFile
                };
            }).catch((err) => {
                logger.error(`上传失败：${currentFile}`);
                this.emit('sftp:uploadFailure', this.options, err);
                return {
                    code: ERROR_CODE,
                    error: err,
                    msg: `${currentFile} 文件上传失败！`
                };
            });
    }

    /**
     * 创建服务器上的文件目录
     * @param {String} remote 目录
     */
    public async mkdir(remote: string): Promise<OprStatus> {
        let isExists = await this.client.exists(remote);

        // 如果服务器已经存在目录
        if (isExists) {
            logger.info(`${remote} 目录已存在`);
            return Promise.resolve({
                code: SUCCESS_CODE,
                data: remote
            });
        }
        return this.client.mkdir(remote)
            .then(() => {
                logger.info(`${remote} 目录创建成功`);
                this.emit('sftp:mkdirSuccess');
                return {
                    code: SUCCESS_CODE,
                    data: remote
                };
            }).catch((err) => {
                logger.error(`${remote} 目录创建失败`);
                return {
                    code: ERROR_CODE,
                    error: err,
                    msg: `${remote} 目录创建失败`
                }
            });
    }

    /**
     * 查看文件夹文件
     * @param r 查看服务器上的指定的文件夹
     */
    public async list(r?: string): Promise<OprStatus> {
        let root = r ?? this.options.root;

        return this.client.list(root)
            .then(() => {

                logger.info(`${root} 目录查看成功`);
                this.emit('sftp:viewSuccess', root);
                return {
                    code: SUCCESS_CODE,
                    data: root
                };
            }).catch((err) => {

                logger.error(`${root} 目录查看失败`);
                return {
                    code: ERROR_CODE,
                    error: err,
                    msg: `${root} 目录查看失败`
                }
            });;
    }

    public close() {
        this.client.end();
        logger.info('ftp 服务关闭');
        this.emit('sftp:close');
    }

    /**
     * 退出登录
     */
    public async logout() {
        this.client.end();
        this.destroy();
    }

    public onBeforeDestroy() {
        this.emit('sftp:beforedestroy');
    }

    public onDestroyed() {
        if (this.client) {
            this.client = null;
        }
        this.emit('sftp:destroy');
    }
}
