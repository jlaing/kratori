import Spriter from '../sprites/Spriter'
import Defines from '../Defines'

/*
thing.json format

*/

export default class Thing {
  static getDefinitionAssetName (name) {
    return name + '.thing'
  }

  static getDefinitionPath (name) {
    return 'assets/things/' + name + '.json'
  }

  static cacheDefinition (loader, name) {
    loader.json(
      Thing.getDefinitionAssetName(name),
      Thing.getDefinitionPath(name)
    )
  }

  static cacheAssets (loader, name) {
    let definition = Thing.loadDefinition(loader, name)
    let sprites = []
    Object.keys(definition.states).forEach((state) => {
      if (
        definition.states[state].sprite &&
        !sprites.includes(definition.states[state].sprite)
      ) {
        sprites.push(definition.states[state].sprite)
      }
    })
    sprites.forEach((sprite) => {
      Spriter.cache(loader, sprite)
    })
  }

  static loadDefinition (game, name) {
    return game.cache.getJSON(Thing.getDefinitionAssetName(name))
  }

  constructor ({ map, name, x, y, height, width }) {
    this.map = map
    this.game = map.game
    this.name = name
    // what map tile are we on?
    this.mapX = x
    this.mapY = y
    // what map tile are we going to next?
    this.mapDestinationX = x
    this.mapDestinationY = y
    // how fast (in pixels) are we moving?
    this.speed = 0
    // do we block movement onto our map tile?
    this.blocking = false
    // what's our pixel position?
    this.x = map.getPixelX(x)
    this.y = map.getPixelY(y)

    // how big are we?
    if (height === undefined) {
      height = Defines.mapTileHeight
    }
    if (width === undefined) {
      width = Defines.mapTileWidth
    }
    this.width = width
    this.height = height

    // load from our JSON
    this.definition = Thing.loadDefinition(this.game, name)

    // our sprites / animations
    this.spriters = {}
    this.currentSprite = null
    this.currentAnimation = null

    // get us started in the right state
    this.setDefaultState()
  }

  getMapX () {
    return this.mapX
  }
  getMapY () {
    return this.mapY
  }
  getMapDestinationX () {
    return this.mapDestinationX
  }
  getMapDestinationY () {
    return this.mapDestinationY
  }

  // only the map should call these
  setMapDestinationX (newMapX) {
    this.mapDestinationX = newMapX
  }
  // only the map should call these
  setMapDestinationY (newMapY) {
    this.mapDestinationY = newMapY
  }

  isBlocking () {
    return this.blocking
  }

  loadDefinition () {
    return this.game.cache.getJSON(Thing.getDefinitionAssetName(this.name))
  }

  setDefaultState () {
    this.setState(this.definition.defaultState)
  }

  setState (stateName, onComplete, onCompleteContext) {
    let state = this.getState(stateName)

    if (state === undefined) {
      console.log(stateName + ' state not found in ' + this.name)
      return
    }

    this.setSpriter(state.sprite)
    this.setAnimation(state.animation, onComplete, onCompleteContext)
  }

  setSpriter (sprite) {
    if (this.currentSprite !== sprite) {
      if (this.currentSprite !== null) {
        // changing current sprite, we need to kill the existing one
        this.killSpriter(this.currentSprite)
        this.currentAnimation = null
      }
      if (this.spriters[sprite]) {
        // spriter exists, just need to bring it back to screen
        this.resetSpriter(sprite)
      } else {
        // spriter is new, need to init it
        this.initSpriter(sprite)
      }
      this.currentSprite = sprite
    }
  }

  initSpriter (sprite) {
    this.spriters[sprite] = new Spriter({
      game: this.game,
      name: sprite,
      group: this.map.getThingsGroup(),
      x: this.x,
      y: this.y
    })
  }

  resetSpriter (sprite) {
    this.spriters[sprite].reset({
      x: this.x,
      y: this.y
    })
  }

  killSpriter (sprite) {
    // TODO this maybe should be destroy, not sure
    this.spriters[sprite].kill()
  }

  setAnimation (animation, onComplete, completeContext) {
    if (this.currentAnimation !== animation) {
      // new animation or sprite, so play animation
      this.spriters[this.currentSprite].playAnimation(
        animation, onComplete, completeContext)
      this.currentAnimation = animation
    }
  }

  getState (stateName) {
    return this.definition.states[stateName]
  }

  update () {
    let destX = this.map.getPixelX(this.mapDestinationX)
    let destY = this.map.getPixelY(this.mapDestinationY)

    if (this.speed > 0 && this.x !== destX) {
      // need to move horizontally
      if (destX > this.x) {
        // we are moving right so add speed
        this.x += this.speed
        // don't go past our destination
        if (this.x > destX) {
          this.x = destX
        }
      } else {
        // we are moving left so subtract speed
        this.x -= this.speed
        // don't go past our destination
        if (this.x < destX) {
          this.x = destX
        }
      }
    }

    if (this.speed > 0 && this.y !== destY) {
      // need to move vertically
      if (destY > this.y) {
        // we are moving down so add speed
        this.y += this.speed
        // don't go past our destination
        if (this.y > destY) {
          this.y = destY
        }
      } else {
        // we are moving up so subtract speed
        this.y -= this.speed
        // don't go past our destination
        if (this.y < destY) {
          this.y = destY
        }
      }
    }

    // if we've reached our destination we can stop moving
    if (this.x === destX &&
        this.y === destY) {
      this.speed = 0
      this.mapX = this.mapDestinationX
      this.mapY = this.mapDestinationY
    }

    // update our graphics to new location
    this.spriters[this.currentSprite].moveTo({
      x: this.x,
      y: this.y
    })
    this.spriters[this.currentSprite].update()
  }
}
