var express = require('express');
var formidable = require('formidable');
var teamRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var sharp = require('sharp');
var path = require('path');
var fs = require('fs-extra');
var config = require('../../config.json');
var Cloud = require('../cloud');
var cloud = new Cloud();
var thumbnailDimension = 200;
var LOGOS_PATH = 'public/images/teamlogos';
var S3_LOGOS_PATH = path.join(config.baseUrl, 'logos');
var S3_BUCKET_PATH = 'teams/logos';
var url = 'mongodb://localhost:27017/72Fest';

//ensure path for logos exists
fs.ensureDir(LOGOS_PATH);

teamRouter.route('/')
    .get(function (req, res) {
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('teams');
            //collection.find({}).sort('teamName', 1).toArray(
            collection.find({}).toArray(
                function (err, results) {
                    //res.json(results);
                    res.render('teamListView', {
                        title: 'Teams',
                        teams: results,
                        baseLogoUrl: S3_LOGOS_PATH
                    });
                });
        });

    })
    .post(function (req, res) {
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('teams');
            var team = {
                teamName: req.body.teamName,
                bio: req.body.bio,
                films: new Array()
            }
            collection.insert(team, function (err, results) {
                res.redirect('/teams/' + results.ops[0]._id);
            })
        });
    });

teamRouter.route('/upload')
    .get(function (req, res) {
        res.render('upload', {
            title: 'Upload'
        });
    })
    .post(function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            res.send(files)
        })

    });
teamRouter.route('/add')
    .get(function (req, res) {
        res.render('teamAddView');
    });

teamRouter.route('/logo/:id').post(function (req, res) {
    var id = new objectId(req.params.id);
    var form = new formidable.IncomingForm();

    form.uploadDir = LOGOS_PATH;
    form.on('file', function (fields, file) {
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('teams');
            collection.findOne({ _id: id }, function (err, results) {
                var sanatizedTeamName = results.teamName.replace(/[^a-zA-Z0-9]/g, '');
                var newPath = path.resolve(form.uploadDir, sanatizedTeamName + path.extname(file.name))
                fs.rename(file.path, newPath, function () {
                    var newThumbPath = path.resolve(form.uploadDir, sanatizedTeamName + '-thumb' + path.extname(file.name));

                    // resize image and upload to s3
                    return sharp(newPath)
                        .resize(thumbnailDimension)
                        .toFile(newThumbPath)
                        .then(function () {
                            return Promise.all([
                                cloud.upload(config.awsBucket, S3_BUCKET_PATH, newPath),
                                cloud.upload(config.awsBucket, S3_BUCKET_PATH, newThumbPath)
                            ]);
                        })
                        .then(function () {
                            // lastly store logo info and redirect page
                            results.logo = sanatizedTeamName + path.extname(file.name);
                            collection.updateOne({_id: id}, results);
                            res.redirect('/teams/' + id);
                        })
                        .catch(function (err) {
                            console.log('failed',err);
                        });
                });
            });
        });

    });

    // parse the form for file
    form.parse(req);
});

teamRouter.route('/:id')
    .get(function (req, res) {

        var id = new objectId(req.params.id);

        mongodb.connect(url, function (err, db) {
            var collection = db.collection('teams');
            collection.findOne({
                    _id: id
                },
                function (err, results) {
                    res.render('teamEditView', {
                        title: 'Teams',
                        teams: results,
                        baseLogoUrl: S3_LOGOS_PATH
                    });
                });
        });
    })
    .put(function (req, res) {
        var id = new objectId(req.params.id);
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('teams');
            collection.findOne({
                _id: id
            }, function (err, result) {
                result.teamName = req.body.teamName;
                result.bio = req.body.bio;
                var filmArray = new Array();

                if (result.films.length > 0) {
                    if (Array.isArray(req.body.filmTitle)) {
                        for (var i = 0; i < req.body.filmTitle.length; i++) {
                            result.films[i].title = req.body.filmTitle[i];
                            result.films[i].year = req.body.filmYear[i];
                            result.films[i].url = req.body.filmUrl[i];
                        }
                    } else {
                        result.films[0].title = req.body.filmTitle;
                        result.films[0].year = req.body.filmYear;
                        result.films[0].url = req.body.filmUrl;
                    }
                }


                collection.updateOne({
                    _id: id
                }, result);
                res.redirect('/teams/' + id);
            });


        });
    });

teamRouter.route('/:id/delete')
.get(function(req,res){
   var id = new objectId(req.params.id);
    mongodb.connect(url, function (err, db) {
            var collection = db.collection('teams');
            var archiveTeams = db.collection('teams_archive');
            collection.findOne({
                _id: id
            }, function (err, result) {

                archiveTeams.insert(result, function(err, result){
                 collection.removeOne({_id: id});
                    res.redirect('/teams');
                });
            });


        });

});

teamRouter.route('/:id/films')
    .post(function (req, res) {
        var id = new objectId(req.params.id);
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('teams');
            collection.findOne({
                _id: id
            }, function (err, result) {
                var film = {
                    title: req.body.filmTitle,
                    year: req.body.filmYear,
                    url: req.body.filmUrl
                };
                result.films.push(film);
                collection.updateOne({
                    _id: id
                }, result);
                res.redirect('/teams/' + id);
            });


        });
    });




module.exports = teamRouter