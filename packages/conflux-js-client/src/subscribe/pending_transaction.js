const { sleep, loop } = require('../utils');

/**
 * Pending transaction
 */
class PendingTransaction {
  constructor(client, value) {
    this.client = client;
    this.value = value;
  }

  async then(resolve, reject) {
    try {
      const result = await this.value;
      resolve(result);
    } catch (e) {
      reject(e);
    }
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
  async mined({ delta = 1000, timeout = 60 * 1000 } = {}) {
    return loop(
      async () => {
        const tx = await this.get();
        if (tx.blockHash) {
          return tx;
        }
      },
      { delta, timeout },
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
   * @param [options.timeout=60*1000] {number} - Loop timeout in ms.
   * @return {Promise<object>} See `Client.getTransactionReceipt`
   */
  async executed({ delta = 1000, timeout = 5 * 60 * 1000 } = {}) {
    const txHash = await this;
    return loop(
      async () => {
        const receipt = await this.client.getTransactionReceipt(txHash);
        if (receipt) {
          if (receipt.outcomeStatus === 0) {
            return receipt;
          } else {
            throw new Error(`transaction "${txHash}" executed failed, outcomeStatus ${receipt.outcomeStatus}`);
          }
        }
      },
      { delta, timeout },
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
   * @param [options.timeout=5*60*1000] {number} - Loop timeout in ms.
   * @param [options.threshold=0.01] {number} - Number in range (0,1)
   * @return {Promise<object>} See `Client.getTransactionReceipt`
   */
  async confirmed({ threshold = 0.01, delta = 1000, timeout = 30 * 60 * 1000 } = {}) {
    return loop(
      async () => {
        const receipt = await this.executed({ delta, timeout });
        const risk = await this.client.getRiskCoefficient(receipt.blockHash);
        if (risk < threshold) {
          return receipt;
        }
      },
      { delta, timeout },
    );
  }

  /**
   * Async wait till contract create transaction deployed.
   * - transaction confirmed
   *
   * @param [options] {object} - See `PendingTransaction.confirmed`
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
