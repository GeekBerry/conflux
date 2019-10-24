const { Hex, Address, PrivateKey } = require('conflux-utils/lib/type');
const { randomPrivateKey, privateKeyToAddress } = require('conflux-utils/lib/sign');
const Transaction = require('conflux-utils/lib/tx');

class Account {
  /**
   * @param cfx {Client}
   * @param privateKey {string|Buffer}
   * @return {Account}
   */
  constructor(cfx, privateKey) {
    this.cfx = cfx;
    this.privateKey = privateKey;
    this.address = Address(privateKeyToAddress(Hex.toBuffer(this.privateKey)));
  }

  getBalance(epoch) {
    return this.cfx.getBalance(this.address, epoch);
  }

  getTransactionCount(epoch) {
    return this.cfx.getTransactionCount(this.address, epoch);
  }

  async sendTransaction({ from, nonce, gasPrice, gas, ...rest }) {
    if (nonce === undefined) {
      nonce = await this.getTransactionCount();
    }

    const tx = new Transaction({
      ...rest,
      nonce,
      gasPrice: gasPrice === undefined ? this.cfx.defaultGasPrice : gasPrice,
      gas: gas === undefined ? this.cfx.defaultGas : gas,
    });

    tx.sign(this.privateKey); // sign will cover r,s,v fields
    if (from !== undefined && tx.from !== from) {
      throw new Error(`Invalid signature, transaction.from !== ${from}`);
    }

    return this.cfx.sendRawTransaction(tx.toString());
  }

  async estimateGas({ nonce, ...rest }) {
    if (nonce === undefined) {
      nonce = await this.getTransactionCount();
    }
    return await this.cfx.estimateGas({ ...rest, from: this.address, nonce });
  }

  async call({ nonce, ...rest }) {
    if (nonce === undefined) {
      nonce = await this.getTransactionCount();
    }
    return this.cfx.call({ ...rest, from: this.address, nonce });
  }
}

class Wallet {
  constructor(cfx) {
    this.cfx = cfx;
    this.accountTable = {};
  }

  get(privateKeyOrAddress) {
    return this.accountTable[privateKeyOrAddress];
  }

  add(privateKey) {
    privateKey = PrivateKey(privateKey);

    let account = this.get(privateKey);
    if (!account) {
      account = new Account(this.cfx, privateKey);
      this.accountTable[account.address] = account;
      this.accountTable[account.privateKey] = account;
    }
    return account;
  }

  create(entropy) {
    const privateKeyBuffer = randomPrivateKey(entropy === undefined ? undefined : Hex.toBuffer(entropy));
    return this.add(privateKeyBuffer);
  }

  remove(privateKeyOrAddress) {
    const account = this.get(privateKeyOrAddress);
    if (account) {
      delete this.accountTable[account.address];
      delete this.accountTable[account.privateKey];
    }
    return account;
  }
}

module.exports = Wallet;
module.exports.Account = Account;
