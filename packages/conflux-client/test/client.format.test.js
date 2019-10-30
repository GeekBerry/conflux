const BigNumber = require('bignumber.js');
const { Hex, EpochNumber } = require('conflux-utils/src/type');

const Client = require('../index');
const MockProvider = require('./__mocks__/provider');

const KEY = '0xa816a06117e572ca7ae2f786a046d2bc478051d0717bf5cc4f5397923258d393';
const ADDRESS = '0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b';
const BLOCK_HASH = '0xe0b0000000000000000000000000000000000000000000000000000000000000';
const TX_HASH = '0xb0a0000000000000000000000000000000000000000000000000000000000000';
const DEFAULT_GAS = 100;
const DEFAULT_GAS_PRICE = 1000000;

// ----------------------------------------------------------------------------
const client = new Client({
  defaultGas: DEFAULT_GAS,
  defaultGasPrice: DEFAULT_GAS_PRICE,
});
client.provider = new MockProvider();

beforeAll(() => {
  expect(client.defaultEpoch).toBe(EpochNumber.LATEST_STATE);
  expect(client.defaultGas).toBe(DEFAULT_GAS);
  expect(client.defaultGasPrice).toBe(DEFAULT_GAS_PRICE);
});

test('getLogs', async () => {
  await expect(client.getLogs()).rejects.toThrow('Cannot destructure property');

  client.provider.call = async (method, options) => {
    expect(method).toBe('cfx_getLogs');
    expect(options.fromEpoch).toBe(undefined);
    expect(options.toEpoch).toBe(undefined);
    expect(options.address).toBe(undefined);
    expect(options.topics).toBe(undefined);
  };
  await client.getLogs({});

  client.provider.call = async (method, options) => {
    expect(method).toBe('cfx_getLogs');
    expect(options.fromEpoch).toBe('0x00');
    expect(options.toEpoch).toBe(EpochNumber.LATEST_MINED);
    expect(options.address).toBe(ADDRESS);
    expect(Array.isArray(options.topics)).toBe(true);
  };
  await client.getLogs({
    fromEpoch: 0,
    toEpoch: EpochNumber.LATEST_MINED,
    address: Hex.toBuffer(ADDRESS),
    topics: [],
  });
});

test('getBalance', async () => {
  await expect(client.getBalance()).rejects.toThrow('do not match hex string');

  client.provider.call = async (method, address, epochNumber) => {
    expect(method).toBe('cfx_getBalance');
    expect(address).toBe(ADDRESS);
    expect(epochNumber).toBe(client.defaultEpoch);
  };
  await client.getBalance(ADDRESS);
  await client.getBalance(ADDRESS.replace('0x', ''));
  await client.getBalance(ADDRESS, EpochNumber.LATEST_STATE);

  client.provider.call = async (method, address, epochNumber) => {
    expect(method).toBe('cfx_getBalance');
    expect(address).toBe(ADDRESS);
    expect(epochNumber).toBe('0x00');
  };
  await client.getBalance(ADDRESS, 0);
});

test('getTransactionCount', async () => {
  await expect(client.getTransactionCount()).rejects.toThrow('do not match hex string');

  client.provider.call = async (method, address, epochNumber) => {
    expect(method).toBe('cfx_getTransactionCount');
    expect(address).toBe(ADDRESS);
    expect(epochNumber).toBe(client.defaultEpoch);
  };
  await client.getTransactionCount(ADDRESS);
  await client.getTransactionCount(ADDRESS.replace('0x', ''));
  await client.getTransactionCount(ADDRESS, EpochNumber.LATEST_STATE);

  client.provider.call = async (method, address, epochNumber) => {
    expect(method).toBe('cfx_getTransactionCount');
    expect(address).toBe(ADDRESS);
    expect(epochNumber).toBe('0x00');
  };
  await client.getTransactionCount(ADDRESS, 0);
});

test('getBlocksByEpoch', async () => {
  await expect(client.getBlocksByEpoch()).rejects.toThrow('do not match hex string');

  client.provider.call = async (method, epochNumber) => {
    expect(method).toBe('cfx_getBlocksByEpoch');
    expect(epochNumber).toBe('0x00');
  };
  await client.getBlocksByEpoch(0);
});

test('getBlockByHash', async () => {
  await expect(client.getBlockByHash()).rejects.toThrow('do not match hex string');
  await expect(client.getBlockByHash(ADDRESS)).rejects.toThrow('do not match BlockHash');
  await expect(client.getBlockByHash(BLOCK_HASH, 0)).rejects.toThrow('detail must be boolean');

  client.provider.call = async (method, blockHash, detail) => {
    expect(method).toBe('cfx_getBlockByHash');
    expect(blockHash).toBe(BLOCK_HASH);
    expect(detail).toBe(false);
  };
  await client.getBlockByHash(BLOCK_HASH);
  await client.getBlockByHash(BLOCK_HASH.replace('0x', ''));
  await client.getBlockByHash(BLOCK_HASH, false);

  client.provider.call = async (method, blockHash, detail) => {
    expect(method).toBe('cfx_getBlockByHash');
    expect(blockHash).toBe(BLOCK_HASH);
    expect(detail).toBe(true);
  };
  await client.getBlockByHash(BLOCK_HASH, true);
});

test('getBlockByEpochNumber', async () => {
  await expect(client.getBlockByEpochNumber()).rejects.toThrow('do not match hex string');
  await expect(client.getBlockByEpochNumber(0, 1)).rejects.toThrow('detail must be boolean');

  client.provider.call = async (method, epochNumber, detail) => {
    expect(method).toBe('cfx_getBlockByEpochNumber');
    expect(epochNumber).toBe(client.defaultEpoch);
    expect(detail).toBe(false);
  };
  await client.getBlockByEpochNumber(EpochNumber.LATEST_STATE);
  await client.getBlockByEpochNumber(EpochNumber.LATEST_STATE, false);

  client.provider.call = async (method, epochNumber, detail) => {
    expect(method).toBe('cfx_getBlockByEpochNumber');
    expect(epochNumber).toBe('0x00');
    expect(detail).toBe(true);
  };
  await client.getBlockByEpochNumber(0, true);
  await client.getBlockByEpochNumber('0', true);
});

test('getBlockByHashWithPivotAssumption', async () => {
  // TODO
});

test('getRiskCoefficient', async () => {
  // TODO
});

test('getTransactionByHash', async () => {
  await expect(client.getTransactionByHash()).rejects.toThrow('do not match hex string');
  await expect(client.getTransactionByHash(ADDRESS)).rejects.toThrow('do not match TxHash');

  client.provider.call = async (method, txHash) => {
    expect(method).toBe('cfx_getTransactionByHash');
    expect(txHash).toBe(TX_HASH);
  };
  await client.getTransactionByHash(TX_HASH);
  await client.getTransactionByHash(TX_HASH.replace('0x', ''));
});

test('getTransactionReceipt', async () => {
  await expect(client.getTransactionReceipt()).rejects.toThrow('do not match hex string');
  await expect(client.getTransactionReceipt(ADDRESS)).rejects.toThrow('do not match TxHash');

  client.provider.call = async (method, txHash) => {
    expect(method).toBe('cfx_getTransactionReceipt');
    expect(txHash).toBe(TX_HASH);
  };
  await client.getTransactionReceipt(TX_HASH);
  await client.getTransactionReceipt(TX_HASH.replace('0x', ''));
});

test('sendTransaction by address', async () => {
  client.getTransactionCount = async (address) => {
    expect(address).toBe(ADDRESS);
    return 0;
  };

  await expect(client.sendTransaction()).rejects.toThrow('Cannot read property');
  await expect(client.sendTransaction({ nonce: 0 })).rejects.toThrow('`from` is required and should match `Address`');

  client.provider.call = async (method, options) => {
    expect(method).toBe('cfx_sendTransaction');
    expect(options.from).toBe(ADDRESS);
    expect(options.nonce).toBe('0x00');
    expect(options.gasPrice).toBe(Hex(client.defaultGasPrice));
    expect(options.gas).toBe(Hex(client.defaultGas));
    expect(options.to).toBe(undefined);
    expect(options.value).toBe(undefined);
    expect(options.data).toBe('0x');
  };
  await client.sendTransaction({ from: ADDRESS });
  await client.sendTransaction({ nonce: 0, from: ADDRESS });

  client.provider.call = async (method, options) => {
    expect(method).toBe('cfx_sendTransaction');
    expect(options.from).toBe(ADDRESS);
    expect(options.nonce).toBe('0x64');
    expect(options.gasPrice).toBe(Hex(client.defaultGasPrice));
    expect(options.gas).toBe('0x01');
    expect(options.to).toBe(ADDRESS);
    expect(options.value).toBe('0x00');
    expect(options.data).toBe('0x');
  };
  await client.sendTransaction({
    nonce: '100',
    from: ADDRESS.replace('0x', ''),
    to: Hex.toBuffer(ADDRESS),
    gas: BigNumber(1),
    value: 0,
    data: '',
  });
});

test('sendTransaction by account', async () => {
  const account = client.wallet.add(KEY);

  client.getTransactionCount = async (address) => {
    expect(Hex(address)).toBe(ADDRESS);
    return 0;
  };

  client.provider.call = async (method, hex) => {
    expect(method).toBe('cfx_sendRawTransaction');
    expect(Hex.isHex(hex)).toBe(true);
  };
  await client.sendTransaction({ from: account });
});

test('sendRawTransaction', async () => {
  await expect(client.sendRawTransaction()).rejects.toThrow('do not match hex string');

  client.provider.call = async (method, txHash) => {
    expect(method).toBe('cfx_sendRawTransaction');
    expect(txHash).toBe('0x01ff');
  };
  await client.sendRawTransaction('01ff');
  await client.sendRawTransaction(Buffer.from([1, 255]));
});

test('getCode', async () => {
  await expect(client.getCode()).rejects.toThrow('do not match hex string');

  client.provider.call = async (method, address, epochNumber) => {
    expect(method).toBe('cfx_getCode');
    expect(address).toBe(ADDRESS);
    expect(epochNumber).toBe(client.defaultEpoch);
  };
  await client.getCode(ADDRESS);
  await client.getCode(ADDRESS.replace('0x', ''));
  await client.getCode(ADDRESS, client.defaultEpoch);

  client.provider.call = async (method, address, epochNumber) => {
    expect(method).toBe('cfx_getCode');
    expect(address).toBe(ADDRESS);
    expect(epochNumber).toBe('0x00');
  };
  await client.getCode(ADDRESS, 0);
});

test('call', async () => {
  client.getTransactionCount = async (address) => {
    expect(Hex(address)).toBe(ADDRESS);
    return 100;
  };

  await expect(client.call()).rejects.toThrow('Cannot read property');
  await expect(client.call({ nonce: 0 })).rejects.toThrow('`to` is required and should match `Address`');

  client.provider.call = async (method, options, epochNumber) => {
    expect(method).toBe('cfx_call');

    expect(options.from).toBe(undefined);
    expect(options.nonce).toBe(undefined);
    expect(options.gasPrice).toBe(Hex(client.defaultGasPrice));
    expect(options.gas).toBe(Hex(client.defaultGas));
    expect(options.to).toBe(ADDRESS);
    expect(options.value).toBe(undefined);
    expect(options.data).toBe(undefined);

    expect(epochNumber).toBe(client.defaultEpoch);
  };
  await client.call({ to: ADDRESS });

  client.provider.call = async (method, options, epochNumber) => {
    expect(method).toBe('cfx_call');

    expect(options.from).toBe(ADDRESS);
    expect(options.nonce).toBe('0x64');
    expect(options.gasPrice).toBe(Hex(client.defaultGasPrice));
    expect(options.gas).toBe('0x01');
    expect(options.to).toBe(ADDRESS);
    expect(options.value).toBe('0x64');
    expect(options.data).toBe('0x');

    expect(epochNumber).toBe(EpochNumber.EARLIEST);
  };
  await client.call(
    {
      from: Hex.toBuffer(ADDRESS),
      to: Hex.toBuffer(ADDRESS),
      gas: BigNumber(1),
      value: '100',
      data: '',
    },
    EpochNumber.EARLIEST,
  );
});

test('estimateGas', async () => {
  client.getTransactionCount = async (address) => {
    expect(Hex(address)).toBe(ADDRESS);
    return 100;
  };

  await expect(client.estimateGas()).rejects.toThrow('Cannot read property');
  await expect(client.estimateGas({ nonce: 0 })).rejects.toThrow('`to` is required and should match `Address`');

  client.provider.call = async (method, options) => {
    expect(method).toBe('cfx_estimateGas');

    expect(options.from).toBe(undefined);
    expect(options.nonce).toBe(undefined);
    expect(options.gasPrice).toBe(Hex(client.defaultGasPrice));
    expect(options.gas).toBe(Hex(client.defaultGas));
    expect(options.to).toBe(ADDRESS);
    expect(options.value).toBe(undefined);
    expect(options.data).toBe(undefined);
  };
  await client.estimateGas({ to: ADDRESS });

  client.provider.call = async (method, options) => {
    expect(method).toBe('cfx_estimateGas');

    expect(options.from).toBe(ADDRESS);
    expect(options.nonce).toBe('0x64');
    expect(options.gasPrice).toBe(Hex(client.defaultGasPrice));
    expect(options.gas).toBe('0x01');
    expect(options.to).toBe(ADDRESS);
    expect(options.value).toBe('0x64');
    expect(options.data).toBe('0x');
  };
  await client.estimateGas(
    {
      from: Hex.toBuffer(ADDRESS),
      to: Hex.toBuffer(ADDRESS),
      gas: BigNumber(1),
      value: '100',
      data: '',
    },
  );
});
