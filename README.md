# edp-bcs

[![Build Status](https://travis-ci.org/ecomfe/edp-bcs.png?branch=master)](https://travis-ci.org/ecomfe/edp-bcs) [![Dependencies Status](https://david-dm.org/ecomfe/edp-bcs.png)](https://david-dm.org/ecomfe/edp-bcs)

edp bcs command

## api

```javascript
var bcs = require('edp-bcs');

var opts = {
	ak: 'ak',
	sk: 'sk'
};

var path = 'test';
var bucket = 'adteset';
var prefix = 'test2014'

opts.callbacks = function(err, results) {
	console.log(results);
};

bcs.upload(path, bucket, prefix, opts);
```
