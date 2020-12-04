import fs from 'fs'
import path from 'path'
import glob from 'glob'

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

function parseFiles (files: string = '') {

    return globFile(files);
}

export default parseFiles;
