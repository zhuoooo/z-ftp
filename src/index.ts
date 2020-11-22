import {initFTP, put} from './ftp/init';
import * as sftp from './sftp/init';
const path = require('path');

initFTP();

async function upload () {
    put(path.resolve(__dirname, './README.md'), 'readme.md').then(() =>{
        console.log('上传成功！');
    }).catch(() => {
        console.log('上传失败！');
        
    })
    
}

upload();
