const near = require("../utils/near.js")
const bs58 = require('bs58');
const moment = require('moment')

const verify = async (ctx, next) => {
  let fgYellow = "\x1b[33m%s\x1b[0m";
  let fgBlue = "\x1b[34m%s\x1b[0m";
  let fgGreen = "\x1b[32m%s\x1b[0m";

  let allow = [
    '/api/v1/comment/delete',
    '/api/v1/post/getSignByPostId',
    '/api/v1/post/delete',
    '/api/v1/user/report',
    '/api/v1/communities/replacementSequence',
    '/api/v1/user/share',
    '/api/v1/communities/update',
    '/api/v1/communities/contributor/update',
    '/api/v1/communities/contributor/add',
    '/api/v1/communities/contributor/delete',
    '/api/v1/post/addEncryptContentSign',
    '/api/v1/post/getDeCodeContent'

  ]
  let params = ctx.params
  let url = ctx.request.url
  let method = ctx.request.method
  console.log(fgYellow, "request url:" + "  " + method + "  " + url);
  console.log(fgBlue, "request params :" + JSON.stringify(params));

  if (url.indexOf('/api/v1/') == -1) {
    console.log("method_name")
    ctx.throw(401, 'method name error');
  }
  try {
    if (method == "POST" && allow.indexOf(url) != -1) {

      const data = params.data
      const account_id = params.data.me
      const timestamp = params.data.timestamp
      const signature = params.signature
      let User = ctx.model("user")
      if (!signature) {
        ctx.throw(401, 'signature error');
      }

      if (account_id) {
        try {
          const data_str = JSON.stringify(data);
          const sign = bs58.decode(signature)
          const nearAccount = await near.near.account(account_id);
          if (!(await near.verifyAccountOwner(nearAccount, data_str, sign))) {
            ctx.throw(401, 'not account owner');
          }
        } catch (e) {
          ctx.throw(401, e);
        }

    /*    if ((moment().valueOf() - timestamp) > 60 * 1000 * 60) {
          ctx.throw(401, 'time  expire');
        }*/
        // let doc = await User.getRow({account_id: account_id})
        // if (!doc) {
        //   doc = {
        //     account_id: account_id,
        //     public_key: "",
        //     create_time: new Date(),
        //     avatar: "",
        //     bio: "",
        //     background: "",
        //     email: "",
        //     following: [],
        //     followers: [],
        //     media: [],
        //     actions: []
        //   }
        //   await User.updateOrInsertRow({account_id: account_id}, doc)
        // }

        ctx.params = {
          ...data,
          //accountId: account_id,
          ...data.args,
          signature: signature
        }
        console.log(fgGreen, "params :" + JSON.stringify(ctx.params));

      } else {
        ctx.throw(401, 'not account owner');
      }

    }
  } catch (e) {
    ctx.throw(401, e);
  }


  await next();
};


module.exports = verify
