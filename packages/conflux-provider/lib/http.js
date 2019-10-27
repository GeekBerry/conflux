const superagent = require('superagent');

function randomId() {
  return `${Date.now()}${Math.random().toFixed(7).substring(2)}`; // 13+7=20 int string
}

/**
 * Http protocol json rpc provider.
 */
class HttpProvider {
  /**
   * @param host {string} - Full json rpc http url
   * @param [options] {object}
   * @param [options.timeout=60*1000] {number} - Request time out in ms
   * @param [options.log] {function} - Log function
   * @return {HttpProvider}
   *
   * @example
   * > const provider = new HttpProvider('http://testnet-jsonrpc.conflux-chain.org:12537', {log: console.info});
   */
  constructor(host, {
    timeout = 60 * 1000,
    log,
  } = {}) {
    this.host = host;
    this.timeout = timeout;
    this.log = log;
  }

  /**
   * Call a json rpc method with params
   *
   * @param method {string} - Json rpc method name.
   * @param [params] {array} - Json rpc method params.
   * @return {Promise<*>} Json rpc method return value.
   *
   * @example
   * > await provider.call('cfx_epochNumber');
   * > await provider.call('cfx_getBlockByHash', blockHash);
   */
  async call(method, ...params) {
    const data = { jsonrpc: '2.0', id: randomId(), method, params };

    const startTime = Date.now();
    const { body: { result, error } = {} } = await superagent
      .post(this.host)
      .send(data)
      .timeout(this.timeout);
    const endTime = Date.now();

    if (this.log) {
      this.log({ data, result, error, duration: endTime - startTime });
    }

    if (error) {
      throw new Error(JSON.stringify(error));
    }
    return result;
  }

  close() {}
}

module.exports = HttpProvider;
