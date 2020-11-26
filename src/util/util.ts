/**
 * Created by uedc on 2020/9/11.
 */

let fs = require('fs');
let path = require('path');
let glob = require('glob');

function globFile (pattern) {
    let p = path.join(process.cwd(), pattern);
    if (fs.existsSync(p)) {
        if (fs.statSync(p).isDirectory()) {
            pattern += '/**';
        } else {
            return [pattern];
        }
    }
    return glob.sync(pattern, {});
}

function globFiles (files) {
    let ret = [];
    files.forEach(file => {
        ret.push(...globFile(file) as []);
    });
    return ret;
}

function parseFiles (files = []) {
    if (!Array.isArray(files)) {
        files = [
            files
        ];
    }
    return globFiles(files);
}

exports.glob = parseFiles;
