module.exports = function (app) {
  const moment = require('moment')
  const {Pool} = require('pg')
  const config = require('config')
  const constants = config.get('constants');
  // import {ObjectId} from 'mongodb'
  app.get('/api/v1/communities/list', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let keyword = params.keyword
    let page = params.page ? +params.page : 0
    let limit = params.limit ? +params.limit : 10
    let type = params.type //hot new follow
    let Post = ctx.model("post")
    let Join = ctx.model("join")
    let Community = ctx.model("communities")
    let ops = {}
    if (keyword) {
      ops['$or'] = [{name: {$regex: keyword, $options: 'i'}}]
    }
    let sort = {}
    if (type == 'hot') {
      sort = {score: -1}
    } else if (type == 'new') {
      sort = {createAt: -1}
    } else {
      sort = {createAt: -1}
    }
    let communities = await Community.getPagedRows(ops, page * limit, limit, sort)
    let count = await Community.getRowsCount(ops)
    for (let i = 0; i < communities.length; i++) {
      let members = await Join.getRowsCount({communityId: communities[i].communityId, joinFlag: false});
      let posts = await Post.getRowsCount({receiverId: communities[i].communityId, deleted: false});
      communities[i]['data']['membersCount'] = members
      communities[i]['data']['postCount'] = posts
    }
    ctx.body = {code: '200', success: true, msg: 'ok', data: communities, count: count}

  })

  app.get('/api/v1/communities/members', async (ctx, next) => {
    let params = ctx.params
    let communityId = params.communityId
    let accountId = params.accountId
    let page = params.page ? +params.page : 0
    let limit = params.limit ? +params.limit : 10
    let Join = ctx.model("join")
    let User = ctx.model("user")
    let Follow = ctx.model("follow")
    let Post = ctx.model("post")
    let Community = ctx.model("communities")
    let community = await Community.getRow({communityId: communityId})
    if (community == null) {
      return ctx.body = {code: '200', success: false, msg: 'community not have', data: [], count: 0}
    }
    let members = await Join.getPagedRows({
      communityId: communityId,
      joinFlag: false
    }, page * limit, limit, {creator: -1});
    let count = await Join.getRowsCount({communityId: communityId, joinFlag: false});
    let d = []
    for (let i = 0; i < members.length; i++) {
      let row = await User.getRow({account_id: members[i]['accountId']})
      row['data'] = {}
      row['data']["type"] = (members[i]['creator'] == 1) ? 'creator' : 'member',
        row['data']["joinTime"] = members[i]['createAt']
      d.push(row)
    }
    for (let i = 0; i < d.length; i++) {
      let following = await Follow.getRowsCount({accountId: d[i].account_id, followFlag: false})
      let follows = await Follow.getRowsCount({account_id: d[i].account_id, followFlag: false})
      let postCount = await Post.getRowsCount({accountId: d[i].account_id, deleted: false})
      let isFollow = await Follow.getRowsCount({accountId: accountId, account_id: d[i].account_id, followFlag: false})
      d[i]['data']['isFollow'] = (isFollow != 0) ? true : false
      d[i]['data']['following'] = following
      d[i]['data']['follows'] = follows
      d[i]['data']['postCount'] = postCount
    }
    ctx.body = {code: '200', success: true, msg: 'ok', data: d, count: count}

  })

  app.get('/api/v1/communities/detail', async (ctx, next) => {
    let params = ctx.params
    let communityId = params.communityId
    let accountId = params.accountId
    let Join = ctx.model("join")
    let Post = ctx.model("post")
    let User = ctx.model("user")
    let Community = ctx.model("communities")
    let Contributor = ctx.model("contributor")
    let community = await Community.getRow({communityId: communityId})
    if (!community) {
      return ctx.body = {code: '200', success: false, msg: 'community not have', data: [], count: 0}
    }
    let postCount = await Post.getRowsCount({receiverId: communityId})
    let membersCount = await Join.getRowsCount({communityId: communityId, joinFlag: false});
    let isJoin = await Join.getRow({accountId: accountId, communityId: communityId, joinFlag: false})
    let user = await User.getRow({account_id: community['accountId']})
    let contributors = await Contributor.getRows({communityId: communityId})
    for (let i = 0; i < contributors.length; i++) {
      let user = await User.getRow({account_id: contributors[i].accountId})
      contributors[i]['name'] = user ? user['name'] : ""
      contributors[i]['avatar'] = user ? user['avatar'] : ""
    }
    community['data'] = {
      postCount: postCount,
      membersCount: membersCount,
      isJoin: isJoin ? true : false,
      createUser: user ? user : {msg: 'Create user not found'},
    }
    community['contributor'] = contributors
    community['cover'] = community['cover'] ? community['cover'] : ''
    community['avatar'] = community['avatar'] ? community['avatar'] : ''
    community['info'] = community['info'] ? community['info'] : ''
    community['information'] = community['information'] ? community['information'] : ''
    community['website'] = community['website'] ? community['website'] : ''
    community['governance'] = community['governance'] ? community['governance'] : ''
    community['twitter'] = community['twitter'] ? community['twitter'] : ''
    community['discord'] = community['discord'] ? community['discord'] : ''

    ctx.body = {code: '200', success: true, msg: 'ok', data: community}

  })

  app.post('/api/v1/communities/update', async (ctx, next) => {
    let params = ctx.params
    let communityId = params.communityId
    let accountId = params.accountId
    let name = params.name
    let cover = params.cover
    let avatar = params.avatar
    let info = params.info
    let information = params.information
    let website = params.website
    let governance = params.governance
    let twitter = params.twitter
    let discord = params.discord
    let Community = ctx.model("communities")
    let community = await Community.getRow({communityId: communityId, accountId: accountId})
    if (!community) {
      return ctx.body = {code: '200', success: false, msg: 'community not have', data: {},}
    }
    let doc = {}
    if (name) {
      doc['name'] = name
    }
    if (cover) {
      doc['cover'] = cover
    }
    if (avatar) {
      doc['avatar'] = avatar
    }
    if (info) {
      doc['info'] = info
    }

    /*    if (website) {
          doc['website'] = {}
        }
        if (governance) {
          doc['governance'] =  {}
        }
        if (twitter) {
          doc['twitter'] =  {}
        }
        if (discord) {
          doc['discord'] =  {}
        }*/
    let update = await Community.updateRow({communityId: communityId}, doc)
    let updateCommunity = await Community.getRow({communityId: communityId})
    updateCommunity['data'] = {}
    ctx.body = {code: '200', success: true, msg: 'ok', data: updateCommunity}

  })

  app.post('/api/v1/communities/addBenefit', async (ctx, next) => {
    let params = ctx.params
    let communityId = params.communityId
    let accountId = params.accountId
    let title = params.title
    let introduction = params.introduction
    let type = params.type
    let Community = ctx.model("communities")
    let Benefit = ctx.model("benefit")

    let community = await Community.getRow({communityId: communityId, accountId: accountId})
    if (!community) {
      return ctx.body = {code: '200', success: false, msg: 'community not have', data: {},}
    }
    let doc = {communityId: communityId}
    if (title) {
      doc['title'] = title
    }
    if (introduction) {
      doc['introduction'] = introduction
    }
    if (type) {
      doc['type'] = type
    }

    let update = await Benefit.createRow(doc)
    let row = await Benefit.getRow(doc)
    if (row) {
      ctx.body = {code: '200', success: true, msg: 'ok', data: row}
    } else {
      ctx.body = {code: '201', success: false, msg: 'fail', data: {}}
    }


  })

  app.get('/api/v1/communities/getBenefitList', async (ctx, next) => {
    let params = ctx.params
    let communityId = params.communityId
    let accountId = params.accountId
    let title = params.title
    let introduction = params.introduction
    let type = params.type
    let Community = ctx.model("communities")
    let Benefit = ctx.model("benefit")
    let community = await Community.getRow({communityId: communityId, accountId: accountId})
    if (!community) {
      return ctx.body = {code: '200', success: false, msg: 'community not have', data: {},}
    }
    let row = await Benefit.getRows({communityId: communityId})
    if (row) {
      ctx.body = {code: '200', success: true, msg: 'ok', data: row}
    } else {
      ctx.body = {code: '201', success: false, msg: 'fail', data: {}}
    }


  })

  app.post('/api/v1/communities/updateBenefit', async (ctx, next) => {
    let params = ctx.params
    let communityId = params.communityId
    let accountId = params.accountId
    let benefits = params.benefits
    let title = params.title
    let introduction = params.introduction
    let type = params.type
    let Community = ctx.model("communities")
    let Benefit = ctx.model("benefit")
    let community = await Community.getRow({communityId: communityId, accountId: accountId})
    if (!community) {
      return ctx.body = {code: '200', success: false, msg: 'community not have', data: {},}
    }
    let n = []
    if (Array.isArray(benefits)) {
      n = benefits
    }
    let doc = {communityId: communityId}
    await Benefit.deleteRow({communityId: communityId})
    for (let i = 0; i < n.length; i++) {
      doc['title'] = n[i].title ? n[i].title : ""
      doc['type'] = n[i].type ? n[i].type : ""
      doc['introduction'] = n[i].introduction ? n[i].introduction : ""

      let row = await Benefit.updateOrInsertRow(doc, doc)
    }
    ctx.body = {code: '200', success: true, msg: 'ok', data: row}

  })

  app.post('/api/v1/communities/deleteBenefit', async (ctx, next) => {
    let params = ctx.params
    let communityId = params.communityId
    let accountId = params.accountId
    let benefitId = params.benefitId
    let Community = ctx.model("communities")
    let Benefit = ctx.model("benefit")
    let community = await Community.getRow({communityId: communityId, accountId: accountId})
    if (!community) {
      return ctx.body = {code: '200', success: false, msg: 'community not have', data: {},}
    }
    let row = await Benefit.deleteRow({_id: mongoose.Types.ObjectId(benefitId), communityId: communityId,})
    if (row) {
      ctx.body = {code: '200', success: true, msg: 'ok', data: row}
    } else {
      ctx.body = {code: '201', success: false, msg: 'fail', data: {}}
    }


  })

  app.post('/api/v1/communities/addNews', async (ctx, next) => {
    let params = ctx.params
    let communityId = params.communityId
    let accountId = params.accountId
    let url = params.url
    let title = params.title
    let picture = params.picture
    let creator = params.creator
    let introduction = params.introduction
    let time = params.time
    let type = params.type
    let Community = ctx.model("communities")
    let News = ctx.model("news")

    let community = await Community.getRow({communityId: communityId, accountId: accountId})
    if (!community) {
      return ctx.body = {code: '200', success: false, msg: 'community not have', data: {},}
    }
    let doc = {communityId: communityId}
    if (url) {
      doc['url'] = url
    }
    if (title) {
      doc['title'] = title
    }
    if (picture) {
      doc['picture'] = picture
    }
    if (introduction) {
      doc['introduction'] = introduction
    }
    if (creator) {
      doc['creator'] = creator
    }
    if (time) {
      doc['time'] = time
    }

    let update = await News.createRow(doc)
    let row = await News.getRow(doc)
    if (row) {
      ctx.body = {code: '200', success: true, msg: 'ok', data: row}
    } else {
      ctx.body = {code: '201', success: false, msg: 'fail', data: {}}
    }


  })

  app.get('/api/v1/communities/getNewsList', async (ctx, next) => {
    let params = ctx.params
    let communityId = params.communityId
    let accountId = params.accountId
    let Community = ctx.model("communities")
    let News = ctx.model("news")
    let community = await Community.getRow({communityId: communityId, accountId: accountId})
    if (!community) {
      return ctx.body = {code: '200', success: false, msg: 'community not have', data: {},}
    }
    let row = await News.getRows({communityId: communityId})
    if (row) {
      ctx.body = {code: '200', success: true, msg: 'ok', data: row}
    } else {
      ctx.body = {code: '201', success: false, msg: 'fail', data: {}}
    }


  })


  app.post('/api/v1/communities/updateNews', async (ctx, next) => {
    let params = ctx.params
    let communityId = params.communityId
    let accountId = params.accountId
    let news = params.news
    let Community = ctx.model("communities")
    let News = ctx.model("news")
    let community = await Community.getRow({communityId: communityId, accountId: accountId})
    if (!community) {
      return ctx.body = {code: '200', success: false, msg: 'community not have', data: {},}
    }

    let n = []
    if (Array.isArray(news)) {
      n = news
    }
    let doc = {communityId: communityId}
    await News.deleteRow({communityId: communityId})
    for (let i = 0; i < n.length; i++) {

      doc['url'] = n[i].url ? n[i].url : ""
      doc['title'] = n[i].title ? n[i].title : ""
      doc['picture'] = n[i].picture ? n[i].picture : ""
      doc['introduction'] = n[i].introduction ? n[i].introduction : ""
      doc['creator'] = n[i].creator ? n[i].creator : ""
      doc['time'] = n[i].time ? n[i].time : ""
      let row = await News.updateOrInsertRow(doc, doc)
    }

    ctx.body = {code: '200', success: true, msg: 'ok', data: row}


  })

  app.post('/api/v1/communities/deleteNews', async (ctx, next) => {
    let params = ctx.params
    let communityId = params.communityId
    let accountId = params.accountId
    let newsId = params.newsId
    let Community = ctx.model("communities")
    let News = ctx.model("news")
    let community = await Community.getRow({communityId: communityId, accountId: accountId})
    if (!community) {
      return ctx.body = {code: '200', success: false, msg: 'community not have', data: {},}
    }
    let row = await News.deleteRow({_id: mongoose.Types.ObjectId(newsId), communityId: communityId,})
    if (row) {
      ctx.body = {code: '200', success: true, msg: 'ok', data: row}
    } else {
      ctx.body = {code: '201', success: false, msg: 'fail', data: {}}
    }


  })


  app.post('/api/v1/communities/contributor/update', async (ctx, next) => {
    let params = ctx.params
    let communityId = params.communityId
    let accountId = params.accountId
    let currentAccountId = params.currentAccountId
    let information = params.information
    let contributors = params.contributors
    let Community = ctx.model("communities")
    let Contributor = ctx.model("contributor")
    let community = await Community.getRow({communityId: communityId, accountId: accountId})
    if (!community) {
      return ctx.body = {code: '200', success: false, msg: 'community not have', data: {},}
    }
    let c = []
    if (Array.isArray(contributors)) {
      c = contributors
    }

    await Contributor.deleteRow({communityId: communityId})
    for (let i = 0; i < c.length; i++) {
      let update = await Contributor.updateOrInsertRow({
        communityId: communityId,
        accountId: c[i]
      }, {communityId: communityId, accountId: c[i]})
    }

    let update = await Community.updateRow({communityId: communityId}, {information: information})
    let updateContributor = await Contributor.getRow({communityId: communityId, accountId: accountId})
    ctx.body = {code: '200', success: true, msg: 'ok', data: updateContributor}

  })

  app.post('/api/v1/communities/contributor/add', async (ctx, next) => {
    let params = ctx.params
    let communityId = params.communityId
    let accountId = params.accountId
    let currentAccountId = params.currentAccountId
    let name = params.name
    let avatar = params.avatar
    let Community = ctx.model("communities")
    let Contributor = ctx.model("contributor")
    let community = await Community.getRow({communityId: communityId, accountId: currentAccountId})
    if (!community) {
      return ctx.body = {code: '200', success: false, msg: 'community not have', data: {},}
    }
    let doc = {communityId: communityId, accountId: accountId}
    if (name) {
      doc['name'] = name
    }
    if (avatar) {
      doc['avatar'] = avatar
    }
    let update = await Contributor.updateOrInsertRow({communityId: communityId, accountId: accountId}, doc)
    let updateContributor = await Contributor.getRow({communityId: communityId, accountId: accountId})
    ctx.body = {code: '200', success: true, msg: 'ok', data: updateContributor}

  })

  app.post('/api/v1/communities/contributor/delete', async (ctx, next) => {
    let params = ctx.params
    let communityId = params.communityId
    let accountId = params.accountId
    let currentAccountId = params.currentAccountId
    let Community = ctx.model("communities")
    let Contributor = ctx.model("contributor")
    let community = await Community.getRow({communityId: communityId, accountId: currentAccountId})
    if (!community) {
      return ctx.body = {code: '200', success: false, msg: 'community not have', data: {},}
    }
    let update = await Contributor.deleteRow({communityId: communityId, accountId: accountId})

    ctx.body = {code: '200', success: true, msg: 'ok', data: {}}

  })


  app.post('/api/v1/communities/replacementSequence', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let communityId = params.communityId
    let upCommunityId = params.upCommunityId
    let downCommunityId = params.downCommunityId

    let Join = ctx.model("join")
    let up = null
    let down = null
    let weight = 0
    if (upCommunityId) {
      up = await Join.getRow({communityId: upCommunityId, accountId: accountId})
    }
    if (downCommunityId) {
      down = await Join.getRow({communityId: downCommunityId, accountId: accountId})
    }

    let community = await Join.getRow({communityId: communityId, accountId: accountId})
    if (!community) {
      return ctx.body = {code: '200', success: false, msg: 'CommunityId is null ', data: {}}

    }
    if (!up && !down) {
      return ctx.body = {code: '200', success: false, msg: 'upCommunityId and downCommunityId is null ', data: {}}
    }
    if (!upCommunityId) {
      weight = down.weight + 1
    }
    if (!downCommunityId) {
      weight = up.weight - 1
    }
    if (upCommunityId && downCommunityId) {
      weight = (down.weight + up.weight) / 2
    }
    let update = await Join.updateRow({communityId: communityId, accountId: accountId}, {weight: weight})

    ctx.body = {code: '200', success: true, msg: 'ok', data: {}}

  })
  app.get('/api/v1/communities/At', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let User = ctx.model("user")
    const ownershipChangeFunctionCalls = `
       select account_id from accounts where account_id ~ $1 limit 5 offset 0
    `;
    const pool = new Pool({connectionString: constants.INDEXER})
    const {rows} = await pool.query(ownershipChangeFunctionCalls, ['^' + accountId]);
    for (let i = 0; i < rows.length; i++) {
      let row = await User.getRow({account_id: rows[i]['account_id']})
      if (row) {
        rows[i] = row
      }

    }
    ctx.body = {code: '200', success: true, msg: 'ok', data: rows}

  })

  app.get('/api/v1/communities/findLikelyNFTs', async (ctx, next) => {

    let params = ctx.params
    let accountId = params.accountId
    let type = params.type  //collected , created

    const ownershipChangeEvents = `
        select distinct token_id as token_id,
        token_old_owner_account_id as token_old_owner_account_id,
        token_new_owner_account_id as token_new_owner_account_id,
        emitted_by_contract_account_id as contract_id
        from assets__non_fungible_token_events
        where token_new_owner_account_id = $1 
    `;  //or  token_old_owner_account_id = $1
    const pool = new Pool({connectionString: constants.INDEXER})
    const {rows} = await pool.query(ownershipChangeEvents, [accountId]);
    console.log(rows);
    let n = []
    for (let i = 0; i < rows.length; i++) {
      if (type == 'created') {
        if (!rows[i]['token_old_owner_account_id'] || rows[i]['token_old_owner_account_id'] == '') {
          n.push(rows[i])
        }
      } else {
        if (rows[i]['token_old_owner_account_id'] && rows[i]['token_old_owner_account_id'] != '') {
          n.push(rows[i])
        }
      }
    }


    ctx.body = {code: '200', success: true, msg: 'ok', data: n.reverse()}

  })


}

