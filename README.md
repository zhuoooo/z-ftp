# z-ftp

> 基于 ftp、ssh2-sftp-client 实现的上传工具

![](E:\repo\z-ftp\upload.png)



## Basic Usage

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



## Methods

所有的方法都返回值类型如下

```ts
{
    code: 0, // 0表示操作成功，除0以外的值都为错误
    data: '', // code = 0 时，存在
    msg: '', // code != 0 时，存在
    error: '' // code != 0 时，存在
}
```



### connect

 连接服务，不接受任何参数

```ts
// defaultConfig
let options = {
    host: '', // 必填，服务器地址
    username: '', // 账号，在 sftp 模式下必填
    password: '', // 密码，在 sftp 模式下必填
    port: 22, // 端口号
    retries: 1, // 连接失败时，重试次数
    minTimeout: 1000, // 连接失败时，重新连接时的最短时间
    factor: 2, // 用来计算两次连接间的时间 
    size: '',
    ext: [], // 多文件上传时，限制文件类型
    concurrency: 3, // 并发数，只有在并行上传的情况下有效
    mode: UPLOAD_MODE.parallel, // parallel 并行上传， serial 串行上传
    root: './' // 指定上传到服务器的某个路径
};
```



### put(filePath, remotePath)

文件上传方法，将本地的文件上传到服务器上

- filePath：必选，本地的文件，不会判断文件是否存在，所以需要在入参的时候自行判断
- remotePath：必选，上传到服务器上的路径，同样不会判断服务器上的文件夹目录是否存在，需要自行创建

### upload(filePath, remotePath, mode)

本地上传，推荐使用这个方法，这个方法会判断文件是否存在于本地，以及创建服务器上的文件目录

- filePath：必选，接收一个`string`或`string[]`的值，支持`glob`写法，支持混合输入
- remotePath：非必选，接收一个`string`，默认值是`defaultConfig.root`
- mode：非必选，接收一个`string`，枚举值为：`parallel`/`serial`，默认值是`defaultConfig.mode`

#### Usage

```ts
// 上传一个文件夹
ftp.connect()
    .then(() => {
        ftp.upload('./file');
    })
    .then(() => {
        ftp.close();
    });

// 上传多个文件，和glob的写法
ftp.connect()
    .then(() => {
        ftp.upload(['./src/index.ts', './class/**/*.ts']);
    })
    .then(() => {
        ftp.close();
    });
```

### mkdir(remotePath)

创建一个服务器上的文件目录

- remotePath：必选，接收一个`string`

### batchMkdir(remotePath)

循环创建一个服务器上的文件目录

- remotePath：必选，接收一个`string[]`

### delete(file)

删除服务端的文件

- file：必选，接收一个`string`，不会验证服务端是否存在文件

### list(filePath)

查看服务器上的文件/文件夹

- filePath：非必选，接收一个`string`，默认值是`defaultConfig.root`

### close()

关闭连接

### 