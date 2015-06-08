# very simple promise implementation
Example:

```js
var Promise = require('./compoment/util/promise.js');

var p = Promise(function(resolve, reject){
    setTimeout(function(){
        resolve('tim');
    }, 1000);

});

p.then(console.log)
    .then(function(){
        console.log('part2');
        return new Promise(function(resolve, reject){
            setTimeout(function(){
                resolve('Tim');
            }, 2000);
        });
    })
    .then(function(value){
        console.log(value);
        return 'fuck';
    })
    .then(function(value){
        console.log(value);
        throw Error('monster');
    })
    .then(null, function(err){
        console.log(err);
        return new Promise(function(resolve, reject){
            setTimeout(function(){
                reject('final Error')
            }, 1000);
        });
    })
    .then(null, console.log);
;

```



