let schema = require('./base/model')({
  commentId: {type: String, default: ''},
  postId: {type: String, default: ''},
  content: {type: String, default: ''},
  accountId: {type: String, default: ''},
  created: {type: Date, default: Date.now}
}, "posts");

module.exports = schema
