const { Hex, PrivateKey } = require('conflux-utils/src/type');
const { randomPrivateKey } = require('conflux-utils/src/sign');
const Account = require('./account');

/**
 * Contains an in memory wallet with multiple accounts.
 */
class Wallet {
  /**
   * @param client {Client}
   * @return {Wallet}
   */
  constructor(client) {
    this.client = client; // for remote wallet api operate
    this.accountMap = new Map();
  }

  /**
   * Get the number of account in wallet.
   * 1 account have 1 address and 1 privateKey as key
   *
   * @return {number}
   */
  get size() {
    return this.accountMap.size / 2;
  }

  /**
   * Create a random Account.
   *
   * @param [entropy] {string} - Hex string seed.
   * @return {Account}
   */
  create(entropy) {
    const privateKeyBuffer = randomPrivateKey(entropy !== undefined ? Hex.toBuffer(entropy) : undefined);
    return this.add(privateKeyBuffer);
  }

  /**
   * Get a account in wallet by address or privateKey.
   *
   * @param privateKeyOrAddress {string} - Hex string.
   * @return {Account}
   */
  get(privateKeyOrAddress) {
    return this.accountMap.get(privateKeyOrAddress);
  }

  /**
   * Add a account to wallet by privateKey.
   *
   * @param privateKey {string|Buffer}
   * @return {Account}
   */
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

  /**
   * Remove a account in wallet by address or privateKey
   *
   * @param privateKeyOrAddress {string} - Hex string.
   * @return {Account}
   */
  remove(privateKeyOrAddress) {
    const account = this.get(privateKeyOrAddress);
    if (account instanceof Account) {
      this.accountMap.delete(account.address);
      this.accountMap.delete(account.privateKey);
    }
    return account;
  }

  /**
   * Clear all account in wallet.
   */
  clear() {
    this.accountMap.clear();
  }
}

module.exports = Wallet;
