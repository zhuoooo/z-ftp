
let EventEmitter = require('events');

export default class Uploader extends EventEmitter {
    constructor(opt = {}) {
        super();
        this.init(opt);
    }

    public init(opt) {
        this.options = opt;
    }

    public async connect(): Promise<Record<string, any>> {
        throw new Error('connect must be override');
    }

    public async upload(filePath?, remoteDir?): Promise<{}> {

        throw new Error('upload must be override');
    }

    public delete (remoteFile?) {

        throw new Error('delete must be override');
    }

    public list () {

        throw new Error('list must be override');
    }

    public close () {
        
    }

    public onReady() {
        console.log('connected');
        this.emit('upload:ready');
    }

    public onStart() {
        console.log('start upload');
        this.emit('upload:start', this.options);
    }

    public onSuccess() {
        console.log('upload success');
        this.emit('upload:success');
    }

    public onFailure(e) {
        console.error('upload fail', e);
        this.emit('upload:failure', this.options, e);
    }

    public onFileUpload(file) {
        this.emit('upload:file', this.options, file);
    }

    /**
     * 提供接口方便在销毁前做业务处理
     */
    public onBeforeDestroy() {
        this.emit('upload:beforedestroy');
    }

    public onDestroyed() {

        this.emit('upload:destroy');
    }

    public destroy() {
        if (this.destroyed) {
            this.onBeforeDestroy();
            this.options = null;
            this.removeAllListeners();
            this.onDestroyed();
            this.destroyed = true;
        }
    }

}
