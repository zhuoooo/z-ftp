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


// let LoaderRunner = require('./loader_runner');
// let Ftp = require('./ftp');
// let Sftp = require('./sftp');
// let options = require('./options');
// let ProgressBar = require('progress');

// function loaderFactory (constructor, options, ...listeners) {
//     let loader = new constructor(options);

//     listeners.forEach(listener =>  Object.entries(listener).forEach(([key, fn]) => loader.on(key, fn)));
//     loader.on('upload:success', () => loader.destroy());
//     loader.on('upload:failure', () => loader.destroy());

//     return loader;
// }

// function getBaseListeners () {
//     let bar;
//     return {
//         'upload:start': options => {
//             bar = new ProgressBar('[uploading] [:bar] :current/:total :fileName', Object.assign({
//                 total: options.files.length
//             }, {
//                 incomplete: ' ',
//                 head: '>',
//                 complete: '=',
//                 width: 20
//             }));
//         },
//         'upload:file': (options, file) => {
//             bar.tick({
//                 fileName: file
//             });
//         },
//         'upload:destroy': () => {
//             bar = null;
//         }
//     };
// }


// function run () {
//     let loaderRunner = new LoaderRunner();

//     if (options.ftp) {
//         loaderRunner.regisit('ftp', loaderFactory(Ftp, options.ftp, getBaseListeners(), {

//             // 其它事件可以这里注册
//         }));
//     }

//     if (options.sftp) {
//         loaderRunner.regisit('sftp', loaderFactory(Sftp, options.sftp, getBaseListeners(), {

//         }));
//     }

//     loaderRunner.start().then(() => process.exit(0));
// }

// run();
