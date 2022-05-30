let schema = require('./base/model')({
  accountId: {type: String, default: ''},
  target_hash: {type: String, default: ''},
  createAt: {type: Number, default: Date.now},
}, "share");

schema.index({target_hash: 1})

module.exports = schema
