/**
 * Await sleep.
 *
 * @memberOf utils
 * @param ms {number} - Sleep duration in ms.
 * @return {Promise<undefined>}
 */
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

/**
 * Loop execute `func` if it return `undefined`
 *
 * @memberOf utils
 * @param func {function} - Function to execute.
 * @param [options] {object}
 * @param [options.delta=1000] {number} - Loop transaction interval in ms.
 * @param [options.timeout=30*1000] {number} - Loop timeout in ms.
 * @return {Promise<*>}
 */
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

module.exports = {
  sleep,
  loop,
};
