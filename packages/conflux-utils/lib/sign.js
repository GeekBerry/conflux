const crypto = require('crypto');
const rlp = require('rlp');
const keccak = require('keccak');
const scryptJs = require('scrypt.js');
const secp256k1 = require('secp256k1');
const elliptic = require('elliptic');

const secp256k1ec = new elliptic.ec('secp256k1');

// ----------------------------------------------------------------------------
/**
 * gen a random buffer with `size` bytes.
 *
 * > Note: call `crypto.randomBytes`
 *
 * @param size {number}
 * @return {Buffer}
 */
function randomBuffer(size) {
  return crypto.randomBytes(size);
}

/**
 * @param array {Buffer[]}
 * @return {Buffer}
 */
function rlpEncode(array) {
  return rlp.encode(array);
}

/**
 * keccak 256
 *
 * @param buffer {Buffer}
 * @return {Buffer}
 */
function sha3(buffer) {
  return keccak('keccak256').update(buffer).digest();
}

/**
 * @param key {Buffer}
 * @param iv {Buffer}
 * @param buffer {Buffer}
 * @return {Buffer}
 */
function cipheriv(key, iv, buffer) {
  return crypto.createCipheriv('aes-128-ctr', key, iv).update(buffer);
}

/**
 * @param key {Buffer}
 * @param iv {Buffer}
 * @param buffer {Buffer}
 * @return {Buffer}
 */
function decipheriv(key, iv, buffer) {
  return crypto.createDecipheriv('aes-128-ctr', key, iv).update(buffer);
}

/**
 * @param massageBuffer {Buffer}
 * @param privateBuffer {Buffer}
 * @return {{r: Buffer, s: Buffer, v: number}}
 */
function ecsign(massageBuffer, privateBuffer) {
  const sig = secp256k1.sign(sha3(massageBuffer), privateBuffer);
  return {
    r: sig.signature.slice(0, 32),
    s: sig.signature.slice(32, 64),
    v: sig.recovery,
  };
}

/**
 * @param key {Buffer}
 * @param salt {Buffer}
 * @return {Buffer}
 */
function scrypt32(key, salt) {
  return scryptJs(key, salt, 8192, 8, 1, 32);
}

module.exports = {
  randomBuffer,
  rlpEncode,
  secp256k1ec,
  sha3,
  cipheriv,
  decipheriv,
  ecsign,
  scrypt32,
};
