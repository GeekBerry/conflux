const superagent = require('superagent');

function randomId() {
  return `${Date.now()}${Math.random().toFixed(7).substring(2)}`; // 13+7=20 int string
}

/**
 * Http protocol json rpc provider.
 */
class HttpProvider {
  /**
   * @param url {string} - Full json rpc http url
   * @param [options] {object}
   * @param [options.timeout=60*1000] {number} - Request time out in ms
   * @param [options.log] {function} - Log function
   * @return {HttpProvider}
   *
   * @example
   * > const provider = new HttpProvider('http://testnet-jsonrpc.conflux-chain.org:12537', {log: console.info});
   */
  constructor(url, {
    timeout = 60 * 1000,
    log,
  } = {}) {
    this.url = url;
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
    const startTime = Date.now();

    const data = { jsonrpc: '2.0', id: randomId(), method, params };

    const { body: { result, error } = {} } = await superagent
      .post(this.url)
      .send(data)
      .timeout(this.timeout);

    if (this.log) {
      this.log({ data, result, error, duration: Date.now() - startTime });
    }

    if (error) {
      throw new Error(JSON.stringify(error));
    }
    return result;
  }
}

module.exports = HttpProvider;
