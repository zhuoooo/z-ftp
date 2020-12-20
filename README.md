# z-ftp
> 基于 ftp、ssh2-sftp-client 实现的上传工具

![](E:\repo\z-ftp\upload.png)



### Basic Usage

```js
import Ftp from './ftp';
import Sftp from './sftp';

let ftp = new Ftp({
    username: 'ftp',
    port: 21,
    password: 'Admin@123',
    host: 'localhost',
    root: '/zqh/'
});

ftp.connect()
    .then(() => {
        ftp.upload('./file');
    })
    .then(() => {
        ftp.close();
    });

```

### 

### Methods

#### connect

#### put

#### upload

#### delete

#### list

#### close

#### mkdir

#### batchMkdir