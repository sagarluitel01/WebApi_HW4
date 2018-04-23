var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://sagar01:D3goldhap@ds111535.mlab.com:11535/webapidatabase');

var actor = new Schema({
    ActorName: {type: String, required: true},
    CharacterName: {type: String, required: true},
})

var MovieSchema = new Schema({
    Title: String,
    Year: String,
    Genre: [ "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Thriller",
        "Western"],
    Actors : {type: [actor]},
    NumOfRev : {type: Number},
    avgRating : {type: Number}
});

MovieSchema.pre('save', function(next) {
    var movie = this;
    next();
});

module.exports = mongoose.model('Movie', MovieSchema);