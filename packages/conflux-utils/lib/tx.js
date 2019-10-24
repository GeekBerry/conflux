const { Hex, Address, PrivateKey, Drip } = require('./type');
const { rlpEncode, sha3, ecdsaSign, ecdsaRecover, publicKeyToAddress } = require('./sign');

// const MAX_TX_GAS = 100000000;
// const MIN_TX_GAS = 21000;

class Transaction {
  /**
   * Signs a transaction. This account needs to be unlocked.
   *
   * @param options {object}
   * @param options.nonce {string|number} - This allows to overwrite your own pending transactions that use the same nonce.
   * @param options.gasPrice {string|number} - The price of gas for this transaction in drip.
   * @param options.gas {string|number} - The amount of gas to use for the transaction (unused gas is refunded).
   * @param [options.to=null] {string} - The destination address of the message, left undefined for a contract-creation transaction.
   * @param [options.value=0] {string|number|BigNumber} - The value transferred for the transaction in drip, also the endowment if it’s a contract-creation transaction.
   * @param [options.data=''] {string|Buffer} - Either a ABI byte string containing the data of the function call on a contract, or in the case of a contract-creation transaction the initialisation code.
   * @param [options.r=null] {string|Buffer} - ECDSA signature r
   * @param [options.s=null] {string|Buffer} - ECDSA signature s
   * @param [options.v=null] {string|number} - ECDSA recovery id
   * @return {Transaction}
   */
  constructor({ nonce, gasPrice, gas, to, value, data, r, s, v }) {
    this.nonce = Hex(nonce);
    this.gasPrice = Drip(gasPrice);
    this.gas = Hex(gas);
    this.to = to === undefined ? Hex(null) : Address(to);
    this.value = value === undefined ? Drip(0) : Drip(value);
    this.data = data === undefined ? Hex('') : Hex(data);
    this.r = r === undefined ? Hex(null) : Hex(r);
    this.s = s === undefined ? Hex(null) : Hex(s);
    this.v = v === undefined ? Hex(null) : Hex(v);
  }

  /**
   * @return {string|undefined} Hex string of sender address
   */
  get from() {
    try {
      const publicKey = ecdsaRecover(this.hash(), {
        r: Hex.toBuffer(this.r),
        s: Hex.toBuffer(this.s),
        v: Number(this.v),
      });
      return Hex(publicKeyToAddress(publicKey));
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Sign transaction and set 'r','s','v'.
   *
   * @param privateKey {string} - Private key hex string.
   */
  sign(privateKey) {
    const { r, s, v } = ecdsaSign(this.hash(), Hex.toBuffer(PrivateKey(privateKey)));
    this.r = Hex(r);
    this.s = Hex(s);
    this.v = Hex(v);
  }

  /**
   * Computes a sha hash of the transaction.
   *
   * @return {Buffer}
   */
  hash() {
    return sha3(this.encode());
  }

  /**
   * @param [includeSignature=false] {boolean} - Whether or not to include the signature.
   * @return {Buffer}
   */
  encode(includeSignature = false) {
    const raw = [this.nonce, this.gasPrice, this.gas, this.to, this.value, this.data];
    if (includeSignature) {
      raw.push(this.v, this.r, this.s);
    }
    return rlpEncode(raw.map(Hex.toBuffer));
  }

  /**
   * Get the raw tx hex string.
   *
   * @return {string}
   */
  toString() {
    return Hex(this.encode(true));
  }
}

module.exports = Transaction;
