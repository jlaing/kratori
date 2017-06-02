import Spriter from '../graphics/Spriter'
import Defines from '../Defines'
import ThingAvatarName from '../graphics/ThingAvatarName'

/*
thing.json format

Things can go on the map, so they have set/getMapX,Y and
set/getMapDestinationX,Y
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
    // do we block movement onto our map tile?
    this.blocking = false
    // what's our pixel position?
    this.x = map.getPixelX(x)
    this.y = map.getPixelY(y)
    this.destinationX = this.x
    this.destinationY = this.y
    this.speed = 0

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

    this.currentState = null

    // our sprites / animations
    this.spriters = {}
    this.currentSprite = null
    this.currentAnimation = null

    // create a graphics group
    this.group = this.game.add.group(this.x, this.y, this.game)

    this.map.getThingsGroup().add(this.group)

    // are we still alive? or should map remove us
    this.alive = true

    // get us started in the right state
    this.setDefaultState()

    // add the avatar name to over over this
    this.avatarName = new ThingAvatarName(
      { thing: this, group: this.group, game: this.game }
    )
  }

  destroy () {
    // take away our references to these so they will get garbage collected
    // and then we can get garbage collected to
    this.avatarName = null
    this.group.destroy()
  }

  setX (x) {
    this.x = x
  }
  setY (y) {
    this.y = y
  }
  getX () {
    return this.x
  }
  getY () {
    return this.y
  }
  getDestinationX () {
    return this.destinationX
  }
  getDestinationY () {
    return this.destinationY
  }
  setSpeed (speed) {
    this.speed = speed
  }
  getSpeed () {
    return this.speed
  }

  // base Thing never moves on it's own
  setMovement (dx, dy) {
  }
  getMovementX () {
    return 0
  }
  getMovementY () {
    return 0
  }
  getMovementSpeed () {
    return 0
  }

  setMapX (x) {
    this.mapX = x
  }
  setMapY (y) {
    this.mapY = y
  }
  getMapX () {
    return this.mapX
  }
  getMapY () {
    return this.mapY
  }
  setMapDestinationX (x) {
    this.mapDestinationX = x
    this.destinationX = this.map.getPixelX(x)
  }
  setMapDestinationY (y) {
    this.mapDestinationY = y
    this.destinationY = this.map.getPixelY(y)
  }
  getMapDestinationX () {
    return this.mapDestinationX
  }
  getMapDestinationY () {
    return this.mapDestinationY
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
    if (this.currentState === stateName) {
      return
    }

    let state = this.getState(stateName)

    if (state === undefined) {
      return
    }

    this.setSpriter(state.sprite)
    this.setAnimation(state.animation, onComplete, onCompleteContext)
    this.currentState = stateName
  }

  setSpriter (sprite) {
    if (this.currentSprite !== sprite) {
      if (this.currentSprite !== null) {
        // changing current sprite, we need to kill the existing one
        this.killSpriter(this.currentSprite)
        this.currentAnimation = null
      }
      if (!this.spriters[sprite]) {
        this.initSpriter(sprite)
      }
      this.currentSprite = sprite
    }
  }

  initSpriter (sprite) {
    this.spriters[sprite] = new Spriter({
      game: this.game,
      name: sprite,
      group: this.group
    })
  }

  isAlive () {
    return this.alive
  }

  kill () {
    this.alive = false
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

  stateUpdate () {
    this.avatarName.stateUpdate()
  }

  graphicsUpdate () {
    let speed = this.getSpeed()
    if (speed !== 0) {
      let x = this.getX()
      let y = this.getY()
      let destX = this.getDestinationX()
      let destY = this.getDestinationY()
      let dx = destX - x
      let dy = destY - y

      if (dx !== 0 || dy !== 0) {
        // speed is expressed in map tiles per second
        // so speed in pixels is mapTileWidth/Height * speed
        // scale the speed by fractional seconds that has passed since last update
        let speedX = speed * Defines.mapTileWidth * this.game.time.physicsElapsed
        let speedY = speed * Defines.mapTileHeight * this.game.time.physicsElapsed

        // make sure we aren't moving faster than our movement speed
        if (Math.abs(dx) > speedX) {
          dx = speedX * Math.sign(dx)
        }
        if (Math.abs(dy) > speedY) {
          dy = speedY * Math.sign(dy)
        }

        // adjust x/y
        x += dx
        y += dy

        // if we are within 0.5 px of dest then snap
        if (Math.abs(destX - x) < 0.5) {
          x = destX
        }
        if (Math.abs(destY - y) < 0.5) {
          y = destY
        }

        // we have our new pixel location
        this.setX(x)
        this.setY(y)
      }
    }

    // update our graphics to new location
    this.group.x = this.x
    this.group.y = this.y
  }
}
