var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  _id: Schema.Types.ObjectId,
  userName: String,
  googleId: String,
  facebookId: String,
  email: String,
  firstName: String,
  lastName: String,
  thumbnail: String,
  sessionid: String,
  accessCode: String,
  expiredAt: String,
});

var User = mongoose.model('user', userSchema);

module.exports = User;
