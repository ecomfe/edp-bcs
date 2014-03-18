/**
 * lib/bcs.js ~ 2013/05/11 19:14:35
 * @author leeight(liyubei@baidu.com)
 * @ignore
 * 静态资源上传的功能
 **/
var edp = require( 'edp-core' );

/**
 * @param {Object} opts 命令行参数.
 * @return {number}
 */
exports.getMaxSize = function( maxSize ) {
    if ( !maxSize ) {
        maxSize = 10 * 1024 * 1024;   // 10M
    }
    else {
        var msptn = /^([\d\.]+)([mk])?/i;
        var match = maxSize.match( msptn );
        if ( !match ) {
            edp.log.error( 'Invalid arguments: %s', maxSize );
            process.exit( 1 );
        }

        maxSize = parseInt( match[1], 10 );
        var unit = match[ 2 ];
        if (unit == 'm' || unit == 'M') {
            maxSize = maxSize * (1024 * 1024);
        } else if (unit == 'k' || unit == 'K') {
            maxSize = maxSize * (1024);
        }

        if (!maxSize) {
            maxSize = 10 * 1024 * 1024;
        }
    }

    return maxSize;
};

/**
 * @param {Array.<string>} args 命令行参数.
 * @param {Object.<string, string>} opts 命令的可选参数.
 */
exports.start = function (args, opts) {
    var file = args[ 0 ];
    if ( !file || args.length != 2 ) {
        edp.log.error( 'Invalid arguments' );
        process.exit( 1 );
    }

    var bktptn = /^bs:\/\/([^\/]+)(.*)?$/;
    var match = args[ 1 ].match( bktptn );
    if ( !match ) {
        edp.log.error( 'Invalid arguments: %s', args[ 1 ] );
        process.exit( 1 );
    }

    var bucket = match[ 1 ];
    var target = (match[ 2 ] || '').replace(/^\/+/, '');

    var fs = require( 'fs' );
    if ( !fs.existsSync( file ) ) {
        edp.log.error( 'No such file or directory = [%s]', file );
        process.exit( 1 );
    }

    var config = require( 'edp-config' );
    var ak = config.get( 'bcs.' + bucket + '.ak' ) || config.get( 'bcs.ak' );
    var sk = config.get( 'bcs.' + bucket + '.sk' ) || config.get( 'bcs.sk' );
    if ( !ak || !sk ) {
        edp.log.warn( 'Please set `bcs.ak` and `bcs.sk` first.' );
        edp.log.warn( 'You can apply them from ' +
            'http://bcs-console.bae.baidu.com/' );
        process.exit( 1 );
    }

    var opts = {
        maxSize: opts['max-size'],
        autoUri: opts['auto-uri'],
        ak: ak,
        sk: sk
    };

    return exports.upload(file, bucket, target, opts);
};

/**
 * @param {string} file 文件或目录
 * @param {string} bucket
 * @param {string} target 目标目录
 */
exports.upload = function (file, bucket, target, opts) {
    var maxSize = exports.getMaxSize( opts.maxSize );
    var autoUri = !!opts.autoUri;
    var bcs = require( './lib/sdk' );
    var sdk = new bcs.BaiduCloudStorage( opts.ak, opts.sk, maxSize, autoUri );
    return sdk.upload(bucket, file, target, opts.callback);
};



















/* vim: set ts=4 sw=4 sts=4 tw=100: */
