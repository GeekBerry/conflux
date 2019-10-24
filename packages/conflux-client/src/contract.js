// FIXME: not to depend on 'web3-eth-abi' and 'ethers'
const web3Abi = require('web3-eth-abi');
const { defaultAbiCoder: ethAbi } = require('ethers/utils/abi-coder');

class Contract {
  constructor({ abi: contractABI, code, address }) {
    this.address = address;

    for (const abi of contractABI) {
      switch (abi.type) {
        case 'constructor':
          this['constructor'] = new Method(abi, code);
          break;

        case 'function':
          this[abi.name] = new Method(abi);
          break;

        default:
          break;
      }
    }
  }
}

class Method extends Function {
  constructor(abi, code) {
    super();
    this.abi = abi;
    this.code = code || web3Abi.encodeFunctionSignature(abi);
    return new Proxy(this, this.constructor);
  }

  static apply(self, bindAccount, params) {
    return new Called(self, self.encode(params));
  }

  /**
   * @param params {array}
   * @return {string}
   */
  encode(params) {
    if (!this.code) {
      throw new Error('contract method is empty');
    }
    return this.code + web3Abi.encodeParameters(this.abi.inputs, params).replace('0x', '');
  }

  /**
   * @param value {string}
   * @return {*}
   */
  decode(value) {
    if (this.abi.outputs) {
      const array = ethAbi.decode(this.abi.outputs, value);
      value = array.length <= 1 ? array[0] : array;
    }
    return value;
  }
}

class Called {
  constructor(method, code) {
    this.method = method;
    this.code = code;
  }

  parse(hex) {
    return this.method.decode(hex);
  }

  toString() {
    return this.code;
  }
}

module.exports = Contract;
module.exports.Method = Method;
module.exports.Called = Called;
