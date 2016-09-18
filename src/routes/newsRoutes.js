var express = require('express');
var newsRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;

var router = function () {
    newsRouter.route('/add')
        .get(function (req, res) {
            res.render('newsAddView');
        });

    newsRouter.route('/')
        .post(function (req, res) {
            var url =
                'mongodb://localhost:27017/72Fest';
            mongodb.connect(url, function (err, db) {
                console.log(req.body);
                var collection = db.collection('news');
                var newsItem = {
                  title: req.body.newsTitle,
                  content: req.body.article,
                  date: new Date()
                };
                     collection.insert(newsItem, function (err, results) {
//                    req.login(results.ops[0], function () {
//                        res.redirect('/auth/profile');
//                    });
                });
                
            });
            console.log('did it');
        });
    return newsRouter;
};

module.exports = router;