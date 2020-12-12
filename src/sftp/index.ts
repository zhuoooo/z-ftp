import sftp from 'ssh2-sftp-client';
import path from 'path';

import { logger, setLogInfo } from '../util/log';
import { getFiles, getDirectory, parseFiles, existFile } from '../util/util';

import Uploader from '../class/uploader'

export default class Sftp extends Uploader {
    constructor(opt) {
        super(opt);
        this.client = new sftp();
    }

    init(opt) {
        this.options = Object.assign({
            host: '',
            port: '22',
            username: '',
            password: '',
            root: './'
        }, opt);
        
        setLogInfo({
            ...this.options,
            user: this.options.username
        });
    }

    connect(): Promise<Record<string, any>> {

        return this.client.connect({
            host: this.options.host,
            port: this.options.port,
            username: this.options.username,
            password: this.options.password
        });
    }

    // 先写着接口，要不要再说
    download() {

    }

    async delete(remoteFile) {
        return this.client.delete(remoteFile);
    }

    /**
     * 上传本地文件到服务器
     * @param curPath 上传文件的路径
     */
    async upload(curPath, remoteDir?): Promise<{}> {
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
            let re = path.dirname(path.join(remote, file));
            await this.put(p, re);
        }

        return Promise.all(uploadList);
    }

    async put(currentFile, remoteDir?) {

        if (!existFile(currentFile)) {
            logger.error(`不存在当前路径的文件：${currentFile}`);
            throw new Error(`不存在当前路径的文件：${currentFile}！`);
        }

        let remote = path.join(remoteDir, path.basename(currentFile));

        return this.client.fastPut(currentFile, remote)
            .then(() => {
                logger.info(`${currentFile} 文件上传成功`);
            }).catch(() => {
                logger.error(`${currentFile} 文件上传失败！`);
            });
    }

    batchMkdir(remote: string[]) {
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
    async mkdir(remote: string) {
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
    async list(r?: string) {
        let root = r ?? this.options.root;

        return this.client.list(root);
    }

    close() {
        this.client?.end?.();
    }

    /**
     * 退出登录
     */
    async logout() {
        this.client?.end?.();
        this.onDestroyed();
    }

    onDestroyed() {
        if (this.client) {
            this.client.destroy();
            this.client = null;
        }
        super.onDestroyed();
    }
}
