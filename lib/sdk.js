/**
 * lib/sdk.js ~ 2013/05/11 19:30:50
 * @author leeight(liyubei@baidu.com)
 * @ignore
 * 封装bcs的api
 **/
var edp = require( 'edp-core' );
var async = require( 'async' );
var walk = require( 'walk' );
var fs= require( 'fs' );
var path= require( 'path' );

/**
 * @constructor
 * @param {string} ak The AccessKey.
 * @param {string} sk The SecretKey.
 * @param {number} maxSize The max file size.
 * @param {boolean=} opt_autoUri 是否自动添加md5的后缀.
 */
function BaiduCloudStorage(ak, sk, maxSize, opt_autoUri) {
    this.ak = ak;
    this.sk = sk;
    this.maxSize = maxSize;
    this.autoUri = !!opt_autoUri;
}

/**
 * @see http://dev.baidu.com/wiki/bcs/index.php?title=sign
 * 只返回MBO的签名（Method, Bucket Name, Object Name），对于上传的
 * 应用足够了.
 * @param {string} method The request method.
 * @param {string} bucketName The bucket name.
 * @param {string} objectName The object name.
 *
 * @return {string} The url with signature.
 */
BaiduCloudStorage.prototype.sign = function(method, bucketName, objectName) {
    // base64_encode(hash_hmac('sha1', Content, SecretKey,true))
    var flag = 'MBO';
    var body = [
        'Method=' + method,
        'Bucket=' + bucketName,
        'Object=' + objectName
    ].join('\n');

    var content = flag + '\n' + body + '\n';

    var hmac = require('crypto').createHmac('sha1', this.sk);
    hmac.update(new Buffer(content, 'utf-8'));
    var digest = encodeURIComponent(hmac.digest('base64')).replace(/%2F/g, '/');

    var signature = [flag, this.ak, digest].join(':');
    var url = this._getBcsHost() + '/' + bucketName + '/' +
        encodeURIComponent(objectName.substr(1)) + '?sign=' + signature;
    return url;
};

/**
 * 需要针对开发机单独处理一下，因为开发机可能没有外网的权限，无法
 * 直接访问bs.baidu.com，但是如果直接设置成s3.bae.baidu.com，那么
 * 不再公司的时候也无法访问，所以呢，也是挺纠结的一个事情。
 * @return {string}
 */
BaiduCloudStorage.prototype._getBcsHost = function() {
    var os = require('os');
    var fs = require('fs');

    if (os.platform() === 'linux') {
        if (fs.existsSync('/etc/redhat-release')) {
            var version = fs.readFileSync('/etc/redhat-release');
            if (version.indexOf('Nahant Update 3') != -1) {
                return 'http://s3.bae.baidu.com';
            }
        }
    }
    return 'http://bs.baidu.com';
};

/**
 * @return {string}
 */
BaiduCloudStorage.prototype._getBaseName = function(localFile) {
    var path = require('path');
    var fs = require('fs');
    var crypto = require('crypto');

    if (this.autoUri) {
        var basename = path.basename(localFile);
        var extname = path.extname(basename);

        var md5sum = crypto.createHash('md5');
        md5sum.update(fs.readFileSync(localFile));
        return basename.replace(extname, '') + '-' +
            md5sum.digest('hex').substring(0, 8) + extname;
    } else {
        return path.basename(localFile);
    }
};

/**
 * @param {string} localFile The local file path.
 * @param {string=} opt_prefix The target prefix path.
 */
BaiduCloudStorage.prototype._getObjectName = function(localFile, opt_prefix) {
    var fs = require('fs');
    var path = require('path');
    var stat = fs.statSync(localFile);

    var objectName;

    if (opt_prefix) {
        if (stat.isFile()) {
            var ext = path.extname(localFile);
            if (ext && ext == path.extname(opt_prefix)) {
                // edp bcs lib/bcs.js bs://adtest/hello/world/my-bcs.js
                // objectName = '/my-bcs.js'
                objectName = '/' + opt_prefix;
            } else {
                // edp bcs lib/bcs.js bs://adtest/hello/world
                // objectName = '/hello/world/bcs.js'
                objectName = '/' + opt_prefix + '/' +
                    this._getBaseName(localFile);
            }
        }
    } else {
        objectName = '/' + this._getBaseName(localFile);
    }

    return objectName.replace(/\/+/g, '/');
};

/**
 * @param {string} bucketName Bucket Name,.
 * @param {string} localFile The local file path.
 * @param {string=} opt_prefix The target prefix path.
 * @param {function} callback callback
 */
BaiduCloudStorage.prototype.upload = function(bucketName,
                                              localFile,
                                              opt_prefix,
                                              callback) {
    var _this = this;
    var uploadSingle = function (filename, callback) {
        var dirname = path.dirname(path.relative(localFile, filename))
        var prefix = path.join(opt_prefix, dirname);
        var def = _this.uploadSingle(bucketName, filename, prefix);
        def.then(function() {
            callback(null, filename);
        }, function() {
            callback(filename + " not uploaded");
        });
    };

    this.walk(localFile, function(files) {
        async.map(files, uploadSingle, callback);
    });
};

/**
 * @param {string} root path to walk
 * @param {function} callback callback
 *
 */
BaiduCloudStorage.prototype.walk = function(root, callback) {

    var stat = fs.statSync(root);

    if (stat.isDirectory()) {

        var files = [];
        var walker  = walk.walk(root, { followLinks: false });

        walker.on('file', function(root, stat, next) {
            file = path.join(root, stat.name);
            var stat = fs.statSync(file);

            if (stat.size > this.maxSize) {
                edp.log.error('%s size = [%s], maxSize = [%s], ignore it.',
                    localFile, stat.size, this.maxSize);
            } else {
                files.push(file);
            }
            next();
        });

        walker.on('end', function() {
            callback(files)
        });

    } else if (stat.isFile()) {
        callback([root]);
    }
};

/**
 * @param {string} bucketName Bucket Name,.
 * @param {string} localFile The local file path.
 * @param {string=} opt_prefix The target prefix path.
 *
 * @return {Deferred}
 */
BaiduCloudStorage.prototype.uploadSingle = function(bucketName,
                                              localFile,
                                              opt_prefix) {
    var Deferred = require( './Deferred' );

    var url = require('url');
    var http = require('http');
    var fs = require('fs');
    var path = require('path');

    var def = new Deferred();

    var objectName = this._getObjectName(localFile, opt_prefix);
    var targetUrl = this.sign('PUT', bucketName, objectName);

    var data = fs.readFileSync(localFile);
    var options = url.parse(targetUrl);
    options.method = 'PUT';
    options.headers = {
        'Connection': 'close',
        'Content-Length': data.length
    };

    var req = http.request(options, function(res) {
        if (res.statusCode === 200) {
            var bcsUrl = decodeURIComponent(targetUrl.replace(/\?.*/g, ''));
            var cdnHost = require('edp-config').get('bcs.host');
            if (cdnHost) {
                bcsUrl = bcsUrl.replace(/^http:\/\/(s3\.bae|bs)\.baidu\.com/,
                    cdnHost);
            }
            edp.log.info( bcsUrl );

            def.resolve( bcsUrl );
        } else {
            res.setEncoding('utf8');
            res.on('data', function( chunk ) {
                var msg = chunk.toString();
                edp.log.warn( msg );
                def.reject( new Error( msg ) );
            });
        }
    });
    req.on('error', function(e) {
        edp.log.error('Problem with request: %s', e.message);
        def.reject( e );
    });

    process.nextTick(function(){
        req.write(data);
        req.end();
    });

    return def;
};

/**
 * @ignore
 */
exports.BaiduCloudStorage = BaiduCloudStorage;





















/* vim: set ts=4 sw=4 sts=4 tw=100: */
