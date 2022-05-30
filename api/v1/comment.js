module.exports = function (app) {


  app.get('/api/v1/comment/list', async (ctx, next) => {
    let params = ctx.params
    let postId = params.postId
    let accountId = params.accountId
    let page = params.page ? +params.page : 0
    let limit = params.limit ? +params.limit : 10
    let type = params.type //hot or new
    let Comment = ctx.model("comment")
    let Like = ctx.model("like")
    let User = ctx.model("user")
    let Post = ctx.model("post")
    let Share = ctx.model("share")

    let Follow = ctx.model("follow")

    let sort = {}
    if (type == 'hot') {
      sort = {score: -1}
    } else if (type == 'new') {
      sort = {createAt: -1}
    } else {
      sort = {createAt: -1}
    }
    let ops = {commentPostId: postId, deleted: false}
    let comments = await Comment.getPagedRows(ops, page * limit, limit, sort)
    let count = await Comment.getRowsCount(ops)
    for (let i = 0; i < comments.length; i++) {
      let commentCount = await Comment.getRowsCount({postId: comments[i]['target_hash'], deleted: false});
      let likeCount = await Like.getRowsCount({target_hash: comments[i]['target_hash'], likeFlag: false});
      let shareCount =await Share.getRowsCount({target_hash: comments[i]['target_hash']})
      let count = await Like.getRowsCount({
        accountId: accountId,
        target_hash: comments[i]['target_hash'],
        likeFlag: false
      });
      let user = await User.getRow({account_id: comments[i].accountId})
      let following = await Follow.getRowsCount({accountId: user.account_id, followFlag: false})
      let follows = await Follow.getRowsCount({account_id: user.account_id, followFlag: false})
      let postCount = await Post.getRowsCount({accountId: user.account_id, deleted: false})
      let isFollow = await Follow.getRowsCount({accountId: accountId, account_id: user.account_id, followFlag: false})
      let replay = await Comment.getRow({target_hash: comments[i].postId})

      user['data'] = {
        isFollow: isFollow != 0 ? true : false,
        following: following,
        follows: follows,
        postCount: postCount
      }

      comments[i]['data'] = {
        commentCount: commentCount,
        likeCount: likeCount,
        shareCount:shareCount,
        isLike: (count == 0) ? false : true,
        user: user,
        replay:replay?replay.accountId:null

      }

      delete comments[i]['text_sign']
    }

    ctx.body = {code: '200', success: true, msg: 'ok', data: comments, count: count}

  })

  app.get('/api/v1/comment/second/list', async (ctx, next) => {
    let params = ctx.params
    let commentId = params.commentId
    let accountId = params.accountId
    let page = params.page ? +params.page : 0 //0,1,2
    let limit = params.limit ? +params.limit : 10 //0,1,2
    let Comment = ctx.model("comment")
    let Like = ctx.model("like")
    let User = ctx.model("user")
    let Post = ctx.model("post")
    let Share = ctx.model("share")
    let Follow = ctx.model("follow")
    let sort = {createAt: -1}
    let ops = {postId: commentId, deleted: false}
    let comments = await Comment.getPagedRows(ops, page * limit, limit, sort)
    let count = await Comment.getRowsCount(ops)
    for (let i = 0; i < comments.length; i++) {
      let commentCount = await Comment.getRowsCount({postId: comments[i]['target_hash'], deleted: false});
      let likeCount = await Like.getRowsCount({target_hash: comments[i]['target_hash'], likeFlag: false});
      let shareCount =await Share.getRowsCount({target_hash: comments[i]['target_hash']})
      let count = await Like.getRowsCount({
        accountId: accountId,
        target_hash: comments[i]['target_hash'],
        likeFlag: false
      });

      let user = await User.getRow({account_id: comments[i].accountId})
      let following = await Follow.getRowsCount({accountId: user.account_id, followFlag: false})
      let follows = await Follow.getRowsCount({account_id: user.account_id, followFlag: false})
      let postCount = await Post.getRowsCount({accountId: user.account_id, deleted: false})
      let isFollow = await Follow.getRowsCount({accountId: accountId, account_id: user.account_id, followFlag: false})
      let replay = await Comment.getRow({target_hash: comments[i].postId})

      user['data'] = {
        isFollow: isFollow != 0 ? true : false,
        following: following,
        follows: follows,
        postCount: postCount,

      }

      comments[i]['data'] = {
        commentCount: commentCount,
        likeCount: likeCount,
        shareCount:shareCount,
        isLike: (count == 0) ? false : true,
        user: user,
        replay:replay?replay.accountId:null

      }
      delete comments[i]['text_sign']
    }

    ctx.body = {code: '200', success: true, msg: 'ok', data: comments, count: count}

  })


  app.post('/api/v1/comment/delete', async (ctx, next) => {
    let params = ctx.params
    let commentId = params.commentId
    let accountId = params.accountId
    let Comment = ctx.model("comment")
    let comment = await Comment.getRow({target_hash: commentId})
    if (comment && accountId) {
      if (comment.accountId == accountId) {
        let u = await Comment.updateRow({target_hash: commentId}, {deleted: true})
        let r = await Comment.getRow({target_hash: commentId})
        if (r.deleted == true) {
          return ctx.body = {code: '200', success: true, msg: 'delete success', data: {}}
        }
      }
    }

    ctx.body = {code: '200', success: false, msg: 'delete fail', data: {}}
  })

  async function getComments(ops, Comment, Like, accountId, Follow, User, Post) {
    let comments = await Comment.getRows(ops)
    let count = await Comment.getRowsCount(ops)
    for (let i = 0; i < comments.length; i++) {
      let commentCount = await Comment.getRowsCount({postId: comments[i]['target_hash'], deleted: false});
      let likeCount = await Like.getRowsCount({target_hash: comments[i]['target_hash'], likeFlag: false});
      let count = await Like.getRowsCount({
        accountId: accountId,
        target_hash: comments[i]['target_hash'],
        likeFlag: false
      });

      let user = await User.getRow({account_id: comments[i].accountId})
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

      comments[i]['data'] = {
        commentCount: commentCount,
        likeCount: likeCount,
        isLike: (count == 0) ? false : true,
        user: user
      }
    }

    return comments
  }

}
