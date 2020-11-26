/**
 * Created by uedc on 2020/9/11.
 */

let EventEmitter = require('events');

class LoaderRunner extends EventEmitter{
    constructor () {
        super();
        this._loaderList = new Map();
    }

    regisit (name, loader) {
        this._loaderList.set(name, loader);
        loader.on('upload:destroy', () => this.unRegisit(name));
    }

    unRegisit (name) {
        this._loaderList.delete(name);
    }

    async start () {
        for (let [, loader] of this._loaderList) {
            await loader.connect();
            await loader.startUpload();

            console.log('\n');
        }
    }

    destroy () {
        this._loaderList.clear();
        this._loaderList = null;
    }
}

module.exports = LoaderRunner;
