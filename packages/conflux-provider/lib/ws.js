const EventEmitter = require('events');
const WS = require('ws');

function randomId() {
  return `${Date.now()}${Math.random().toFixed(7).substring(2)}`; // 13+7=20 int string
}

class WebsocketProvider {
  constructor(url, {
    timeout = 60 * 1000,
    log,
  } = {}) {
    this.url = url;
    this.timeout = timeout;
    this.log = log;

    this.messageEvent = new EventEmitter();
  }

  async getWS() {
    if (!this.ws || [WS.CLOSED, WS.CLOSING].includes(this.ws.readyState)) {
      const ws = new WS(this.url);

      ws.on('message', message => {
        const body = JSON.parse(message);
        this.messageEvent.emit(body.id, body);
      });
      ws.on('close', () => {});
      ws.on('error', () => {});
      await new Promise(resolve => ws.once('open', resolve));

      this.ws = ws;
    }
    return this.ws;
  }

  async call(method, ...params) {
    const startTime = Date.now();
    const data = { jsonrpc: '2.0', id: randomId(), method, params };

    const ws = await this.getWS();

    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(
        () => reject(new Error(`timeout when call ${method}(${params.join(',')}) after ${this.timeout} ms`)),
        this.timeout,
      );

      this.messageEvent.once(data.id, ({ error, result }) => {
        if (this.log) {
          this.log({ data, result, error, duration: Date.now() - startTime });
        }

        clearTimeout(timeoutHandle);
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });

      ws.send(JSON.stringify(data));
    });
  }

  close() {
    if (this.ws) {
      this.ws.terminate();
      this.messageEvent.removeAllListeners();
    }
  }
}

module.exports = WebsocketProvider;
