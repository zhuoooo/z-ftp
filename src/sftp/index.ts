const sftp = require('ssh2-sftp-client')
const fs = require('fs')
import fse from 'fs-extra'
const path = require('path')
import parseFiles from '../util/util'

import Uploader from '../class/uploader'

const client = new sftp()

export default class Sftp extends Uploader {
    init(opt) {
        this.options = Object.assign({
            host: '',
            port: '22',
            username: '',
            password: '',
            root: './',
            keepalive: 1000
        }, opt)
    }

    connect(): Promise<Record<string, any>> {
        let client = new sftp()

        this.client = client

        return client.connect({
            host: this.options.host,
            port: this.options.port,
            username: this.options.username,
            password: this.options.password
        })
    }

    // 先写着接口，要不要再说
    download() {

    }

    async delete(remoteFile) {
        return client.delete(remoteFile)
    }

    /**
     * 上传本地文件到服务器
     * @param curPath 上传文件的路径
     */
    async upload(curPath, remoteDir?): Promise<{}> {
        let files = parseFiles(curPath),
            uploadList: {}[] = [],
            remote = remoteDir ?? this.options.root

        files.forEach(async (file) => {
            let p = path.join(process.cwd(), file)
            let tarDir = path.join(remote, file)

            if (fs.statSync(p).isDirectory()) {
                let isExists = await this.client.exists(tarDir)

                // 如果服务器已经存在目录
                if (isExists) {
                    return
                }
                this.client.mkdir(tarDir)
                return
            }
            uploadList.push(this.put(file, path.dirname(tarDir)))
        })

        return Promise.all(uploadList)
    }

    async put(currentFile, remoteDir?) {
        let isExitCurFile = await fse.pathExists(currentFile)

        if (!isExitCurFile) {
            console.warn(`不存在当前路径的文件：${currentFile}`)
            throw new Error(`不存在当前路径的文件：${currentFile}，请重新输入文件路径！`)
        }

        let remote = path.join(remoteDir, path.basename(currentFile))
        

        return this.client.fastPut(currentFile, remote)
    }

    /**
     * 查看文件夹文件
     * @param r 查看服务器上的指定的文件夹
     */
    async list(r?: string) {
        let root = r ?? this.options.root

        return this.client.list(root)
    }

    close() {
        this.client.end()
    }

    /**
     * 退出登录
     */
    async logout() {
        this.client.end()
        this.onDestroyed()
    }

    onDestroyed() {
        if (this.client) {
            this.client.destroy()
            this.client = null
        }
        super.onDestroyed()
    }
}
