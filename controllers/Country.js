var mongoose = require('mongoose');

var CountrySchema = new mongoose.Schema({  
  name: String,
  timezone:String,
  image:String, 
  delete: Number,
  created_date:{ type: Date, default: Date.now }
});
mongoose.model('Country', CountrySchema);
module.exports = mongoose.model('Country');
