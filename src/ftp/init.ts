const ftp = require('ftp'); // 连接FTP
const fs = require('fs');
import fse from 'fs-extra';
const path = require('path');

const client = new ftp();

client.on('ready', () => {
    console.log('ftp client is ready');
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

let defaultConf = {
    host: '192.168.1.5',
    port: '21',
    user: '',
    password: '',
    keepalive: 1000
};

function initFTP(config = defaultConf) {
    client.connect(config);
}

//将文件上传到ftp目标地址
async function put(currentFile, targetFilePath) {

    // TODO 判断目标地址是否存在文件
    let isExitCurFile = await fse.pathExists(currentFile);

    if (!isExitCurFile) {
        console.warn(`不存在当前路径的文件：${currentFile}`);
        throw new Error(`不存在当前路径的文件：${currentFile}，请重新输入文件路径！`);
    }

    const dirpath = path.dirname(targetFilePath);
    let fileName = path.basename(targetFilePath);
    const rs = fs.createReadStream(currentFile);

    
    return new Promise((resolve, reject) => {
        client.put(rs, fileName, (err) => {
            resolve({ err: err });
        });
    });
}

export {
    initFTP,
    put,
    client
}