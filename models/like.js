let schema = require('./base/model')({
    predecessor_id: {type: String, default: ''},
    target_hash: {type: String, default: ''},
    likeFlag: {type: Boolean, default: false},
    accountId: {type: String, default: ''},
    receipt_id: {type: String, default: ''},
    receiver_id: {type: String, default: ''},
    data: {type: {}, default: {}},
    method: {type: {}, default: {}},
    createAt: {type: Number, default: 0},
    asyncTime: {type: Date, default: Date.now}
}, "likes");

schema.index({created: 1})

module.exports = schema
