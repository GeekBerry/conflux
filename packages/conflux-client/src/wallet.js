const { Hex, PrivateKey } = require('conflux-utils/lib/type');
const { randomPrivateKey } = require('conflux-utils/lib/sign');
const Account = require('./account');

class Wallet {
  constructor(client) {
    this.client = client; // for remote wallet api operate
    this.accountMap = new Map();
  }

  create(entropy) {
    const privateKeyBuffer = randomPrivateKey(entropy === undefined ? undefined : Hex.toBuffer(entropy));
    return this.add(privateKeyBuffer);
  }

  get(privateKeyOrAddress) {
    return this.accountMap.get(privateKeyOrAddress);
  }

  add(privateKey) {
    privateKey = PrivateKey(privateKey);

    let account = this.get(privateKey);
    if (!account) {
      account = new Account(privateKey);
      this.accountMap.set(account.address, account);
      this.accountMap.set(account.privateKey, account);
    }
    return account;
  }

  remove(privateKeyOrAddress) {
    const account = this.get(privateKeyOrAddress);
    if (account instanceof Account) {
      this.accountMap.delete(account.address);
      this.accountMap.delete(account.privateKey);
    }
    return account;
  }

  clear() {
    this.accountMap.clear();
  }
}

module.exports = Wallet;
