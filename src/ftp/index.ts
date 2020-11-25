const FtpClient = require('ftp'); // 连接FTP
const fs = require('fs');
import fse from 'fs-extra';
import Uploader from '../class/uploader';
const path = require('path');


const client = new FtpClient();

let defaultConf = {
    host: '192.168.1.5',
    port: '21',
    user: '',
    password: '',
    keepalive: 1000
};

export default class Ftp extends Uploader {
    init(opt) {
        this.options = Object.assign({
            host: '192.168.1.5',
            port: '21',
            user: '',
            password: '',
            root: '',
            keepalive: 1000
        }, opt);
    }

    connect(): Promise<Record<string, any>> {
        return new Promise((resolve) => {
            let client = new FtpClient();

            client.connect({
                host: this.options.host,
                port: this.options.port,
                user: this.options.user,
                password: this.options.password
            })

            client.on('ready', () => {
                console.log('ftp client is ready');
                resolve();
            });
            client.on('close', () => {
                console.log('ftp client has close')
            });
            client.on('end', () => {
                console.log('ftp client has end')
            });
            client.on('error', (err) => {
                console.log('ftp client has an error : ' + JSON.stringify(err))
            });

            this.client = client;
        })
    }

    async upload(currentFile): Promise<{}> {

        // TODO 判断目标地址是否存在文件
        let isExitCurFile = await fse.pathExists(currentFile);

        if (!isExitCurFile) {
            console.warn(`不存在当前路径的文件：${currentFile}`);
            throw new Error(`不存在当前路径的文件：${currentFile}，请重新输入文件路径！`);
        }

        let fileName = path.basename(currentFile);
        const rs = fs.createReadStream(currentFile);

        return new Promise((resolve, reject) => {
            this.client.put(rs, fileName, (err) => {
                reject(err)
            });

            resolve();
        });
    }

    onDestroyed() {
        if (this.client) {
            this.client.destroy();
            this.client = null;
        }
        super.onDestroyed();
    }

}
