const sftp = require('ssh2-sftp-client');
const path = require('path');

let sftpClient = new sftp();

sftpClient.on('ready', () => {
    console.log('ftp client is ready');
});
sftpClient.on('close', () => {
    console.log('ftp client has close')
});
sftpClient.on('end', () => {
    console.log('ftp client has end')
});
sftpClient.on('error', (err) => {
    console.log('ftp client has an error : ' + JSON.stringify(err))
});

let defaultConf =  {
    host: '192.168.1.5',
    port: '223', 
    username: 'zhuo',
    password: 'Zhuo',
    keepalive: 1000
};

function initSFTP (config = defaultConf) {
    sftpClient.connect(config);
}

//将文件上传到ftp目标地址
function put(currentFile, targetFilePath) {
    const dirpath = path.dirname(targetFilePath);
    let fileName = path.basename(targetFilePath);

    // TODO 判断目标地址是否存在文件

    return sftpClient.fastPut(currentFile, fileName);
}

export {
    initSFTP,
    put,
    sftpClient
};