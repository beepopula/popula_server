let schema = require('./base/model')({
  communityId :{type: String, default: ''},
  accountId: {type: String, default: ''},
  name: {type: String, default: ''},
  avatar: {type: String, default: ''},
  data: {type: {}, default: {}},
  weight: {type: Number, default: 0},
  createAt: {type: Number, default: Date.now},
}, "contributors");

schema.index({accountId: 1})

module.exports = schema
