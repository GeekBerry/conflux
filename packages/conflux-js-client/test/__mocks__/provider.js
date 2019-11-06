const { Hex, EpochNumber } = require('conflux-js-utils/src/type');
const { randomBuffer } = require('conflux-js-utils/src/sign');
const BaseProvider = require('../../lib/provider/base');
const data = require('./data.json');

const fullNode = {
  cfx_gasPrice() {
    return Hex(randomBuffer(1));
  },

  cfx_epochNumber() {
    return Hex(randomBuffer(2));
  },

  cfx_getLogs() {
    return []; // TODO
  },

  cfx_getBalance(address, epochNumber) {
    if (epochNumber === EpochNumber.EARLIEST || epochNumber === '0x00') {
      return '0x0';
    }
    return Hex(randomBuffer(4));
  },

  cfx_getTransactionCount(address, epochNumber) {
    if (epochNumber === EpochNumber.EARLIEST || epochNumber === '0x00') {
      return '0x0';
    }
    return Hex(randomBuffer(1));
  },

  cfx_getBlocksByEpoch(epochNumber) {
    if (epochNumber === EpochNumber.EARLIEST || epochNumber === '0x00') {
      return data.epoch[epochNumber];
    } else if (epochNumber === '0x01') {
      return data.epoch[epochNumber];
    }
    throw new Error('{"code":-32602,"message":"Invalid params: expected a numbers with less than largest epoch number."}');
  },

  cfx_getBlockByHash(blockHash, detail) {
    const block = data.block[blockHash];
    if (!block) {
      return null;
    }

    if (detail) {
      block.transactions = block.transactions.map(txHash => data.transaction[txHash]);
    }

    return block;
  },

  cfx_getBlockByEpochNumber(epochNumber, detail) {
    const blockHashArray = this.cfx_getBlocksByEpoch(epochNumber);
    return this.cfx_getBlockByHash(blockHashArray[blockHashArray.length - 1], detail);
  },

  cfx_getTransactionByHash(txHash) {
    return data.transaction[txHash] || null;
  },

  cfx_getBlockByHashWithPivotAssumption(blockHash, pivotBlockHash, epochNumber) {
    const blockHashArray = this.cfx_getBlocksByEpoch(epochNumber);
    if (blockHashArray.includes(blockHash) && blockHashArray[blockHashArray.length - 1] === pivotBlockHash) {
      return this.cfx_getBlockByHash(blockHash);
    }
    // throw new Error('{"code":-32602,"message":"Invalid params: expected a numbers with less than largest epoch number."}');
  },

  cfx_getTransactionReceipt(txHash) {
    return data.receipt[txHash] || null;
  },

  cfx_sendTransaction() {
    return '0xb0a0000000000000000000000000000000000000000000000000000000000000';
  },

  cfx_sendRawTransaction() {
    return '0xb0a0000000000000000000000000000000000000000000000000000000000000';
  },

  cfx_call() {
    return '0x0000000000000000000000000000000000000000000000000000000000000064';
  },

  cfx_estimateGas() {
    return '0x5208';
  },
};

// ==========================================================================
class MockProvider extends BaseProvider {
  async call(method, ...params) {
    const startTime = Date.now();
    const data = { jsonrpc: '2.0', id: this.requestId(), method, params };

    let result;
    let error;
    try {
      result = fullNode[method](...params);
    } catch (e) {
      error = e;
    }

    if (error) {
      this.logger.error({ data, error, duration: Date.now() - startTime });
      throw new BaseProvider.RPCError(error);
    } else {
      this.logger.info({ data, result, duration: Date.now() - startTime });
    }

    return result;
  }

  close() {}
}

module.exports = MockProvider;
