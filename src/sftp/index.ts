import SftpClient from 'ssh2-sftp-client';
import path from 'path';

import { logger } from '../util/log';
import { getFiles, getDirectory, parseFiles, existFile } from '../util/util';

import Uploader, { IUploader } from '../class/uploader';
import { SftpConnedtOptions } from '../type/common';

export default class Sftp extends Uploader implements IUploader {
    constructor(opt: SftpConnedtOptions) {
        super(opt);
        this.client = new SftpClient();

        this.client.on('error', (err) => {
            logger.error('sftp 出错: ' + JSON.stringify(err));
        });
    }

    public init(opt) {

        // sftp 本身支持重连机制，但是命名有点魔幻，所以这里处理一下
        opt.retry_factor = opt.factor ?? 2;
        opt.retry_minTimeout = opt.minTimeout ?? 1000;

        super.init(opt);
    }

    public connect(): Promise<Record<string, any>> {

        return this.client.connect(this.options);
    }

    // 先写着接口，要不要再说
    public download() {

    }

    public async delete(remoteFile) {
        return this.client.delete(remoteFile);
    }

    /**
     * 上传本地文件到服务器
     * @param curPath 上传文件的路径
     */
    public async upload(curPath, remoteDir?): Promise<{}> {
        let remote = remoteDir ?? this.options.root;

        let files = parseFiles(curPath),
            dirList: string[] = getDirectory(files, remote),
            fileList: string[] = getFiles(files),
            uploadList: {}[] = [];

        await this.batchMkdir(dirList);

        // fileList.forEach(async (file) => {
        //     let p = path.join(process.cwd(), file);
        //     let re = path.dirname(path.join(remote, file));
        //     uploadList.push(await this.put(p, re));
        // });
        for (const file of fileList) {

            let p = path.join(process.cwd(), file);
            let re = path.join(remote, file);
            await this.put(p, re);
        }

        return Promise.all(uploadList);
    }

    public async put(currentFile: string, remoteFile: string) {

        if (!existFile(currentFile)) {
            logger.error(`不存在当前路径的文件：${currentFile}`);
            throw new Error(`不存在当前路径的文件：${currentFile}！`);
        }

        this.onFileUpload(currentFile);

        return this.client.fastPut(currentFile, remoteFile)
            .then(() => {
                this.onSuccess(`${remoteFile} 文件上传成功`);
            }).catch(() => {
                this.onFailure(`${currentFile} 文件上传失败！`);
            });
    }

    public batchMkdir(remote: string[]) {
        let list: Record<string, any>[] = [];
        remote.forEach(dir => {
            list.push(this.mkdir(dir));
        });
        return Promise.all(list);
    }

    /**
     * 创建服务器上的文件目录
     * @param {String} remote 目录
     */
    public async mkdir(remote: string) {
        let isExists = await this.client.exists(remote);

        // 如果服务器已经存在目录
        if (isExists) {
            logger.info(`${remote} 目录已存在`);
            return;
        }
        return this.client.mkdir(remote)
            .then(() => {
                logger.info(`${remote} 目录创建成功`);
            }).catch(() => {
                logger.error(`${remote} 目录创建失败`);
            });
    }

    /**
     * 查看文件夹文件
     * @param r 查看服务器上的指定的文件夹
     */
    public async list(r?: string) {
        let root = r ?? this.options.root;

        return this.client.list(root);
    }

    public close() {
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
        this.emit('sftp:beforedestroy');
    }

    public onDestroyed() {
        if (this.client) {
            this.client = null;
        }
        this.emit('sftp:destroy');
    }
}
