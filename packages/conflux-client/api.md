
----------
# client

A client of conflux node.


## Client.constructor



### Parameters

Name                    | Type                    | Required | Default                  | Description
------------------------|-------------------------|----------|--------------------------|---------------------------------------------------------------
options                 | object                  | false    |                          | Client and Provider constructor options.
options.url             | string                  | false    | ''                       | Url of provider to create.
options.defaultEpoch    | string,number           | false    | EpochNumber.LATEST_STATE | Default epochNumber.
options.defaultGasPrice | string,number,BigNumber | false    |                          | The default gas price in drip to use for transactions.
options.defaultGas      | string,number,BigNumber | false    |                          | The default maximum gas provided for a transaction (gasLimit).

### Return

`void`

### Example

```
> const client = new Client({url:'http://testnet-jsonrpc.conflux-chain.org:12537'});
```

```
> const client = new Client({  url: 'http://localhost:8000',  defaultGasPrice: 100,  defaultGas: 100000,  log: console.log,});
```

## Client.setProvider

Create and set `provider` for client.

### Parameters

Name    | Type   | Required | Default | Description
--------|--------|----------|---------|------------------------------
url     | string | false    | ''      | Url of provider to create.
options | object | false    |         | Provider constructor options.

### Return

`Object` 

### Example

```
> client.provider;
   HttpProvider {
     url: 'http://testnet-jsonrpc.conflux-chain.org:12537',
     timeout: 30000,
     ...
   }> client.setProvider('http://localhost:8000');> client.provider; // Options will be reset to default.
   HttpProvider {
     url: 'http://testnet-jsonrpc.conflux-chain.org:12537',
     timeout: 60000,
     ...
   }
```

## Client.Contract

A shout cut for `new Contract(client, options);`

### Parameters

Name    | Type   | Required | Default | Description
--------|--------|----------|---------|---------------------------
options | object | true     |         | See `Contract.constructor`

### Return

`Contract` 


## Client.close

close client connection.

### Parameters

`void`

### Return

`void`

### Example

```
> client.close();
```

## Client.gasPrice

Returns the current gas price oracle. The gas price is determined by the last few blocks median gas price.

### Parameters

`void`

### Return

`Promise.<number>` Gas price in drip.

### Example

```
> await client.gasPrice();
   0
```

## Client.epochNumber

Returns the current epochNumber the client is on.

### Parameters

`void`

### Return

`Promise.<number>` EpochNumber

### Example

```
> await client.epochNumber();
   200109
```

## Client.getLogs

Gets past logs, matching the given options.

### Parameters

Name              | Type                  | Required | Default | Description
------------------|-----------------------|----------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
options           | object                | false    |         |
options.fromEpoch | string,number         | false    |         | The number of the earliest block
options.toEpoch   | string,number         | false    |         | The number of the latest block
options.address   | string,Array.<string> | false    |         | An address or a list of addresses to only get logs from particular account(s).
options.topics    | array                 | false    |         | An array of values which must each appear in the log entries. The order is important, if you want to leave topics out use null, e.g. [null, '0x12...']. You can also pass an array for each topic with options for that topic e.g. [null, ['option1', 'option2']]

### Return

`Promise.<array>` Array of log objects.

### Example

```
> await client.getPastLogs({
      fromEpoch: 0,
      toEpoch: 'latest_mined',
      address: '0x169a10a431130B2F4853294A4a966803668af385'
    });
```

## Client.getBalance

Get the balance of an address at a given epochNumber.

### Parameters

Name        | Type          | Required | Default           | Description
------------|---------------|----------|-------------------|-----------------------------------------
address     | string        | true     |                   | The address to get the balance of.
epochNumber | string,number | false    | this.defaultEpoch | The end epochNumber to count balance of.

### Return

`Promise.<BigNumber>` Address balance number in drip.

### Example

```
> let balance = await client.getBalance("0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b");> balance;
   BigNumber { s: 1, e: 18, c: [ 17936, 36034970586632 ] }> Drip.toCFX(balance).toString(10);
   1.793636034970586632> balance = await client.getBalance("0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b", 0);> balance.toString(10);
   0
```

## Client.getTransactionCount

Get the numbers of transactions sent from this address.

### Parameters

Name        | Type          | Required | Default           | Description
------------|---------------|----------|-------------------|-----------------------------------------------------
address     | string        | true     |                   | The address to get the numbers of transactions from.
epochNumber | string,number | false    | this.defaultEpoch | The end epochNumber to count transaction of.

### Return

`Promise.<number>` 

### Example

```
> await client.getTransactionCount("0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b");
   61> await client.getTransactionCount("0xbbd9e9be525ab967e633bcdaeac8bd5723ed4d6b", EpochNumber.EARLIEST);
   0
```

## Client.getBlocksByEpoch

Get block hash array of a epochNumber.

### Parameters

Name        | Type          | Required | Default | Description
------------|---------------|----------|---------|-----------------------------------------------------------
epochNumber | string,number | true     |         | EpochNumber or string in ["latest", "earliest", "pending"]

### Return

`Promise.<Array.<string>>` Block hash array, last one is the pivot block hash of this epochNumber.

### Example

```
> await client.getBlocksByEpoch(EpochNumber.EARLIEST); // same as `client.getBlocksByEpoch(0)`
   ['0x2da120ad267319c181b12136f9e36be9fba59e0d818f6cc789f04ee937b4f593']> await client.getBlocksByEpoch(449);
   [
   '0x3d8b71208f81fb823f4eec5eaf2b0ec6b1457d381615eff2fbe24605ea333c39',
   '0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40'
   ]
```

## Client.getBlockByHash

Returns a block matching the block hash.

### Parameters

Name      | Type    | Required | Default | Description
----------|---------|----------|---------|--------------------------------------------------------------
blockHash | string  | true     |         | The hash of block to be get.
detail    | boolean | false    | false   | `true` return transaction object, `false` return TxHash array

### Return

`Promise.<(object|null)>` Block info object.
- `string` miner: The address of the beneficiary to whom the mining rewards were given.
- `string|null` hash: Hash of the block. `null` when its pending block.
- `string` parentHash: Hash of the parent block.
- `string[]` refereeHashes: Array of referee hashes.
- `number|null` epochNumber: The current block epochNumber in the client's view. `null` when it's not in best block's past set.
- `boolean|null` stable: If the block stable or not. `null` for pending stable.
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

### Example

```
> await client.getBlockByHash('0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40');
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
```

```
> await client.getBlockByHash('0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40', true);
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
```

## Client.getBlockByEpochNumber

Get the epochNumber pivot block info.

### Parameters

Name        | Type          | Required | Default | Description
------------|---------------|----------|---------|--------------------------------------------------------------
epochNumber | string,number | true     |         | EpochNumber or string in ["latest", "earliest", "pending"]
detail      | boolean       | false    | false   | `true` return transaction object, `false` return TxHash array

### Return

`Promise.<(object|null)>` The block info (same as `getBlockByHash`).

### Example

```
> await client.getBlockByEpochNumber(449);
   {
     hash: '0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40',
     ...
   }
```

## Client.getBlockByHashWithPivotAssumption

Get block by `blockHash` if pivot block of `epochNumber` is `pivotBlockHash`.

### Parameters

Name           | Type   | Required | Default | Description
---------------|--------|----------|---------|----------------------------------------------------------------
blockHash      | string | true     |         | Block hash which epochNumber expect to be `epochNumber`.
pivotBlockHash | string | true     |         | Block hash which expect to be the pivot block of `epochNumber`.
epochNumber    | number | true     |         | EpochNumber or string in ["latest", "earliest", "pending"]

### Return

`Promise.<object>` The block info (same as `getBlockByHash`).

### Example

```
> await client.getBlockByHashWithPivotAssumption('0x3d8b71208f81fb823f4eec5eaf2b0ec6b1457d381615eff2fbe24605ea333c39','0x59339ff28bc235cceac9fa588ebafcbf61316e6a8c86c7a1d7239b9445d98e40'449,);
   {
     hash: '0x3d8b71208f81fb823f4eec5eaf2b0ec6b1457d381615eff2fbe24605ea333c39',
     ...
   }
```

## Client.getTransactionByHash

Returns a transaction matching the given transaction hash.

### Parameters

Name   | Type   | Required | Default | Description
-------|--------|----------|---------|----------------------
txHash | string | true     |         | The transaction hash.

### Return

`Promise.<(object|null)>` Transaction info object
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

### Example

```
> await client.getTransactionByHash('0xbe007c3eca92d01f3917f33ae983f40681182cf618defe75f490a65aac016914');
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
```

## Client.getTransactionReceipt

Returns the receipt of a transaction by transaction hash.

> Note: The receipt is not available for pending transactions and returns null.

### Parameters

Name   | Type   | Required | Default | Description
-------|--------|----------|---------|----------------------
txHash | string | true     |         | The transaction hash.

### Return

`Promise.<(object|null)>` - `number` outcomeStatus: `0`: the transaction was successful, `1`: EVM reverted the transaction.
- `string` stateRoot: The state root of transaction execution.
- `number` epochNumber: EpochNumber where this transaction was in.
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

### Example

```
> await client.getTransactionReceipt('0xbe007c3eca92d01f3917f33ae983f40681182cf618defe75f490a65aac016914');
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
```

## Client.sendTransaction

Creates new message call transaction or a contract creation, if the data field contains code.

> FIXME: rpc `cfx_sendTransaction` not implement yet.

### Parameters

Name    | Type   | Required | Default | Description
--------|--------|----------|---------|------------------------------
options | object | true     |         | See `Transaction.callOptions`

### Return

`Promise.<PendingTransaction>` The PendingTransaction object.

### Example

```
> // TODO call with address
```

```
> const account = client.wallet.add(KEY);> await client.sendTransaction({
      from: account, // from account instance will sign by local.
      to: ADDRESS,
      value: Drip.fromCFX(0.023),
    });
   "0x459473cb019bb59b935abf5d6e76d66564aafa313efd3e337b4e1fa6bd022cc9"
```

```
> await client.sendTransaction({
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
```

```
> const promise = client.sendTransaction({ // Not await here, just get promise
      from: account1,
      to: ADDRESS1,
      value: Drip.fromCFX(0.007),
    });> await promise; // transaction
   "0x91fbdfb33f3a585f932c627abbe268c7e3aedffc1633f9338f9779c64702c688"> await promise.get(); // get transaction
   {
    "blockHash": null,
    "transactionIndex": null,
    "hash": "0x91fbdfb33f3a585f932c627abbe268c7e3aedffc1633f9338f9779c64702c688",
    ...
   }> await promise.mined(); // wait till transaction mined
   {
    "blockHash": "0xe9b22ce311003e26c7330ac54eea9f8afea0ffcd4905828f27c9e2c02f3a00f7",
    "transactionIndex": 0,
    "hash": "0x91fbdfb33f3a585f932c627abbe268c7e3aedffc1633f9338f9779c64702c688",
    ...
   }> await promise.executed(); // wail till transaction executed in right status. and return it's receipt.
   {
    "blockHash": "0xe9b22ce311003e26c7330ac54eea9f8afea0ffcd4905828f27c9e2c02f3a00f7",
    "index": 0,
    "transactionHash": "0x91fbdfb33f3a585f932c627abbe268c7e3aedffc1633f9338f9779c64702c688",
    "outcomeStatus": 0,
    ...
   }> await promise.confirmed(); // wait till transaction risk coefficient '<' threshold.
   {
    "blockHash": "0xe9b22ce311003e26c7330ac54eea9f8afea0ffcd4905828f27c9e2c02f3a00f7",
    "index": 0,
    "transactionHash": "0x91fbdfb33f3a585f932c627abbe268c7e3aedffc1633f9338f9779c64702c688",
    "outcomeStatus": 0,
    ...
   }
```

## Client.sendRawTransaction

Signs a transaction. This account needs to be unlocked.

### Parameters

Name | Type          | Required | Default | Description
-----|---------------|----------|---------|------------------------
hex  | string,Buffer | true     |         | Raw transaction string.

### Return

`Promise.<PendingTransaction>` The PendingTransaction object. See `sendTransaction`

### Example

```
> await client.sendRawTransaction('0xf85f800382520894bbd9e9b...');
   "0xbe007c3eca92d01f3917f33ae983f40681182cf618defe75f490a65aac016914"
```

## Client.getCode

Get the code at a specific address.

### Parameters

Name        | Type          | Required | Default           | Description
------------|---------------|----------|-------------------|-----------------------------------------------------------
address     | string        | true     |                   | The contract address to get the code from.
epochNumber | string,number | false    | this.defaultEpoch | EpochNumber or string in ["latest", "earliest", "pending"]

### Return

`Promise.<string>` Code hex string

### Example

```
> await client.getCode('0xb385b84f08161f92a195953b980c8939679e906a');
   "0x6080604052348015600f57600080fd5b506004361060325760003560e01c806306661abd1460375780638..."
```

## Client.call

Executes a message call transaction, which is directly executed in the VM of the node,
but never mined into the block chain.

### Parameters

Name        | Type          | Required | Default           | Description
------------|---------------|----------|-------------------|----------------------------------------
options     | object        | true     |                   | See `Transaction.callOptions`
epochNumber | string,number | false    | this.defaultEpoch | The end epochNumber to execute call of.

### Return

`Promise.<string>` Hex bytes the contract method return.


## Client.estimateGas

Executes a message call or transaction and returns the amount of the gas used.

### Parameters

Name    | Type   | Required | Default | Description
--------|--------|----------|---------|------------------------------
options | object | true     |         | See `Transaction.callOptions`

### Return

`Promise.<number>` The used gas for the simulated call/transaction.


----------
# contract

Contract with all its methods and events defined in its abi.



## Contract.constructor



### Parameters

Name            | Type   | Required | Default | Description
----------------|--------|----------|---------|-----------------------------------------------------------------------------------------------------
client          | Client | true     |         | Client instance.
options         | object | true     |         |
options.abi     | array  | true     |         | The json interface for the contract to instantiate
options.address | string | false    |         | The address of the smart contract to call, can be added later using `contract.address = '0x1234...'`
options.code    | string | false    |         | The byte code of the contract, can be added later using `contract.constructor.code = '0x1234...'`

### Return

`object` 

### Example

```
> const contract = client.Contract({ abi, code });> contract instanceof Contract;
   true> contract.abi; // input abi
   [{type:'constructor', inputs:[...]}, ...]> contract.constructor.code; // input code
   "0x6080604052600080..."// deploy a contract by send constructor then wait and get contract address by `PendingTransaction.deployed` trick.> await contract.constructor(100).sendTransaction({ from: account }).deployed();
   "0xc3ed1a06471be1d3bcd014051fbe078387ec0ad8"
```

```
> const contract = client.Contract({ abi, address });> contract.address
   "0xc3ed1a06471be1d3bcd014051fbe078387ec0ad8"> await contract.count(); // call a method without parameter, get decoded return value.
   BigNumber { _hex: '0x64' }> await contract.inc(1); // call a method with parameters, get decoded return value.
   BigNumber { _hex: '0x65' }> await contract.count().call({ from: account }); // call a method from a account.
   BigNumber { _hex: '0x64' }> await contract.count().estimateGas();
   21655> await contract.count().estimateGas({ from: ADDRESS, nonce: 68 }); // if from is a address string, nonce is required
   21655// send transaction from account instance, then wail till confirmed, and get receipt.> await contract.inc(1)
   .sendTransaction({ from: account1 })
   .confirmed({ threshold: 0.01, timeout: 30 * 1000 });
   {
     "blockHash": "0xba948c8925f6d7f14faf540c3b9e6d24d33c78168b2dd81a6021a50949d9f0d7",
     "index": 0,
     "transactionHash": "0x8a5f48c2de0f1bdacfe90443810ad650e4b327a0d19ce49a53faffb224883e42",
     "outcomeStatus": 0,
     ...
   }> await contract.count(); // data in block chain changed by transaction.
   BigNumber { _hex: '0x65' }
```

## Contract.Called.sendTransaction

Will send a transaction to the smart contract and execute its method.
set contract.address as `to`,
set contract method encode as `data`.

> Note: This can alter the smart contract state.

### Parameters

Name    | Type   | Required | Default | Description
--------|--------|----------|---------|------------------------------
options | object | true     |         | See `Transaction.callOptions`

### Return

`Promise.<PendingTransaction>` The PendingTransaction object.


## Contract.Called.estimateGas

Executes a message call or transaction and returns the amount of the gas used.
set contract.address as `to`,
set contract method encode as `data`.

### Parameters

Name    | Type   | Required | Default | Description
--------|--------|----------|---------|------------------------------
options | object | true     |         | See `Transaction.callOptions`

### Return

`Promise.<number>` The used gas for the simulated call/transaction.


## Contract.Called.call

Executes a message call transaction,
set contract.address as `to`,
set contract method encode as `data`.

> Note: Can not alter the smart contract state.

### Parameters

Name        | Type          | Required | Default | Description
------------|---------------|----------|---------|-------------------------------
options     | object        | true     |         | See `Transaction.callOptions`.
epochNumber | string,number | true     |         | See `Client.call`.

### Return

`Promise.<*>` Decoded contact call return.



----------
# subscribe.pending_transaction

Pending transaction


## PendingTransaction.get

Get transaction by hash.

### Parameters

Name          | Type   | Required | Default | Description
--------------|--------|----------|---------|--------------------------------
options       | object | false    |         |
options.delay | number | false    | 0       | Defer execute after `delay` ms.

### Return

`Promise.<(Object|null)>` See `Client.getTransactionByHash`


## PendingTransaction.mined

Async wait till transaction been mined.

- blockHash !== null

### Parameters

Name            | Type   | Required | Default | Description
----------------|--------|----------|---------|---------------------------------
options         | object | false    |         |
options.delta   | number | false    | 1000    | Loop transaction interval in ms.
options.timeout | number | false    | 30*1000 | Loop timeout in ms.

### Return

`Promise.<object>` See `Client.getTransactionByHash`


## PendingTransaction.executed

Async wait till transaction been executed.

- mined
- receipt !== null
- receipt.outcomeStatus === 0

### Parameters

Name            | Type   | Required | Default | Description
----------------|--------|----------|---------|---------------------------------
options         | object | false    |         |
options.delta   | number | false    | 1000    | Loop transaction interval in ms.
options.timeout | number | false    | 60*1000 | Loop timeout in ms.

### Return

`Promise.<object>` See `Client.getTransactionReceipt`


## PendingTransaction.confirmed

Async wait till transaction been confirmed.

- executed
- transaction block risk coefficient < threshold

### Parameters

Name              | Type   | Required | Default   | Description
------------------|--------|----------|-----------|---------------------------------
options           | object | false    |           |
options.delta     | number | false    | 1000      | Loop transaction interval in ms.
options.timeout   | number | false    | 5*60*1000 | Loop timeout in ms.
options.threshold | number | false    | 0.01      | Number in range (0,1)

### Return

`Promise.<object>` See `Client.getTransactionReceipt`


## PendingTransaction.deployed

Async wait till contract create transaction deployed.
- transaction confirmed

### Parameters

Name    | Type   | Required | Default | Description
--------|--------|----------|---------|-----------------------------------
options | object | false    |         | See `PendingTransaction.confirmed`

### Return

`Promise.<string>` The contract address.


----------
# utils.index




## utils.sleep

Await sleep.

### Parameters

Name | Type   | Required | Default | Description
-----|--------|----------|---------|----------------------
ms   | number | true     |         | Sleep duration in ms.

### Return

`Promise.<undefined>` 


## utils.loop

Loop execute `func` if it return `undefined`

### Parameters

Name            | Type     | Required | Default | Description
----------------|----------|----------|---------|---------------------------------
func            | function | true     |         | Function to execute.
options         | object   | false    |         |
options.delta   | number   | false    | 1000    | Loop transaction interval in ms.
options.timeout | number   | false    | 30*1000 | Loop timeout in ms.

### Return

`Promise.<*>` 



----------
# wallet.account




## Account.constructor

Create a account by privateKey.

### Parameters

Name       | Type          | Required | Default | Description
-----------|---------------|----------|---------|------------
privateKey | string,Buffer | true     |         |

### Return

`Account` 


## Account.encrypt

Encrypt account privateKey to object.

### Parameters

Name     | Type   | Required | Default | Description
---------|--------|----------|---------|------------
password | string | true     |         |

### Return

`object` 


## Account.signTransaction

Sign a transaction.

### Parameters

Name    | Type   | Required | Default | Description
--------|--------|----------|---------|------------------
options | object | true     |         | See 'Transaction'

### Return

`Transaction` 


## Account.toString



### Parameters

`void`

### Return

`string` Account address as string.


## Account.decrypt

Decrypt account encrypt info.

### Parameters

Name     | Type   | Required | Default | Description
---------|--------|----------|---------|------------
info     | object | true     |         |
password | string | true     |         |

### Return

`Account` 



----------
# wallet.wallet

Contains an in memory wallet with multiple accounts.


## Wallet.constructor



### Parameters

Name   | Type   | Required | Default | Description
-------|--------|----------|---------|------------
client | Client | true     |         |

### Return

`Wallet` 


## Wallet.size

Get the number of account in wallet.
1 account have 1 address and 1 privateKey as key

### Parameters

`void`

### Return

`number` 


## Wallet.create

Create a random Account.

### Parameters

Name    | Type   | Required | Default | Description
--------|--------|----------|---------|-----------------
entropy | string | false    |         | Hex string seed.

### Return

`Account` 


## Wallet.get

Get a account in wallet by address or privateKey.

### Parameters

Name                | Type   | Required | Default | Description
--------------------|--------|----------|---------|------------
privateKeyOrAddress | string | true     |         | Hex string.

### Return

`Account` 


## Wallet.add

Add a account to wallet by privateKey.

### Parameters

Name       | Type          | Required | Default | Description
-----------|---------------|----------|---------|------------
privateKey | string,Buffer | true     |         |

### Return

`Account` 


## Wallet.remove

Remove a account in wallet by address or privateKey

### Parameters

Name                | Type   | Required | Default | Description
--------------------|--------|----------|---------|------------
privateKeyOrAddress | string | true     |         | Hex string.

### Return

`Account` 


## Wallet.clear

Clear all account in wallet.

### Parameters

`void`

### Return

`void`
