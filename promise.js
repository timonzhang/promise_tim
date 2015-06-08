var Promise = module.exports = function (f){
    var first = Object.create(promiseNode);
    first.handler = function(){};
    first.rejecter = function(){};
    f(first.resolve.bind(first), first.reject.bind(first));

    return first;
}


var promiseNode = {
    value : null,//当前的值，可能为自身，有可能为ERROR,
    error : null,
    handler :null,//当前的处理方式
    reject:null,//错误处理函数
    next:null,//后一个promise

    then: function(fullfill, reject){
        var newNext = Object.create(promiseNode);
        this.handler = fullfill;
        this.reject = reject;
        this.next = newNext;

        if( (this.value && !isThenable(this.value)) || this.error){//已计算出值且不是PROMISE
            this.execute(value, this.error);
        }
        return this.next;
    },

    //根据给定值将自身改成完成状态(fullfill or reject)，并依次调用后续promise,返回自身
    execute: function(value, hasError){
        var currentHasError = false;
        if(!this.value && !this.error){//只有当value不存在时，才运行
            try{
                if(!hasError) {
                    this.value = this.handler(value);
                }else{
                    this.value = this.reject(value);
                }
            }catch(err){
                this.error = err;
            currentHasError = true;
        }
        }

        var self = this;
        //开始传递
        if (this.next){
            if(currentHasError){//当前执行阶段出错
                self.next.execute(this.error, true);
            }else{
                if (this.value && isThenable(this.value)){//如果resolve完后是个promise则为该promise的then方法添加后续
                    this.value.then(function(result){
                        self.next.execute(result, false);
                    },function(err){
                        self.next.execute(err, true);
                    });
                }else{
                    this.next.execute(this.value, false);
                }
            }
        }

        return this;
    },
    resolve: function(value){
        this.execute(value, false);
    },
    reject: function(value){
        this.execute(value, true);
    }
}

Promise.prototype.wrap = function(obj){
    if(typeof obj !== 'Function'){
        return new Promise(function(resolve){resolve(obj)});
    }else{//function
        return new Promise(function(resolve, reject){
            try{
                var result = obj();
                resolve(result);
            }catch(err){
                reject(err);
            }
        });
    }
}

/**
 * Promise.all(p1,p2...).then()
 */
Promise.prototype.all = function(){
    var  self = new Promise(function(fullfilled, reject){
        var args = Array.prototype.slice.call(arguments);
        var expected = args.length;
        var count = 0;
        var results = [];

        function fullfill (result){
            count ++;
            results.push(result);
            if(count >= expected){
                self.resolve(results);
            }
            return result;
        }

        function reject(result){
            count ++;
            results.push(result);
            self.reject(results);
            return result;
        }

        args.forEach(function(arg){//为每个参数封装成Promise，
            var p = arg;
            if(!isThenable(p)){
                p = Promise.wrap(p);
            }
            p.then(fullfill, reject);
        });
    });

    return self;
}


function isThenable(o){
    return typeof o.then === 'function';
}








