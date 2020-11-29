
let EventEmitter = require('events');

export default class Uploader extends EventEmitter {
    constructor(opt = {}) {
        super()
        this.init(opt)
    }

    init(opt) {
        this.options = opt
    }

    async connect(): Promise<Record<string, any>> {
        throw new Error('connect must be override')
    }

    async upload(filePath?, remoteDir?): Promise<{}> {

        throw new Error('upload must be override')
    }

    delete (remoteFile?) {

        throw new Error('delete must be override')
    }

    list () {

        throw new Error('list must be override')
    }

    onReady() {
        console.log('connected')
        this.emit('upload:ready')
    }

    onStart() {
        console.log('start upload');
        this.emit('upload:start', this.options)
    }

    onSuccess() {
        console.log('upload success')
        this.emit('upload:success')
    }

    onFailure(e) {
        console.error('upload fail', e)
        this.emit('upload:failure', this.options, e)
    }

    onFileUpload(file) {
        this.emit('upload:file', this.options, file)
    }

    /**
     * 提供接口方便在销毁前做业务处理
     */
    onBeforeDestroy() {
        this.emit('upload:beforedestroy');
    }

    onDestroyed() {

        this.emit('upload:destroy');
    }

    destroy() {
        if (this.destroyed) {
            this.onBeforeDestroy();
            this.options = null;
            this.removeAllListeners();
            this.onDestroyed();
            this.destroyed = true;
        }
    }

}
