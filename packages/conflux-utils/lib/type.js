const lodash = require('lodash');
const BigNumber = require('bignumber.js');
const {
  randomBuffer,
  rlpEncode,
  sha3,
  secp256k1ec,
  ecsign,
  scrypt32,
  cipheriv,
  decipheriv,
} = require('./sign');

// const MIN_TX_GAS = 21000;
const MAX_TX_GAS = 100000000;

// ----------------------------------- Hex ------------------------------------
/**
 * @memberOf type
 * @param value {string|number|Buffer|Date|BigNumber|null|undefined} - The value to gen hex string.
 * @return {string} Hex string in lowercase and starts with '0x'
 */
function Hex(value = undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return '0x';
  }

  if (lodash.isNumber(value) || BigNumber.isBigNumber(value)) {
    return Hex(value.toString(16));
  }

  if (lodash.isString(value)) {
    let string = value.toLowerCase();

    string = string.startsWith('0x') ? string : `0x${string}`;
    string = string.length % 2 ? `0x0${string.substring(2)}` : string;

    if (!/^0x[0-9a-f]*$/.test(string)) {
      throw new Error(`"${value}" do not match hex string`);
    }

    return string;
  }

  if (Buffer.isBuffer(value)) {
    return `0x${value.toString('hex')}`;
  }

  if (lodash.isDate(value)) {
    return Hex(value.valueOf());
  }

  return Hex(`${value}`);
}

/**
 * @param value {string|number|Buffer|Date|BigNumber|null|undefined} - The value to gen hex string and dump to Buffer.
 * @return {Buffer}
 */
Hex.toBuffer = function (value) {
  if (value === undefined) {
    return Buffer.from('');
  }

  const buffer = Buffer.from(Hex(value).substring(2), 'hex');
  return buffer.equals(Buffer.from('00', 'hex')) ? Buffer.from('') : buffer;
};

// ---------------------------------- Drip ------------------------------------
/**
 * @memberOf type
 * @param value {string|number|Buffer|BigNumber}
 * @return {string}
 */
function Drip(value) {
  const number = BigNumber(value);
  const string = Hex(number);
  if (string.length < 2) {
    throw new Error(`Drip can not be empty, got "${value}"`);
  }
  return string;
}

/**
 * Get Drip hex string by GDrip value.
 *
 * @param value {string|number|BigNumber} - Value in GDrip.
 * @return {string} Hex string in drip.
 */
Drip.fromGDrip = function (value) {
  const number = BigNumber(value).times(1e9);
  if (!number.isInteger()) {
    throw new Error(`can no parse ${value} GDrip to Drip in integer`);
  }
  return Drip(number);
};

/**
 * Get Drip hex string by CFX value.
 *
 * @param value {string|number|BigNumber} - Value in CFX.
 * @return {string} Hex string in drip.
 */
Drip.fromCFX = function (value) {
  const number = BigNumber(value).times(1e9).times(1e9); // XXX: 1e18 > Number.MAX_SAFE_INTEGER > 1e9
  if (!number.isInteger()) {
    throw new Error(`can no parse ${value} CFX to Drip in integer`);
  }
  return Drip(number);
};

// ---------------------------------- PrivateKey ------------------------------
/**
 * @memberOf type
 * @param value {string|number|Buffer|BigNumber}
 * @return {string}
 */
function PrivateKey(value) {
  const string = Hex(value);
  if (string.length !== 2 + 64) {
    throw new Error(`${value} do not match PrivateKey length`);
  }
  return string;
}

PrivateKey.CRYPT_VERSION = '3.5';

/**
 * Gen a random private key.
 *
 * @param [name] {string} - The string to be sha3.
 * @return {string} Hex string.
 */
PrivateKey.create = function (name) {
  return PrivateKey(sha3(name || randomBuffer(192)));
};

/**
 * @param privateKey {string}
 * @param password {string}
 * @return {{cipher: string, salt: string, iv: string, mac: string}}
 */
PrivateKey.encrypt = function (privateKey, password) {
  const keyBuffer = Hex.toBuffer(PrivateKey(privateKey));

  if (!lodash.isString(password)) {
    throw new Error('No password given.');
  }

  const saltBuffer = randomBuffer(32);
  const ivBuffer = randomBuffer(16);
  const derivedBuffer = scrypt32(Buffer.from(password), saltBuffer);
  const cipherBuffer = cipheriv(derivedBuffer.slice(0, 16), ivBuffer, keyBuffer);
  const macBuffer = sha3(Buffer.concat([derivedBuffer.slice(16, 32), cipherBuffer]));

  return {
    version: PrivateKey.CRYPT_VERSION,
    salt: Hex(saltBuffer),
    iv: Hex(ivBuffer),
    cipher: Hex(cipherBuffer),
    mac: Hex(macBuffer),
  };
};

/**
 * @param options
 * @param options.version {string}
 * @param options.salt {string}
 * @param options.iv {string}
 * @param options.cipher {string}
 * @param options.mac {string}
 * @param password {string}
 * @return {string}
 */
PrivateKey.decrypt = function ({ version, salt, iv, cipher, mac }, password) {
  if (version !== PrivateKey.CRYPT_VERSION) {
    throw new Error(`Not a valid version ${PrivateKey.CRYPT_VERSION} wallet`);
  }

  const saltBuffer = Hex.toBuffer(salt);
  const ivBuffer = Hex.toBuffer(iv);
  const derivedBuffer = scrypt32(Buffer.from(password), saltBuffer);
  const cipherBuffer = Hex.toBuffer(cipher);
  const macBuffer = sha3(Buffer.concat([derivedBuffer.slice(16, 32), cipherBuffer]));

  if (Hex(macBuffer) !== mac) {
    throw new Error('Key derivation failed, possibly wrong password!');
  }

  const keyBuffer = decipheriv(derivedBuffer.slice(0, 16), ivBuffer, cipherBuffer);
  return Hex(keyBuffer);
};

/**
 * Get address by private key.
 *
 * @param privateKey {string}
 * @return {string}
 */
PrivateKey.toAddress = function (privateKey) {
  const buffer = Hex.toBuffer(PrivateKey(privateKey));
  const ecKey = secp256k1ec.keyFromPrivate(buffer);
  const publicKey = Hex(ecKey.getPublic(false, 'hex').slice(2));
  const publicHash = Hex(sha3(Hex.toBuffer(publicKey)));
  return Hex(publicHash.slice(-40));
};

// ----------------------------------- Address --------------------------------
/**
 * @memberOf type
 * @param value {string|number|Buffer|BigNumber}
 * @return {string}
 */
function Address(value) {
  const string = Hex(value);
  if (string.length !== 2 + 40) {
    throw new Error(`${value} do not match Address length`);
  }
  return string;
}

// ---------------------------------- Epoch -----------------------------------
/**
 * @memberOf type
 * @param value {string|number|Buffer|BigNumber}
 * @return {string}
 */
function Epoch(value) {
  if (lodash.isString(value)) {
    value = value.toLowerCase();
  }

  if ([Epoch.EARLIEST, Epoch.LATEST_STATE, Epoch.LATEST_MINED].includes(value)) {
    return value;
  }

  return Hex(Number(value));
}

Epoch.EARLIEST = 'earliest';
Epoch.LATEST_STATE = 'latest_state';
Epoch.LATEST_MINED = 'latest_mined';

// ----------------------------------- BlockHash ------------------------------
/**
 * @memberOf type
 * @param value {string|number|Buffer|BigNumber}
 * @return {string}
 */
function BlockHash(value) {
  const string = Hex(value);
  if (string.length !== 2 + 64) {
    throw new Error(`${value} do not match BlockHash length`);
  }
  return string;
}

// ----------------------------------- TxHash ---------------------------------
/**
 * @memberOf type
 * @param value {string|number|Buffer|BigNumber}
 * @return {string}
 */
function TxHash(value) {
  const string = Hex(value);
  if (string.length !== 2 + 64) {
    throw new Error(`${value} do not match TxHash length`);
  }
  return string;
}

// ------------------------------ Transaction ---------------------------------
/**
 * Signs a transaction. This account needs to be unlocked.
 *
 * TODO gen tx hash
 *
 * @memberOf type
 * @param options {object}
 * @param [options.nonce=0] {number|string} - Integer of a nonce. This allows to overwrite your own pending transactions that use the same nonce.
 * @param [options.to='0x'] {string} - - The destination address of the message, left undefined for a contract-creation transaction.
 * @param [options.value=0] {number|string|BigNumber} - The value transferred for the transaction in drip, also the endowment if it’s a contract-creation transaction.
 * @param [options.data='0x'] {string} - Either a ABI byte string containing the data of the function call on a contract, or in the case of a contract-creation transaction the initialisation code.
 * @param [options.gasPrice=1] {number|string} - The price of gas for this transaction in drip.
 * @param [options.gasLimit=MAX_TX_GAS] {number|string} - The amount of gas to use for the transaction (unused gas is refunded).
 * @param options.privateKey {string} - Private key hex string.
 * @return {string} Signed raw transaction hex string.
 */
function Tx({ nonce = 0, gasPrice = 1, gasLimit = MAX_TX_GAS, to = null, value = 0, data = '', privateKey }) {
  const array = [
    Number(nonce),
    Drip(gasPrice),
    Number(gasLimit),
    to ? Address(to) : Hex(to),
    Drip(value),
    data,
  ].map(Hex.toBuffer);

  const { r, s, v } = ecsign(rlpEncode(array), Hex.toBuffer(PrivateKey(privateKey)));
  const buffer = rlpEncode([...array, Hex.toBuffer(v), r, s]);
  return Hex(buffer);
}

module.exports = {
  Hex,
  Drip,
  PrivateKey,
  Address,
  Epoch,
  BlockHash,
  TxHash,
  Tx,
};
