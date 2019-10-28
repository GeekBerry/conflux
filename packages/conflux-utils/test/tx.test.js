const Transaction = require('../lib/tx');

const ADDRESS = '0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b';
const KEY = '0xa816a06117e572ca7ae2f786a046d2bc478051d0717bf5cc4f5397923258d393';

test('Transaction', () => {
  const tx = new Transaction({
    nonce: 0,
    gasPrice: 1,
    gas: 21000,
    to: '0x0123456789012345678901234567890123456789',
    value: 0,
  });

  expect(tx.nonce).toBe('0x00');
  expect(tx.gasPrice).toBe('0x01');
  expect(tx.gas).toBe('0x5208');
  expect(tx.to).toBe('0x0123456789012345678901234567890123456789');
  expect(tx.value).toBe('0x00');
  expect(tx.data).toBe('0x');
  expect(tx.r).toBe(undefined);
  expect(tx.s).toBe(undefined);
  expect(tx.v).toBe(undefined);
  expect(tx.from).toBe(undefined); // virtual attribute
  expect(tx.hash).toBe(undefined); // virtual attribute

  tx.sign(KEY);

  expect(tx.r).toBe('0x1fdeea421319a30193d3250779a0edfaac79f9bb0556b523d8e4f9cba85543e2');
  expect(tx.s).toBe('0x28c6e13c055fe689b540b921b8a2cd944738367c8eeecd18400560e11b4c6a4f');
  expect(tx.v).toBe('0x01');
  expect(tx.from).toBe(ADDRESS);
  expect(tx.hash).toBe('0xcf9eec4364c30176207e8972acfb358fb29b05569835125c458b94839651a724');
  expect(tx.serialize()).toBe('0xf85f8001825208940123456789012345678901234567890123456789808001a01fdeea421319a30193d3250779a0edfaac79f9bb0556b523d8e4f9cba85543e2a028c6e13c055fe689b540b921b8a2cd944738367c8eeecd18400560e11b4c6a4f');

  tx.value = '0x01';
  expect(tx.from).not.toBe(ADDRESS);
});
