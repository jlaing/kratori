import Character from './Character'

/*
thing.json format

*/

export default class Creature extends Character {
  constructor ({ map, name, x, y, height, width }) {
    super({ map, name, x, y, height, width })
    // current action time
    this.actionTime = Creature.randomRange(0, 100)
  }

  aiAction () {
    if (this.actionTime < 50) {
      this.actionTime++
    } else {
      this.actionTime = 0
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
      this.setMovement(dir[0], dir[1])
      if (Creature.randomChance(25)) {
        if (Creature.randomChance(25)) {
          this.setRun(true)
        } else {
          this.setRun(false)
        }
      }
    }
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
