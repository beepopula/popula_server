module.exports = function (app) {
  const utils = require("../../utils/utils.js")
  const near = require("../../utils/near.js")
  const CryptoJS = require('crypto-js');
  const moment = require('moment')
  const config = require('config');
  const key = CryptoJS.enc.Utf8.parse(config.get('aes').key);
  const iv = CryptoJS.enc.Utf8.parse(config.get('aes').iv);

  app.get('/api/v1/post/list', async (ctx, next) => {
    let params = ctx.params
    let accountId = params.accountId
    let communityId = params.communityId
    let keyword = params.keyword
    let page = params.page ? +params.page : 0
    let limit = params.limit ? +params.limit : 10
    let type = params.type //hot //new /follow
    let lastPostId = params.lastPostId
    let Post = ctx.model("post")
    let Like = ctx.model("like")
    let Share = ctx.model("share")
    let Follow = ctx.model("follow")
    let Comment = ctx.model("comment")
    let lastPost = null
    if (lastPostId) {
      lastPost = await Post.getRow({target_hash: lastPostId})
    }

    let ops = {deleted: false}
    let sort = {}

    if (keyword) {
      ops['text'] = {$regex: keyword, $options: 'i'}
      ops["type"] = {$ne: "encrypt"}
    }

    if (type == 'hot') {
        ops["type"] = {$ne: "encrypt"}
        sort = {score: -1}
    } else if (type == 'new') {
        ops["type"] = {$ne: "encrypt"}
      if (lastPost) {
        ops["_id"] = {$gt: lastPost['_id']}
      }
      sort = {createAt: -1}
    } else if (type == 'follow') {

      let follows = await Follow.getRows({accountId: accountId,followFlag:false})
      if (lastPost) {
        ops["_id"] = {$gt: lastPost['_id']}
      }
      let followIds = []
      for (let i = 0; i < follows.length; i++) {
        followIds.push(follows[i]['account_id'])
      }
      ops['accountId'] = {$in: followIds}
      sort = {createAt: -1}
    } else {

      sort = {createAt: -1}
    }
    if (communityId) {
      ops['receiverId'] = communityId

      delete  ops['type']
    }
    let posts = await Post.getPagedRows(ops, page * limit, limit, sort)
    let count = await Post.getRowsCount(ops)

    for (let i = 0; i < posts.length; i++) {
      let commentCount = await Comment.getRowsCount({commentPostId: posts[i]['target_hash'], deleted: false});
      let likeCount = await Like.getRowsCount({target_hash: posts[i]['target_hash'], likeFlag: false});
      let shareCount =await Share.getRowsCount({target_hash: posts[i]['target_hash']})
      posts[i]['data'] = {
        likeCount: likeCount,
        commentCount: commentCount,
        shareCount:shareCount,
      }
      if (accountId) {
        let count = await Like.getRowsCount({
          accountId: accountId,
          target_hash: posts[i]['target_hash'],
          likeFlag: false
        });
        posts[i]['data']['isLike'] = (count == 0) ? false : true
      }
      delete posts[i]['text_sign']
    }


    ctx.body = {code: '200', success: true, msg: 'ok', data: posts, count: count, unReadCount: count}

  })

  app.get('/api/v1/post/detail', async (ctx, next) => {
    let params = ctx.params
    let postId = params.postId
    let accountId = params.accountId
    let Post = ctx.model("post")
    let Like = ctx.model("like")
    let Follow = ctx.model("follow")
    let Comment = ctx.model("comment")
    let User = ctx.model("user")
    let Join = ctx.model("join")
    let Share = ctx.model("share")
    let Community = ctx.model("communities")
    let post = await Post.getRow({target_hash: postId})
    if (!post) {
      return ctx.body = {code: '200', success: false, msg: ' post is null', data: {}}
    }
    let user = await User.getRow({account_id: post.accountId})
    if (!user) {
      return ctx.body = {code: '200', success: false, msg: 'user  is null', data: {}}
    }
    let commentCount = await Comment.getRowsCount({commentPostId: post['target_hash'], deleted: false});
    let likeCount = await Like.getRowsCount({target_hash: post['target_hash'], likeFlag: false});
    let shareCount =await Share.getRowsCount({target_hash: post['target_hash']})

    post['data'] = {likeCount: likeCount, commentCount: commentCount,shareCount:shareCount}
    let following = await Follow.getRowsCount({accountId: user.account_id, followFlag: false})
    let follows = await Follow.getRowsCount({account_id: user.account_id, followFlag: false})
    let postCount = await Post.getRowsCount({accountId: user.account_id, deleted: false})
    let isFollow = await Follow.getRowsCount({accountId: accountId, account_id: user.account_id, followFlag: false})

    user['data'] = {
      isFollow: isFollow != 0 ? true : false,
      following: following,
      follows: follows,
      postCount: postCount
    }
    let joins = await Join.getPagedRows({accountId: user.account_id, joinFlag: false}, 0, 3, {createAt: -1})
    let c = []
    for (let i = 0; i < joins.length; i++) {
      let community = await Community.getRow({communityId: joins[i].communityId})
      if (community) {
        c.push(community)
      }
    }

    let postCommunity = await Community.getRow({communityId: post.receiverId})
    let isJoin = await Join.getRow({accountId: accountId, communityId: post.receiverId, joinFlag: false})
    if (postCommunity) {
      let members = await Join.getRowsCount({communityId: post.receiverId, joinFlag: false});
      let posts = await Post.getRowsCount({receiverId: post.receiverId, deleted: false});
      postCommunity['data']['membersCount'] = members
      postCommunity['data']['postCount'] = posts
      postCommunity['data']['isJoin'] = (isJoin != null) ? true : false
    } else {
      postCommunity = {}
    }

    if (accountId) {
      let count = await Like.getRowsCount({
        accountId: accountId,
        target_hash: post['target_hash'],
        likeFlag: false
      });
      post['data']['isLike'] = (count == 0) ? false : true
    }
    delete post['text_sign']

    ctx.body = {
      code: '200',
      success: true,
      msg: 'ok',
      data: {post: post, user: user, postCommunity: postCommunity, JoinedCommunities: c}
    }

  })

  app.post('/api/v1/post/getSignByPostId', async (ctx, next) => {
    let params = ctx.params
    let postId = params.postId
    let commentId = params.commentId
    let accountId = params.accountId
    let Post = ctx.model("post")
    let Comment = ctx.model("comment")
    let post = await Post.getRow({target_hash: postId})
    let comment=null
    if (commentId) {
        comment = await Comment.getRow({target_hash: commentId})
    }
    if (!post && !comment) {
      return ctx.body = {code: '200', success: false, msg: 'fail', data: {}}
    }

    try{
      let permission = await utils.checkPermission(post?post:comment, accountId)
      if (permission) {
        return ctx.body = {
          code: '200',
          success: true,
          msg: 'ok',
          data: {text_sign: commentId&&comment ? comment.text_sign :post.text_sign }
        }

      } else {
        return ctx.body = {
          code: '200',
          success: false,
          msg: 'no permission',
          data: {}
        }

      }
    }catch (e){
      console.log(e)
      return ctx.body = {
        code: '200',
        success: false,
        msg: 'no permission',
        data: {}
      }

    }



  })


  app.post('/api/v1/post/addEncryptContentSign', async (ctx, next) => {
    let params = ctx.params
    let nonce =moment().valueOf()
    let content = params.content   //{"text":"tt","imgs":[]}
    let encode = encrypt(JSON.stringify(content))
    let sign = await near.sign(encode+nonce)
    let r ={
      nonce:nonce,
      sign:sign,
      encode:encode
    }
     ctx.body = {code: '200', success: true, msg: 'ok', data: r}
  })

  app.post('/api/v1/post/getDeCodeContent', async (ctx, next) => {
    let params = ctx.params
    let postId = params.postId
    let content = params.content
    let Post = ctx.model("post")
    let post = await Post.getRow({target_hash: postId})
    let decode = decrypt(content)
    ctx.body = {code: '200', success: true, msg: 'ok', data: decode}
  })













  app.post('/api/v1/post/delete', async (ctx, next) => {
    let params = ctx.params
    let postId = params.postId
    let accountId = params.accountId
    let Post = ctx.model("post")
    let post = await Post.getRow({target_hash: postId})
    if (post && accountId) {
      if (post.accountId == accountId) {
        let u = await Post.updateRow({target_hash: postId}, {deleted: true})
        let r = await Post.getRow({target_hash: postId})
        if (r.deleted == true) {
          return ctx.body = {code: '200', success: true, msg: 'delete success', data: {}}
        }
      }
    }

    ctx.body = {code: '200', success: false, msg: 'delete fail', data: {}}
  })


  // app.post('/api/v1/post/sign_post', async (ctx, next) => {
  //   const data = ctx.params.args;
  //   const me = ctx.request.body.data.me
  //   let Post = ctx.model("post")
  //   const item = Post.getRow({target_hash: data.target_hash})
  //   const args = {
  //     text: ""
  //   }
  //   item.args = JSON.stringify(args);
  //   const permission = await utils.checkPermission(item, me)
  //   if (permission && item.args.encrypt_args) {
  //     let args = item.args.encrypt_args
  //     let args_json = JSON.stringify(args)
  //     let sign = await near.sign(args_json)
  //     ctx.body = {code: '200', success: true, msg: 'ok', data: sign}
  //   } else {
  //     ctx.body = {code: '400', success: false, msg: 'ok', err: "no permission"}
  //   }


  // })

  const encrypt = (text) => {
    let srcs = CryptoJS.enc.Utf8.parse(text);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
    return encrypted.ciphertext.toString().toUpperCase();
  }

  const decrypt = async (text) => {
    let encryptedHexStr = CryptoJS.enc.Hex.parse(text);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, key, {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
  }

}

