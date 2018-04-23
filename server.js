var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var jwt = require('jsonwebtoken');
var Movie = require('./Movie');
var Review = require('./Review');
var async = require('async');
var rp = require('request-promise');
var cors = require('cors');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(cors());

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
        user.save(function(err) {
            if (err) {
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

router.route('/update/:movieID') //******----***********
    .put(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.movieID;
        Movie.findById(id, function(err, movie) {
            if (err) res.send(err);

            if (req.body.Title) {
                movie.Title = req.body.Title;
            }
            if (req.body.Year) {
                movie.Year = req.body.Year;
            }
            if (req.body.Genre) {
                movie.Genre = req.body.Genre;
            }
            if (req.body.Actors) {
                movie.Actors = req.body.Actors;
            }
            movie.save(function(err) {
                if (err) {
                    return res.send(err);
                }
                res.json({ message: 'Update successful' });
            });
        });
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

router.post('/CreateReview', authJwtController.isAuthenticated, function (req, res) {

    var movie = req.body.movie;

    Movie.findOne({Title: req.body.Movie},
        function (err, movie){
            if (err) res.send(err);

            if(movie) {
                var newReview = new Review(req.body);

                newReview.save(function (err) {
                    if (err) {
                        res.send(err);
                    }
                });
                res.send({success: "Rewiew created"})
            }
            else {
                res.send({success: false, message: "Movie was not found"})
            }
        });
});

router.route('/getAllRev').get(
    function (req, res) {
        Review.find(function (err, reviews) {
            if (err) {res.send(err);}
            res.json(reviews);
        });
});

router.route('/movies').get(authJwtController.isAuthenticated,
    function (req, res) {
        if (req.query.Review ==='true') {
            Movie.aggregate([
                {
                    $lookup:{
                        from: "reviews",
                        localField: "Title",
                        foreignField: "Movie",
                        as: 'review'
                    }
                }
                ], function (err, result) {
                if(err) {res.send(err);}
                else res.send({Movie: result});
            });
        }else {
            Movie.find({}, function (err, movies) {
                if(err) {res.send(err);}
                res.json({Movie: movies});
                })
        }
    });


/*router.route('/movies')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.find(function (err, movies) {
            if (err) res.send(err);
            if(req.headers.Review === 'true'){
                Movie.aggregate([{
                    $lookup:{
                        from: "reviews",
                        localField: "Title",
                        foreignField: "Movie",
                        as: 'review'
                    }
                }
                ], function (err, result) {
                    if(err) res.send(err);
                    else res.json(result);
                });
            } else {
                res.json(movies);
            }
        });
    });*/


const GA_TRACKING_ID = process.env.GA_KEY;

function trackDimension(category, action, label, value, dimension, metric) {

    var options = { method: 'GET',
        url: 'https://www.google-analytics.com/collect',
        qs:
            {   // API Version.
                v: '1',
                // Tracking ID / Property ID.
                tid: GA_TRACKING_ID,
                // Random Client Identifier. Ideally, this should be a UUID that
                // is associated with particular user, device, or browser instance.
                cid: crypto.randomBytes(16).toString("hex"),
                // Event hit type.
                t: 'event',
                // Event category.
                ec: category,
                // Event action.
                ea: action,
                // Event label.
                el: label,
                // Event value.
                ev: value,
                // Custom Dimension
                cd1: dimension,
                // Custom Metric
                cm1: metric
            },
        headers:
            {  'Cache-Control': 'no-cache' } };

    return rp(options);
}


router.route('/test')
    .get(function (req, res) {
        // Event value must be numeric.
        trackDimension('Feedback', 'Rating', 'Feedback for Movie', '3', 'Guardian\'s of the Galaxy', '1')
            .then(function (response) {
                console.log(response.body);
                res.status(200).send('Event tracked.').end();
            })
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);