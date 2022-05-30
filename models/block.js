let schema = require('./base/model')({
    blockId: {type : Number, default : 0},
    asyncFlag: { type : Boolean, default : false},
    created: {type: Date, default: Date.now}
}, "posts");

schema.index({created: 1})
schema.index({blockId: 1})

module.exports = schema
