import Ftp from './ftp';
import Sftp from './sftp'
const path = require('path');

let ftp = new Ftp({
    username: '',
    host: 'localhost'
});
let sftp = new Sftp({
    username: '',
    password: '',
    host: ''
});

module.exports = {
    ftp,
    sftp
};
