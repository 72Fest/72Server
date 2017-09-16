var express = require('express');
var methodOverride = require('express-method-override');
var bodyParser = require('body-parser');
var auth = require('./auth');

var app = express();
var port = process.env.PORT || 5000;

var teamRouter = require('./src/routes/teamRoutes');
var newsRouter = require('./src/routes/newsRoutes')();

//var teamRouter = require('./src/routes/teamRoutes');

app.use(express.static('public'));
app.use(express.static('bower_components'));

app.use(auth.basicAuth('user', 'pass'));

app.set('views', 'src/views');
app.set('view engine', 'ejs');
//app.use('/teams', teamRouter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use('/teams', teamRouter);
app.use('/news', newsRouter);
app.get('/', function (req, res) {
    res.render('index');
});



app.listen(port, function () {
    console.log('running');
});