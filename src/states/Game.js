/* globals __DEV__ */
import Phaser from 'phaser'
import Character from '../things/Character'
import Creature from '../things/Creature'
import Defines from '../Defines'
import Map from '../map/Map'
import io from 'socket.io-client'

export default class extends Phaser.State {
  init () {}
  preload () {}

  create () {
    this.map = new Map({ game: this.game })

    // create our main character
    // @ TODO
    // use some sort of position generator for this
    let x = this.map.getCenterX()
    let y = this.map.getCenterY()
    while (this.map.isBlocked(x, y)) {
      x += 1
      y += 1
    }
    this.character = new Character({
      map: this.map,
      name: 'character',
      height: 22,
      width: 16
    })
    this.map.addThing(this.character)

    // create a bunch of random moving tree npcs
    // @ TODO use some sort of npc generator for this
    this.logs = []
    for (let i = 0; i < 40; i++) {
      let x, y
      do {
        x = Creature.randomRange(0, this.map.getHeight())
        y = Creature.randomRange(0, this.map.getWidth())
      } while (this.map.isBlocked(x, y))
      let log = new Creature({
        map: this.map,
        name: 'log',
        x: x,
        y: y,
        height: 22,
        width: 16
      })
      this.map.addThing(log)
      this.logs.push(log)
    }

    let socket = io('http://localhost:4000')
    socket.on('connect', function () {
      console.log('got conected')
      socket.send({log: 'test message from client'})
    })
    socket.on('disconnect', function () {
      console.log('got disconnected')
    })
    socket.on('error', function () {
      console.log('got error')
    })
    socket.on('onlog', function (data) {
      console.log('got log: ' + data.log)
    })
    socket.on('onping', function () {
      console.log('got ping')
      socket.send({type: 'pong'})
    })
  }

  update () {
    let walk = false
    let run = false
    let dir = []
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.A)) {
      dir.push('left')
    } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.D)) {
      dir.push('right')
    }
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.S)) {
      dir.push('down')
    } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.W)) {
      dir.push('up')
    }
    if (dir.length > 0) {
      this.character.setDirections(dir)
      walk = true
    }
    if (walk && this.game.input.keyboard.isDown(Phaser.KeyCode.SHIFT)) {
      run = true
    }
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR)) {
      this.character.attack(walk | run)
    } else if (run) {
      this.character.run()
    } else if (walk) {
      this.character.walk()
    }

    this.logs.forEach((log) => {
      // @TODO
      // refactor this to use some sort of AI agent that generates actions
      // similar to the keyboard actions above, then we can just loop through
      // all actors and use their 'agent' to generate actions
      // main loop can just call getNextAction() from each agent
      // we can bind a keyboard agent to the player character
      // and we can bind an AI agent to each npc
      // at that point we may not need the Creature type, since it's basically
      // the same as a Character, or maybe the AI is baked into the Character/Creature
      // type of classes
      log.aiAction()
      log.update()
    })

    this.character.update()

    this.map.update()
  }

  render () {
    if (__DEV__) {
      // this.game.debug.spriteInfo(this.character.spriters[this.character.name].sprite, 32, 32)
      let x = Math.floor((this.character.x / Defines.mapTileWidth))
      let y = Math.floor((this.character.y / Defines.mapTileHeight))
      this.game.debug.text('Character: tile x,y = ' +
        String(x) + ', ' + String(y) + ' ' +
        'Character: x,y = ' +
        String(this.character.x) + ', ' + String(this.character.y)
      , 10, 20)
    }
  }
}
