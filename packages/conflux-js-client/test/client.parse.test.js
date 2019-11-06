const lodash = require('lodash');
const BigNumber = require('bignumber.js');
const { Hex } = require('conflux-js-utils/src/type');

const Client = require('../index');
const MockProvider = require('./__mocks__/provider');

const ADDRESS = '0xa000000000000000000000000000000000000001';
const BLOCK_HASH = '0xe1b0000000000000000000000000000000000000000000000000000000000001';
const TX_HASH = '0xb0a0000000000000000000000000000000000000000000000000000000000000';

// ----------------------------------------------------------------------------
const client = new Client();
client.provider = new MockProvider();

test('gasPrice', async () => {
  const gasPrice = await client.gasPrice();

  expect(Number.isInteger(gasPrice)).toBe(true);
});

test('epochNumber', async () => {
  const epochNumber = await client.epochNumber();

  expect(Number.isInteger(epochNumber)).toBe(true);
});

test('getBalance', async () => {
  const balance = await client.getBalance(ADDRESS);

  expect(BigNumber.isBigNumber(balance)).toBe(true);
  expect(balance.isInteger()).toBe(true);
});

test('getTransactionCount', async () => {
  const txCount = await client.getTransactionCount(ADDRESS);

  expect(Number.isInteger(txCount)).toBe(true);
});

test('getBlocksByEpoch', async () => {
  const blockHashArray = await client.getBlocksByEpoch(0);

  expect(Array.isArray(blockHashArray)).toBe(true);
  blockHashArray.forEach(txHash => {
    expect(Hex.isHex32(txHash)).toBe(true);
  });
});

test('getBlockByHash', async () => {
  const block = await client.getBlockByHash(BLOCK_HASH);

  expect(Hex.isHex32(block.hash)).toBe(true);
  expect(Hex.isHex20(block.miner)).toBe(true);
  expect(Hex.isHex32(block.parentHash)).toBe(true);
  expect(Hex.isHex(block.transactionsRoot)).toBe(true);
  expect(Hex.isHex(block.deferredLogsBloomHash)).toBe(true);
  expect(Hex.isHex(block.deferredReceiptsRoot)).toBe(true);
  expect(Hex.isHex(block.deferredStateRoot)).toBe(true);
  expect(lodash.isBoolean(block.adaptive)).toBe(true);
  // expect(lodash.isBoolean(block.stable)).toBe(true); ???
  expect(Number.isInteger(block.blame)).toBe(true);
  expect(Number.isInteger(block.epochNumber)).toBe(true);
  expect(Number.isInteger(block.size)).toBe(true);
  expect(Number.isInteger(block.height)).toBe(true);
  expect(Number.isInteger(block.timestamp)).toBe(true);
  expect(block.nonce.startsWith('0x')).toBe(true);
  expect(BigNumber.isBigNumber(block.gasLimit)).toBe(true);
  expect(BigNumber.isBigNumber(block.difficulty)).toBe(true);
  expect(Array.isArray(block.refereeHashes)).toBe(true);
  expect(Array.isArray(block.transactions)).toBe(true);
  expect(lodash.isPlainObject(block.deferredStateRootWithAux)).toBe(true);
  block.transactions.forEach(txHash => {
    expect(Hex.isHex32(txHash)).toBe(true);
  });

  const blockDetail = await client.getBlockByHash(BLOCK_HASH, true);
  expect(Array.isArray(blockDetail.transactions)).toBe(true);
  blockDetail.transactions.forEach(tx => {
    expect(lodash.isPlainObject(tx)).toBe(true);
  });
});

test('getBlockByEpochNumber', async () => {
  const block = await client.getBlockByEpochNumber(1);
  expect(block.epochNumber).toBe(1);
});

test('getBlockByHashWithPivotAssumption', async () => {
  const block = await client.getBlockByHashWithPivotAssumption(
    '0xe1b0000000000000000000000000000000000000000000000000000000000000',
    '0xe1b0000000000000000000000000000000000000000000000000000000000001',
    1,
  );
  expect(block.hash).toBe('0xe1b0000000000000000000000000000000000000000000000000000000000000');
  expect(block.epochNumber).toBe(1);
});

test('getTransactionByHash', async () => {
  const transaction = await client.getTransactionByHash(TX_HASH);

  expect(Hex.isHex32(transaction.blockHash)).toBe(true);
  expect(Hex.isHex32(transaction.hash)).toBe(true);
  expect(Hex.isHex20(transaction.from)).toBe(true);
  expect(Hex.isHex20(transaction.to)).toBe(true);
  expect(transaction.data.startsWith('0x')).toBe(true);
  expect(Hex.isHex32(transaction.r)).toBe(true);
  expect(Hex.isHex32(transaction.s)).toBe(true);
  expect(Hex.isHex20(transaction.contractCreated) || lodash.isNull(transaction.contractCreated)).toBe(true);
  expect(Number.isInteger(transaction.transactionIndex)).toBe(true);
  expect(Number.isInteger(transaction.nonce)).toBe(true);
  expect(Number.isInteger(transaction.status)).toBe(true);
  expect(Number.isInteger(transaction.v)).toBe(true);
  expect(BigNumber.isBigNumber(transaction.gas)).toBe(true);
  expect(BigNumber.isBigNumber(transaction.gasPrice)).toBe(true);
  expect(BigNumber.isBigNumber(transaction.value)).toBe(true);
});

test('getTransactionReceipt', async () => {
  const receipt = await client.getTransactionReceipt(TX_HASH);

  expect(Hex.isHex32(receipt.blockHash)).toBe(true);
  expect(Hex.isHex32(receipt.transactionHash)).toBe(true);
  expect(Hex.isHex20(receipt.from)).toBe(true);
  expect(Hex.isHex20(receipt.to)).toBe(true);
  expect(Hex.isHex(receipt.logsBloom)).toBe(true);
  expect(Hex.isHex(receipt.stateRoot)).toBe(true);
  expect(Hex.isHex20(receipt.contractCreated) || lodash.isNull(receipt.contractCreated)).toBe(true);
  expect(Number.isInteger(receipt.index)).toBe(true);
  expect(Number.isInteger(receipt.epochNumber)).toBe(true);
  expect(Number.isInteger(receipt.outcomeStatus)).toBe(true);
  expect(BigNumber.isBigNumber(receipt.gasUsed)).toBe(true);
  expect(Array.isArray(receipt.logs)).toBe(true);
});

test('sendTransaction by address', async () => {
  const promise = client.sendTransaction({
    nonce: 0,
    from: ADDRESS,
    gasPrice: 100,
    gas: 21000,
  });

  const txHash = await promise;
  expect(Hex.isHex(txHash)).toBe(true);

  const transactionCreated = await promise.get({ delta: 0 });
  expect(Hex.isHex32(transactionCreated.hash)).toBe(true);

  const transactionMined = await promise.mined();
  expect(Hex.isHex32(transactionMined.blockHash)).toBe(true);

  const receiptExecute = await promise.executed();
  expect(receiptExecute.outcomeStatus).toBe(0);

  const receiptConfirmed = await promise.confirmed({ bar: 0.01 });
  expect(receiptConfirmed.outcomeStatus).toBe(0);

  await expect(promise.confirmed({ timeout: 0 })).rejects.toThrow('Timeout');
});
