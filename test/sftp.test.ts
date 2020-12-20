/**
 * sftp 单元测试文件
 */

import sftp from 'ssh2-sftp-client';
import SftpClient from '../src/sftp/index';
import {
    ERROR_CODE,
    SUCCESS_CODE
} from '../src/const/code';

let opt = {
    host: 'localhost',
    port: 22,
    username: 'unittest',
    password: 'unittest',
    root: './user'
};
let file = './src/index.ts';
let dir = '../test/';
let initMock = jest.fn((opt) => {
    if (opt) {

        return Promise.resolve({
            data: opt,
            code: SUCCESS_CODE
        });
    }
    return Promise.reject({ code: ERROR_CODE });
});

jest.mock('ssh2-sftp-client', () => {
    return jest.fn().mockImplementation(() => {
        return {
            connect: initMock,
            delete: initMock,
            fastPut: jest.fn((file, remoteFile) => {

                return Promise.resolve(file);
            }),
            exists: jest.fn((dir) => {
                return Promise.resolve(!dir);
            }),
            mkdir: initMock,
            end: initMock,
            list: initMock,
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
    sftp.mockClear();
});


describe('sftp功能测试', () => {

    it('测试连接成功', async () => {
        let client = new SftpClient({
            ...opt,
            factor: 2,
            minTimeout: 1000
        });

        await client.connect().then(() => {
            expect(initMock).toBeCalled();
        });
    });

    it('测试上传文件夹', async () => {
        let client = new SftpClient(opt);
        let result = await client.upload('./src');

        expect(result).toBeInstanceOf(Array);

        let result1 = await client.upload('./src', '/user');
        expect(result1).toBeInstanceOf(Array);
    });

    it('测试上传不存在的文件', async () => {
        let client = new SftpClient(opt);

        client.put('./src/test.ts', '').catch(err => {

            expect(err).toBeInstanceOf(Error);
        });
    });

    it('测试删除', async () => {
        let client = new SftpClient(opt);

        client.delete(file).then(res => {
            expect(res.code).toEqual(SUCCESS_CODE);
        });

        client.delete('').catch(err => {
            expect(err.code).toEqual(ERROR_CODE);
        });
    });


    it('测试创建文件夹失败', async () => {
        let client = new SftpClient(opt);

        client.mkdir('').catch(err => {
            expect(err.code).toEqual(ERROR_CODE);
        });
    });

    it('测试查看目录', async () => {
        let client = new SftpClient(opt);
        client.list('root');

        expect(initMock).toBeCalled();

        client.list().then(res => {
            expect(res.code).toEqual(SUCCESS_CODE);
        })
    });

    it('测试关闭服务', () => {
        let client = new SftpClient(opt);
        client.close();

        expect(initMock).toBeCalled();
    });


    it('测试关闭服务', () => {
        let client = new SftpClient(opt);
        client.logout();

        expect(initMock).toBeCalled();
    });
});
