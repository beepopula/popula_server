module.exports = function (app) {


  app.post('/api/v1/block/update', async (ctx, next) => {
    let params = ctx.params
    if (!process.env.NODE_ENV == 'devtestnet'&&!process.env.NODE_ENV == 'devtestnet') {
      return   ctx.body = {code: '200', success: false, msg: 'fail', data: {}}
    }
    let finalBlockHeight = params.finalBlockHeight ? +params.finalBlockHeight : 0
    let blockHeight = params.blockHeight ? +params.blockHeight : 0
    let Block = ctx.model("block")
    let update = await Block.updateRow({name: 'optimistic_b'}, {
      debug: true,
      finalBlockHeight: finalBlockHeight,
      blockHeight: blockHeight
    })
    let row = await Block.getRow({name: 'optimistic_b'})
    ctx.body = {code: '200', success: true, msg: 'ok', data: row}

  })


}
