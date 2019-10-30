const BigNumber = require('bignumber.js');
const {
  Hex,
  UInt,
  Drip,
  PrivateKey,
  Address,
  EpochNumber,
  BlockHash,
  TxHash,
} = require('../src/type');

const ADDRESS = '0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b';
const KEY = '0xa816a06117e572ca7ae2f786a046d2bc478051d0717bf5cc4f5397923258d393';

// ----------------------------------------------------------------------------
test('Hex(null)', () => {
  expect(() => Hex()).toThrow('do not match hex string');
  expect(() => Hex(undefined)).toThrow('do not match hex string');
  expect(Hex(null)).toBe('0x');
});

test('Hex(string)', () => {
  expect(Hex('')).toBe('0x');
  expect(Hex('0x')).toBe('0x');

  expect(Hex('1234')).toBe('0x1234');
  expect(Hex('0x1234')).toBe('0x1234');

  expect(Hex('a')).toBe('0x0a');
  expect(() => Hex('x')).toThrow('do not match hex string');
  expect(() => Hex(' a')).toThrow('do not match hex string');
  expect(() => Hex('a ')).toThrow('do not match hex string');

  expect(Hex('0xa')).toBe('0x0a');
  expect(Hex('0x0A')).toBe('0x0a');
});

test('Hex(Buffer)', () => {
  expect(Hex(Buffer.from([]))).toBe('0x');
  expect(Hex(Buffer.from([1, 10, 255]))).toBe('0x010aff');
});

test('Hex(Number)', () => {
  expect(() => Hex(-1)).toThrow('do not match hex string');
  expect(Hex(0)).toBe('0x00');
  expect(Hex(1)).toBe('0x01');
  expect(() => Hex(3.14)).toThrow('do not match hex string');
  expect(Hex(256)).toBe('0x0100');
  expect(Hex(0x1fffffffffffff)).toBe('0x1fffffffffffff');
});

test('Hex(BigNumber)', () => {
  expect(() => Hex(BigNumber(-1))).toThrow('do not match hex string');
  expect(Hex(BigNumber(0))).toBe('0x00');
  expect(Hex(BigNumber(1))).toBe('0x01');
  expect(() => Hex(BigNumber(3.14))).toThrow('do not match hex string');
  expect(Hex(BigNumber(256))).toBe('0x0100');
  expect(Hex(BigNumber(0x1fffffffffffff))).toBe('0x1fffffffffffff');

  expect(() => Hex(BigNumber(0.01).times(10))).toThrow('do not match hex string');
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
  expect(() => Hex.toBuffer('ff')).toThrow('do not match hex string');
  expect(() => Hex.toBuffer(0xff)).toThrow('do not match hex string');
});

test('UInt', () => {
  expect(() => UInt(undefined)).toThrow('do not match hex string');

  expect(UInt(100)).toBe('0x64');
  expect(UInt('100')).toBe('0x64');
  expect(UInt('0100')).toBe('0x64');
  expect(() => UInt(-100)).toThrow('do not match hex string');

  expect(UInt(true)).toBe('0x01');
  expect(UInt(null)).toBe('0x00');
});

test('Drip', () => {
  expect(() => Drip(undefined)).toThrow('do not match hex string');
  expect(() => Drip(null)).toThrow('do not match hex string');

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
  expect(() => Drip.fromGDrip(BigNumber(0.1).div(1e9))).toThrow('GDrip to Drip in integer');

  expect(Drip.toGDrip('1000000000').toString()).toBe('1');
});

test('Drip.fromCFX', () => {
  expect(Drip.fromCFX(0)).toBe('0x00');
  expect(Drip.fromCFX(0.01)).toBe('0x2386f26fc10000');
  expect(Drip.fromCFX(1)).toBe('0x0de0b6b3a7640000');
  expect(() => Drip.fromCFX(BigNumber(0.1).div(1e9).div(1e9))).toThrow('CFX to Drip in integer');

  expect(Drip.toCFX('1000000000000000000').toString()).toBe('1');
});

test('PrivateKey', () => {
  expect(() => PrivateKey(undefined)).toThrow('do not match hex string');

  expect(PrivateKey(KEY)).toBe(KEY);
  expect(PrivateKey(KEY.toUpperCase())).toBe(KEY);
  expect(PrivateKey(KEY.replace('0x', ''))).toBe(KEY);
  expect(() => PrivateKey(ADDRESS)).toThrow('do not match PrivateKey');
});

test('Address', () => {
  expect(() => Address(undefined)).toThrow('do not match hex string');

  expect(Address(ADDRESS)).toBe(ADDRESS);
  expect(Address(ADDRESS.toUpperCase())).toBe(ADDRESS);
  expect(Address(ADDRESS.replace('0x', ''))).toBe(ADDRESS);
  expect(() => Address(KEY)).toThrow('do not match Address');
});

test('EpochNumber', () => {
  expect(() => EpochNumber(undefined)).toThrow('do not match hex string');

  expect(EpochNumber(null)).toBe('0x00');
  expect(EpochNumber(0)).toBe('0x00');
  expect(EpochNumber('100')).toBe('0x64');
  expect(EpochNumber(EpochNumber.EARLIEST)).toBe(EpochNumber.EARLIEST);
  expect(EpochNumber(EpochNumber.EARLIEST.toUpperCase())).toBe(EpochNumber.EARLIEST);
  expect(EpochNumber(EpochNumber.LATEST_STATE)).toBe(EpochNumber.LATEST_STATE);
  expect(EpochNumber(EpochNumber.LATEST_MINED)).toBe(EpochNumber.LATEST_MINED);
  expect(() => EpochNumber('xxxxxxx')).toThrow('do not match hex string');
});

test('BlockHash', () => {
  expect(() => BlockHash(undefined)).toThrow('do not match hex string');

  expect(BlockHash('0123456789012345678901234567890123456789012345678901234567890123'))
    .toBe('0x0123456789012345678901234567890123456789012345678901234567890123');

  expect(BlockHash('0x0123456789012345678901234567890123456789012345678901234567890123'))
    .toBe('0x0123456789012345678901234567890123456789012345678901234567890123');

  expect(() => BlockHash(ADDRESS)).toThrow('do not match BlockHash');
});

test('TxHash', () => {
  expect(() => TxHash(undefined)).toThrow('do not match hex string');

  expect(TxHash('0123456789012345678901234567890123456789012345678901234567890123'))
    .toBe('0x0123456789012345678901234567890123456789012345678901234567890123');

  expect(TxHash('0x0123456789012345678901234567890123456789012345678901234567890123'))
    .toBe('0x0123456789012345678901234567890123456789012345678901234567890123');

  expect(() => TxHash(ADDRESS)).toThrow('do not match TxHash');
});
