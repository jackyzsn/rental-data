var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var authUserSchema = new Schema({
  _id: Schema.Types.ObjectId,
  userId: String,
  verifyRequest: String,
  verified: Boolean,
  verifiedAt: String,
  propertyInfo: String,
  isAdmin: Boolean,
  propertyData: {
    waterMeter: [
      {
        month: String,
        reading: String,
        acceptFlag: Boolean,
      },
    ],
  },
});

var AuthUser = mongoose.model('authuser', authUserSchema);

module.exports = AuthUser;
