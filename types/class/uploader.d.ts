/**
 * @file 实现上传的基类
 */
declare let EventEmitter: any;
export interface IUploader {
    connect(): any;
    upload(filePath?: string, remoteDir?: string): Promise<Record<string, any>>;
    delete(remoteFile?: string): any;
    list(): any;
    close(): any;
    mkdir(remote: string): any;
}
export default class Uploader extends EventEmitter {
    constructor(opt: any);
    init(opt: any): void;
    onReady(): void;
    onStart(): void;
    onSuccess(file?: any): void;
    onFailure(e: any): void;
    onFileUpload(file: any): void;
    /**
     * 提供接口方便在销毁前做业务处理
     */
    onBeforeDestroy(): void;
    onDestroyed(): void;
    destroy(): void;
}
export {};
