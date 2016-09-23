var express = require('express');
var teamRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/72Fest';
teamRouter.route('/')
    .get(function (req, res) {
        
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('teams');
            collection.find({}).sort('teamName', 1).toArray(
                function (err, results) {
                    //res.json(results);
                    res.render('teamListView', {
                        title: 'Teams',
                        teams: results
                    });
                });
        });

    });

module.exports = teamRouter