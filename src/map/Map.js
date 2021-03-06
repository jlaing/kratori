import Defines from '../Defines'
import EventsSubPub from '../Utils/EventsSubPub'
import config from '../config'

export default class Map {
  constructor () {
    this.events = new EventsSubPub()
    this.tiles = []
    this.currentID = 0
  }

  getEvents () {
    return this.events
  }

  getMapXFromPixel (x) {
    return Math.floor(x / Defines.mapTileWidth)
  }
  getMapYFromPixel (y) {
    return Math.floor(y / Defines.mapTileHeight)
  }
  getPixelX (mapX) {
    return mapX * Defines.mapTileWidth + Math.floor(Defines.mapTileWidth / 2)
  }
  getPixelY (mapY) {
    return mapY * Defines.mapTileHeight + Math.floor(Defines.mapTileHeight / 2)
  }

  getWidth () {
    if (this._cache_getWidth === undefined) {
      this._cache_getWidth = this.getMapXFromPixel(config.gameWidth)
    }
    return this._cache_getWidth
  }
  getHeight () {
    if (this._cache_getHeight === undefined) {
      this._cache_getHeight = this.getMapYFromPixel(config.gameHeight)
    }
    return this._cache_getHeight
  }
  getCenterX () {
    return this.getMapXFromPixel(Math.floor(config.gameWidth / 2))
  }
  getCenterY () {
    return this.getMapYFromPixel(Math.floor(config.gameHeight / 2))
  }

  getTileStartX (mapX) {
    return mapX * Defines.mapTileWidth
  }
  getTileStartY (mapY) {
    return mapY * Defines.mapTileHeight
  }

  addThing (thing) {
    let mapX = thing.getMapX()
    let mapY = thing.getMapY()
    let tile = this.getTile(mapX, mapY, true)

    if (tile.things.indexOf(thing) === -1) {
      // only add if we are not already on this tile
      if (thing.isBlocking()) {
        // always put blocking elements at the front
        tile.things.unshift(thing)
      } else {
        tile.things.push(thing)
      }
    }

    this.events.fire('addThing', { tile, thing, mapX, mapY })
  }

  getTile (mapX, mapY, createIfNone = false) {
    if (this.tiles[mapX] === undefined) {
      if (!createIfNone) {
        return null
      }
      this.tiles[mapX] = []
    }
    if (this.tiles[mapX][mapY] === undefined ||
      this.tiles[mapX][mapY] === null) {
      if (!createIfNone) {
        return null
      }
      this.tiles[mapX][mapY] = { graphics: null, things: [] }
    }
    return this.tiles[mapX][mapY]
  }

  getThingsAt (mapX, mapY) {
    let tile = this.getTile(mapX, mapY)
    if (tile === null) {
      return null
    }
    return tile.things
  }

  isBlocked (mapX, mapY) {
    let tile = this.getTile(mapX, mapY)
    if (tile === null || tile.things.length === 0) {
      return false
    }
    // if there is a blocking thing it will be at the start of the array
    return tile.things[0].isBlocking()
  }

  removeThing (thing) {
    let mapX = thing.getMapX()
    let mapY = thing.getMapY()
    let tile = this.getTile(mapX, mapY)

    if (tile === null) {
      return
    }

    // find the thing in the current tile
    let currentIndex = tile.things.indexOf(thing)
    if (currentIndex > -1) {
      tile.things.splice(currentIndex, 1)
    }
    if (tile.things.length === 0) {
      // the tile is empty so let's delete it
      delete this.tiles[mapX][mapY]
    }

    this.events.fire('removeThing', { tile, thing, mapX, mapY })
  }

  updateStateThing (thing) {
    if (!thing.isAlive()) {
      this.removeThing(thing)
      thing.destroy()
      return
    }
    thing.stateUpdate()

    // 1 if there is movement
    //   a change the destination with the movement
    //   b we've used the movement so clear it
    // 2 if destination is same as current location, then we are done
    // 3 if the destination is blocked set destination to current position
    // note: actual movement happens in the grapics update
    // 4 update the current map position, moving tiles if nec

    let moveDX = thing.getMovementX()
    let moveDY = thing.getMovementY()
    let moveSpeed = thing.getMovementSpeed()

    let mapX = thing.getMapX()
    let mapY = thing.getMapY()

    // 1 if there is movement
    //   a change the destination with the movement
    //   b we've used the movement so clear it
    if (moveSpeed > 0 && Math.abs(moveDX) + Math.abs(moveDY) > 0) {
      this.doThingNewDestination(thing, mapX, mapY, moveDX, moveDY)
    }

    let mapDestX = thing.getMapDestinationX()
    let mapDestY = thing.getMapDestinationY()
    let speed = thing.getSpeed()

    if (speed === 0) {
      // nothing to do cause we have no speed
      return
    }

    // 2 if destination is same as current location, then just do tween if any
    //    to snap to current mapX,Y
    if (mapDestX === mapX && mapDestY === mapY) {
      return
    }

    // 3 if the destination is blocked set destination to current position
    if (this.isBlocked(mapDestX, mapDestY)) {
      thing.setMapDestinationX(mapX)
      thing.setMapDestinationY(mapY)
      mapDestX = mapX
      mapDestY = mapY
    }

    // 4 update the current map position, moving tiles if nec
    let newMapX = this.getMapXFromPixel(thing.getX())
    let newMapY = this.getMapYFromPixel(thing.getY())
    if (newMapX !== mapX || newMapY !== mapY) {
      // remove from old tile
      this.removeThing(thing)

      // put myself on the new tile
      // this will start a tween to this new position
      thing.setMapX(newMapX)
      thing.setMapY(newMapY)

      // and put us on the new tile
      // this uses the destination
      this.addThing(thing)
    }
  }

  doThingNewDestination (thing, mapX, mapY, moveDX, moveDY) {
    // get the old movement, maybe none
    let oldMoveDX = thing.getMapDestinationX() - mapX
    let oldMoveDY = thing.getMapDestinationY() - mapY
    // add the new movement to the old
    // but make it maximum of -1 to 1 (with Math.sign)
    let adjustedMoveDX = Math.sign(moveDX + oldMoveDX)
    let adjustedMoveDY = Math.sign(moveDY + oldMoveDY)
    // there is movement, so we'll use it
    let possibleMoves = []
    if (adjustedMoveDX !== moveDX && adjustedMoveDY !== moveDY) {
      possibleMoves.push([mapX + adjustedMoveDX, mapY + adjustedMoveDY])
    }
    if (adjustedMoveDX !== moveDX) {
      possibleMoves.push([mapX + adjustedMoveDX, mapY + moveDY])
    }
    if (adjustedMoveDY !== moveDY) {
      possibleMoves.push([mapX + moveDX, mapY + adjustedMoveDY])
    }
    possibleMoves.push([mapX + moveDX, mapY + moveDY])
    if (moveDX !== 0) {
      possibleMoves.push([mapX + moveDX, mapY])
    }
    if (moveDY !== 0) {
      possibleMoves.push([mapX, mapY + moveDY])
    }
    // we'll see if we can move to any of possibilities given this vector
    while (possibleMoves.length > 0) {
      let move = possibleMoves.pop()
      if (this.doThingSetNewDestinationIfCan(thing, move[0], move[1])) {
        break
      }
    }
    // we've used the movement or are blocked, so take it away
    thing.clearMovement()
  }

  doThingSetNewDestinationIfCan (thing, newMapX, newMapY) {
    // check to see if it's out of bounds
    if (newMapX < 0 || newMapY < 0 ||
        newMapX >= this.getWidth() || newMapY >= this.getHeight()) {
      return false
    }
    // check to see if it's blocked
    if (this.isBlocked(newMapX, newMapY)) {
      return false
    }
    thing.setMapDestinationX(newMapX)
    thing.setMapDestinationY(newMapY)
    thing.setSpeed(thing.getMovementSpeed())
  }

  stateUpdate () {
    let width = this.getWidth()
    let height = this.getHeight()
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // takes care of movement and
        // will call update on all children Things
        let tile = this.getTile(x, y)
        if (tile === null) {
          continue
        }
        if (tile.things.length === 0) {
          continue
        }
        tile.things.forEach((thing) => { this.updateStateThing(thing) })
      }
    }
  }

  physicsUpdate (physicsTimeElapsed) {
    let width = this.getWidth()
    let height = this.getHeight()
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // takes care of movement and
        // will call update on all children Things
        let tile = this.getTile(x, y)
        if (tile === null) {
          continue
        }
        if (tile.things.length === 0) {
          continue
        }
        tile.things.forEach((thing) => {
          thing.physicsUpdate(physicsTimeElapsed)
        })
      }
    }
  }

  getThingsGroup () {
    return this.thingsGroup
  }
}
