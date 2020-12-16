/**
 * ftp 单元测试文件
 */

import ftp from 'ftp';
import FtpClient from '../src/ftp/index';

const initMock = jest.fn();

jest.mock('ftp', () => {
    return jest.fn().mockImplementation(() => {
        return {
            connect: jest.fn(() => Promise),
            delete: jest.fn((file) => {}),
            put: jest.fn((file, remoteFile, cb) => {
                cb && cb();
            }),
            on: initMock
        };
    });
}); // ftp 现在是一个mock函数

beforeEach(() => {
    // 每次实例化的时候清除实例引用
    ftp.mockClear();
});

const opt = {
    host: 'localhost',
    port: 22,
    user: 'unittest',
    password: 'unittest',
    root: '.'
};
const file = './src/index.ts';

describe('ftp功能测试', () => {

    it('检查是否调用了类构造函数', () => {
        const client = new FtpClient({});
        expect(ftp).toHaveBeenCalledTimes(1);
    });

    it('测试连接', async () => {
        
        const client = new FtpClient(opt);
        let result = await client.connect();

        expect(result).toEqual(opt);
    });

    it('测试删除', async () => {
        const client = new FtpClient(opt);
        let result = await client.delete(file);

        expect(result).toEqual({
            file: file
        });
    });

    it('测试上传', async () => {
        const client = new FtpClient(opt);
        let result = await client.put(file, file);

        expect(result).toEqual({
            file: file
        });
    });

});
