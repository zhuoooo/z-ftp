const ftp = require('ftp') // 连接FTP
const fs = require('fs')
import fse from 'fs-extra'
const path = require('path')

import Uploader from '../class/uploader'

const client = new ftp()

export default class Ftp extends Uploader {
    init(opt) {
        this.options = Object.assign({
            host: '192.168.1.3',
            port: '21',
            user: '',
            password: '',
            root: '.',
            keepalive: 1000
        }, opt)
    }

    connect(): Promise<Record<string, any>> {
        return new Promise((resolve) => {
            let client = new ftp()

            client.connect({
                host: this.options.host,
                port: this.options.port,
                user: this.options.user,
                password: this.options.password
            })

            client.on('ready', () => {
                console.log('ftp client is ready')
                resolve({})
            })
            client.on('close', () => {
                console.log('ftp client has close')
            })
            client.on('end', () => {
                console.log('ftp client has end')
            })
            client.on('error', (err) => {
                console.log('ftp client has an error : ' + JSON.stringify(err))
            })

            this.client = client
        })
    }

    // 先写着接口，要不要再说
    download () {

    }

    async delete (file) {
        return new Promise((resolve, reject) => {
            this.client.delete(file, err => {
                reject(err)
            })

            resolve()
        })
    }

    /**
     * 上传本地文件到服务器
     * @param currentFile 上传文件的路径
     */
    async upload(currentFile): Promise<{}> {

        // TODO 判断目标地址是否存在文件
        let isExitCurFile = await fse.pathExists(currentFile)

        if (!isExitCurFile) {
            console.warn(`不存在当前路径的文件：${currentFile}`)
            throw new Error(`不存在当前路径的文件：${currentFile}，请重新输入文件路径！`)
        }

        let fileName = path.basename(currentFile)
        const rs = fs.createReadStream(currentFile)

        return new Promise((resolve, reject) => {
            this.client.put(rs, fileName, (err) => {
                reject(err)
            })

            resolve({})
        })
    }

    /**
     * 查看文件夹文件
     * @param r 查看服务器上的指定的文件夹
     */
    async list (r?: string) {
        let root = r ?? this.options.root

        let list = await new Promise((resolve, reject) => {
            this.client.list(root, (err, list) => {
                if (err) {
                    reject(err)
                }
                resolve(list) 
            })
        })
        return list
    }

    /**
     * 退出登录
     */
    async logout() {
        this.client.logout()
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
