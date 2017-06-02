export default class EventsSubPub {
  constructor () {
    this.listeners = {}
  }
  listen (event, callback) {
    if (this.listeners[event] === undefined) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }
  fire (event, data) {
    if (this.listeners[event] === undefined) {
      return
    }
    this.listeners[event].forEach((callback) => {
      callback(data)
    })
  }
}
