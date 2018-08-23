var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://username:Password@ds111535.mlab.com:11535/webapidatabase');

var ReviewSchema = new Schema({
    Movie: { type: String, required: true },
    Reviewer:{ type: String, required: true },
    Review: { type: String, required: true },
    Rating: {type: Number, required:true, min: 0, max: 5}
});

ReviewSchema.pre('save', function(next) {
    var review = this;
    next();
});

module.exports = mongoose.model('Review', ReviewSchema);
