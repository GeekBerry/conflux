const { Hex, PrivateKey, Address } = require('conflux-utils/lib/type');
const { privateKeyToAddress, randomPrivateKey } = require('conflux-utils/lib/sign');
const Transaction = require('conflux-utils/lib/tx');

class Account {
  static create(entropy) {
    const privateKeyBuffer = randomPrivateKey(entropy === undefined ? undefined : Hex.toBuffer(entropy));
    return new this(privateKeyBuffer);
  }

  /**
   * @param privateKey {string|Buffer}
   * @return {Account}
   */
  constructor(privateKey) {
    this.privateKey = PrivateKey(privateKey);
    this.address = Address(privateKeyToAddress(Hex.toBuffer(this.privateKey)));
  }

  /**
   * @param options {object} - See 'Transaction'
   * @return {Promise<Transaction>}
   */
  signTransaction(options) {
    const tx = new Transaction(options);
    tx.sign(this.privateKey); // sign will cover r,s,v fields
    if (tx.from !== this.address) {
      throw new Error(`Invalid signature, transaction.from !== ${this.address}`);
    }
    return tx;
  }

  toString() {
    return this.address;
  }
}

module.exports = Account;
