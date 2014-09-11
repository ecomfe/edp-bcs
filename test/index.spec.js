/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * index.spec.js ~ 2014/03/04 18:28:04
 * @author leeight(liyubei@baidu.com)
 *         zengjialuo(zengjialuo@baidu.com)
 * @version $Revision$ 
 * @description 
 *  
 **/
var index = require('../index');
var path = require('path');
var bcs = require('../lib/sdk');
var async = require('async');

describe('index', function () {
    it('default', function () {
        expect(index.getMaxSize({})).toBe(10 * 1024 * 1024);

        expect(index.getMaxSize({ 'max-size': '2M' })).toBe(2 * 1024 * 1024);
        expect(index.getMaxSize({ 'max-size': '2m' })).toBe(2 * 1024 * 1024);

        expect(index.getMaxSize({ 'max-size': '2K' })).toBe(2 * 1024);
        expect(index.getMaxSize({ 'max-size': '2k' })).toBe(2 * 1024);

        expect(index.getMaxSize({ 'max-size': '2.1K' })).toBe(2 * 1024);
        expect(index.getMaxSize({ 'max-size': '2.1k' })).toBe(2 * 1024);
    });


    it('cli', function () {
        var _sendRequestBack = bcs.BaiduCloudStorage.prototype._sendRequest;
        bcs.BaiduCloudStorage.prototype._sendRequest = 
            function (options, data, targetUrl, def) {
                setTimeout(function () {
                    var bcsUrl = decodeURIComponent(targetUrl.replace(/\?.*/g, ''));
                    def.resolve(bcsUrl);
                }, 50);
            };

        var commandList = [
            {
                args: [
                    path.join(__dirname, './data/a.txt'),
                    'bs://a-bucket-name/hello/world'
                ],
                opts: {}
            },
            {
                args: [
                    path.join(__dirname, './data/a.txt'),
                    'bs://a-bucket-name/hello/world'
                ],
                opts: {
                    'auto-uri': true
                }
            },
            {  
                args: [
                    path.join(__dirname, './data/a.txt'),
                    'bs://a-bucket-name/hello/world/b.txt'
                ],
                opts: {}
            },
            {  
                args: [
                    path.join(__dirname, './data/a.txt'),
                    'bs://a-bucket-name/hello/world/b.txt'
                ],
                opts: {
                    'auto-uri': true
                }
            },
            {

                args: [
                    path.join(__dirname, './data/z'),
                    'bs://a-bucket-name/hello/world'
                ],
                opts: {}
            },
            {

                args: [
                    path.join(__dirname, './data/z'),
                    'bs://a-bucket-name/hello/world'
                ],
                opts: {
                    'auto-uri': true
                }
            }
        ];

        var doneFlag = false;
        var results;

        async.map(
            commandList,
            function (item, callback) {
                var d = index.start(item.args, item.opts);
                d.done(function (data) {
                    callback(null, data);
                });
                d.fail(function (err) {
                    callback(err);
                });
            },
            function (err, res) {
                results = res;
                doneFlag = true;
            }
        );


        waitsFor(function () { 
            return !!doneFlag;
        });

        runs(function () {
            expect(results[0]).toBe('http://bs.baidu.com/a-bucket-name/hello/world/a.txt');
            expect(results[1]).toBe('http://bs.baidu.com/a-bucket-name/hello/world/a-2632561a.txt');
            expect(results[2]).toBe('http://bs.baidu.com/a-bucket-name/hello/world/b.txt');
            expect(results[3]).toBe('http://bs.baidu.com/a-bucket-name/hello/world/b-2632561a.txt');
            expect(results[4].success.length).toBe(3);
            expect(results[4].success.some(function (item) {
                return item.url === 'http://bs.baidu.com/a-bucket-name/hello/world/2.txt';
            })).toBe(true);
            expect(results[5].success.length).toBe(3);
            expect(results[5].success.some(function (item) {
                return item.url === 'http://bs.baidu.com/a-bucket-name/hello/world/y/3-da717507.txt';
            })).toBe(true);
            bcs.BaiduCloudStorage.prototype._sendRequest = _sendRequestBack;
        });
    });

});





















/* vim: set ts=4 sw=4 sts=4 tw=100: */
