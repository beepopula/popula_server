const nearAPI = require('near-api-js')
const config = require('config');
const bs58 = require('bs58');
const homedir = require('os').homedir();
const path = require('path');
const tweetnacl = require("tweetnacl");
const CREDENTIALS_DIR = '.near-credentials';
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
const constants = config.get('constants');
const nearWallet = config.get('nearWallet');

class Near {


  constructor() {
    this.near = {}
    this.account = {}
    this.keyStore = {}
    this.init()
    console.log('init');
  }

  async init() {
    this.keyStore = new nearAPI.keyStores.UnencryptedFileSystemKeyStore(credentialsPath);
    this.near = await nearAPI.connect({
      keyStore: this.keyStore,
      ...nearWallet
    });
    this.account = await this.near.account(constants.ACCOUNT_ID);
    console.log(this.account);

  }

  async sign(arr) {
    const dataBuffer = Buffer.from(arr);
    console.log(dataBuffer);
    const keyPair = await this.keyStore.getKey(nearWallet.networkId, constants.ACCOUNT_ID);
    const { signature } = keyPair.sign(dataBuffer)
    return bs58.encode(signature);
  }

  async verifySignature (data, signature, public_key){
    let bf_data = new Uint8Array(Buffer.from(data))
    let bf_sign = new Uint8Array(signature)
    let bf_pk = new Uint8Array(bs58.decode(public_key))
    let valid = tweetnacl.sign.detached.verify(bf_data, bf_sign, bf_pk);
    return valid;
  }


   async verifyAccountOwner(nearAccount, data, signature) {
    const accessKeys = await nearAccount.getAccessKeys()
    return accessKeys.some(it => {
      const publicKey = it.public_key.replace('ed25519:', '');
      return this.verifySignature(data, signature, publicKey)
    });
  };
}


module.exports = new Near()
