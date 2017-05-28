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
    if (this.actionTime < 100) {
      this.actionTime++
    } else {
      this.actionTime = 0
      let dir = Creature.randomChoice([
        ['up'],
        ['down'],
        ['left'],
        ['right'],
        ['left', 'up'],
        ['left', 'down'],
        ['right', 'up'],
        ['right', 'down']
      ])
      this.setDirections(dir)
      if (Creature.randomChance(25)) {
        if (Creature.randomChance(25)) {
          this.run()
        } else {
          this.walk()
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
