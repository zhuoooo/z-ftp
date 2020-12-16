/**
 * @file ftp 二次封装功能
 */

import ftp from 'ftp';
import path from 'path';

import Uploader, { IUploader } from '../class/uploader';
import { logger, setLogInfo } from '../util/log';
import { getFiles, getDirectory, parseFiles, existFile } from '../util/util';

export default class Ftp extends Uploader implements IUploader {
    constructor(opt) {
        super(opt);

        this.client = new ftp();

        this.client.on('ready', () => {
            this.onReady();
        });
        this.client.on('close', () => {
            logger.info('ftp 服务关闭');
        });
        this.client.on('end', () => {
            logger.info('ftp 服务结束');
        });
        this.client.on('error', (err) => {
            logger.error('ftp 出错: ' + JSON.stringify(err));
        });
    }

    public init(opt) {
        this.options = Object.assign({
            host: '',
            port: '21',
            user: '',
            password: '',
            root: '.'
        }, opt);
        
        setLogInfo(opt);
    }

    public connect(): Promise<Record<string, any>> {
        return new Promise((resolve) => {

            this.client.connect({
                host: this.options.host,
                port: this.options.port,
                user: this.options.user,
                password: this.options.password
            });
            resolve(this.options);
        })
    }

    // 先写着接口，要不要再说
    public download() {

    }

    public async delete(file: string) {
        if (!file) {
            logger.error('必须输入删除的文件或文件路径');
            throw new Error('必须输入删除的文件或文件路径');
        }

        return new Promise((resolve, reject) => {

            this.client.delete(file, err => {
                logger.error(err);
                reject(err);
            });

            logger.info(`${file} 文件删除成功`);
            resolve({
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
    public mkdir(remote: string) {
        this.client.mkdir(remote, (err) => {
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
        this.onDestroyed();
    }

    public onDestroyed() {
        if (this.client) {
            this.client.destroy();
            this.client = null;
        }
        super.onDestroyed();
    }

}
