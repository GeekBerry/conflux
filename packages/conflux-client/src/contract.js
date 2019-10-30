// FIXME: not to depend on 'web3-eth-abi' and 'ethers'
const web3Abi = require('web3-eth-abi');
const { defaultAbiCoder: ethAbi } = require('ethers/utils/abi-coder');

/**
 * Contract with all its methods and events defined in its abi.
 */
class Contract {
  /**
   *
   * @param client {Client} - Client instance.
   * @param options {object}
   * @param options.abi {array} - The json interface for the contract to instantiate
   * @param [options.address] {string} - The address of the smart contract to call, can be added later using `contract.address = '0x1234...'`
   * @param [options.code] {string} - The byte code of the contract, can be added later using `contract.constructor.code = '0x1234...'`
   * @return {object}
   *
   * @example
   * > const contract = client.Contract({ abi, code });
   * > contract instanceof Contract;
   true

   * > contract.abi; // input abi
   [{type:'constructor', inputs:[...]}, ...]

   * > contract.constructor.code; // input code
   "0x6080604052600080..."

   * // deploy a contract by send constructor then wait and get contract address by `PendingTransaction.deployed` trick.
   * > await contract.constructor(100).sendTransaction({ from: account }).deployed();
   "0xc3ed1a06471be1d3bcd014051fbe078387ec0ad8"

   * @example
   * > const contract = client.Contract({ abi, address });
   * > contract.address
   "0xc3ed1a06471be1d3bcd014051fbe078387ec0ad8"

   * > await contract.count(); // call a method without parameter, get decoded return value.
   BigNumber { _hex: '0x64' }
   * > await contract.inc(1); // call a method with parameters, get decoded return value.
   BigNumber { _hex: '0x65' }
   * > await contract.count().call({ from: account }); // call a method from a account.
   BigNumber { _hex: '0x64' }
   * > await contract.count().estimateGas();
   21655
   * > await contract.count().estimateGas({ from: ADDRESS, nonce: 68 }); // if from is a address string, nonce is required
   21655

   * // send transaction from account instance, then wail till confirmed, and get receipt.
   * > await contract.inc(1)
   .sendTransaction({ from: account1 })
   .confirmed({ threshold: 0.01, timeout: 30 * 1000 });
   {
     "blockHash": "0xba948c8925f6d7f14faf540c3b9e6d24d33c78168b2dd81a6021a50949d9f0d7",
     "index": 0,
     "transactionHash": "0x8a5f48c2de0f1bdacfe90443810ad650e4b327a0d19ce49a53faffb224883e42",
     "outcomeStatus": 0,
     ...
   }

   * > await contract.count(); // data in block chain changed by transaction.
   BigNumber { _hex: '0x65' }
   */
  constructor(client, { abi: contractABI, address, code }) {
    this.abi = contractABI; // XXX: Create a method named `abi` in solidity is a `Warning`.
    this.address = address; // XXX: Create a method named `address` in solidity is a `ParserError`

    for (const methodABI of contractABI) {
      switch (methodABI.type) {
        case 'constructor':
          // cover this.constructor
          this['constructor'] = new Constructor(client, { contract: this, abi: methodABI, code });
          break;

        case 'function':
          this[methodABI.name] = new Method(client, { contract: this, abi: methodABI });
          break;

        case 'event':
          // TODO
          break;

        default:
          break;
      }
    }
  }
}

class Method extends Function {
  constructor(client, { contract, abi }) {
    super();
    this.client = client;
    this.contract = contract;
    this.abi = abi;
    return new Proxy(this, this.constructor);
  }

  static apply(self, _, params) {
    return new Called(self, {
      to: self.contract.address,
      data: self.encode(params),
    });
  }

  encode(params) {
    return web3Abi.encodeFunctionCall(this.abi, params);
  }

  decode(value) {
    const array = ethAbi.decode(this.abi.outputs, value);
    return array.length <= 1 ? array[0] : array;
  }
}

class Constructor extends Method {
  constructor(client, { code, ...rest }) {
    super(client, rest);
    this.code = code;
  }

  static apply(self, _, params) {
    return new Called(self, {
      data: self.encode(params),
    });
  }

  encode(params) {
    if (!this.code) {
      throw new Error('contract.constructor.code is empty');
    }
    return this.code + web3Abi.encodeParameters(this.abi.inputs, params).replace('0x', '');
  }

  decode(value) {
    return value;
  }
}

/**
 * @memberOf Contract
 */
class Called {
  constructor(method, { to, data }) {
    this.method = method;
    this.to = to;
    this.data = data;
  }

  /**
   * Will send a transaction to the smart contract and execute its method.
   * set contract.address as `to`,
   * set contract method encode as `data`.
   *
   * > Note: This can alter the smart contract state.
   *
   * @param options {object} - See `Transaction.callOptions`
   * @return {Promise<PendingTransaction>} The PendingTransaction object.
   */
  sendTransaction(options) {
    return this.method.client.sendTransaction({
      to: this.to,
      data: this.data,
      ...options,
    });
  }

  /**
   * Executes a message call or transaction and returns the amount of the gas used.
   * set contract.address as `to`,
   * set contract method encode as `data`.
   *
   * @param options {object} - See `Transaction.callOptions`
   * @return {Promise<number>} The used gas for the simulated call/transaction.
   */
  estimateGas(options) {
    return this.method.client.estimateGas({
      to: this.to,
      data: this.data,
      ...options,
    });
  };

  /**
   * Executes a message call transaction,
   * set contract.address as `to`,
   * set contract method encode as `data`.
   *
   * > Note: Can not alter the smart contract state.
   *
   * @param options {object} - See `Transaction.callOptions`.
   * @param epochNumber {string|number} - See `Client.call`.
   * @return {Promise<*>} Decoded contact call return.
   */
  async call(options, epochNumber) {
    let result = await this.method.client.call(
      {
        to: this.to,
        data: this.data,
        ...options,
      },
      epochNumber,
    );
    return this.method.decode(result);
  };

  async then(resolve, reject) {
    try {
      const result = await this.call();
      resolve(result);
    } catch (e) {
      reject(e);
    }
  }
}

module.exports = Contract;
module.exports.Constructor = Constructor;
module.exports.Method = Method;
module.exports.Called = Called;
