var express = require('express');
var newsRouter = express.Router();
var markdown = require('markdown').markdown;
var mongodb = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/72Fest';
var router = function () {
    newsRouter.route('/add')
        .get(function (req, res) {
            res.render('newsAddView');
        });

    newsRouter.route('/')
        .post(function (req, res) {

            mongodb.connect(url, function (err, db) {
                console.log(req.body);
                var collection = db.collection('news');
                var newsItem = {
                    title: req.body.newsTitle,
                    content: req.body.article,
                    timestamp: new Date()
                };
                collection.insert(newsItem, function (err, results) {

                    res.redirect('/news');

                });

            });
            console.log('did it');
        })

    .get(function (req, res) {

        mongodb.connect(url, function (err, db) {
            var collection = db.collection('news');
            collection.find({}).toArray(
                function (err, results) {
                    results.forEach(function (result) {
                        result.content = markdown.toHTML(result.content);
                    });
                    //console.log(results);
                    //res.json(results);
                    res.render('newsListView', {
                        title: 'News',
                        news: results
                    });
                });
        });
    });

    newsRouter.route('/:id')
        .get(function (req, res) {

            var id = new objectId(req.params.id);

            mongodb.connect(url, function (err, db) {
                var collection = db.collection('news');
                collection.findOne({
                        _id: id
                    },
                    function (err, results) {
                        res.render('newsEditView', {
                            title: 'News',
                            news: results
                        });
                    });
            });
        })
        .put(function (req, res) {
            console.log('put');
            var id = new objectId(req.params.id);

            mongodb.connect(url, function (err, db) {
                var collection = db.collection('news');
                collection.findOne({
                    _id: id
                }, function (err, result) {
                    result.title = req.body.newsTitle;
                    result.content = req.body.article;
                    collection.updateOne({
                        _id: id
                    }, result);
                    //                            collection.updateOne({_id : id},{$set : {title : req.body.newsTitle, content : req.body.article }});
                    res.redirect('/news');
                });


            });
        });
    
    newsRouter.route('/:id/delete')
.get(function(req,res){
   var id = new objectId(req.params.id);
    mongodb.connect(url, function (err, db) {
            var collection = db.collection('news');
           
            collection.findOne({
                _id: id
            }, function (err, result) {
                 collection.removeOne({_id: id}, function(err){
                          res.redirect('/news'); 
                 });
              
            });


        });
    
});
    return newsRouter;
};

module.exports = router;