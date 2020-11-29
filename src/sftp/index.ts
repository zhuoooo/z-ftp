const sftp = require('ssh2-sftp-client')
const fs = require('fs')
import fse from 'fs-extra'
const path = require('path')

import Uploader from '../class/uploader'

const client = new sftp()

export default class Sftp extends Uploader {
    init(opt) {
        this.options = Object.assign({
            host: '',
            port: '22', 
            username: 'sftp',
            password: '',
            root: '.',
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
    download () {

    }

    async delete (remoteFile) {
        return client.delete(remoteFile)
    }

    /**
     * 上传本地文件到服务器
     * @param currentFile 上传文件的路径
     */
    async upload(currentFile, remoteDir?): Promise<{}> {

        let isExitCurFile = await fse.pathExists(currentFile)

        if (!isExitCurFile) {
            console.warn(`不存在当前路径的文件：${currentFile}`)
            throw new Error(`不存在当前路径的文件：${currentFile}，请重新输入文件路径！`)
        }

        const dirpath = path.dirname(currentFile)
        let remote = path.join(remoteDir ?? this.options.root, path.basename(currentFile)) 
        
        return this.client.fastPut(currentFile, remote)
    }

    /**
     * 查看文件夹文件
     * @param r 查看服务器上的指定的文件夹
     */
    async list (r?: string) {
        let root = r ?? this.options.root

        return this.client.list(root)
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
