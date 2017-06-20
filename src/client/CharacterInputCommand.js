import EventsSubPub from '../Utils/EventsSubPub'

export default class CharacterInputCommand {
  constructor ({input}) {
    this.input = input
    this.character = null
    this.events = new EventsSubPub()

    this.lastMovementX = 0
    this.lastMovementY = 0
    this.lastDirection = 'down'
    this.lastRun = false
    this.lastAttack = false

    this.input.getEvents().listen('input', this.hasInput.bind(this))
  }

  getEvents () {
    return this.events
  }

  setCharacter (character) {
    this.character = character
  }

  hasInput ({ x, y, run, attack }) {
    if (this.character === null) {
      return
    }
    let dir = this.character.getDirection()
    if (y > 0) {
      dir = 'down'
    } else if (y < 0) {
      dir = 'up'
    }
    if (x > 0) {
      dir = 'right'
    } else if (x < 0) {
      dir = 'left'
    }
    if (x !== 0 || y !== 0) {
      this.character.setRun(run)
    }
    this.character.setAttack(attack)
    this.character.setMovement(x, y)
    this.character.setDirection(dir)

    if (this.lastMovementX !== x ||
        this.lastMovementY !== y ||
        this.lastDirection !== dir ||
        this.lastRun !== run ||
        this.lastAttack !== attack) {
      this.events.fire('inputChange', { x, y, dir, run, attack })
    }

    this.lastMovementX = x
    this.lastMovementY = y
    this.lastDirection = dir
    this.lastRun = run
    this.lastAttack = attack
  }
}
