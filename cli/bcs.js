/**
 * @file 上传文件的功能
 * @author leeight(leeight@gmail.com)
 */


/**
 * 命令行配置项
 *
 * @inner
 * @type {Object}
 */
var cli = {};

/**
 * @const
 * @type {Array.<string>}
 */
cli.options = ['max-size:', 'auto-uri'];

/**
 * @const
 * @type {string}
 */
cli.description = '支持通过bcs来上传静态文件';


/**
 * 模块命令行运行入口
 * 
 * @param {Array} args 命令运行参数
 * @param {Object} opts 命令运行选项
 */
cli.main = function ( args, opts ) {
    require( '../index' ).start( args, opts );
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;


