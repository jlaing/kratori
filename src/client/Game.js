/* globals __DEV__ */
import Phaser from 'phaser'
import Character from '../things/Character'
import Creature from '../things/Creature'
import Defines from '../Defines'
import Map from '../map/Map'
import Input from '../client/Input'
import CharacterInputCommand from '../client/CharacterInputCommand'
import MapRender from '../graphics/MapRender'
import ThingRender from '../graphics/ThingRender'
import io from 'socket.io-client'
import AssetLoader from '../client/AssetLoader'

export default class extends Phaser.State {
  init () {}
  preload () {
    this.game.time.advancedTiming = true
  }

  create () {
    this.input = new Input({game: this.game})
    this.characterInput = new CharacterInputCommand({input: this.input})

    this.characterInput.getEvents().listen(
      'inputChange', ({x, y, dir, run, attack}) => {
        console.log('input change')
      })

    this.map = new Map()
    this.mapRender = new MapRender({ map: this.map, game: this.game })
    this.thingRender = new ThingRender({ map: this.map, game: this.game })

    // @ TODO
    // take 'input changes' and send those to the server
    // have server make logs move and send movement to client

    // @ TODO
    // sync map, spawns, movement, actions, kills with server

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
    socket.on('character', function (character) {
      console.log(character)
      console.log('character received')
      if (!this.map.isBlocked(character.x, character.y)) {
        this.character = new Character({
          definition: AssetLoader.loadDefinition(this.game, 'character'),
          map: this.map,
          name: 'character',
          x: character.x,
          y: character.y,
          height: 22,
          width: 16
        })
        this.characterInput.setCharacter(this.character)
        this.map.addThing(this.character)
        console.log('character added')
      }
    }.bind(this))
    socket.on('creature', function (data) {
      console.log(data)
      data.creature.forEach((creature) => {
        console.log('creature received')
        if (!this.map.isBlocked(creature.x, creature.y)) {
          let log = new Creature({
            definition: AssetLoader.loadDefinition(this.game, 'log'),
            map: this.map,
            name: 'log',
            x: creature.x,
            y: creature.y,
            height: 22,
            width: 16
          })
          this.map.addThing(log)
          console.log('creature added')
        }
      }, this)
    }.bind(this))
    socket.on('onping', function () {
      console.log('got ping')
      socket.send({type: 'pong'})
    })

    this.stateLoop = null
  }

  paused () {
    if (this.stateLoop !== null) {
      this.game.time.events.remove(this.stateLoop)
      this.stateLoop = null
    }
  }
  resumed () {
    if (this.stateLoop === null) {
      this.startStateLoop()
    }
  }

  startStateLoop () {
    this.stateLoop = this.game.time.events.loop(100, this.stateUpdate, this)
  }

  stateUpdate () {
    this.map.stateUpdate()
  }

  update () {
    if (this.stateLoop === null) {
      this.startStateLoop()
    }

    this.input.physicsUpdate(this.game.time.physicsElapsed)
    this.map.physicsUpdate(this.game.time.physicsElapsed)
    this.thingRender.physicsUpdate(this.game.time.physicsElapsed)
  }

  render () {
    if (__DEV__ && this.character) {
      // this.game.debug.spriteInfo(this.character.spriters[this.character.name].sprite, 32, 32)
      let x = Math.floor((this.character.x / Defines.mapTileWidth))
      let y = Math.floor((this.character.y / Defines.mapTileHeight))
      this.game.debug.text('Character: tile x,y = ' +
        String(x) + ', ' + String(y) +
        ' fps: ' + this.game.time.fps
      , 10, 20)
    }
  }
}
