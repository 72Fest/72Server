var express = require('express');
var formidable = require('formidable');
var teamRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var easyimg = require('easyimage')
var path = require('path');
var fs = require('fs');
var thumbnailDimension = 200;
var url = 'mongodb://localhost:27017/72Fest';
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
                        teams: results
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

teamRouter.route('/logo/:id')
    .post(function (req, res) {
        var id = new objectId(req.params.id);
        var form = new formidable.IncomingForm();
        form.uploadDir = 'public/images/teamlogos';
        form.on('file', function (fields, file) {

            mongodb.connect(url, function (err, db) {
                var collection = db.collection('teams');
                collection.findOne({
                        _id: id
                    },
                    function (err, results) {
                        var newPath = path.join(form.uploadDir, results.teamName + path.extname(file.name))
                        fs.rename(file.path, newPath, function () {
                            console.log('callback');
                            easyimg.thumbnail({
                                width: thumbnailDimension,
                                height: thumbnailDimension,
                                src: newPath,
                                dst: form.uploadDir + results.teamName + '-thumb' + path.extname(file.name),
                                quality: 85
                            }).then(function (img) {
                                console.log('help');
                                console.log('but it worked:' + img);
                            }, function (err) {
                                console.log('failed');
                            });
                        });
                        results.logo = results.teamName + path.extname(file.name);
                        collection.updateOne({
                            _id: id
                        }, results);



                    });
            });

        });

        form.on('end', function (fields, file) {
            res.redirect('/teams/' + id)
        });
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
                        teams: results
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

teamRouter.route('/:id/films')
    .post(function (req, res) {
        var id = new objectId(req.params.id);
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('teams');
            collection.findOne({
                _id: id
            }, function (err, result) {
                console.log(result);
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