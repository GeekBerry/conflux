const { HttpProvider } = require('conflux-provider');
const { Address, Epoch, BlockHash, TxHash } = require('conflux-utils/lib/type');
const Transaction = require('conflux-utils/lib/tx');

const parse = require('./parse');
const Contract = require('./contract');
const Account = require('./account');

/**
 * A client of conflux node.
 */
class Client {
  /**
   * @param url {string} - Url of provider to create, support ['HttpProvider'] now.
   * @param [options] - Provider constructor options.
   *
   * @example
   * > const cfx = new Client('http://testnet-jsonrpc.conflux-chain.org:12537');
   */
  constructor(url, options) {
    this.provider = new HttpProvider(url, options); // TODO
    // this.wallet = new Wallet(this);

    this.defaultEpoch = Epoch.LATEST_STATE;
    this.defaultGasPrice = 100; // TODO undefined
    this.defaultGas = 1000000; // TODO undefined
  }

  Account(privateKey) {
    return new Account(privateKey);
  }

  Contract(options) {
    return new Contract(this, options);
  }

  /**
   * close client connection.
   *
   * @example
   * > cfx.close();
   */
  close() {}

  /**
   * Returns the current gas price oracle. The gas price is determined by the last few blocks median gas price.
   *
   * @return {Promise<number>} Gas price in drip.
   *
   * @example
   * > await cfx.gasPrice();
   0
   */
  async gasPrice() {
    const result = await this.provider.call('cfx_gasPrice');
    return parse.number(result);
  }

  /**
   * Returns the current epoch number the client is on.
   *
   * @return {Promise<number>} Epoch number
   *
   * @example
   * > await cfx.epochNumber();
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
   * > await cfx.getPastLogs({
      fromEpoch: 0,
      toEpoch: 'latest_mined',
      address: '0x169a10a431130B2F4853294A4a966803668af385'
    });
   */
  getLogs({ fromEpoch, toEpoch, address, topics }) {
    return this.provider.call('cfx_getLogs', {
      fromEpoch: fromEpoch === undefined ? undefined : Epoch(fromEpoch),
      toEpoch: toEpoch === undefined ? undefined : Epoch(toEpoch),
      address: address === undefined ? undefined : Address(address),
      topics,
    });
  }

  // -------------------------------- address -----------------------------------
  /**
   * Get the balance of an address at a given epoch.
   *
   * @param address {string} - The address to get the balance of.
   * @param [epoch=this.defaultEpoch] {string|number} - The end epoch to count balance of.
   * @return {Promise<BigNumber>} Address balance number in drip.
   *
   * @example
   * > let balance = await cfx.getBalance("0x407d73d8a49eeb85d32cf465507dd71d507100c1");
   * > balance;
   BigNumber { s: 1, e: 18, c: [ 19279, 96239115917632 ] }

   * > balance.toString(10);
   1927996239115917632

   * > balance = await cfx.getBalance("0x407d73d8a49eeb85d32cf465507dd71d507100c1", 0);
   * > balance.toString(10);
   0
   */
  async getBalance(address, epoch = this.defaultEpoch) {
    const result = await this.provider.call('cfx_getBalance', Address(address), Epoch(epoch));
    return parse.bigNumber(result);
  }

  /**
   * Get the numbers of transactions sent from this address.
   *
   * @param address {string} - The address to get the numbers of transactions from.
   * @param [epoch=this.defaultEpoch] {string|number} - The end epoch to count transaction of.
   * @return {Promise<number>}
   *
   * @example
   * > await cfx.getTransactionCount("0x407d73d8a49eeb85d32cf465507dd71d507100c1");
   61

   * > await cfx.getTransactionCount("0x407d73d8a49eeb85d32cf465507dd71d507100c1", Epoch.EARLIEST);
   0
   */
  async getTransactionCount(address, epoch = this.defaultEpoch) {
    const result = await this.provider.call('cfx_getTransactionCount', Address(address), Epoch(epoch));
    return parse.number(result);
  }

  // -------------------------------- block -----------------------------------
  /**
   * TODO
   *
   * @return {Promise<string>} Block hash
   *
   * @example
   * > await cfx.getBestBlockHash();
   "0x7274f450ada5eb5bd9b83640ec2a42f76badf948be96be688df34d97ffc8c68d"
   */
  getBestBlockHash() {
    return this.provider.call('cfx_getBestBlockHash');
  }

  /**
   * Get block hash array of a epoch.
   *
   * @param epoch {string|number} - Epoch number or string in ["latest", "earliest", "pending"]
   * @return {Promise<string[]>} Block hash array, last one is the pivot block hash of this epoch.
   *
   * @example
   * > await cfx.getBlocksByEpoch(Epoch.EARLIEST); // same as `cfx.getBlocksByEpoch(0)`
   ['0x2da120ad267319c181b12136f9e36be9fba59e0d818f6cc789f04ee937b4f593']

   * > await cfx.getBlocksByEpoch(449);
   [
   '0x3d8b71208f81fb823f4eec5eaf2b0ec6b1457d381615eff2fbe24605ea333c39',
   '0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40'
   ]
   */
  getBlocksByEpoch(epoch) {
    return this.provider.call('cfx_getBlocksByEpoch', Epoch(epoch));
  }

  /**
   * Returns a block matching the block hash.
   *
   * @param blockHash {string} - The hash of block to be get.
   * @param [detail=false] {boolean} - `true` return transaction object, `false` return TxHash array
   * @return {Promise<object|null>} Block info object.
   - `string` miner: The address of the beneficiary to whom the mining rewards were given.
   - `string|null` hash: Hash of the block. `null` when its pending block.
   - `string` parentHash: Hash of the parent block.
   - `string[]` refereeHashes: Array of referee hashes.
   - `number|null` epochNumber: The current block epoch number in the client's view. `null` when it's not in best block's past set.
   - `boolean` stable: Ff the block stable or not
   - `string` nonce: Hash of the generated proof-of-work. `null` when its pending block.
   - `number` gas: The maximum gas allowed in this block.
   - `string` difficulty: Integer string of the difficulty for this block.
   - `number` height: The block heights. `null` when its pending block.
   - `number` size: Integer the size of this block in bytes.
   - `number` blame: 0 if there's nothing to blame; k if the block is blaming on the state info of its k-th ancestor.
   - `boolean` adaptive: If the block's weight adaptive or not.
   - `number` timestamp: The unix timestamp for when the block was collated.
   - `string` transactionsRoot: The hash of the transactions of the block.
   - `string[]` transactions: Array of transaction objects, or 32 Bytes transaction hashes depending on the last given parameter.
   - `string` deferredLogsBloomHash: The hash of the deferred block's log bloom filter
   - `string` deferredReceiptsRoot: The hash of the receipts of the block after deferred execution.
   - `string` deferredStateRoot: The root of the final state trie of the block after deferred execution.
   - `object` deferredStateRootWithAux: Information of deferred state root

   * @example
   * > await cfx.getBlockByHash('0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40');
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
   * > await cfx.getBlockByHash('0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40', true);
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
    const result = await this.provider.call('cfx_getBlockByHash', BlockHash(blockHash), detail);
    return parse.block(result);
  }

  /**
   * Get the epoch pivot block info.
   *
   * @param epoch {string|number} - Epoch number or string in ["latest", "earliest", "pending"]
   * @param [detail=false] {boolean} - `true` return transaction object, `false` return TxHash array
   * @return {Promise<object|null>} The block info (same as `getBlockByHash`).
   *
   * @example
   * > await cfx.getBlockByEpochNumber(449);
   {
     hash: '0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40',
     ...
   }
   */
  async getBlockByEpochNumber(epoch, detail = false) {
    const result = await this.provider.call('cfx_getBlockByEpochNumber', Epoch(epoch), detail);
    return parse.block(result);
  }

  /**
   * Get block `blockHash` if the epochNumber is `epoch` and pivot block of `epoch` is `pivotBlockHash`.
   *
   * @param blockHash {string} - Block hash which epoch expect to be `epoch`.
   * @param pivotBlockHash {string} - Block hash which expect to be the pivot block of `epoch`.
   * @param epoch {number} - Epoch number or string in ["latest", "earliest", "pending"]
   * @return {Promise<object>} The block info (same as `getBlockByHash`).
   *
   * @example
   * > await cfx.getBlockByHashWithPivotAssumption(
   '0x3d8b71208f81fb823f4eec5eaf2b0ec6b1457d381615eff2fbe24605ea333c39',
   '0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40'
   449,
   );
   {
     hash: '0x3d8b71208f81fb823f4eec5eaf2b0ec6b1457d381615eff2fbe24605ea333c39',
     ...
   }
   */
  async getBlockByHashWithPivotAssumption(blockHash, pivotBlockHash, epoch) {
    const result = await this.provider.call('cfx_getBlockByHashWithPivotAssumption',
      BlockHash(blockHash), BlockHash(pivotBlockHash), Epoch(epoch),
    );
    return parse.block(result);
  }

  // -------------------------------- transaction -----------------------------------
  /**
   * Returns a transaction matching the given transaction hash.
   *
   * @param txHash {string} - The transaction hash.
   * @return {Promise<object|null>} Transaction info object
   - `string` blockHash: Hash of the block where this transaction was in and got executed. `null` when its pending.
   - `number` transactionIndex: Integer of the transactions index position in the block.
   - `string` hash: Hash of the transaction.
   - `number` nonce: The number of transactions made by the sender prior to this one.
   - `string` from: Address of the sender.
   - `string` to: Address of the receiver. null when its a contract creation transaction.
   - `string` value: Value transferred in Drip.
   - `string` data: The data send along with the transaction.
   - `number` gas: Gas provided by the sender.
   - `number` gasPrice: Gas price provided by the sender in Drip.
   - `string` status: '0x0' successful execution; '0x1' exception happened but nonce still increased; '0x2' exception happened and nonce didn't increase.
   - `string|null` contractCreated: The contract address created, if the transaction was a contract creation, otherwise null.
   - `string` r: ECDSA signature r
   - `string` s: ECDSA signature s
   - `string` v: ECDSA recovery id
   *
   * @example
   * > await cfx.getTransactionByHash('0xbe007c3eca92d01f3917f33ae983f40681182cf618defe75f490a65aac016914');
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
   - `number` outcomeStatus: `0`: the transaction was successful, `1`: EVM reverted the transaction.
   - `string` stateRoot: The state root of transaction execution.
   - `number` epochNumber: Epoch number where this transaction was in.
   - `string` blockHash: Hash of the block where this transaction was in.
   - `string` transactionHash: Hash of the transaction.
   - `number` index: Integer of the transactions index position in the block.
   - `string` from: Address of the sender.
   - `string` to: Address of the receiver. null when its a contract creation transaction.
   - `string|null` contractCreated: The contract address created, if the transaction was a contract creation, otherwise null.
   - `number` gasUsed: The amount of gas used by this specific transaction alone.
   - `[object]` logs: Array of log objects, which this transaction generated.
   - `[string]` logs[].address: The address of the contract executing at the point of the `LOG` operation.
   - `[string]` logs[].topics: The topics associated with the `LOG` operation.
   - `[string]` logs[].data: The data associated with the `LOG` operation.
   - `string` logsBloom: Log bloom.

   * @example
   * > await cfx.getTransactionReceipt('0xbe007c3eca92d01f3917f33ae983f40681182cf618defe75f490a65aac016914');
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
    return parse.transaction(result);
  }

  /**
   * Creates new message call transaction or a contract creation, if the data field contains code.
   *
   * > FIXME: rpc `cfx_sendTransaction` not implement yet.
   *
   * @param options {object} - See `Transaction.callOptions`
   * @return {Promise<string>} The transaction hash, or the zero hash if the transaction is not yet available.
   *
   * @example
   * TODO
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
   * @param hex {string} - Raw transaction string.
   * @return {Promise<string>} Transaction hash.
   *
   * @example
   * > await cfx.sendRawTransaction('0xf85f800382520894bbd9e9b...');
   "0xbe007c3eca92d01f3917f33ae983f40681182cf618defe75f490a65aac016914"
   */
  sendRawTransaction(hex) {
    return this.provider.call('cfx_sendRawTransaction', hex); // not format by Hex here.
  }

  // -------------------------------- contract -----------------------------------
  /**
   * Get the code at a specific address.
   *
   * @param address {string} - The contract address to get the code from.
   * @param [epoch=this.defaultEpoch] {string|number} - Epoch number or string in ["latest", "earliest", "pending"]
   * @return {Promise<string>} Code hex string
   *
   * @example
   * > await cfx.getCode('0xb385b84f08161f92a195953b980c8939679e906a');
   "0x6080604052348015600f57600080fd5b506004361060325760003560e01c806306661abd1460375780638..."
   */
  getCode(address, epoch = this.defaultEpoch) {
    return this.provider.call('cfx_getCode', Address(address), epoch);
  }

  /**
   * Executes a message call transaction, which is directly executed in the VM of the node,
   * but never mined into the block chain.
   *
   * @param options {object} - See `Transaction.callOptions`
   * @param [epoch=this.defaultEpoch] {string|number} - The end epoch to execute call of.
   * @return {Promise<string>} Hex bytes the contract method return.
   */
  async call(options, epoch = this.defaultEpoch) {
    if (options.gasPrice === undefined) {
      options.gasPrice = this.defaultGasPrice;
    }

    if (options.gas === undefined) {
      options.gas = this.defaultGas;
    }

    if (options.from && options.nonce === undefined) {
      options.nonce = await this.getTransactionCount(options.from);
    }

    return this.provider.call('cfx_call', Transaction.callOptions(options), Epoch(epoch));
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
