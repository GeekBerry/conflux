const { Hex, PrivateKey, Address } = require('../lib/type');
const {
  sha3,
  randomBuffer,
  randomPrivateKey,
  privateKeyToAddress,
  ecdsaSign,
  ecdsaRecover,
  encrypt,
  decrypt,
} = require('../lib/sign');

const KEY = '0xa816a06117e572ca7ae2f786a046d2bc478051d0717bf5cc4f5397923258d393';
const ADDRESS = '0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b';

test('randomBuffer', () => {
  const buffer1 = randomBuffer(32);
  const buffer2 = randomBuffer(32);

  expect(buffer1.length).toBe(32);
  expect(Hex(buffer1).length).toBe(2 + 64);
  expect(buffer1.equals(buffer2)).toBe(false);
});

test('randomPrivateKey', () => {
  const key1 = PrivateKey(randomPrivateKey());
  const key2 = PrivateKey(randomPrivateKey());
  expect(key1).not.toBe(key2);

  const entropy = Hex.toBuffer('0x0123456789012345678901234567890123456789012345678901234567890123');
  const key3 = PrivateKey(randomPrivateKey(entropy));
  const key4 = PrivateKey(randomPrivateKey(entropy));
  expect(key3).not.toBe(key4);
});

test('privateKeyToAddress', () => {
  const address = Address(privateKeyToAddress(Hex.toBuffer(KEY)));
  expect(address).toBe(ADDRESS);
});

test('encrypt and decrypt', () => {
  const { salt, iv, cipher, mac } = encrypt(Hex.toBuffer(KEY), Buffer.from('password'));

  expect(salt.length).toBe(32);
  expect(iv.length).toBe(16);
  expect(cipher.length).toBe(32);
  expect(mac.length).toBe(32);

  const key = Hex(decrypt({ salt, iv, cipher, mac }, Buffer.from('password')));
  expect(key).toBe(KEY);
});

test('ecdsaSign and ecdsaRecover', () => {
  const hash = randomBuffer(32);
  const { r, s, v } = ecdsaSign(hash, Hex.toBuffer(KEY));

  expect(r.length).toBe(32);
  expect(s.length).toBe(32);
  expect(Number.isInteger(v)).toBe(true);

  const publicKey = ecdsaRecover(hash, { r, s, v });
  const address = Hex(sha3(publicKey).slice(-20));
  expect(address).toBe(ADDRESS);
});
