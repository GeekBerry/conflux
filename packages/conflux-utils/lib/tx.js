const { Hex, Address, PrivateKey, Drip } = require('./type');
const { rlpEncode, sha3, ecdsaSign, ecdsaRecover, publicKeyToAddress } = require('./sign');

function throwError(...args) {
  throw new Error(...args);
}

class Transaction {
  /**
   * @param options {object}
   * @param options.from {string} - The address the transaction is send from.
   * @param options.nonce {string|number} - This allows to overwrite your own pending transactions that use the same nonce.
   * @param options.gasPrice {string|number} - The gasPrice used for each paid gas.
   * @param options.gas {string|number|BigNumber} - The gas provided for the transaction execution. It will return unused gas.
   * @param [options.to] {string} - The address the transaction is directed to.
   * @param [options.value] {string|number|BigNumber} - the value sent with this transaction
   * @param [options.data=''] {string|Buffer} - The compiled code of a contract OR the hash of the invoked method signature and encoded parameters.
   * @return {object} Formatted send transaction options object.
   */
  static sendOptions({ from, nonce, gasPrice, gas, to, value, data }) {
    return {
      from: from === undefined ? throwError('`from` is required and should match `Address`') : Address(from),
      nonce: nonce === undefined ? throwError('`nonce` is required and should match `Hex`') : Hex(nonce),
      gasPrice: gasPrice === undefined ? throwError('`gasPrice` is required and should match `Drip`') : Drip(gasPrice),
      gas: gas === undefined ? throwError('`gas` is required and should match `Hex`') : Hex(gas),
      to: to === undefined ? undefined : Address(to),
      value: value === undefined ? undefined : Drip(value),
      data: data === undefined ? Hex('') : Hex(data),
    };
  }

  /**
   * @param options {object}
   * @param [options.from] {string} - The address the transaction is sent from.
   * @param [options.nonce] {string|number} - The caller nonce (transaction count).
   * @param [options.gasPrice] {string|number} - The gasPrice used for each paid gas.
   * @param [options.gas] {string|number|BigNumber} - The gas provided for the transaction execution. `call` consumes zero gas, but this parameter may be needed by some executions.
   * @param options.to {string} - The address the transaction is directed to.
   * @param [options.value] {string|number|BigNumber} - Integer of the value sent with this transaction.
   * @param [options.data] {string|Buffer} - Hash of the method signature and encoded parameters.
   * @return {object} Formatted call contract options object.
   */
  static callOptions({ from, nonce, gasPrice, gas, to, value, data }) {
    return {
      from: from === undefined ? undefined : Address(from),
      nonce: nonce === undefined ? undefined : Hex(nonce),
      gasPrice: gasPrice === undefined ? undefined : Drip(gasPrice),
      gas: gas === undefined ? undefined : Hex(gas),
      to: to === undefined ? throwError('`to` is required and should match `Address`') : Address(to),
      value: value === undefined ? undefined : Drip(value),
      data: data === undefined ? undefined : Hex(data),
    };
  }

  /**
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
   * @return {{}}
   */
  static rawOptions({ nonce, gasPrice, gas, to, value, data, r, s, v }) {
    return {
      nonce: nonce === undefined ? throwError('`nonce` is required and should match `Hex`') : Hex(nonce),
      gasPrice: gasPrice === undefined ? throwError('`gasPrice` is required and should match `Drip`') : Drip(gasPrice),
      gas: gas === undefined ? throwError('`gas` is required and should match `Hex`') : Hex(gas),
      to: to === undefined ? Hex(null) : Address(to),
      value: value === undefined ? Drip(0) : Drip(value),
      data: data === undefined ? Hex('') : Hex(data),
      r: r === undefined ? Hex(null) : Hex(r),
      s: s === undefined ? Hex(null) : Hex(s),
      v: v === undefined ? Hex(null) : Hex(v),
    };
  }

  /**
   * Signs a transaction. This account needs to be unlocked.
   *
   * @param options {object} - See `Transaction.rawOptions`
   * @return {Transaction}
   */
  constructor(options) {
    Object.assign(this, Transaction.rawOptions(options));
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
  serialize() {
    return Hex(this.encode(true));
  }
}

module.exports = Transaction;
