module.exports = function (app) {
  const moment = require('moment')
  const config = require('config')
  const constants = config.get('constants');
  let rp = require("request-promise")
  app.post('/api/v1/user/updateInfo', async (ctx, next) => {
    let params = ctx.params
    let account_id = params.accountId
    let avatar = params.avatar
    let name = params.name
    let background = params.background
    let email = params.email
    let bio = params.bio
    let twitter = params.twitter
    let instagram = params.instagram
    let youtube = params.youtube
    let tiktok = params.tiktok

    let User = ctx.model("user")
    if (!account_id) {
      return ctx.body = {code: '200', success: false, msg: 'account_id must params', data: {}}
    }
    let ops = {account_id: account_id}
    if (avatar) {
      ops['avatar'] = avatar
    }
    if (name) {
      ops['name'] = name
    }

    if (background) {
      ops['background'] = background
    }

    if (email) {
      ops['email'] = email
    }

    if (bio) {
      ops['bio'] = bio
    }
    if (twitter) {

      const url = `https://publish.twitter.com/oembed?url=${encodeURI(twitter)}`;
      let options = {
        method: 'GET',
        url: url,
        timeout: 10000
      };

      let data = await rp(options).catch(e => {
        console.log(e);
      });
      console.log("twitter verified",data);

      ops['twitter']['url'] = twitter
      ops['twitter']['verified'] = false
    }
    if (instagram) {
      ops['instagram']['url'] = instagram
      ops['instagram']['verified'] = true
    }
    if (youtube) {
      ops['youtube']['url'] = youtube
      ops['youtube']['verified'] = true
    }
    if (tiktok) {
      ops['tiktok']['url'] = tiktok
      ops['tiktok']['verified'] = true
    }


    let row = await User.updateRow({account_id: account_id}, ops)
    let u = await User.getRow({account_id: account_id})
    if (u) {
      ctx.body = {code: '200', success: true, msg: 'ok', data: {}}
    } else {
      ctx.body = {code: '200', success: false, msg: 'add fail', data: {}}
    }

  })


  app.post('/api/v1/user/test/updateInfo', async (ctx, next) => {
    let params = ctx.params
    let account_id = params.accountId
    let avatar = params.avatar
    let name = params.name
    let background = params.background
    let email = params.email
    let bio = params.bio
    let twitter = params.twitter
    let instagram = params.instagram
    let youtube = params.youtube
    let tiktok = params.tiktok

    let User = ctx.model("user")
    if (!account_id) {
      return ctx.body = {code: '200', success: false, msg: 'account_id must params', data: {}}
    }
    let ops = {account_id: account_id}
    if (avatar) {
      ops['avatar'] = avatar
    }
    if (name) {
      ops['name'] = name
    }

    if (background) {
      ops['background'] = background
    }

    if (email) {
      ops['email'] = email
    }

    if (bio) {
      ops['bio'] = bio
    }
    if (twitter) {

      const url = `https://publish.twitter.com/oembed?url=${encodeURI(twitter)}`;
      let options = {
        method: 'GET',
        url: url,
        timeout: 10000
      };

      let data = await rp(options).catch(e => {
        console.log(e);
      });
      console.log("twitter verified",data);
      ops['twitter']={}
      ops['twitter']['url'] = twitter
      ops['twitter']['verified'] = false
    }
    if (instagram) {
      ops['instagram']={}
      ops['instagram']['url'] = instagram
      ops['instagram']['verified'] = true
    }
    if (youtube) {
      ops['youtube']={}
      ops['youtube']['url'] = youtube
      ops['youtube']['verified'] = true
    }
    if (tiktok) {
      ops['tiktok']={}
      ops['tiktok']['url'] = tiktok
      ops['tiktok']['verified'] = true
    }


    let row = await User.updateRow({account_id: account_id}, ops)
    let u = await User.getRow({account_id: account_id})
    if (u) {
      ctx.body = {code: '200', success: true, msg: 'ok', data: {}}
    } else {
      ctx.body = {code: '200', success: false, msg: 'add fail', data: {}}
    }

  })

  app.post('/api/v1/user/login', async (ctx, next) => {
    let params = ctx.params
    let account_id = params.accountId
    let avatar = params.avatar
    let name = params.name
    let background = params.background
    let email = params.email
    let bio = params.bio
    let User = ctx.model("user")
    if (!account_id) {
      return ctx.body = {code: '200', success: false, msg: 'account_id must params', data: {}}
    }
    let ops = {account_id: account_id}
    if (avatar) {
      ops['avatar'] = avatar
    }
    if (name) {
      ops['name'] = name
    }

    if (background) {
      ops['background'] = background
    }

    if (email) {
      ops['email'] = email
    }

    if (bio) {
      ops['bio'] = bio
    }

    let row = await User.updateOrInsertRow({account_id: account_id}, ops)
    let u = await User.getRow({account_id: account_id})
    if (u) {
      ctx.body = {code: '200', success: true, msg: 'ok', data: {}}
    } else {
      ctx.body = {code: '200', success: false, msg: 'add fail', data: {}}
    }

  })

  app.get('/api/v1/user/info', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let currentAccountId = params.currentAccountId
    let User = ctx.model("user")
    let Follow = ctx.model("follow")
    let Post = ctx.model("post")
    let Join = ctx.model("join")
    let Community = ctx.model("communities")
    let ops = {account_id: accountId}
    let row = await User.getRow(ops)
    if (row) {
      let following = await Follow.getRowsCount({accountId: accountId, followFlag: false})
      let follows = await Follow.getRowsCount({account_id: accountId, followFlag: false})
      let postCount = await Post.getRowsCount({accountId: accountId, deleted: false})
      let communities = await Join.getRows({accountId: accountId, joinFlag: false});
      //let count = await Join.getRowsCount({accountId: accountId, joinFlag: false});
      let d = []
      for (let i = 0; i < communities.length; i++) {
        let row = await Community.getRow({communityId: communities[i]['communityId'], deleted: false})
        d.push(row)
      }
      let isFollow = await Follow.getRowsCount({
        accountId: currentAccountId,
        account_id: row.account_id,
        followFlag: false
      })
      row['data'] = {}
      row['data']['isFollow'] = (isFollow != 0) ? true : false
      row['data']['following'] = following
      row['data']['follows'] = follows
      row['data']['postCount'] = postCount
      row['data']['joinedCommunities'] = d
      //row['data']['joinedCount'] = count
      ctx.body = {code: '200', success: true, msg: 'ok', data: row}
    } else {
      ctx.body = {code: '200', success: true, msg: 'fail', data: {
        account_id: accountId,
        public_key: "",
        create_time: new Date(),
        avatar: "",
        bio: "",
        background: "",
        email: "",
        following: [],
        followers: [],
        media: [],
        actions: []
      }}
    }
  })

  app.get('/api/v1/user/replies', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let currentAccountId = params.currentAccountId
    let page = params.page ? +params.page : 0
    let limit = params.limit ? +params.limit : 10
    let User = ctx.model("user")
    let Post = ctx.model("post")
    let Like = ctx.model("like")
    let Comment = ctx.model("comment")
    let Share = ctx.model("share")
    let ops = {account_id: accountId}
    let row = await User.getRow(ops)
    if (row) {
      let comments = await Comment.getPagedRows({accountId: accountId,deleted:false}, page * limit, limit, {createAt: -1})
      let count = await Comment.getRowsCount({accountId: accountId,deleted:false})
      for (let i = 0; i < comments.length; i++) {
        let commentCount = await Comment.getRowsCount({postId: comments[i]['target_hash'], deleted: false});
        let likeCount = await Like.getRowsCount({target_hash: comments[i]['target_hash'], likeFlag: false});
        let shareCount =await Share.getRowsCount({target_hash: comments[i]['target_hash']})

        let count = await Like.getRowsCount({
          accountId: currentAccountId,
          target_hash: comments[i]['target_hash'],
          likeFlag: false
        });
        let post =await Post.getRow({target_hash:comments[i]['commentPostId']})


        comments[i]['access']=post?post.access:{}
        comments[i]['data'] = {
          commentCount: commentCount,
          likeCount: likeCount,
          isLike: (count == 0) ? false : true,
          shareCount:shareCount,
        }
        delete comments[i]['text_sign']

      }
      ctx.body = {code: '200', success: true, msg: 'ok', data: comments, count: count}
    } else {
      ctx.body = {code: '200', success: false, msg: 'fail', data: {}}
    }
  })

  app.get('/api/v1/user/posts', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let currentAccountId = params.currentAccountId
    let page = params.page ? +params.page : 0
    let limit = params.limit ? +params.limit : 10
    let User = ctx.model("user")
    let Like = ctx.model("like")
    let Post = ctx.model("post")
    let Share = ctx.model("share")
    let Comment = ctx.model("comment")
    let ops = {account_id: accountId}
    let row = await User.getRow(ops)
    if (row) {
      let posts = await Post.getPagedRows({accountId: accountId,deleted:false}, page * limit, limit, {createAt: -1})
      let count = await Post.getRowsCount({accountId: accountId,deleted:false})
      for (let i = 0; i < posts.length; i++) {
        let commentCount = await Comment.getRowsCount({postId: posts[i]['target_hash'], deleted: false});
        let likeCount = await Like.getRowsCount({target_hash: posts[i]['target_hash'], likeFlag: false});
        let shareCount =await Share.getRowsCount({target_hash: posts[i]['target_hash']})

        let count = await Like.getRowsCount({
          accountId: currentAccountId,
          target_hash: posts[i]['target_hash'],
          likeFlag: false
        });
        posts[i]['data'] = {
          commentCount: commentCount,
          likeCount: likeCount,
          isLike: (count == 0) ? false : true,
          shareCount:shareCount
        }
        delete posts[i]['text_sign']

      }
      ctx.body = {code: '200', success: true, msg: 'ok', data: posts, count: count}
    } else {
      ctx.body = {code: '200', success: false, msg: 'fail', data: {}}
    }
  })

  app.get('/api/v1/user/likes', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let currentAccountId = params.currentAccountId
    let page = params.page ? +params.page : 0
    let limit = params.limit ? +params.limit : 10
    let User = ctx.model("user")
    let Post = ctx.model("post")
    let Comment = ctx.model("comment")
    let Like = ctx.model("like")
    let Share = ctx.model("share")
    let ops = {account_id: accountId}
    let row = await User.getRow(ops)
    if (row) {
      let likes = await Like.getPagedRows({accountId: accountId, likeFlag: false}, page * limit, limit, {createAt: -1})
      let count = await Like.getRowsCount({accountId: accountId, likeFlag: false})
      let l = []
      for (let i = 0; i < likes.length; i++) {
        let post = await Post.getRow({target_hash: likes[i].target_hash,deleted:false})
        let comment = await Comment.getRow({target_hash: likes[i].target_hash,deleted:false})
        if (post) {
          let commentCount = await Comment.getRowsCount({postId: post['target_hash'], deleted: false});
          let likeCount = await Like.getRowsCount({target_hash: post['target_hash'], likeFlag: false});
          let shareCount =await Share.getRowsCount({target_hash: post['target_hash']})
          let count = await Like.getRowsCount({
            accountId: currentAccountId,
            target_hash: post['target_hash'],
            likeFlag: false
          });
          post['data'] = {
            commentCount: commentCount,
            likeCount: likeCount,
            isLike: (count == 0) ? false : true,
            shareCount:shareCount
          }
          delete post['text_sign']
          l.push(post)
        }
        if (comment) {
          let commentCount = await Comment.getRowsCount({postId: comment['target_hash'], deleted: false});
          let likeCount = await Like.getRowsCount({target_hash: comment['target_hash'], likeFlag: false});
          let shareCount =await Share.getRowsCount({target_hash: comment['target_hash']})
          let count = await Like.getRowsCount({
            accountId: currentAccountId,
            target_hash: comment['target_hash'],
            likeFlag: false
          });
          let post =await Post.getRow({target_hash:comment['commentPostId']})
          comment['access']=post?post.access:{}
          comment['data'] = {
            commentCount: commentCount,
            likeCount: likeCount,
            isLike: (count == 0) ? false : true,
            shareCount:shareCount
          }
          delete comment['text_sign']
          l.push(comment)
        }
      }
      ctx.body = {code: '200', success: true, msg: 'ok', data: l, count: count}
    } else {
      ctx.body = {code: '200', success: false, msg: 'fail', data: {}}
    }
  })


  app.get('/api/v1/user/list', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let keyword = params.keyword
    let page = params.page ? +params.page : 0
    let limit = params.limit ? +params.limit : 10
    let User = ctx.model("user")
    let Follow = ctx.model("follow")
    let Post = ctx.model("post")
    let ops = {}
    if (keyword) {
      ops['$or'] = [{name: {$regex: keyword, $options: 'i'}}, {account_id: {$regex: keyword, $options: 'i'}}]
    }
    let users = await User.getPagedRows(ops, page * limit, limit, {createAt: -1})
    let count = await User.getRowsCount(ops)
    for (let i = 0; i < users.length; i++) {
      let following = await Follow.getRowsCount({accountId: users[i].account_id, followFlag: false})
      let follows = await Follow.getRowsCount({account_id: users[i].account_id, followFlag: false})
      let postCount = await Post.getRowsCount({accountId: users[i].account_id, deleted: false})
      let isFollow = await Follow.getRowsCount({
        accountId: accountId,
        account_id: users[i].account_id,
        followFlag: false
      })
      users[i]['data'] = {}
      users[i]['data']['isFollow'] = (isFollow != 0) ? true : false
      users[i]['data']['following'] = following
      users[i]['data']['follows'] = follows
      users[i]['data']['postCount'] = postCount
    }
    ctx.body = {code: '200', success: true, msg: 'ok', data: users, count: count}


  })


  app.get('/api/v1/user/communities', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let page = params.page ? +params.page : 0 //0,1,2
    let limit = params.limit ? +params.limit : 10 //0,1,2
    let lastTime = params.lastTime
    let lastPostId = params.lastPostId
    let Join = ctx.model("join")
    let User = ctx.model("user")
    let Post = ctx.model("post")
    let Community = ctx.model("communities")
    let lastPost = null
    if (lastPostId) {
      lastPost = await Post.getRow({target_hash: lastPostId})
    }

    let members = await Join.getPagedRows({accountId: accountId, joinFlag: false}, page * limit, limit, {weight: -1});
    let count = await Join.getRowsCount({accountId: accountId, joinFlag: false});
    let d = []
    if(members.length==0){
      members.push({
        "communityId" : constants.MAIN_CONTRACT,
      })
    }
    for (let i = 0; i < members.length; i++) {
      let row = await Community.getRow({communityId: members[i]['communityId']})
      d.push(row)
    }

    for (let i = 0; i < d.length; i++) {
      let q = {receiverId: d[i]['communityId'], deleted: false}
      let postCount = await Post.getRowsCount(q)
      if (lastPost) {
        q["_id"] = {$gt: lastPost['_id']}
      }
      let unReadCount = await Post.getRowsCount(q)
      d[i]['data'] = {
        postCount: postCount,
        unReadCount: unReadCount
      }
    }


    ctx.body = {code: '200', success: true, msg: 'ok', data: d, count: count}

  })


  app.get('/api/v1/user/unJoinCommunities', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let page = params.page ? +params.page : 0 //0,1,2
    let limit = params.limit ? +params.limit : 10 //0,1,2
    let lastTime = params.lastTime
    let type = params.type //hot new
    let Join = ctx.model("join")
    let User = ctx.model("user")
    let Post = ctx.model("post")
    let Community = ctx.model("communities")
    let members = await Join.getRows({accountId: accountId, joinFlag: false});

    let d = []
    for (let i = 0; i < members.length; i++) {
      let row = await Community.getRow({communityId: members[i]['communityId']})
      d.push(row)
    }
    let author = await Community.getRows({accountId: accountId})
    if (author) {
      d.push(author)
    }
    let c = []
    c.push(constants.MAIN_CONTRACT)
    for (let i = 0; i < d.length; i++) {
      c.push(d[i]['communityId'])
    }
    let sort = {}
    if (type == 'hot') {
      sort = {score: -1}
    } else {
      sort = {createAt: -1}
    }
    let unJoinCommunities = await Community.getPagedRows({communityId: {$nin: c}}, page * limit, limit, sort)
    let count = await Community.getRowsCount({communityId: {$nin: c}})
    let r = []
    for (let i = 0; i < unJoinCommunities.length; i++) {
      let postCount = await Post.getRowsCount({receiverId: unJoinCommunities[i]['communityId'], deleted: false})
      let membersCount = await Join.getRowsCount({communityId: unJoinCommunities[i]['communityId'], joinFlag: false});
      unJoinCommunities[i]['data'] = {
        postCount: postCount,
        membersCount: membersCount
      }

    }

    ctx.body = {code: '200', success: true, msg: 'ok', data: unJoinCommunities, count: count}

  })

  app.post('/api/v1/user/report', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let commentId = params.commentId
    let postId = params.postId
    let User = ctx.model("user")
    let Report = ctx.model("report")
    let ops = {account_id: accountId}
    let row = await User.getRow(ops)
    if (!row) {
      return ctx.body = {code: '201', success: false, msg: 'accountId not have', data: {}}
    }
    let doc = {accountId: accountId}
    if (commentId) {
      doc['commentId'] = commentId
    }
    if (postId) {
      doc['postId'] = postId
    }
    let u = await Report.updateOrInsertRow(doc, doc)
    let r = await Report.getRow(doc)
    if (r) {
      ctx.body = {code: '200', success: true, msg: 'ok', data: r}
    } else {
      ctx.body = {code: '200', success: false, msg: 'fail', data: {}}
    }


  })

 /* app.post('/api/v1/user/share', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let target_hash = params.target_hash
    let Share = ctx.model("share")
    let User = ctx.model("user")
    let ops = {account_id: accountId}
    let row = await User.getRow(ops)
    if (!row || !target_hash) {
      return ctx.body = {code: '201', success: false, msg: 'accountId  or target_hash not have', data: {}}
    }
    let doc = {accountId: accountId, target_hash: target_hash}

    let u = await Share.createRow(doc)
    let r = await Share.getRow(doc)
    if (r) {
      ctx.body = {code: '200', success: true, msg: 'ok', data: {}}
    } else {
      ctx.body = {code: '200', success: false, msg: 'fail', data: {}}
    }

  })*/
  app.get('/api/v1/user/getNotifications', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let lastTime = params.lastTime ?params.lastTime:moment().subtract(30, "days").valueOf()
    let Notification = ctx.model("notification")
    let User = ctx.model("user")
    let q = {"$or":[{accountId: accountId, "$or":[{type:"comment"},{type:"post"}]},{'options.At':accountId}]}
    if (lastTime) {
      q['createAt'] = {$gte: lastTime}
    }

    let n =[]
    let comments = await Notification.getRows(q,{createAt:-1})
    for (let i = 0; i < comments.length; i++) {
      let q = {type: "like", target_hash: comments[i].target_hash}
      if (lastTime) {
        q['createAt'] = {$gte: lastTime}
      }
      let likes = await Notification.getRows(q,{createAt:-1})
      for (let i=0;i<likes.length;i++){
        let user =await User.getRow({account_id:likes[i]['accountId']})
        likes[i]['data']={
          name:user&&user['name']?user['name']:'',
          account_id:likes[i]['accountId'],
          avatar:user&&user['avatar']?user['avatar']:''
        }
      }

      comments[i]['data'] = {}
      comments[i]['data']['type']='comment'
      comments[i]['data']['likes'] = likes;
      comments[i]['data']['count'] = likes.length;
      comments[i]['data']['At']=null
        if(comments[i]['options']){
        for (let j =0;j<comments[i]['options'].length;j++){
          if (accountId==comments[i]['options'][j]['At']){
            comments[i]['data']['At']=comments[i]['options'][j]['At']
          }
        }
        }

      if (comments[i]['type']=='post'){
        if (likes.length!=0||comments[i]['data']['At']!=null){
          n.push(comments[i])
        }
      } else {
        n.push(comments[i])
      }

    }
    let fq = {account_id: accountId, type: "follow"}
    if (lastTime) {
      fq['createAt'] = {$gte: lastTime}
    }
    let follows = await Notification.getRows(fq,{createAt:-1})

    for (let i=0;i<follows.length;i++){
      let user =await User.getRow({account_id:follows[i]['accountId']})
      follows[i]['data']={
        name:user&&user['name']?user['name']:'',
        account_id:follows[i]['accountId'],
        avatar:user&&user['avatar']?user['avatar']:''
      }
    }

    if (follows.length>0){
      n.push({
        type:'follow',
        data:{
          type:'follow',
          follow: follows,
          count: follows.length
        },
        createAt:follows[0].createAt
      })

    }

    ctx.body = {
      code: '200',
      success: true,
      msg: 'ok',
      data: n.sort(keySort('createAt', true)),
      lastTime: moment().valueOf()
    }

  })


  function keySort(key, sortType) {
    return function (a, b) {
      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        return sortType ? (b[key] - a[key]) : (a[key] - b[key]);
      } else if (typeof a[key] === 'string' && typeof b[key] === 'string') {
        let x = a[key].toLowerCase();
        let y = b[key].toLowerCase();
        if (x < y) {
          return sortType ? 1 : -1;
        }
        if (x > y) {
          return sortType ? -1 : 1;
        }
        return 0;
      } else {
        return 0;
      }
    }
  }


}
