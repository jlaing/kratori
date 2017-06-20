import Phaser from 'phaser'
import EventsSubPub from '../Utils/EventsSubPub'

export default class Input {
  constructor ({ game }) {
    this.game = game
    this.events = new EventsSubPub()
  }

  getEvents () {
    return this.events
  }

  physicsUpdate (physicsTimeElapsed) {
    let x = 0
    let y = 0
    let attack = false
    let run = false
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.S)) {
      y++
    }
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.W)) {
      y--
    }
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.D)) {
      x++
    }
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.A)) {
      x--
    }
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.SHIFT)) {
      run = true
    }
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR)) {
      attack = true
    }
    this.events.fire('input', { x, y, run, attack })
  }
}
