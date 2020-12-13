/** 
 * @file 实现上传的基类
 */

let EventEmitter = require('events');
import { logger } from '../util/log';

export interface IUploader {
    connect();
    upload(filePath?: string, remoteDir?: string): Promise<Record<string, any>>;
    delete(remoteFile?: string);
    list();
    close();
    mkdir(remote: string);
}

export default class Uploader extends EventEmitter {

    constructor(opt = {}) {
        super();
        this.init(opt);
    }

    public init(opt) {
        this.options = opt;
    }

    public onReady() {
        logger.info('连接成功');
        this.emit('upload:ready');
    }

    public onStart() {
        logger.info('开始上传');
        this.emit('upload:start', this.options);
    }

    public onSuccess(file?) {
        logger.info(`上传成功：${file}`);
        this.emit('upload:success');
    }

    public onFailure(e) {
        logger.error(`上传失败：${e}`);
        this.emit('upload:failure', this.options, e);
    }

    public onFileUpload(file) {
        logger.info(`准备上传文件：${file}`);
        this.emit('upload:file', this.options, file);
    }

    /**
     * 提供接口方便在销毁前做业务处理
     */
    public onBeforeDestroy() {
        this.emit('upload:beforedestroy');
    }

    public onDestroyed() {

        this.emit('upload:destroy');
    }

    public destroy() {
        if (this.destroyed) {
            this.onBeforeDestroy();
            this.options = null;
            this.removeAllListeners();
            this.onDestroyed();
            this.destroyed = true;
        }
    }

}
