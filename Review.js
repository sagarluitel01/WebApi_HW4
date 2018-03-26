var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://sagar01:D3goldhap@ds111535.mlab.com:11535/webapidatabase');

var ReviewSchema = new Schema({

    Reviewer: String,
    Review: String
});

ReviewSchema.pre('save', function(next) {
    var review = this;
    next();
});

module.exports = mongoose.model('Review', ReviewSchema);