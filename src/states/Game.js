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

    // @ TODO
    // Make sounds for actions

    // @ TODO
    // Make logs attack player, ai action should test if player is near

    // @ TODO
    // Create drops
    // when Character kill() called drop random (make it an action)

    // @ TODO
    // make a player inventory
    // pick up things automatically that are on current square

    // @ TODO
    // make map

    // @ TODO
    // make map blocking

    // @ TODO
    // make map mutable with drops

    // @ TODO
    // make so you can click on map to go to location (route finding)

    // @ TODO
    // make so you can select controlled units in mass and direct

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
      x: x,
      y: y,
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
        x = Creature.randomRange(2, this.map.getHeight() - 3)
        y = Creature.randomRange(2, this.map.getWidth() - 3)
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
    let destX = 0
    let destY = 0
    let dir = this.character.getDirection()
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.S)) {
      destY++
      dir = 'down'
    }
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.W)) {
      destY--
      dir = 'up'
    }
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.A)) {
      destX--
      dir = 'left'
    }
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.D)) {
      destX++
      dir = 'right'
    }
    if (destX !== 0 || destY !== 0) {
      if (this.game.input.keyboard.isDown(Phaser.KeyCode.SHIFT)) {
        this.character.setRun(true)
      } else {
        this.character.setRun(false)
      }
    }
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR)) {
      this.character.setAttack(true)
    } else {
      this.character.setAttack(false)
    }
    this.character.setMovement(destX, destY)
    this.character.setDirection(dir)

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
    })

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
