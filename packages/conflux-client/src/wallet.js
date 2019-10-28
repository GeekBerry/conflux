const lodash = require('lodash');
const { Hex, PrivateKey, Address } = require('conflux-utils/lib/type');
const { randomPrivateKey, privateKeyToAddress, encrypt, decrypt } = require('conflux-utils/lib/sign');
const Transaction = require('conflux-utils/lib/tx');

class Account {
  /**
   * @param privateKey {string|Buffer}
   * @return {Account}
   */
  constructor(privateKey) {
    this.privateKey = PrivateKey(privateKey);
    this.address = Address(privateKeyToAddress(Hex.toBuffer(this.privateKey)));
  }

  /**
   * @param info {object}
   * @param password {string}
   * @return {Account}
   */
  static decrypt(info, password) {
    const privateKeyBuffer = decrypt(lodash.mapValues(info, Hex.toBuffer), Buffer.from(password));
    return new this(privateKeyBuffer);
  }

  /**
   * @param password {string}
   * @return {object}
   */
  encrypt(password) {
    const info = encrypt(Hex.toBuffer(this.privateKey), Buffer.from(password));
    return lodash.mapValues(info, Hex);
  }

  /**
   * @param options {object} - See 'Transaction'
   * @return {Transaction}
   */
  signTransaction(options) {
    const tx = new Transaction(options);
    tx.sign(this.privateKey); // sign will cover r,s,v fields
    if (tx.from !== this.address) {
      throw new Error(`Invalid signature, transaction.from !== ${this.address}`);
    }
    return tx;
  }

  /**
   * @return {string} Account address as string.
   */
  toString() {
    return this.address;
  }
}

class Wallet {
  constructor(client) {
    this.client = client; // for remote wallet api operate
    this.accountMap = new Map();
  }

  create(entropy) {
    const privateKeyBuffer = randomPrivateKey(entropy !== undefined ? Hex.toBuffer(entropy) : undefined);
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
module.exports.Account = Account;
