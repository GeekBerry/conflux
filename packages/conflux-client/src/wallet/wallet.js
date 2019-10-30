const { Hex, PrivateKey } = require('conflux-utils/lib/type');
const Account = require('./account');

class Wallet {
  constructor(client) {
    this.client = client; // for remote wallet api operate
    this.accountMap = new Map();
  }

  /**
   * Create a random Account.
   *
   * @param entropy {string} - Hex string seed.
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
