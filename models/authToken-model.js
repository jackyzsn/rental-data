var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var authTokenSchema = new Schema({
  _id: Schema.Types.ObjectId,
  authCode: String,
  expiredAt: String,
});

var AuthToken = mongoose.model('authToken', authTokenSchema);

module.exports = AuthToken;
