const lodash = require('lodash');
const { HttpProvider, WebsocketProvider } = require('../lib/provider');
const { Hex, Address, EpochNumber, BlockHash, TxHash } = require('conflux-utils/src/type');
const Transaction = require('conflux-utils/src/transaction');

const parse = require('./utils/parse');
const Contract = require('./contract');
const Wallet = require('./wallet');
const Subscribe = require('./subscribe');

/**
 * A client of conflux node.
 */
class Client {
  /**
   * @param [options] {object} - Client and Provider constructor options.
   * @param [options.url=''] {string} - Url of provider to create.
   * @param [options.defaultEpoch=EpochNumber.LATEST_STATE] {string|number} - Default epochNumber.
   * @param [options.defaultGasPrice] {string|number|BigNumber} - The default gas price in drip to use for transactions.
   * @param [options.defaultGas] {string|number|BigNumber} - The default maximum gas provided for a transaction (gasLimit).
   *
   * @example
   * > const client = new Client({url:'http://testnet-jsonrpc.conflux-chain.org:12537'});
   *
   * @example
   * > const client = new Client({
   *   url: 'http://localhost:8000',
   *   defaultGasPrice: 100,
   *   defaultGas: 100000,
   *   log: console.log,
   * });
   */
  constructor({
    url = '',
    defaultEpoch = EpochNumber.LATEST_STATE,
    defaultGasPrice,
    defaultGas,
    ...rest
  } = {}) {
    this.provider = this.setProvider(url, rest);
    this.wallet = new Wallet(this);

    this.defaultEpoch = defaultEpoch;
    this.defaultGasPrice = defaultGasPrice;
    this.defaultGas = defaultGas;

    this._afterExecution('sendRawTransaction', (result) => new Subscribe.PendingTransaction(this, result));
    this._afterExecution('sendTransaction', (result) => new Subscribe.PendingTransaction(this, result));
  }

  /**
   * Create and set `provider` for client.
   *
   * @param [url=''] {string} - Url of provider to create.
   * @param [options] {object} - Provider constructor options.
   * @return {Object}
   *
   * @example
   * > client.provider;
   HttpProvider {
     url: 'http://testnet-jsonrpc.conflux-chain.org:12537',
     timeout: 30000,
     ...
   }

   * > client.setProvider('http://localhost:8000');
   * > client.provider; // Options will be reset to default.
   HttpProvider {
     url: 'http://testnet-jsonrpc.conflux-chain.org:12537',
     timeout: 60000,
     ...
   }
   */
  setProvider(url, options) {
    if (typeof url !== 'string') {
      throw new Error('provider url must by string');
    }

    if (url === '') {
      this.provider = null;
    } else if (url.startsWith('http')) {
      this.provider = new HttpProvider(url, options);
    } else if (url.startsWith('ws')) {
      this.provider = new WebsocketProvider(url, options);
    } else {
      throw new Error(`Invalid protocol or url "${url}"`);
    }

    return this.provider;
  }

  _afterExecution(name, after) {
    const method = this[name].bind(this);
    this.constructor.prototype[name] = (...args) => after(method(...args));
  }

  /**
   * A shout cut for `new Contract(client, options);`
   *
   * @param options {object} - See `Contract.constructor`
   * @return {Contract}
   */
  Contract(options) {
    return new Contract(this, options);
  }

  /**
   * close client connection.
   *
   * @example
   * > client.close();
   */
  close() {
    if (this.provider) {
      this.provider.close();
    }
  }

  // --------------------------------------------------------------------------
  /**
   * Returns the current gas price oracle. The gas price is determined by the last few blocks median gas price.
   *
   * @return {Promise<number>} Gas price in drip.
   *
   * @example
   * > await client.gasPrice();
   0
   */
  async gasPrice() {
    const result = await this.provider.call('cfx_gasPrice');
    return parse.number(result);
  }

  /**
   * Returns the current epochNumber the client is on.
   *
   * @return {Promise<number>} EpochNumber
   *
   * @example
   * > await client.epochNumber();
   200109
   */
  async epochNumber() {
    const result = await this.provider.call('cfx_epochNumber');
    return parse.number(result);
  }

  /**
   * Gets past logs, matching the given options.
   *
   * @param [options] {object}
   * @param [options.fromEpoch] {string|number} - The number of the earliest block
   * @param [options.toEpoch] {string|number} - The number of the latest block
   * @param [options.address] {string|string[]} - An address or a list of addresses to only get logs from particular account(s).
   * @param [options.topics] {array} - An array of values which must each appear in the log entries. The order is important, if you want to leave topics out use null, e.g. [null, '0x12...']. You can also pass an array for each topic with options for that topic e.g. [null, ['option1', 'option2']]
   * @return {Promise<array>} Array of log objects.
   *
   * @example
   * > await client.getPastLogs({
      fromEpoch: 0,
      toEpoch: 'latest_mined',
      address: '0x169a10a431130B2F4853294A4a966803668af385'
    });
   */
  async getLogs({ fromEpoch, toEpoch, address, topics }) {
    return this.provider.call('cfx_getLogs', {
      fromEpoch: fromEpoch !== undefined ? EpochNumber(fromEpoch) : undefined,
      toEpoch: toEpoch !== undefined ? EpochNumber(toEpoch) : undefined,
      address: address !== undefined ? Address(address) : undefined,
      topics,
    });
  }

  // -------------------------------- address -----------------------------------
  /**
   * Get the balance of an address at a given epochNumber.
   *
   * @param address {string} - The address to get the balance of.
   * @param [epochNumber=this.defaultEpoch] {string|number} - The end epochNumber to count balance of.
   * @return {Promise<BigNumber>} Address balance number in drip.
   *
   * @example
   * > let balance = await client.getBalance("0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b");
   * > balance;
   BigNumber { s: 1, e: 18, c: [ 17936, 36034970586632 ] }

   * > Drip.toCFX(balance).toString(10);
   1.793636034970586632

   * > balance = await client.getBalance("0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b", 0);
   * > balance.toString(10);
   0
   */
  async getBalance(address, epochNumber = this.defaultEpoch) {
    const result = await this.provider.call('cfx_getBalance', Address(address), EpochNumber(epochNumber));
    return parse.bigNumber(result);
  }

  /**
   * Get the numbers of transactions sent from this address.
   *
   * @param address {string} - The address to get the numbers of transactions from.
   * @param [epochNumber=this.defaultEpoch] {string|number} - The end epochNumber to count transaction of.
   * @return {Promise<number>}
   *
   * @example
   * > await client.getTransactionCount("0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b");
   61

   * > await client.getTransactionCount("0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b", EpochNumber.EARLIEST);
   0
   */
  async getTransactionCount(address, epochNumber = this.defaultEpoch) {
    const result = await this.provider.call('cfx_getTransactionCount', Address(address), EpochNumber(epochNumber));
    return parse.number(result);
  }

  // -------------------------------- block -----------------------------------

  // TODO
  // async getBestBlockHash() {
  //   return this.provider.call('cfx_getBestBlockHash');
  // }

  /**
   * Get block hash array of a epochNumber.
   *
   * @param epochNumber {string|number} - EpochNumber or string in ["latest", "earliest", "pending"]
   * @return {Promise<string[]>} Block hash array, last one is the pivot block hash of this epochNumber.
   *
   * @example
   * > await client.getBlocksByEpoch(EpochNumber.EARLIEST); // same as `client.getBlocksByEpoch(0)`
   ['0x2da120ad267319c181b12136f9e36be9fba59e0d818f6cc789f04ee937b4f593']

   * > await client.getBlocksByEpoch(449);
   [
   '0x3d8b71208f81fb823f4eec5eaf2b0ec6b1457d381615eff2fbe24605ea333c39',
   '0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40'
   ]
   */
  async getBlocksByEpoch(epochNumber) {
    return this.provider.call('cfx_getBlocksByEpoch', EpochNumber(epochNumber));
  }

  /**
   * Returns a block matching the block hash.
   *
   * @param blockHash {string} - The hash of block to be get.
   * @param [detail=false] {boolean} - `true` return transaction object, `false` return TxHash array
   * @return {Promise<object|null>} Block info object.
   * - `string` miner: The address of the beneficiary to whom the mining rewards were given.
   * - `string|null` hash: Hash of the block. `null` when its pending block.
   * - `string` parentHash: Hash of the parent block.
   * - `string[]` refereeHashes: Array of referee hashes.
   * - `number|null` epochNumber: The current block epochNumber in the client's view. `null` when it's not in best block's past set.
   * - `boolean|null` stable: If the block stable or not. `null` for pending stable.
   * - `string` nonce: Hash of the generated proof-of-work. `null` when its pending block.
   * - `number` gas: The maximum gas allowed in this block.
   * - `string` difficulty: Integer string of the difficulty for this block.
   * - `number` height: The block heights. `null` when its pending block.
   * - `number` size: Integer the size of this block in bytes.
   * - `number` blame: 0 if there's nothing to blame; k if the block is blaming on the state info of its k-th ancestor.
   * - `boolean` adaptive: If the block's weight adaptive or not.
   * - `number` timestamp: The unix timestamp for when the block was collated.
   * - `string` transactionsRoot: The hash of the transactions of the block.
   * - `string[]` transactions: Array of transaction objects, or 32 Bytes transaction hashes depending on the last given parameter.
   * - `string` deferredLogsBloomHash: The hash of the deferred block's log bloom filter
   * - `string` deferredReceiptsRoot: The hash of the receipts of the block after deferred execution.
   * - `string` deferredStateRoot: The root of the final state trie of the block after deferred execution.
   * - `object` deferredStateRootWithAux: Information of deferred state root
   *
   * @example
   * > await client.getBlockByHash('0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40');
   {
    "miner": "0x0000000000000000000000000000000000000015",
    "hash": "0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40",
    "parentHash": "0xe75f82d86f51cdab5a2ed7b4e225c714d1fda7e0aa568c6b4618015ee6666506",
    "refereeHashes": [
      "0x3d8b71208f81fb823f4eec5eaf2b0ec6b1457d381615eff2fbe24605ea333c39"
    ],
    "epochNumber": 449,
    "stable": null,
    "nonce": 17364797680136698000,
    "gas": 3000000000,
    "difficulty": "20000000",
    "height": 449,
    "size": 384,
    "blame": 0,
    "adaptive": false,
    "timestamp": 1571150247,
    "transactionsRoot": "0x2b8f5e08ca12eb66ae89f40a6b52938222ce835f0b786cae0befdbbecd8b55e1"
    "transactions": [
      "0xbe007c3eca92d01f3917f33ae983f40681182cf618defe75f490a65aac016914"
    ],
    "deferredLogsBloomHash": "0xd397b3b043d87fcd6fad1291ff0bfd16401c274896d8c63a923727f077b8e0b5",
    "deferredReceiptsRoot": "0x522717233b96e0a03d85f02f8127aa0e23ef2e0865c95bb7ac577ee3754875e4",
    "deferredStateRoot": "0x39975f9bf46884e7c3c269577177af9a041c5e36a69ef2a4cf581f8a061fa911",
    "deferredStateRootWithAux": {
      "auxInfo": {
        "intermediateDeltaEpochId": "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        "previousSnapshotRoot": "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
      },
      "stateRoot": {
        "deltaRoot": "0x752a3f391da1a584812a9f50ec92542abda59c3cc0ad49741461471680cf1528",
        "intermediateDeltaRoot": "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        "snapshotRoot": "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
      }
    },
   }

   * @example
   * > await client.getBlockByHash('0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40', true);
   {
    "hash": "0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40",
    "transactions": [
      {
        "blockHash": "0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40",
        "transactionIndex": 0,
        "hash": "0xbe007c3eca92d01f3917f33ae983f40681182cf618defe75f490a65aac016914",
        "nonce": 0,
        "from": "0xa70ddf9b9750c575db453eea6a041f4c8536785a",
        "to": "0x63f0a574987f6893e068a08a3fb0e63aec3785e6",
        "value": "1000000000000000000"
        "data": "0x",
        "gas": 21000,
        "gasPrice": "819",
        "status": 0,
        "contractCreated": null,
        "r": "0x88e43a02a653d5895ffa5495718a5bd772cb157776108c5c22cee9beff890650",
        "s": "0x24e3ba1bb0d11c8b1da8d969ecd0c5e2372326a3de71ba1231c876c0efb2c0a8",
        "v": 0,
      }
    ],
    ...
   }
   */
  async getBlockByHash(blockHash, detail = false) {
    if (!lodash.isBoolean(detail)) {
      throw new Error('detail must be boolean');
    }
    const result = await this.provider.call('cfx_getBlockByHash', BlockHash(blockHash), detail);
    return parse.block(result);
  }

  /**
   * Get the epochNumber pivot block info.
   *
   * @param epochNumber {string|number} - EpochNumber or string in ["latest", "earliest", "pending"]
   * @param [detail=false] {boolean} - `true` return transaction object, `false` return TxHash array
   * @return {Promise<object|null>} The block info (same as `getBlockByHash`).
   *
   * @example
   * > await client.getBlockByEpochNumber(449);
   {
     hash: '0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40',
     ...
   }
   */
  async getBlockByEpochNumber(epochNumber, detail = false) {
    if (!lodash.isBoolean(detail)) {
      throw new Error('detail must be boolean');
    }
    const result = await this.provider.call('cfx_getBlockByEpochNumber', EpochNumber(epochNumber), detail);
    return parse.block(result);
  }

  /**
   * Get block by `blockHash` if pivot block of `epochNumber` is `pivotBlockHash`.
   *
   * @param blockHash {string} - Block hash which epochNumber expect to be `epochNumber`.
   * @param pivotBlockHash {string} - Block hash which expect to be the pivot block of `epochNumber`.
   * @param epochNumber {number} - EpochNumber or string in ["latest", "earliest", "pending"]
   * @return {Promise<object>} The block info (same as `getBlockByHash`).
   *
   * @example
   * > await client.getBlockByHashWithPivotAssumption(
   * '0x3d8b71208f81fb823f4eec5eaf2b0ec6b1457d381615eff2fbe24605ea333c39',
   * '0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40'
   * 449,
   * );
   {
     hash: '0x3d8b71208f81fb823f4eec5eaf2b0ec6b1457d381615eff2fbe24605ea333c39',
     ...
   }
   */
  async getBlockByHashWithPivotAssumption(blockHash, pivotBlockHash, epochNumber) {
    const result = await this.provider.call('cfx_getBlockByHashWithPivotAssumption',
      BlockHash(blockHash), BlockHash(pivotBlockHash), EpochNumber(epochNumber),
    );
    return parse.block(result);
  }

  async getRiskCoefficient(blockHash) {
    // FIXME rpc not implement yet.
    return 0;
  }

  // -------------------------------- transaction -----------------------------------
  /**
   * Returns a transaction matching the given transaction hash.
   *
   * @param txHash {string} - The transaction hash.
   * @return {Promise<object|null>} Transaction info object
   * - `string` blockHash: Hash of the block where this transaction was in and got executed. `null` when its pending.
   * - `number` transactionIndex: Integer of the transactions index position in the block.
   * - `string` hash: Hash of the transaction.
   * - `number` nonce: The number of transactions made by the sender prior to this one.
   * - `string` from: Address of the sender.
   * - `string` to: Address of the receiver. null when its a contract creation transaction.
   * - `string` value: Value transferred in Drip.
   * - `string` data: The data send along with the transaction.
   * - `number` gas: Gas provided by the sender.
   * - `number` gasPrice: Gas price provided by the sender in Drip.
   * - `string` status: '0x0' successful execution; '0x1' exception happened but nonce still increased; '0x2' exception happened and nonce didn't increase.
   * - `string|null` contractCreated: The contract address created, if the transaction was a contract creation, otherwise null.
   * - `string` r: ECDSA signature r
   * - `string` s: ECDSA signature s
   * - `string` v: ECDSA recovery id
   *
   * @example
   * > await client.getTransactionByHash('0xbe007c3eca92d01f3917f33ae983f40681182cf618defe75f490a65aac016914');
   {
      "blockHash": "0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40",
      "transactionIndex": 0,
      "hash": "0xbe007c3eca92d01f3917f33ae983f40681182cf618defe75f490a65aac016914",
      "nonce": 0,
      "from": "0xa70ddf9b9750c575db453eea6a041f4c8536785a",
      "to": "0x63f0a574987f6893e068a08a3fb0e63aec3785e6",
      "value": "1000000000000000000"
      "data": "0x",
      "gas": 21000,
      "gasPrice": "819",
      "status": 0,
      "contractCreated": null,
      "r": "0x88e43a02a653d5895ffa5495718a5bd772cb157776108c5c22cee9beff890650",
      "s": "0x24e3ba1bb0d11c8b1da8d969ecd0c5e2372326a3de71ba1231c876c0efb2c0a8",
      "v": 0,
    }
   */
  async getTransactionByHash(txHash) {
    const result = await this.provider.call('cfx_getTransactionByHash', TxHash(txHash));
    return parse.transaction(result);
  }

  /**
   * Returns the receipt of a transaction by transaction hash.
   *
   * > Note: The receipt is not available for pending transactions and returns null.
   *
   * @param txHash {string} - The transaction hash.
   * @return {Promise<object|null>}
   * - `number` outcomeStatus: `0`: the transaction was successful, `1`: EVM reverted the transaction.
   * - `string` stateRoot: The state root of transaction execution.
   * - `number` epochNumber: EpochNumber where this transaction was in.
   * - `string` blockHash: Hash of the block where this transaction was in.
   * - `string` transactionHash: Hash of the transaction.
   * - `number` index: Integer of the transactions index position in the block.
   * - `string` from: Address of the sender.
   * - `string` to: Address of the receiver. null when its a contract creation transaction.
   * - `string|null` contractCreated: The contract address created, if the transaction was a contract creation, otherwise null.
   * - `number` gasUsed: The amount of gas used by this specific transaction alone.
   * - `[object]` logs: Array of log objects, which this transaction generated.
   * - `[string]` logs[].address: The address of the contract executing at the point of the `LOG` operation.
   * - `[string]` logs[].topics: The topics associated with the `LOG` operation.
   * - `[string]` logs[].data: The data associated with the `LOG` operation.
   * - `string` logsBloom: Log bloom.
   *
   * @example
   * > await client.getTransactionReceipt('0xbe007c3eca92d01f3917f33ae983f40681182cf618defe75f490a65aac016914');
   {
    "outcomeStatus": 0,
    "stateRoot": "0x3854f64be6c124dffd0ddca57270846f0f43a119ea681b4e5d022ade537d9f07",
    "epochNumber": 449,
    "blockHash": "0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40",
    "transactionHash": "0xbe007c3eca92d01f3917f33ae983f40681182cf618defe75f490a65aac016914"
    "index": 0,
    "from": "0xa70ddf9b9750c575db453eea6a041f4c8536785a",
    "to": "0x63f0a574987f6893e068a08a3fb0e63aec3785e6",
    "contractCreated": null,
    "gasUsed": 21000,
    "logs": [],
    "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
   }
   */
  async getTransactionReceipt(txHash) {
    const result = await this.provider.call('cfx_getTransactionReceipt', TxHash(txHash));
    return parse.receipt(result);
  }

  /**
   * Creates new message call transaction or a contract creation, if the data field contains code.
   *
   * > FIXME: rpc `cfx_sendTransaction` not implement yet.
   *
   * @param options {object} - See `Transaction.callOptions`
   * @return {Promise<PendingTransaction>} The PendingTransaction object.
   *
   * @example
   * > // TODO call with address
   *
   * @example
   * > const account = client.wallet.add(KEY);
   * > await client.sendTransaction({
      from: account, // from account instance will sign by local.
      to: ADDRESS,
      value: Drip.fromCFX(0.023),
    });
   "0x459473cb019bb59b935abf5d6e76d66564aafa313efd3e337b4e1fa6bd022cc9"

   * @example
   * > await client.sendTransaction({
      from: account,
      to: account, // to account instance
      value: Drip.fromCFX(0.03),
    }).get(); // send then get transaction by hash.
   {
    "blockHash": null,
    "transactionIndex": null,
    "hash": "0xf2b258b49d33dd22419526e168ebb79b822889cf8317ce1796e816cce79e49a2",
    "contractCreated": null,
    "data": "0x",
    "from": "0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b",
    "nonce": 111,
    "status": null,
    "to": "0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b",
    "value": "30000000000000000",
    ...
   }

   * @example
   * > const promise = client.sendTransaction({ // Not await here, just get promise
      from: account1,
      to: ADDRESS1,
      value: Drip.fromCFX(0.007),
    });

   * > await promise; // transaction
   "0x91fbdfb33f3a585f932c627abbe268c7e3aedffc1633f9338f9779c64702c688"

   * > await promise.get(); // get transaction
   {
    "blockHash": null,
    "transactionIndex": null,
    "hash": "0x91fbdfb33f3a585f932c627abbe268c7e3aedffc1633f9338f9779c64702c688",
    ...
   }

   * > await promise.mined(); // wait till transaction mined
   {
    "blockHash": "0xe9b22ce311003e26c7330ac54eea9f8afea0ffcd4905828f27c9e2c02f3a00f7",
    "transactionIndex": 0,
    "hash": "0x91fbdfb33f3a585f932c627abbe268c7e3aedffc1633f9338f9779c64702c688",
    ...
   }

   * > await promise.executed(); // wail till transaction executed in right status. and return it's receipt.
   {
    "blockHash": "0xe9b22ce311003e26c7330ac54eea9f8afea0ffcd4905828f27c9e2c02f3a00f7",
    "index": 0,
    "transactionHash": "0x91fbdfb33f3a585f932c627abbe268c7e3aedffc1633f9338f9779c64702c688",
    "outcomeStatus": 0,
    ...
   }

   * > await promise.confirmed(); // wait till transaction risk coefficient '<' threshold.
   {
    "blockHash": "0xe9b22ce311003e26c7330ac54eea9f8afea0ffcd4905828f27c9e2c02f3a00f7",
    "index": 0,
    "transactionHash": "0x91fbdfb33f3a585f932c627abbe268c7e3aedffc1633f9338f9779c64702c688",
    "outcomeStatus": 0,
    ...
   }
   */
  async sendTransaction(options) {
    if (options.gasPrice === undefined) {
      options.gasPrice = this.defaultGasPrice;
    }

    if (options.gas === undefined) {
      options.gas = this.defaultGas;
    }

    if (options.nonce === undefined) {
      options.nonce = await this.getTransactionCount(options.from);
    }

    if (options.from instanceof Wallet.Account) { // sign by local
      const tx = options.from.signTransaction(options);
      return this.sendRawTransaction(tx.serialize());
    } else { // sign by remote
      return this.provider.call('cfx_sendTransaction', Transaction.sendOptions(options));
    }
  }

  /**
   * Signs a transaction. This account needs to be unlocked.
   *
   * @param hex {string|Buffer} - Raw transaction string.
   * @return {Promise<PendingTransaction>} The PendingTransaction object. See `sendTransaction`
   *
   * @example
   * > await client.sendRawTransaction('0xf85f800382520894bbd9e9b...');
   "0xbe007c3eca92d01f3917f33ae983f40681182cf618defe75f490a65aac016914"
   */
  async sendRawTransaction(hex) {
    return this.provider.call('cfx_sendRawTransaction', Hex(hex));
  }

  // -------------------------------- contract -----------------------------------
  /**
   * Get the code at a specific address.
   *
   * @param address {string} - The contract address to get the code from.
   * @param [epochNumber=this.defaultEpoch] {string|number} - EpochNumber or string in ["latest", "earliest", "pending"]
   * @return {Promise<string>} Code hex string
   *
   * @example
   * > await client.getCode('0xb385b84f08161f92a195953b980c8939679e906a');
   "0x6080604052348015600f57600080fd5b506004361060325760003560e01c806306661abd1460375780638..."
   */
  async getCode(address, epochNumber = this.defaultEpoch) {
    return this.provider.call('cfx_getCode', Address(address), EpochNumber(epochNumber));
  }

  /**
   * Executes a message call transaction, which is directly executed in the VM of the node,
   * but never mined into the block chain.
   *
   * @param options {object} - See `Transaction.callOptions`
   * @param [epochNumber=this.defaultEpoch] {string|number} - The end epochNumber to execute call of.
   * @return {Promise<string>} Hex bytes the contract method return.
   */
  async call(options, epochNumber = this.defaultEpoch) {
    if (options.gasPrice === undefined) {
      options.gasPrice = this.defaultGasPrice;
    }

    if (options.gas === undefined) {
      options.gas = this.defaultGas;
    }

    if (options.from && options.nonce === undefined) {
      options.nonce = await this.getTransactionCount(options.from);
    }

    return this.provider.call('cfx_call', Transaction.callOptions(options), EpochNumber(epochNumber));
  }

  /**
   * Executes a message call or transaction and returns the amount of the gas used.
   *
   * @param options {object} - See `Transaction.callOptions`
   * @return {Promise<number>} The used gas for the simulated call/transaction.
   */
  async estimateGas(options) {
    if (options.gasPrice === undefined) {
      options.gasPrice = this.defaultGasPrice;
    }

    if (options.gas === undefined) {
      options.gas = this.defaultGas;
    }

    if (options.from && options.nonce === undefined) {
      options.nonce = await this.getTransactionCount(options.from);
    }

    const result = await this.provider.call('cfx_estimateGas', Transaction.callOptions(options));
    return parse.number(result);
  }
}

module.exports = Client;
