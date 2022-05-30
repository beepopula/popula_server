let schedule = require("node-schedule");
let timer = true
module.exports = async function (ctx, next) {
  if (timer) {
    schedule.scheduleJob('*/60 * * * * *', async function (ctx) {
      let Post = ctx.model("post")
      let Like = ctx.model("like")
      let Comment = ctx.model("comment")
      let posts = await Post.getRows({})
      for (let i = 0; i < posts; i++) {
        let likeCount = await Like.getRowsCount({target_hash: posts[i]['target_hash'], likeFlag: false});
        let commentCount = await Comment.getRowsCount({postId: posts[i]['target_hash']});
        let score = likeCount + commentCount
        await Post.updateRow({target_hash: posts[i]['target_hash']}, {score: score})
      }
    });
    schedule.scheduleJob('*/60 * * * * *', async function (ctx) {
      let Like = ctx.model("like")
      let Comment = ctx.model("comment")
      let comments = await Comment.getRows({})
      for (let i = 0; i < comments; i++) {
        let likeCount = await Like.getRowsCount({target_hash: comments[i]['target_hash'], likeFlag: false});
        let commentCount = await Comment.getRowsCount({postId: comments[i]['target_hash']});
        let score = likeCount + commentCount
        await Comment.updateRow({target_hash: comments[i]['target_hash']}, {score: score})
      }
    });

  }
  timer = false
  await next();
}

