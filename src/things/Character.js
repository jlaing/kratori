import Thing from './Thing'
import Defines from '../Defines'

/*
thing.json format

*/

export default class Character extends Thing {
  constructor ({ map, name, x, y, height, width }) {
    super({ map, name, x, y, height, width })
    // can have up to two directions, like 'up', 'left'
    this.directions = ['down']
    this.doing = 'stand'
    this.doNext = null
    this.speed = 0
    // Characters and subclasses are blocking
    // default for "thing" is false
    this.blocking = true
  }

  setDirections (dirs) {
    this.directions = dirs
  }

  run () {
    this.speed = Defines.runSpeed
  }

  walk () {
    this.speed = Defines.walkSpeed
  }

  stand () {
    this.speed = 0
  }

  attack (move = false) {
    if (move) {
      this.speed = Defines.attackSpeed
    } else {
      this.speed = 0
    }
    this.doAction('attack', this.doing)
  }

  doAction (action, doNext) {
    if (this.doNext !== null) {
      return // already doing something that can't be stopped
    }
    this.doing = action
    if (doNext) {
      this.doNext = doNext
      this.setState(
        action + '_' + this.directions[0],
        () => {
          this.onNext()
        },
        this
      )
    } else {
      this.setState(action + '_' + this.directions[0])
    }
  }

  onNext () {
    if (this.doNext !== null) {
      let next = this.doNext
      this.doNext = null
      this.do(next)
    }
  }

  update () {
    let dx = 0
    let dy = 0
    this.directions.forEach((dir) => {
      switch (dir) {
        case 'up':
          dy = -1
          break
        case 'down':
          dy = 1
          break
        case 'left':
          dx = -1
          break
        case 'right':
          dx = 1
          break
      }
    })

    if (this.map.moveThing(this, dx, dy)) {
      if (this.speed >= Defines.runSpeed) {
        this.doAction('run')
      } else if (this.speed > 0) {
        this.doAction('walk')
      } else {
        this.doAction('stand')
      }
    } else {
      this.doAction('stand')
    }

    super.update()
  }
}
