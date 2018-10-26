var mongoose = require('mongoose');

var Chat = new mongoose.Schema({  
  sender:String,
  receiver:String,
  message:String,
  type:String,
  created_date:{ type: Date, default: Date.now }
});
mongoose.model('Chat', Chat);
module.exports = mongoose.model('Chat');