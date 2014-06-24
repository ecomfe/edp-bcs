/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 **************************************************************************/



/**
 * sdk.spec.js ~ 2014/03/04 17:34:41
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$
 * @description
 * 测试lib/sdk.js
 **/
var path = require( 'path' );
var bcs = require( '../lib/sdk' );

describe('sdk', function(){
    it('default', function(){
        var bucket = 'adtest';
        var ak = 'ak';
        var sk = 'sk';

        var maxSize = 10 * 1024 * 1024;
        var autoUri = false;

        var localFile = path.join( __dirname, 'sdk.spec.js' );

        var sdk = new bcs.BaiduCloudStorage( ak, sk, maxSize, autoUri );

        var errorMsg = null;
        var d = sdk.upload( bucket, localFile );
        d.fail(function(e){
            errorMsg = e.toString().trim();
        });

        waitsFor(function(){ return d.state !== 'pending'; });

        runs(function(){
            expect( d.state ).toBe( 'rejected' );

            // {'Error':{'code':'11','Message':'ACL:Key-pair can not be found.','LogId':'784098592'}}
            expect( errorMsg.indexOf( 'Error: {"Error":{"code":"11",' +
                '"Message":"ACL:Key-pair can not be found."' ) ).toBe( 0 );

            var sign = sdk.sign( 'PUT', bucket, '/a.txt' );
            expect( sign ).toBe( 'http://bs.baidu.com/adtest/a.txt?sign=MBO:ak:YetFoe6VAgXZ8wYLc7K1xSSr8oI%3D' );
            expect( sdk._getBcsHost() ).toBe( 'http://bs.baidu.com' );
            expect( sdk._getBaseName( '/this/is/the/path/a.txt' ) ).toBe( 'a.txt' );

            expect( sdk._getObjectName( localFile ) ).toBe( '/sdk.spec.js' );
            expect( sdk._getObjectName( localFile, '/this/is/the/' ) ).toBe( '/this/is/the/sdk.spec.js' );
            expect( sdk._getObjectName( localFile, '/this/is/the' ) ).toBe( '/this/is/the/sdk.spec.js' );
            expect( sdk._getObjectName( localFile, '/this/is/the.js' ) ).toBe( '/this/is/the.js' );

            var localDir = __dirname;
            expect( sdk._getObjectName( localDir ) ).toBe( '/test' );
            expect( sdk._getObjectName( localDir + '/' ) ).toBe( '/test' );
        });
    });

    it('upload data', function(){
        var bucket = 'adtest';
        var ak = 'ak';
        var sk = 'sk';

        var maxSize = 10 * 1024 * 1024;
        var autoUri = false;

        var data = 'for upload data';
        var objectName = '/prefix/name.js'; 

        var sdk = new bcs.BaiduCloudStorage( ak, sk, maxSize, autoUri );
        sdk._sendRequest = createSpy('sdk._sendRequest').andCallFake(function( options, data, targetUrl, def ){
            setTimeout(function(){
                var bcsUrl = decodeURIComponent( targetUrl.replace(/\?.*/g, '') );
                def.resolve( bcsUrl );
            }, 500);
        });

        var errorMsg = null;
        var result;
        var d = sdk.realUpload( data, bucket, objectName );
        d.fail(function(e){
            errorMsg = e.toString().trim();
        });
        d.done(function(x){
            result = x;
        });

        waitsFor(function(){ return d.state !== 'pending'; });

        runs(function(){
            expect( d.state ).toBe( 'resolved' );
            expect( errorMsg ).toBe( null );
            expect( result ).toBe( 'http://bs.baidu.com/adtest/prefix/name.js' );
        });
    });


    it('upload directory', function(){
        var bucket = 'adtest';
        var ak = 'ak';
        var sk = 'sk';

        var maxSize = 10;   // 10字节
        var autoUri = false;

        var localDir = path.join( __dirname, 'data' );

        //  总共8个文件，并发的是5个，每个延迟2s，总共需要花费Math.ceil( 8 / 5) * 2 == 4s的时间
        var start = Date.now();
        var sdk = new bcs.BaiduCloudStorage( ak, sk, maxSize, autoUri );
        sdk._sendRequest = createSpy('sdk._sendRequest').andCallFake(function( options, data, targetUrl, def ){
            setTimeout(function(){
                var bcsUrl = decodeURIComponent( targetUrl.replace(/\?.*/g, '') );
                def.resolve( bcsUrl );
            }, 2 * 1000);
        });

        var errorMsg = null;
        var result = null;
        var d = sdk.upload( bucket, localDir );
        d.fail(function(e){
            errorMsg = e.toString().trim();
        });
        d.done(function(x){
            result = x;
        });

        waitsFor(function(){ return d.state !== 'pending'; });

        runs(function(){
            var end = Date.now();
            expect( parseInt( (end - start) / 1000, 10 ) ).toBe( 2 );
            expect( d.state ).toBe( 'resolved' );
            expect( result.success.length ).toBe( 7 );
            expect( result.failure.length ).toBe( 1 );
        });
    });
});





















/* vim: set ts=4 sw=4 sts=4 tw=100: */
