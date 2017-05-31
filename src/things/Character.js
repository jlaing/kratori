import Thing from './Thing'
import Defines from '../Defines'
import CharacterAvatarHealth from '../sprites/CharacterAvatarHealth'
import Attack from '../actions/Attack'

/*
thing.json format

*/

export default class Character extends Thing {
  constructor ({ map, name, x, y, height, width }) {
    super({ map, name, x, y, height, width })
    // where do we want to move?
    // vector
    this.movementX = 0 // -1, 0, or 1
    this.movementY = 0 // -1, 0, or 1
    // speed
    this.movementSpeed = 0 // speed we want to move at
    // are we attacking
    this.startAttack = false
    // where were we last update? so we can calc movement dir and speed
    this.lastX = this.x
    this.lastY = this.y
    // state
    this.direction = 'down' // 'up', 'down', 'left', 'right'
    this.doing = 'stand'
    this.doNext = null
    // Characters and subclasses are blocking
    // default for "thing" is false
    this.blocking = true

    // game logic
    this.health = this.definition.startingHealth
    this.attackAction = new Attack({character: this, map})

    this.avatarLife = new CharacterAvatarHealth(
      {character: this, group: this.group, game: this.game}
    )
  }

  destroy () {
    // take away our references to these so they will get garbage collected
    // and then we can get garbage collected to
    this.attackAction = null
    this.avatarLife = null
    super.destroy()
  }

  damage (amount) {
    this.health -= amount
    if (this.health <= 0) {
      this.kill()
    }
  }

  setRun (run) {
    // can't change speed while attacking
    if (this.startAttack || this.doing === 'attack') {
      return
    }
    if (run) {
      this.movementSpeed = Defines.runSpeed
    } else {
      this.movementSpeed = Defines.walkSpeed
    }
  }
  setAttack (attack) {
    if (attack) {
      this.movementSpeed = Defines.attackSpeed
      this.startAttack = true
    } else {
      this.startAttack = false
    }
  }

  // these override the Thing methods that do nothing
  setMovement (dx, dy) {
    this.movementX += dx
    this.movementY += dy
    // make the movement a maximum of -1 to 1
    this.movementX = Math.sign(this.movementX)
    this.movementY = Math.sign(this.movementY)
  }

  clearMovement () {
    this.movementX = 0
    this.movementY = 0
    this.movementSpeed = 0
  }

  getMovementX () {
    return this.movementX
  }
  getMovementY () {
    return this.movementY
  }
  getMovementSpeed () {
    return this.movementSpeed
  }

  setDirection (dir) {
    this.direction = dir
  }
  getDirection () {
    return this.direction
  }

  run () {
    this.doAction('run')
  }

  walk () {
    this.doAction('walk')
  }

  stand () {
    this.doAction('stand')
  }

  attack () {
    this.doAction('attack', this.doing, this.attackAction)
  }

  doAction (action, doNext, actionObj) {
    if (this.doNext !== null) {
      return // already doing something that can't be stopped
    }
    this.doing = action
    if (doNext) {
      this.doNext = doNext
      this.setState(
        action + '_' + this.getDirection(),
        () => {
          this.onNext()
        },
        this
      )
    } else {
      this.setState(action + '_' + this.getDirection())
    }

    if (actionObj) {
      actionObj.execute()
    }
  }

  onNext () {
    if (this.doNext !== null) {
      let next = this.doNext
      this.doNext = null
      this.doAction(next)
    }
  }

  stateUpdate () {
    this.avatarLife.stateUpdate()

    super.stateUpdate()
  }

  graphicsUpdate () {
    let actualDY = this.y - this.lastY
    let actualDX = this.x - this.lastX

    if (actualDX < 0) {
      this.setDirection('left')
    } else if (actualDX > 0) {
      this.setDirection('right')
    } else if (actualDY < 0) {
      this.setDirection('up')
    } else if (actualDY > 0) {
      this.setDirection('down')
    }

    if (this.startAttack || this.doing === 'attack') {
      this.attack()
    } else if (actualDY === 0 && actualDX === 0) {
      this.stand()
    } else if (this.getSpeed() > Defines.walkSpeed) {
      this.run()
    } else {
      this.walk()
    }

    this.lastX = this.x
    this.lastY = this.y

    super.graphicsUpdate()
  }
}
