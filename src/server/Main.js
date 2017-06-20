import Map from '../map/Map'

export default class Main {
  constructor (io) {
    this.io = io
    this.loopRate = 100
    this.loopTimerID = null
    this.loopLastTime = 0
    this.loopCurrentTime = 0
    this.loopElapsedTime = 0
  }

  init () {
    this.listen()
    this.loopScheduleNext()
  }

  listen () {
    this.io.on(
      'connection',
      (clientSocket) => { this.newConnection(clientSocket) }
    )
  }

  newConnection (clientSocket) {
    console.log('a user connected')

    clientSocket.emit('onlog', { log: 'Ready for message test.' })
    var lagTestTime = new Date().getTime()
    clientSocket.emit('onping')

    clientSocket.on('message', function (m) {
      if (m.log !== undefined) {
        console.log('received log message:')
        console.log(m.log)
      }
      if (m.type !== undefined) {
        switch (m.type) {
          case 'pong':
            console.log('time diff: ' + ((new Date().getTime()) - lagTestTime))
            break
        }
      }
    })

    let map = new Map()
    let x = map.getCenterX()
    let y = map.getCenterY()
    while (map.isBlocked(x, y)) {
      x += 1
      y += 1
    }
    clientSocket.emit('character', { x, y })

    let creatures = []
    for (y = 0; y < 3; y++) {
      for (x = 0; x < 3; x++) {
        creatures.push({ x, y })
      }
    }

    clientSocket.emit('creature', {
      creature: creatures
    })
  }

  loopScheduleNext () {
    // set now() as the last time the loop was called
    this.loopLastTime = Date.now()
    // how long until the next call? We try to call every 100ms
    // but need to adjust for the time it took us to do the loop
    let timeToCall = Math.max(0, this.loopRate - (this.loopLastTime - this.loopCurrentTime))
    // the time at the next loop
    this.loopCurrentTime = this.loopLastTime + timeToCall
    // set the timer for the next loop call
    this.loopTimerID = setTimeout(
      function () {
        this.loop()
      }.bind(this),
      timeToCall
    )
  }

  loop () {
    this.loopScheduleNext()
  }

  addClient (clientSocket) {
  }

  update () {
  }
}
