const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const async = require('async');
const brandModel = {
    /**
     * 
     * @param {objec} data 获取品牌的信息
     * @param {Function} cb 回调函数
     */
    getBrandList(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                cb({ code: -100, msg: '链接数据库失败' });
            } else {
                var db = client.db('cfj');

                var limitNum = parseInt(data.pageSize);
                var skipNum = data.page * data.pageSize - data.pageSize;

                async.parallel([
                    function (callback) {
                        // 查询所有记录
                        db.collection('brand').find().count(function (err, num) {
                            if (err) {
                                callback({ code: -101, msg: '查询数据库失败' });
                            } else {
                                callback(null, num);
                            }
                        })
                    },

                    function (callback) {
                        // 查询分页的数据
                        db.collection('brand').find().limit(limitNum).skip(skipNum).toArray(function (err, data) {
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
                            brandList: results[1],
                            page: data.page,
                        })
                    }
                    // 关闭连接
                    client.close();
                })
            }
        })
    },
    /**
    * 添加操作
    * @param {Object} data 添加信息
    * @param {Function} cb 回调函数
    */
    add(data, cb) {
        MongoClient.connect(url, function (err, client) {
            if (err) {
                console.log('链接数据库失败', err);
                cb({ code: -100, msg: '链接数据库失败' });

                // 这里不需要关闭连接，因为没有连接成功。
                return;
            };
            const db = client.db('cfj');
            let saveData = {
                brandname: data.brandname,
                src: data.src
            };

            // ========= 使用 async 的 串行无关联来写 ======================
            async.series([
                function (callback) {
                    db.collection('brand').find().sort({ _id: -1 }).toArray(function (err, result) {
                        if (err) {
                            callback({ code: '错误状态为：-101', msg: '查询记录失败' });
                        } else {
                            if (result == '') {
                                saveData._id = 1;
                            } else {
                                //result是一个数组，当前获取的是倒序后排第一的id
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
                    db.collection('brand').insertOne(saveData, function (err) {
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
                db.collection('brand').remove({
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
        console.log("进来啊");
        MongoClient.connect(url, function (err, client) {
            // console.log("111111111111111111");
            if (err) {
                cb({ code: -100, msg: '链接数据库失败' });
            } else {
                // console.log("进啊");
                var db = client.db('cfj');
                db.collection('brand').updateOne({
                    _id: parseInt(data.id)

                }, {
                        $set: {
                            brandname: data.brandname,
                            src: data.src
                        }
                    }, function (err) {
                        if (err) {
                            cb({ code: -100, msg: '数据库操作失败' });
                        } else {
                            cb(null);
                        }
                    })
                client.close();
            };
        });
    },

};
module.exports = brandModel;