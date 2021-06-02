var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var authUserSchema = new Schema({
  _id: Schema.Types.ObjectId,
  userId: { type: mongoose.Schema.ObjectId, ref: 'users' },
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
        enteredAt: String,
        acceptFlag: Boolean,
        acceptedAt: String,
      },
    ],
  },
});

var AuthUser = mongoose.model('authuser', authUserSchema);

module.exports = AuthUser;
