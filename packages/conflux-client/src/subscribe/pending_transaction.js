const { sleep, loop } = require('../utils');

/**
 * Pending transaction
 */
class PendingTransaction {
  constructor(client, value) {
    this.client = client;
    this.value = value;
  }

  then(resolve) {
    resolve(this.value);
  }

  /**
   * Get transaction by hash.
   *
   * @param [options] {object}
   * @param [options.delay=0] {number} - Defer execute after `delay` ms.
   * @return {Promise<Object|null>} See `Client.getTransactionByHash`
   */
  async get({ delay = 0 } = {}) {
    await sleep(delay);
    const txHash = await this;
    return this.client.getTransactionByHash(txHash);
  }

  /**
   * Async wait till transaction been mined.
   *
   * - blockHash !== null
   *
   * @param [options] {object}
   * @param [options.delta=1000] {number} - Loop transaction interval in ms.
   * @param [options.timeout=30*1000] {number} - Loop timeout in ms.
   * @return {Promise<object>} See `Client.getTransactionByHash`
   */
  async mined(options) {
    return loop(
      async () => {
        const tx = await this.get();
        if (tx.blockHash) {
          return tx;
        }
      },
      options,
    );
  }

  /**
   * Async wait till transaction been executed.
   *
   * - mined
   * - receipt !== null
   * - receipt.outcomeStatus === 0
   *
   * @param [options] {object}
   * @param [options.delta=1000] {number} - Loop transaction interval in ms.
   * @param [options.timeout=30*1000] {number} - Loop timeout in ms.
   * @return {Promise<object>} See `Client.getTransactionReceipt`
   */
  async executed(options) {
    const txHash = await this;
    return loop(
      async () => {
        const receipt = await this.client.getTransactionReceipt(txHash);
        if (receipt) {
          if (receipt.outcomeStatus === 0) {
            return receipt;
          } else {
            throw new Error(`transaction "${txHash}" deploy failed, outcomeStatus ${receipt.outcomeStatus}`);
          }
        }
      },
      options,
    );
  }

  /**
   * Async wait till transaction been confirmed.
   *
   * - executed
   * - transaction block risk coefficient < threshold
   *
   * @param [options] {object}
   * @param [options.delta=1000] {number} - Loop transaction interval in ms.
   * @param [options.timeout=30*1000] {number} - Loop timeout in ms.
   * @param [options.threshold=0.01] {number} - Number in range (0,1)
   * @return {Promise<object>} See `Client.getTransactionReceipt`
   */
  async confirmed({ threshold = 0.01, ...options } = {}) {
    return loop(
      async () => {
        const receipt = await this.executed(options);
        if (await this.client.getRiskCoefficient(receipt.blockHash) < threshold) {
          return receipt;
        }
      },
      options,
    );
  }

  /**
   * Async wait till contract create transaction deployed.
   * - transaction confirmed
   *
   * @param [options] {object}
   * @param [options.delta=1000] {number} - Loop transaction interval in ms.
   * @param [options.timeout=30*1000] {number} - Loop timeout in ms.
   * @param [options.threshold=0.01] {number} - Number in range (0,1)
   * @return {Promise<string>} The contract address.
   */
  async deployed(options) {
    const { transactionHash, outcomeStatus, contractCreated } = await this.confirmed(options);
    if (outcomeStatus === 0) {
      return contractCreated;
    } else {
      throw new Error(`transaction "${transactionHash}" deploy failed with ${outcomeStatus}`);
    }
  }
}

module.exports = PendingTransaction;
