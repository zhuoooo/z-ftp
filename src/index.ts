import Ftp from './ftp';
import * as sftp from './sftp/init';
const path = require('path');

let ftp = new Ftp();

async function upload () {
    ftp.upload(path.resolve(__dirname, './README.md'), 'readme.md').then(() =>{
        console.log('上传成功！');
    }).catch(() => {
        console.log('上传失败！');
        
    })
    
}

upload();
