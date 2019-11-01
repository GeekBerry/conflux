const { Hex } = require('conflux-js-utils/src/type');
const Client = require('../index');
const MockProvider = require('./__mocks__/provider');
const { abi, code, address } = require('./__mocks__/contract.json');

const ADDRESS = '0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b';

// ----------------------------------------------------------------------------
const client = new Client({
  defaultGasPrice: 100,
  defaultGas: 1000000,
});
client.provider = new MockProvider();

test('Contract', async () => {
  let value;

  const contract = await client.Contract({ abi, code, address });

  expect(contract.address).toBe(address);
  expect(contract.constructor.code).toBe(code);

  const deployAddress = await contract.constructor(100).sendTransaction({ from: ADDRESS, nonce: 0 }).deployed();
  expect(Hex.isHex(deployAddress)).toBe(true);

  value = await contract.count();
  expect(value.toString()).toBe('100');

  value = await contract.inc(0).call({ from: ADDRESS, nonce: 0 });
  expect(value.toString()).toBe('100');

  value = await contract.count().estimateGas({ gasPrice: 101 });
  expect(value).toBe(21000);
});
