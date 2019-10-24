const lodash = require('lodash');
const BigNumber = require('bignumber.js');

// ----------------------------------- Hex ------------------------------------
/**
 * @memberOf type
 * @param value {string|number|Buffer|Date|BigNumber|null} - The value to gen hex string.
 * @return {string} Hex string.
 */
function Hex(value) {
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

    if (!Hex.isHex(string)) {
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
 * Check if is hex string.
 *
 * > Hex: /^0x([0-9a-f][0-9a-f])*$/
 *
 * @param hex {string} - Value to be check.
 * @return {boolean}
 */
Hex.isHex = function (hex) {
  return /^0x([0-9a-f][0-9a-f])*$/.test(hex);
};

/**
 * @param hex {string} - The hex string.
 * @return {Buffer}
 */
Hex.toBuffer = function (hex) {
  if (!Hex.isHex(hex)) {
    throw new Error(`"${hex}" do not match hex string`);
  }

  const buffer = Buffer.from(hex.substring(2), 'hex');
  if (buffer.equals(Buffer.from('00', 'hex'))) {
    return Buffer.from('');
  }
  return buffer;
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
function SendObject({ from, nonce, gasPrice, gas, to, value, data }) {
  return {
    from: Address(from),
    nonce: Hex(nonce),
    gasPrice: Drip(gasPrice),
    gas: Hex(gas),
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
function CallObject({ from, nonce, gasPrice, gas, to, value, data }) {
  return {
    from: from === undefined ? undefined : Address(from),
    nonce: nonce === undefined ? undefined : Hex(nonce),
    gasPrice: gasPrice === undefined ? undefined : Drip(gasPrice),
    gas: gas === undefined ? undefined : Hex(gas),
    to: Address(to),
    value: value === undefined ? undefined : Drip(value),
    data: data === undefined ? undefined : Hex(data),
  };
}

module.exports = {
  Hex,
  Drip,
  PrivateKey,
  Address,
  Epoch,
  BlockHash,
  TxHash,
  SendObject,
  CallObject,
};
