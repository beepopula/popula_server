module.exports = function (app) {




  app.get('/api/v1/follow/list', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let page = params.page?+params.page:0
    let limit = params.limit ?+params.limit:10
    let Follow = ctx.model("follow")
    let ops={accountId:accountId,followFlag:false}
    let follows = await Follow.getPagedRows(ops,page*limit,limit,{createAt:-1})
    ctx.body = {code: '200',success: true, msg: 'ok', data: follows}

  })











}
