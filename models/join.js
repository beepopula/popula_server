let schema = require('./base/model')({
  communityId :{type: String, default: ''},
  weight: {type: Number, default: 0},
  accountId: {type: String, default: ''},
  joinFlag: {type: Boolean, default: false},
  creator: {type: Number, default: 0},
  data: {type: {}, default: {}},
  createAt: {type: Number, default: 0},
  asyncTime: {type: Date, default: Date.now}
}, "join");

schema.index({created: 1})

module.exports = schema
