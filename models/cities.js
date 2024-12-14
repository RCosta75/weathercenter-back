const mongoose = require('mongoose');

const citySchema = mongoose.Schema({
	cityName: String,
	country: String,
	lat: Number,
	long: Number,
	apiId : Number,
});

const City = mongoose.model('cities', citySchema);

module.exports = City;