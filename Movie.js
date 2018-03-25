var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://sagar01:D3goldhap@ds111535.mlab.com:11535/webapidatabase');

var MovieSchema = new Schema({
    Title: String,
    Year: String,
    Genre: [ "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Thriller",
        "Western"],
    Actors:[
        { AName: String,
            CName: String },
        { AName: String,
            CName: String }
    ]
});

MovieSchema.pre('save', function(next) {
    var movie = this;
    next();
});

module.exports = mongoose.model('Movie', MovieSchema);