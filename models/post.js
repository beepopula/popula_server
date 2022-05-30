let schema = require('./base/model')({
  accountId: {type: String, default: ''},
  predecessor_id: {type: String, default: ''},
  text: {type: String, default: ''},
  imgs: {type: [], default: []},
  options: {type: [], default: []},
  video: {type: String, default: ''},
  audio: {type: String, default: ''},
  encrypt_args: {type: String, default: ''},
  access: {type: {}, default: {}},
  text_sign: {type: String, default: ''},
  contract_id_sign: {type: String, default: ''},
  transaction_hash: {type: String, default: ''},
  blur_imgs: {type: {}, default: {}},
  target_hash: {type: String, default: ''},
  token_metadata: {type: {}, default: {}},
  receiptId: {type: String, default: ''},
  receiverId: {type: String, default: ''},
  data: {type: {}, default: {}},
  methodName: {type: String, default: String},
  type: {type: String, default: ''},
  gas_used: {type: String, default: String},
  deleted: {type: Boolean, default: false},
  score: {type: Number, default: 0},
  createAt: {type: Number, default: 0},
  asyncTime: {type: Date, default: Date.now}
}, "posts");

schema.index({created: 1})

module.exports = schema
