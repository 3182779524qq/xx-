const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const async = require('async');

const phoneModel = {
    /**
     * 
     * @param {object} data 添加手机信息
     * @param {Function} cb 回调函数
     */
    add(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('链接数据库失败', err);
                cb({ code: -100, msg: '链接数据库失败' });
                return;
            };
            const db = client.db('cfj');
            let saveData = {
                src: data.src,
                phonename: data.phonename,
                brand: data.brand,
                price: data.price,
                secondprice: data.secondprice
            };
            // ========= 使用 async 的 串行无关联来写 ======================
            async.series([
                function (callback) {
                    db.collection('phone').find().sort({ _id: -1 }).toArray(function (err, result) {
                        if (err) {
                            callback({ code: '错误状态为：-101', msg: '查询记录失败' });
                        } else {
                            if (result == '') {
                                saveData._id = 1;
                            } else {
                                var num = result[0]._id;
                                console.log(result[0]._id);
                                num++;
                                saveData._id = num;
                            }
                            callback(null);
                        }
                    });
                },
                function (callback) {
                    // 写入数据库的操作
                    db.collection('phone').insertOne(saveData, function (err) {
                        if (err) {
                            callback({ code: -101, msg: '写入数据库失败' });
                        } else {
                            callback(null);
                        }
                    })
                }
            ], function (err, results) {
                // 不管上面3个异步操作是否都成功，都会进入到这个最终的回调里面
                if (err) {
                    console.log('上面的3步操作，可能出了问题', err);
                    // 还得告诉前端页面
                    cb(err);
                } else {
                    cb(null);
                }

                client.close();
            });
        })
    },

    /**
    * 获取手机列表
    * @param {Object} data 页码信息与每页显示条数信息
    * @param {Function} cb 回调函数
    */
    getPhoneList(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                cb({ code: -100, msg: '链接数据库失败' });
            } else {
                var db = client.db('cfj');
                // console.log("数据库进来了嘛");
                var limitNum = parseInt(data.pageSize);
                var skipNum = data.page * data.pageSize - data.pageSize;

                async.parallel([
                    function (callback) {
                        // 查询所有记录
                        db.collection('phone').find().count(function (err, num) {
                            if (err) {
                                callback({ code: -101, msg: '查询数据库失败' });
                            } else {
                                callback(null, num);
                            }
                        })
                    },
                    function (callback) {
                        // 查询分页的数据
                        db.collection('phone').find().limit(limitNum).skip(skipNum).toArray(function (err, data) {
                            if (err) {
                                callback({ code: -101, msg: '查询数据库失败' });
                            } else {
                                callback(null, data);
                            }
                        })
                    }
                ], function (err, results) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, {
                            totalPage: Math.ceil(results[0] / data.pageSize),
                            phoneList: results[1],
                            page: data.page,
                        })
                    }
                    // 关闭连接
                    client.close();
                })
            }
        })
        // console.log("失败了？");
    },
    /**
     * 
     * @param {object} data 这是要删除的数据
     * @param {function} cb  这是删除后的回调
     */
    delete(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                cb({ code: -100, msg: '链接数据库失败' });
            } else {
                var db = client.db('cfj');
                db.collection('phone').remove({
                    _id: parseInt(data.id)
                }, function (err) {
                    if (err) {
                        cb({ code: -100, msg: '数据库操作失败' });
                    }
                })
                client.close();
            };
        });
        cb(null);
    },

    /**
     * 
     * @param {object} data 这是要修改的数据
     * @param {function} cb  这是修改后的回调
     */
    update(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                cb({ code: -100, msg: '链接数据库失败' });
            } else {
                console.log("进来啊");
                var db = client.db('cfj');
                db.collection('phone').updateOne({
                    _id: parseInt(data.id)
                }, {
                        $set: {
                            src: data.src,
                            phonename: data.phonename,
                            brand: data.brand,
                            price: data.price,
                            secondprice: data.secondprice
                        }
                    }, function (err) {
                        if (err) {
                            cb({ code: -100, msg: '数据库操作失败' });
                        }
                    })
                client.close();
                // console.log("链接失败？");
            };
        });
        cb(null);
    }
};

module.exports = phoneModel;