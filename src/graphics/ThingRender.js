import Phaser from 'phaser'
import CharacterAvatarHealth from '../graphics/CharacterAvatarHealth'
import ThingAvatarName from '../graphics/ThingAvatarName'
import Spriter from '../graphics/Spriter'

export default class ThingRender {
  constructor ({map}) {
    this.map = map
    this.game = map.game

    this.group = this.game.add.group(0, 0, this.game)

    map.getEvents().listen('addThing', this.addThing.bind(this))
  }

  addThing ({tile, thing, mapX, mapY}) {
    if (thing.render !== undefined) {
      return
    }

    let events = thing.getEvents()
    events.listen('destroy', this.destroyThing.bind(this))
    events.listen('stateUpdate', this.thingStateUpdate.bind(this))
    events.listen('positionChange', this.thingPositionChange.bind(this))
    events.listen('stateChange', this.thingStateChange.bind(this))

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

    // our sprites / animations
    thing.render.spriters = {}
    thing.render.currentSprite = null
    thing.render.currentAnimation = null

    // create a graphics group
    thing.render.group =
      this.game.add.group(0, 0, this.game)

    // add to our group
    this.group.add(thing.render.group)
    // set our position for initial draw
    thing.render.group.x = thing.getX()
    thing.render.group.y = thing.getY()

    // set the initial state so we get a sprite now
    let state = thing.getState(thing.getCurrentStateName())
    this.thingStateChange({ thing, state })
  }

  destroyThing (thing) {
    if (thing.render === undefined) {
      return
    }
    delete thing.render.avatarLife
    delete thing.render.avatarName
    thing.render.group.destroy()
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

  physicsUpdate () {
    this.group.sort('y', Phaser.Group.SORT_ASCENDING)
  }

  thingPositionChange ({thing, x, y}) {
    // update our graphics to new location
    thing.render.group.x = x
    thing.render.group.y = y
  }

  thingStateChange ({ thing, state, onComplete, onCompleteContext }) {
    this.thingSetSpriter(thing, state.sprite)
    this.thingSetAnimation(thing, state.animation, onComplete, onCompleteContext)
  }

  thingInitSpriter (thing, sprite) {
    thing.render.spriters[sprite] = new Spriter({
      game: this.game,
      name: sprite,
      group: thing.render.group
    })
  }

  thingSetSpriter (thing, sprite) {
    if (thing.render.currentSprite !== sprite) {
      if (thing.render.currentSprite !== null) {
        // changing current sprite, we need to kill the existing one
        this.thingKillSpriter(thing, thing.render.currentSprite)
        thing.render.currentAnimation = null
      }
      if (!thing.render.spriters[sprite]) {
        this.thingInitSpriter(thing, sprite)
      }
      thing.render.currentSprite = sprite
    }
  }

  thingKillSpriter (thing, sprite) {
    // TODO this maybe should be destroy, not sure
    thing.render.spriters[sprite].kill()
  }

  thingSetAnimation (thing, animation, onComplete, completeContext) {
    if (thing.render.currentAnimation !== animation) {
      // new animation or sprite, so play animation
      thing.render.spriters[thing.render.currentSprite].playAnimation(
        animation, onComplete, completeContext)
      thing.render.currentAnimation = animation
    }
  }
}
