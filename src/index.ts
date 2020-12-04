import Ftp from './ftp';
import Sftp from './sftp'
const path = require('path');

let ftp = new Ftp({
    root: './zhuo'
});
let sftp = new Sftp({
    root: './zqh'
})

async function upload() {
    await ftp.connect();

    await ftp.upload('./src').then(() => {
        console.log('上传成功！');
    }).catch((err) => {
        console.error(err)
        console.log('上传失败！');
    })

    console.table(await ftp.list())
}

// upload()
// let file = parseFiles('./README.md')

// console.log(file);

async function supload () {
    await sftp.connect()
    console.log('链接成功');

    await sftp.upload('./src')
    let list = await sftp.list('./zqh/src')

    console.table(list)
}
supload()




module.exports = {
    ftp, 
    sftp
};


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
