function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Timer {
  constructor() {
    this.startTime = Date.now();
    this.lastTime = this.startTime;
  }

  get duration() {
    return Date.now() - this.startTime;
  }

  async delta(ms) {
    await sleep(ms + this.lastTime - Date.now());
    this.lastTime = Date.now();
  }
}

async function loop(func, { delta = 1000, timeout = 30 * 1000 } = {}) {
  const timer = new Timer();

  while (timer.duration < timeout) {
    const ret = await func();
    if (ret !== undefined) {
      return ret;
    }
    await timer.delta(delta);
  }

  throw new Error(`Timeout after ${timeout} ms`);
}

// ----------------------------------------------------------------------------
class PendingTransaction {
  constructor(client, value) {
    this.client = client;
    this.value = value;
  }

  then(resolve) {
    resolve(this.value);
  }

  async get({ delay = 0 } = {}) {
    await sleep(delay);
    const txHash = await this;
    return this.client.getTransactionByHash(txHash);
  }

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

  // executed failed ?
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

  async confirmed({ bar = 0.01, ...options } = {}) {
    return loop(
      async () => {
        const receipt = await this.executed(options);
        if (await this.client.getRiskCoefficient(receipt.blockHash) < bar) {
          return receipt;
        }
      },
      options,
    );
  }

  async deployed(options) {
    const { transactionHash, outcomeStatus, contractCreated } = await this.confirmed(options);
    if (outcomeStatus === 0) {
      return contractCreated;
    } else {
      throw new Error(`transaction "${transactionHash}" deploy failed with ${outcomeStatus}`);
    }
  }
}

module.exports.PendingTransaction = PendingTransaction;
