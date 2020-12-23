/** 
 * @file 实现上传的基类
 */

let EventEmitter = require('events');
import path from 'path';
import merge from 'lodash/merge';

import { UPLOAD_MODE } from '../const/common';
import { logger, setLogInfo } from '../util/log';
import { getFiles, getDirectory, parseFiles } from '../util/util';
import { UploadMode, OprStatus } from '../type/common';

export interface IUploader {
    connect();
    put(filePath?: string, remoteDir?: string): Promise<OprStatus>;
    delete(remoteFile?: string);
    list();
    close();
    mkdir(remote: string): Promise<OprStatus>;
}

export default class Uploader extends EventEmitter {

    constructor(opt) {
        super();
        this.init(opt);
    }

    public init(opt) {

        this.options = merge({
            port: 22,
            host: '',
            username: '',
            password: '',
            retries: 1,
            factor: 2,
            mode: UPLOAD_MODE.parallel, // parallel 并行上传， serial 串行上传
            minTimeout: 1000,
            root: './'
        }, opt);

        setLogInfo(opt);
    }

    /**
     * 上传本地文件到服务器
     * @param [curPath]     上传文件的路径
     * @param [remoteDir]   上传到目标路径
     * @param [mode]        指定上传模式
     */
    public async upload(curPath: string, remoteDir?: string, mode?: UploadMode): Promise<Record<string, any>> {
        let remote = remoteDir ?? this.options.root,
            uploadMode = mode ?? this.options.mode;

        let files = parseFiles(curPath),
            dirList: string[] = getDirectory(files, remote),
            fileList: string[] = getFiles(files),
            uploadList: Record<string, any>[] = [];

        await this.batchMkdir(dirList);

        for (const file of fileList) {

            let p = path.join(process.cwd(), file);
            let re = path.join(remote, file);

            if (uploadMode === UPLOAD_MODE.serial) {

                uploadList.push(await this.put(p, re));
            } else {

                uploadList.push(this.put(p, re));
            }
        }

        return Promise.all(uploadList);
    }

    public batchMkdir(remote: string[]): Promise<Record<string, any>> {
        let list: Record<string, any>[] = [];
        remote.forEach(dir => {
            list.push(this.mkdir(dir));
        });
        return Promise.all(list);
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
        if (!this.destroyed) {
            this.onBeforeDestroy();
            this.options = null;
            this.removeAllListeners();
            this.onDestroyed();
            this.destroyed = true;
        }
    }

}
