

var sdk = require('../index');
var path = require('path');


sdk.start([path.join(__dirname, './data/a.txt'), 'bs://weigou-baidu-com/hello/world'], {});


sdk.start([path.join(__dirname, './data/z/y/3.txt'), 'bs://weigou-baidu-com/'], {});


sdk.start(
    [
        path.join(__dirname, './data/z/y/3.txt'),
        'bs://weigou-baidu-com/'
    ],
    {
        'auto-uri': true
    }
);


sdk.start([path.join(__dirname, './data/z'), 'bs://weigou-baidu-com/test/upload/folder'], {});


