var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://sagar01:D3goldhap@ds111535.mlab.com:11535/webapidatabase');

/*var Actors = new Schema({
    actorName: {type: String, required: true},
    characterName: {type: String, required: true},
})*/

var MovieSchema = new Schema({
    Title: String,
    Year: String,
    Genre: [ "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Thriller",
        "Western"],
    Actors: [
        {
            ActorName: String,
            CharacterName: String
        }
    ]
});

MovieSchema.pre('save', function(next) {
    var movie = this;
    next();
});

module.exports = mongoose.model('Movie', MovieSchema);