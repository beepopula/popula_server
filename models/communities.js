let schema = require('./base/model')({
  predecessor_id: {type: String, default: ''},
  communityId :{type: String, default: ''},
  name: {type: String, default: ''},
  community_type: {type: String, default: ''},
  cover: {type: String, default: ''},
  avatar: {type: String, default: ''},
  info: {type: String, default: ''},
  information: {type: String, default: ''},
  governance: {type: String, default: ''},
  website: {type: {}, default: {}},
  twitter: {type: {}, default: {}},
  discord: {type: {}, default: {}},
  contributor: {type: [], default: []},
  gas_used: {type: String, default: ''},
  receiptId: {type: String, default: ''},
  accountId: {type: String, default: ''},
  data: {type: {}, default: {}},
  method: {type: {}, default: {}},
  deleted: {type: Boolean, default: false},
  createAt: {type: Date, default: Date.now},
  asyncTime: {type: Date, default: Date.now}
}, "communities");

schema.index({created: 1})

module.exports = schema
