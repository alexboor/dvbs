const { exec } = require('child_process');

class Backup {

    /**
     * run
     *
     * Main module method
     *
     * @param params Array extra parameters for module command
     */
    async run (params) {
        return new Promise(async (resolve, reject) => {
            if (!params[0]) {
                reject(this._responseError('Container name can\'t be empty!'))
            }

            try {
                let containerInfo = await this._getContainerInfo(params[0]);
                let mounts = containerInfo['Mounts'];

                if (!mounts) reject(this._responseError('No volumes had backuped. No mounted volumes in the container.'));

                mounts.forEach(async item => {
                    let name = params[1] || this._attachCurrentDirectory(this._createName(params[0], item['Destination']));

                    try {
                        let result = await this._archive(params[0], item['Source'], name);
                        resolve(this._responseOk(result))
                    } catch (err) {
                        reject(this._responseError(err));
                    }
                });
            } catch (err) {
                reject('No such container')
            }
        })
    }

    /**
     * _archive
     *
     * Archiving the volume directory
     *
     * @param name {string} Container name
     * @param src {string} Volume directory path
     * @param dest {string} Path and filename where to save archive
     * @return {Promise<any>} response object
     * @private
     */
    _archive(name, src, dest) {
        return new Promise((resolve, reject) => {
            exec(`tar -czvf ${dest}.tar.gz ${src}`, (err, stdout, stderr) => {
                if (err) reject(stderr);
                resolve(stdout);
            }).unref();
        });


    }

    /**
     * getContainerInfo
     *
     * Return a full container information
     *
     * @param name {String} Container name need to inspect
     * @return {Promise} Object
     */
    _getContainerInfo(name) {
        return new Promise((resolve,reject) => {
            exec(`docker inspect ${name}`, (err, stdout, stderr) => {
                if (err) reject(stderr);

                resolve(JSON.parse(stdout)[0])
            }).unref();
        });
    }

    /**
     * _createName
     *
     * Return name generated from container name and destination of volume plus currrent date
     *
     * @param name
     * @param dest
     * @return {string}
     * @private
     */
    _createName(name,dest) {
        let now = new Date();
        let date = `${now.getFullYear()}.${now.getMonth()+1}.${now.getDate()}.${now.getHours()}.${now.getMinutes()}`;

        return `[${name}]_${dest.split('/').join('_')}_${date}`;
    }

    /**
     * _attachCurrentDirectory
     *
     * Add fullpath working directory to given filenam
     *
     * @param name {string} File name
     * @return {string} Full path with given filename
     * @private
     */
    _attachCurrentDirectory(name) {
        return `${process.cwd()}/${name}`;
    }

    /**
     * _responseOk
     *
     * Return Seccess response object
     *
     * @param payload {Object|string} payload data for response
     * @return {Object}
     * @private
     */
    _responseOk(payload) {
       return payload
    }

    /**
     * _responseError
     *
     * Returns Failed response object payloaded with messages data
     *
     * @param msg
     * @return {{ok: boolean, msg: *}}
     * @private
     */
    _responseError(msg) {
        return msg
    }
};

module.exports = Backup;