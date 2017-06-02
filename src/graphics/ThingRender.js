import Phaser from 'phaser'
import CharacterAvatarHealth from '../graphics/CharacterAvatarHealth'
import ThingAvatarName from '../graphics/ThingAvatarName'

export default class ThingRender {
  constructor ({map}) {
    this.map = map
    this.game = map.game

    this.group = this.game.add.group(100, 100, this.game)

    map.getEvents().listen('addThing', this.addThing.bind(this))
  }

  addThing ({tile, thing, mapX, mapY}) {
    if (thing.render !== undefined) {
      return
    }

    thing.getEvents().listen('destroy', this.destroyThing.bind(this))
    thing.getEvents().listen('stateUpdate', this.thingStateUpdate.bind(this))

    thing.render = {}

    if (thing.thingType === 'character' || thing.thingType === 'creature') {
      console.log('add character')
      // add the avatarLife to hover over character
      thing.render.avatarLife = new CharacterAvatarHealth(
        { character: thing, group: this.group, game: this.game }
      )
    }

    // add the avatar name to hover over thing
    console.log('add thing')
    thing.render.avatarName = new ThingAvatarName(
      { thing: thing, group: this.group, game: this.game }
    )
  }
  destroyThing (thing) {
    if (thing.render === undefined) {
      return
    }
    delete thing.render.avatarLife
    delete thing.render.avatarName
  }

  thingStateUpdate (thing) {
    if (thing.render === undefined) {
      return
    }
    if (thing.render.avatarLife !== undefined) {
      thing.render.avatarLife.stateUpdate()
    }
    if (thing.render.avatarName !== undefined) {
      thing.render.avatarName.stateUpdate()
    }
  }

  graphicsUpdate () {
    this.group.sort('y', Phaser.Group.SORT_ASCENDING)
  }
}
