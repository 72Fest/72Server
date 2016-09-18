var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 5000;

var teamRouter = require('./src/routes/teamRoutes');
var newsRouter = require('./src/routes/newsRoutes')();

//var teamRouter = require('./src/routes/teamRoutes');

app.use(express.static('public'));
app.use(express.static('bower_components'));



app.set('views', 'src/views');
app.set('view engine', 'ejs');
//app.use('/teams', teamRouter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use('/teams', teamRouter);
app.use('/news', newsRouter);
app.get('/', function (req, res) {
    res.render('index');
});



app.listen(port, function () {
    console.log('running');
});