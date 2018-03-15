var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var jwt = require('jsonwebtoken');
var Movie = require('./Movie');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    }
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);
        var returnedUser = new User(user);
        returnedUser.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            }
        });


    });
});

router.post('/createmovie', function (req, res) {
    if (!req.body.Title || !req.body.Year || !req.body.Genre) {
        res.json({success: false, msg: 'you are missing title or year or genre.'});
    }
    else {
        var newMovie = new Movie(req.body);

        newMovie.save(function(err) {
            if (err) {
                return res.send(err);
            }
            res.json({ message: 'Movie created!' });
        });
    }

});

router.route('/update/:movieID')
    .put(authJwtController.isAuthenticated, function (req, res) {
        var mid = req.params.movieID;
        Movie.findById(mid, function (err, movie) {
            if (err) res.send(err);
            if(req.body.Title){
                movie.Title = req.body.Title;
            }
            if(req.body.Year){
                movie.Year = req.body.Year;
            }
            if(req.body.Genre){
                movie.Genre = req.body.Genre;
            }
            if(req.body.Actors){
                movie.Actors = req.body.Actors;
            }
            movie.save(function (err) {
                if(err)
                    return res.send(err);
            })
            res.json({ success: true, message: "Update successful" });
        })

    });

router.route('/get').get(authJwtController.isAuthenticated,
    function (req, res) {
        Movie.find(function (err, movies) {
            if (err) res.send(err);
            res.json(movies);
        });
    });

router.delete('/delete/:movieID', authJwtController.isAuthenticated, function (req, res) {
    var id = req.params.movieID;
    Movie.findById(id, function(err, movie) {
        if (err) res.send(err);

        movie.remove();
        res.json({ success: true, message: 'The movie is successfully deleted.' });
    });
});

app.use('/', router);
app.listen(process.env.PORT || 8080);