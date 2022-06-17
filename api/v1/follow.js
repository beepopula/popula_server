module.exports = function (app) {




  app.get('/api/v1/follow/list', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let currentAccountId = params.currentAccountId
    let page = params.page?+params.page:0
    let limit = params.limit ?+params.limit:10
    let Follow = ctx.model("follow")
    let User = ctx.model("user")
    let ops={accountId:accountId,followFlag:false}
    let follows = await Follow.getPagedRows(ops,page*limit,limit,{createAt:-1})

    for (let i=0;i<follows.length;i++){
      let user =await User.getRow({account_id:follows[i]['account_id']})
      let isFollow = await Follow.getRowsCount({
        accountId: currentAccountId,
        account_id: follows[i]['account_id'],
        followFlag: false
      })
      follows[i]['data']={
        name:user&&user['name']?user['name']:'',
        account_id:follows[i]['accountId'],
        avatar:user&&user['avatar']?user['avatar']:'',
        introduction:user&&user['introduction']?user['introduction']:'',
        near:user&&user['near']?user['near']:'',
        isFollow: isFollow != 0 ? true : false,
      }
    }

    ctx.body = {code: '200',success: true, msg: 'ok', data: follows}

  })

  app.get('/api/v1/follow/followingList', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let currentAccountId = params.currentAccountId
    let page = params.page?+params.page:0
    let limit = params.limit ?+params.limit:10
    let Follow = ctx.model("follow")
    let User = ctx.model("user")
    let ops={account_id:accountId,followFlag:false}
    let follows = await Follow.getPagedRows(ops,page*limit,limit,{createAt:-1})

    for (let i=0;i<follows.length;i++){
      let user =await User.getRow({account_id:follows[i]['accountId']})
      let isFollow = await Follow.getRowsCount({
        accountId: currentAccountId,
        account_id: follows[i]['accountId'],
        followFlag: false
      })
      follows[i]['data']={
        name:user&&user['name']?user['name']:'',
        account_id:follows[i]['accountId'],
        avatar:user&&user['avatar']?user['avatar']:'',
        introduction:user&&user['introduction']?user['introduction']:'',
        near:user&&user['near']?user['near']:'',
        isFollow: isFollow != 0 ? true : false,
      }
    }
    ctx.body = {code: '200',success: true, msg: 'ok', data: follows}

  })











}
