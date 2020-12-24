/**  
 * @file 项目中常用的工具函数
 */

import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import glob from 'glob';

/**
 * 获取存在的文件目录
 *
 * @param {string[]} files 混合文件夹和文件的路径数组
 * @param {string} prefix 路径前缀
 * @return {*} 
 */
function getDirectory(files: string[], prefix = '') {
    let list: string[] = [];

    files.forEach(file => {
        let p = path.join(process.cwd(), file);

        if (fs.statSync(p).isDirectory()) {
            list.push(path.join(prefix, file));

        }
    });

    return list;
}

/**
 * 获取存在的文件路径
 * @param {string[]} files 混合文件夹和文件的路径数组
 * @return {*}  {string[]}
 */
function getFiles(files: string[]): string[] {
    let list: string[] = [];

    files.forEach(file => {
        let p = path.join(process.cwd(), file);

        if (!fs.statSync(p).isDirectory()) {
            list.push(file);

        }
    });

    return list;
}

/**
 * 判断是否存在文件
 * @param {String} file
 */
function existFile(file): boolean {
    let isExitCurFile = fse.pathExistsSync(file);

    return isExitCurFile;
}

function globFile(pattern, ext: string[] = [], globOption = {}) {
    let p = path.join(process.cwd(), pattern);

    if (fs.existsSync(p)) {
        if (fs.statSync(p).isDirectory()) {
            pattern += `/**/*.${ext.length ? `(${ext.join('|')})` : '*'}`;
        } else {
            return [pattern];
        }
    }
    return glob.sync(pattern, globOption);
}

function parseFiles(files: string | string[] = '', ext: string[] = []) {
    let allFiles: string[] = [];
    if (!Array.isArray(files)) {
        files = [files];
    }

    files.forEach(item => {
        allFiles.push(...globFile(item, ext));
    });

    return allFiles;
}

export {
    getDirectory,
    getFiles,
    parseFiles,
    existFile
}
