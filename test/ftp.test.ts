/**
 * ftp 单元测试文件
 */

import ftp from 'ftp';
import FtpClient from '../src/ftp/index';

import {
    ERROR_CODE,
    SUCCESS_CODE
} from '../src/const/code';

let opt = {
    host: 'localhost',
    port: 22,
    username: 'unittest',
    password: 'unittest',
    root: '.'
};
let file = './src/index.ts';
let dir = '../test/';
let initMock = jest.fn(() => { });

jest.mock('ftp', () => {
    return jest.fn().mockImplementation(() => {

        return {
            connect: initMock,
            delete: jest.fn((file, cb) => {
                if (!file) {
                    return cb?.({ code: ERROR_CODE });
                }
                cb?.();
            }),
            put: jest.fn((file, remoteFile, cb) => {
                if (!remoteFile) {

                    cb?.({ code: ERROR_CODE });
                }
                cb?.();
            }),
            mkdir: jest.fn((dir, cb) => {
                if (dir === 'existDir') {
                    return cb({ code: 550 });
                }
                if (dir === 'otherError') {
                    return cb({ code: ERROR_CODE });
                }
                cb?.();
            }),
            list: jest.fn((dir, cb) => {
                let list = [],
                    err = { code: ERROR_CODE };

                if (!dir) {
                    cb(err, list);
                }

                cb('', list);
            }),
            end: initMock,
            on: jest.fn((status, cb) => {
                if (status) {
                    cb?.();
                }
            })
        };
    });
}); // ftp 现在是一个mock函数

beforeEach(() => {
    // 每次实例化的时候清除实例引用
    ftp.mockClear();
});

describe('ftp功能测试', () => {

    it('检查是否调用了类构造函数', () => {
        let client = new FtpClient(opt);
        expect(ftp).toHaveBeenCalledTimes(1);
    });

    it('测试连接成功', async () => {
        let client = new FtpClient(opt);

        client.connect();
        client.emit('connected');

        expect(initMock).toBeCalled();
    });

    it('测试连接失败，默认重连1次', async () => {
        let client = new FtpClient(opt);

        client.connect();
        jest.setTimeout(100);
        client.emit('error', new Error('连接失败'));

        expect(initMock).toBeCalledTimes(2);
    });

    it('测试连接失败，重连2次', async () => {
        let client = new FtpClient({
            ...opt,
            retries: 2
        });

        client.connect();
        jest.setTimeout(100);
        client.emit('ftp:error', new Error('连接失败'));
        client.emit('ftp:error', new Error('连接失败'));

        expect(initMock).toBeCalledTimes(3);
    });

    it('测试删除成功', async () => {
        let client = new FtpClient(opt);
        let result = await client.delete(file);

        expect(result.code).toEqual(SUCCESS_CODE);
    });

    it('测试删除失败', async () => {
        let client = new FtpClient(opt);
        client.delete('').catch(err => {
            expect(err.code).toEqual(ERROR_CODE);
        })
    });

    it('测试上传成功', async () => {
        let client = new FtpClient(opt);
        let result = await client.put(file, file);

        expect(result.code).toEqual(SUCCESS_CODE);
    });


    it('测试上传失败', async () => {
        let client = new FtpClient(opt);

        await client.put('', '').catch(res => {

            expect(res.code).toEqual(ERROR_CODE);
        });

        await client.put(file, '').catch(err => {
            expect(err.code).toEqual(ERROR_CODE);
        });
    });

    it('测试上传文件夹', async () => {
        let client = new FtpClient(opt);
        let result = await client.upload('./src');

        expect(result).toBeInstanceOf(Array);
    });

    it('测试创建文件夹成功', async () => {

        let client = new FtpClient(opt);
        client.mkdir(dir).then(res => {
            expect(res.code).toEqual(SUCCESS_CODE);
        });
    });

    it('测试创建已存在的文件夹', async () => {

        let client = new FtpClient(opt);
        client.mkdir('existDir').then(res => {
            expect(res.code).toEqual(550);
        });
    });

    it('测试创建文件夹失败', async () => {

        let client = new FtpClient(opt);
        client.mkdir('otherError').catch(res => {
            expect(res.code).toEqual(ERROR_CODE);
        });;
    });

    it('测试查看目录', async () => {

        let client = new FtpClient(opt);
        let result = await client.list('root');

        expect(result.code).toEqual(SUCCESS_CODE);
    });

    it('测试查看不存在目录', async () => {

        let client = new FtpClient(opt);

        await client.list('').catch(err => {

            expect(err.code).toEqual(ERROR_CODE);
        });

    });

    it('测试关闭服务', () => {
        let client = new FtpClient(opt);
        client.close();

        expect(initMock).toBeCalled();
    });


    it('测试关闭服务', () => {
        let client = new FtpClient(opt);
        client.logout();

        expect(initMock).toBeCalled();
    });
});
