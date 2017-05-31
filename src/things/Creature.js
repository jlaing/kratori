import Character from './Character'

/*
thing.json format

*/

export default class Creature extends Character {
  constructor ({ map, name, x, y, height, width }) {
    super({ map, name, x, y, height, width })
    // current action time
    this.actionTime = Creature.randomRange(0, 100)
    // current action
    this.actionMovementDirX = 0
    this.actionMovementDirY = 0
    this.actionRun = false
  }

  stateUpdate () {
    if (this.actionTime < 100) {
      this.actionTime += Creature.randomRange(0, 30)
    } else {
      this.actionTime = 0
      if (Creature.randomChance(10)) {
        let dir = Creature.randomChoice([
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1]
        ])
        if (Creature.randomChance(50)) {
          this.actionMovementDirX = dir[0]
          this.actionMovementDirY = dir[1]
        } else {
          this.actionMovementDirX = 0
          this.actionMovementDirY = 0
        }
      }
      this.actionRun = Creature.randomChance(50)
    }

    this.setMovement(this.actionMovementDirX, this.actionMovementDirY)
    this.setRun(this.actionRun)

    super.stateUpdate()
  }

  static randomChance (prob) {
    return (Math.random() < (prob / 100))
  }

  static randomChoice (choices) {
    let c = Math.floor(Math.random() * (choices.length))
    return choices[c]
  }

  static randomRange (min, max) {
    return (Math.floor(Math.random() * (max - min)) + min)
  }
}
