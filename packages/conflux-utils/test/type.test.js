const BigNumber = require('bignumber.js');
const {
  Hex,
  Drip,
  PrivateKey,
  Address,
  Epoch,
  BlockHash,
  TxHash,
} = require('../lib/type');

const ADDRESS = '0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b';
const KEY = '0xa816a06117e572ca7ae2f786a046d2bc478051d0717bf5cc4f5397923258d393';

// ----------------------------------------------------------------------------
test('Hex(null)', () => {
  expect(() => Hex()).toThrowError('do not match hex string');
  expect(() => Hex(undefined)).toThrowError('do not match hex string');
  expect(Hex(null)).toBe('0x');
});

test('Hex(string)', () => {
  expect(Hex('')).toBe('0x');
  expect(Hex('0x')).toBe('0x');

  expect(Hex('1234')).toBe('0x1234');
  expect(Hex('0x1234')).toBe('0x1234');

  expect(Hex('a')).toBe('0x0a');
  expect(() => Hex('x')).toThrowError('do not match hex string');
  expect(() => Hex(' a')).toThrowError('do not match hex string');
  expect(() => Hex('a ')).toThrowError('do not match hex string');

  expect(Hex('0xa')).toBe('0x0a');
  expect(Hex('0x0A')).toBe('0x0a');
});

test('Hex(Buffer)', () => {
  expect(Hex(Buffer.from([]))).toBe('0x');
  expect(Hex(Buffer.from([1, 10, 255]))).toBe('0x010aff');
});

test('Hex(Number)', () => {
  expect(() => Hex(-1)).toThrowError('do not match hex string');
  expect(Hex(0)).toBe('0x00');
  expect(Hex(1)).toBe('0x01');
  expect(() => Hex(3.14)).toThrowError('do not match hex string');
  expect(Hex(256)).toBe('0x0100');
  expect(Hex(0x1fffffffffffff)).toBe('0x1fffffffffffff');
});

test('Hex(BigNumber)', () => {
  expect(() => Hex(BigNumber(-1))).toThrowError('do not match hex string');
  expect(Hex(BigNumber(0))).toBe('0x00');
  expect(Hex(BigNumber(1))).toBe('0x01');
  expect(() => Hex(BigNumber(3.14))).toThrowError('do not match hex string');
  expect(Hex(BigNumber(256))).toBe('0x0100');
  expect(Hex(BigNumber(0x1fffffffffffff))).toBe('0x1fffffffffffff');

  expect(() => Hex(BigNumber(0.01).times(10))).toThrowError('do not match hex string');
  expect(Hex(BigNumber(0.01).times(1e9).times(1e9))).toBe('0x2386f26fc10000');
});

test('Hex(Date)', () => {
  expect(Hex(new Date('1970-01-01T00:00:00.000Z'))).toBe('0x00');
  expect(Hex(new Date('1970-01-01T00:00:00.001Z'))).toBe('0x01');
  expect(Hex(new Date('2000-01-01T00:00:00.000Z'))).toBe('0xdc6acfac00');
  expect(Hex(new Date('2020-01-01T00:00:00.000Z'))).toBe('0x016f5e66e800');
});

test('Hex.toBuffer', () => {
  expect(Hex.toBuffer('0x').equals(Buffer.from(''))).toBe(true);
  expect(Hex.toBuffer('0x00').equals(Hex.toBuffer('0x'))).toBe(true);
  expect(Hex.toBuffer('0xff').equals(Buffer.from('ff', 'hex'))).toBe(true);
  expect(Hex.toBuffer('0x0102').equals(Buffer.from([1, 2]))).toBe(true);
  expect(() => Hex.toBuffer('ff')).toThrowError('do not match hex string');
  expect(() => Hex.toBuffer(0xff)).toThrowError('do not match hex string');
});

test('Drip', () => {
  expect(() => Drip(undefined)).toThrowError('do not match hex string');
  expect(() => Drip(null)).toThrowError('do not match hex string');

  expect(Drip(0)).toBe('0x00');
  expect(Drip(10)).toBe('0x0a');
  expect(Drip('100')).toBe('0x64');
  expect(Drip('0x100')).toBe('0x0100');
  expect(Drip(BigNumber(0.01).times(1e9).times(1e9))).toBe('0x2386f26fc10000');
});

test('Drip.fromGDrip', () => {
  expect(Drip.fromGDrip(0)).toBe('0x00');
  expect(Drip.fromGDrip(0.01)).toBe('0x989680');
  expect(Drip.fromGDrip(1)).toBe('0x3b9aca00');
});

test('Drip.fromCFX', () => {
  expect(Drip.fromCFX(0)).toBe('0x00');
  expect(Drip.fromCFX(0.01)).toBe('0x2386f26fc10000');
  expect(Drip.fromCFX(1)).toBe('0x0de0b6b3a7640000');
});

test('PrivateKey', () => {
  expect(() => PrivateKey(undefined)).toThrowError('do not match hex string');

  expect(PrivateKey(KEY)).toBe(KEY);
  expect(PrivateKey(KEY.toUpperCase())).toBe(KEY);
  expect(PrivateKey(KEY.replace('0x', ''))).toBe(KEY);
});

test('Address', () => {
  expect(() => Address(undefined)).toThrowError('do not match hex string');

  expect(Address(ADDRESS)).toBe(ADDRESS);
  expect(Address(ADDRESS.toUpperCase())).toBe(ADDRESS);
  expect(Address(ADDRESS.replace('0x', ''))).toBe(ADDRESS);
});

test('Epoch', () => {
  expect(() => Epoch(undefined)).toThrowError('do not match hex string');

  expect(Epoch(null)).toBe('0x00');
  expect(Epoch(0)).toBe('0x00');
  expect(Epoch('100')).toBe('0x64');
  expect(Epoch(Epoch.EARLIEST)).toBe(Epoch.EARLIEST);
  expect(Epoch(Epoch.EARLIEST.toUpperCase())).toBe(Epoch.EARLIEST);
  expect(Epoch(Epoch.LATEST_STATE)).toBe(Epoch.LATEST_STATE);
  expect(Epoch(Epoch.LATEST_MINED)).toBe(Epoch.LATEST_MINED);
  expect(() => Epoch('xxxxxxx')).toThrowError('do not match hex string');
});

test('BlockHash', () => {
  expect(() => BlockHash(undefined)).toThrowError('do not match hex string');

  expect(BlockHash('0123456789012345678901234567890123456789012345678901234567890123'))
    .toBe('0x0123456789012345678901234567890123456789012345678901234567890123');

  expect(BlockHash('0x0123456789012345678901234567890123456789012345678901234567890123'))
    .toBe('0x0123456789012345678901234567890123456789012345678901234567890123');

  expect(() => BlockHash(ADDRESS)).toThrowError('do not match BlockHash length');
});

test('TxHash', () => {
  expect(() => TxHash(undefined)).toThrowError('do not match hex string');

  expect(TxHash('0123456789012345678901234567890123456789012345678901234567890123'))
    .toBe('0x0123456789012345678901234567890123456789012345678901234567890123');

  expect(TxHash('0x0123456789012345678901234567890123456789012345678901234567890123'))
    .toBe('0x0123456789012345678901234567890123456789012345678901234567890123');

  expect(() => TxHash(ADDRESS)).toThrowError('do not match TxHash length');
});
