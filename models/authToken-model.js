var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var authTokenSchema = new Schema({
  _id: Schema.Types.ObjectId,
  authCode: String,
  userId: String,
  expiredAt: String,
});

var AuthToken = mongoose.model('authtoken', authTokenSchema);

module.exports = AuthToken;
