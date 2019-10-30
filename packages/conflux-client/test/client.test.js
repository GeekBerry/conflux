const { Hex, EpochNumber } = require('conflux-utils/src/type');
const Client = require('../index');
// const MockProvider = require('./mock/provider');

// ----------------------------------------------------------------------------

test('Client()', () => {
  const client = new Client();

  expect(client.defaultEpoch).toBe(EpochNumber.LATEST_STATE);
  expect(client.defaultGasPrice).toBe(undefined);
  expect(client.defaultGas).toBe(undefined);
  expect(client.provider).toBe(null);
});

test('Client({...})', () => {
  const client = new Client({
    url: 'http://localhost:12537',
    defaultEpoch: EpochNumber.LATEST_MINED,
    defaultGasPrice: 100,
    defaultGas: 1000000,
  });

  expect(client.defaultEpoch).toBe(EpochNumber.LATEST_MINED);
  expect(client.defaultGasPrice).toBe(100);
  expect(client.defaultGas).toBe(1000000);
  expect(client.provider.constructor.name).toBe('HttpProvider');
});

test('Client.setProvider', () => {
  const client = new Client();
  expect(client.provider).toBe(null);

  client.setProvider('http://localhost:80');
  expect(client.provider.constructor.name).toBe('HttpProvider');

  client.setProvider('ws://localhost:443');
  expect(client.provider.constructor.name).toBe('WebsocketProvider');

  client.setProvider('');
  expect(client.provider).toBe(null);

  expect(() => client.setProvider()).toThrow('provider url must by string');
});

test('Client.close', () => {
  const client = new Client();

  client.close();
});
