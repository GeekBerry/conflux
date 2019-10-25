// FIXME: not to depend on 'web3-eth-abi' and 'ethers'
const web3Abi = require('web3-eth-abi');
const { defaultAbiCoder: ethAbi } = require('ethers/utils/abi-coder');

class Contract {
  constructor(cfx, { abi: contractABI, address, code }) {
    this.address = address;

    for (const methodABI of contractABI) {
      switch (methodABI.type) {
        case 'constructor':
          // cover this.constructor
          this['constructor'] = new Constructor(cfx, { contract: this, abi: methodABI, code });
          break;

        case 'function':
          this[methodABI.name] = new Method(cfx, { contract: this, abi: methodABI });
          break;

        default:
          break;
      }
    }
  }
}

class Method extends Function {
  constructor(cfx, { contract, abi }) {
    super();
    this.cfx = cfx;
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

  /**
   * @param params {array}
   * @return {string}
   */
  encode(params) {
    return web3Abi.encodeFunctionCall(this.abi, params);
  }

  /**
   * @param value {string}
   * @return {*}
   */
  decode(value) {
    const array = ethAbi.decode(this.abi.outputs, value);
    return array.length <= 1 ? array[0] : array;
  }
}

class Constructor extends Method {
  constructor(cfx, { code, ...rest }) {
    super(cfx, rest);
    this.code = code;
  }

  static apply(self, _, params) {
    return new Called(self, {
      data: self.encode(params),
    });
  }

  encode(params) {
    if (!this.code) {
      throw new Error('contract.constructor.code is empty')
    }
    return this.code + web3Abi.encodeParameters(this.abi.inputs, params).replace('0x', '');
  }

  decode(value) {
    return value;
  }
}

class Called {
  constructor(method, { to, data }) {
    this.method = method;
    this.to = to;
    this.data = data;
  }

  sendTransaction(options) {
    return this.method.cfx.sendTransaction({
      to: this.to,
      data: this.data,
      ...options,
    });
  }

  estimateGas(options) {
    return this.method.cfx.estimateGas({
      to: this.to,
      data: this.data,
      ...options,
    });
  };

  async call(options, epoch) {
    let result = await this.method.cfx.call(
      {
        to: this.to,
        data: this.data,
        ...options,
      },
      epoch,
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
