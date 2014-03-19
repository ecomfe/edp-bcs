# edp-bcs

[![Build Status](https://travis-ci.org/ecomfe/edp-bcs.png?branch=master)](https://travis-ci.org/ecomfe/edp-bcs) [![Dependencies Status](https://david-dm.org/ecomfe/edp-bcs.png)](https://david-dm.org/ecomfe/edp-bcs)

## Usage

**edp**

```bash
edp bcs a.js bs://<bucket>/a.js

edp bcs dir bs://<bucket>/dir
```

**api**

```javascript
var bcs = require( 'edpx-bcs' );

var ak = '';
var sk = '';
var maxSize = 10 * 1024; // 10K
var autoUri = false;

// 上传文件
var sdk = new bcs.sdk.BaiduCloudStorage( ak, sk, maxSize, autoUri );

var def = sdk.upload( bucket, localFile );
def.done(function( url ){ console.log( url ) });
def.fail(function( e ){ console.error( e ) });

// 上传目录
var def = sdk.upload( bucket, localDir );
def.done(function( result ){
  /** Array.<{item: string, url: string}> */
  result.success;
  
  /** Array.<{item: string, error: string}>*/
  result.failure;
});
// def不会进入rejected的状态，不需要fail的处理函数.
// done.fail(function(){});
```
