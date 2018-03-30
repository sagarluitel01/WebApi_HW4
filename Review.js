var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://sagar01:D3goldhap@ds111535.mlab.com:11535/webapidatabase');

var ReviewSchema = new Schema({
    Movie: String,
    Reviewer: String,
    Review: String,
    Rating: {type: Number, required:true, min: 0, max: 5}
});

ReviewSchema.pre('save', function(next) {
    var review = this;
    next();
});

module.exports = mongoose.model('Review', ReviewSchema);