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
        var bucket = "adtest";
        var ak = "ak";
        var sk = "sk";

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

            // {"Error":{"code":"11","Message":"ACL:Key-pair can not be found.","LogId":"784098592"}}
            expect( errorMsg.indexOf( 'Error: {"Error":{"code":"11","Message":"ACL:Key-pair can not be found."' ) ).toBe( 0 );

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
});





















/* vim: set ts=4 sw=4 sts=4 tw=100: */
