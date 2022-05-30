const nearAPI = require('near-api-js')
const config = require('config');
const bs58 = require('bs58');
const homedir = require('os').homedir();
const path = require('path');

const CREDENTIALS_DIR = '.near-credentials';
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
const constants = config.get('constants');
class Near {


  constructor() {
    this.near = {}
    this.account = {}
    this.keyStore = {}
    this.init()
  }

  async init() {
    this.keyStore = new nearAPI.keyStores.UnencryptedFileSystemKeyStore(credentialsPath);
    this.near = await nearAPI.connect({
      keyStore: this.keyStore,
      ...config.nearWallet
    });
    this.account = await this.near.account(constants.ACCOUNT_ID);
  }

  async sign(arr) {
    const dataBuffer = Buffer.from(arr);
    const keyPair = await this.keyStore.getKey(config.nearWallet.networkId, constants.ACCOUNT_ID);
    const { signature } = keyPair.sign(dataBuffer)
    return bs58.encode(signature);
  }

  static async verifyAccountOwner(nearAccount, data, signature) {
    const accessKeys = await nearAccount.getAccessKeys()
    return accessKeys.some(it => {
      const publicKey = it.public_key.replace('ed25519:', '');
      return verifySignature(data, signature, publicKey)
    });
  };
}


module.exports = new Near()
