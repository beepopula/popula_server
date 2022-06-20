let schema = require('./base/model')({

  communityId :{type: String, default: ''},
  title: {type: String, default: ''},
  introduction: {type: String, default: ''},
  type: {type: String, default: ''},
  createAt: {type: Date, default: Date.now},
  asyncTime: {type: Date, default: Date.now}
}, "benefit");

schema.index({created: 1})

module.exports = schema
