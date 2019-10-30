const lodash = require('lodash');
const { Hex, PrivateKey, Address } = require('conflux-utils/lib/type');
const { privateKeyToAddress, encrypt, decrypt } = require('conflux-utils/lib/sign');
const Transaction = require('conflux-utils/lib/transaction');

class Account {
  /**
   * Create a account by privateKey.
   *
   * @param privateKey {string|Buffer}
   * @return {Account}
   */
  constructor(privateKey) {
    this.privateKey = PrivateKey(privateKey);
    this.address = Address(privateKeyToAddress(Hex.toBuffer(this.privateKey)));
  }

  /**
   * Decrypt account encrypt info.
   *
   * @param info {object}
   * @param password {string}
   * @return {Account}
   */
  static decrypt(info, password) {
    const privateKeyBuffer = decrypt(lodash.mapValues(info, Hex.toBuffer), Buffer.from(password));
    return new this(privateKeyBuffer);
  }

  /**
   * Encrypt account privateKey to object.
   *
   * @param password {string}
   * @return {object}
   */
  encrypt(password) {
    const info = encrypt(Hex.toBuffer(this.privateKey), Buffer.from(password));
    return lodash.mapValues(info, Hex);
  }

  /**
   * Sign a transaction.
   *
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

module.exports = Account;
