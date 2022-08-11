/**
 * @typedef {typeof onmessage} OnMessageFunction
 * @typedef {typeof postMessage} PostMessageFunction
 */


export default class Cartographer {
  /**
   * TODO: prefix with _
   * 
   * @type {PostMessageFunction}
   */
  _postMessage;

  /**
   * 
   * @param {OnMessageFunction} onMessage 
   * @param {PostMessageFunction} postMessage 
   */
  constructor(onMessage, postMessage) {
    this._postMessage = postMessage;

    onMessage = this.receiveMessage;
  }

  /**
   * 
   * @param {MessageEvent} ev 
   */
  receiveMessage(ev) {}

  sendMessage() {
    const message = {};
    /** @type {Transferable[]} */
    const transfer = [];

    this._postMessage(message, transfer);
  }
}
