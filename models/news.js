let schema = require('./base/model')({
  communityId: {type: String, default: ''},
  url: {type: String, default: ''},
  title: {type: String, default: ''},
  picture: {type: String, default: ''},
  creator: {type: String, default: ''},
  time: {type: String, default: ''},
  introduction: {type: String, default: ''},
  createAt: {type: Date, default: Date.now},
  asyncTime: {type: Date, default: Date.now}
}, "news");

schema.index({created: 1})

module.exports = schema
