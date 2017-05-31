import Phaser from 'phaser'
import Defines from '../Defines'

export default class Map {
  constructor ({game}) {
    this.game = game
    this.tiles = []
    this.currentID = 0

    this.floorGroup = this.game.add.group(0, 0, this.game)
    this.thingsGroup = this.game.add.group(0, 0, this.game)

    let graphics = this.game.add.graphics(0, 0)
    graphics.lineStyle(0.25, 0x000000, 0.5)
    let width = this.getWidth()
    let height = this.getHeight()
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        graphics.drawRect(
          this.getTileStartX(x),
          this.getTileStartY(y),
          Defines.mapTileWidth,
          Defines.mapTileHeight
        )
      }
    }

    this.floorGroup.add(graphics)
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
      this._cache_getWidth = this.getMapXFromPixel(this.game.world.width - 1)
    }
    return this._cache_getWidth
  }
  getHeight () {
    if (this._cache_getHeight === undefined) {
      this._cache_getHeight = this.getMapYFromPixel(this.game.world.height - 1)
    }
    return this._cache_getHeight
  }
  getCenterX () {
    return this.getMapXFromPixel(this.game.world.centerX)
  }
  getCenterY () {
    return this.getMapYFromPixel(this.game.world.centerY)
  }

  getTileStartX (mapX) {
    return mapX * Defines.mapTileWidth
  }
  getTileStartY (mapY) {
    return mapY * Defines.mapTileHeight
  }

  addThing (thing) {
    let x = thing.getMapX()
    let y = thing.getMapY()
    let tile = this.getTile(x, y, true)

    if (tile.things.indexOf(thing) === -1) {
      // only add if we are not already on this tile
      if (thing.isBlocking()) {
        // always put blocking elements at the front
        tile.things.unshift(thing)
      } else {
        tile.things.push(thing)
      }
    }

    this.addTileGraphic(tile, x, y)
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
      if (tile.graphics !== null) {
        // if we had a graphics cause it was a blocking tile, we want to
        // destroy it also
        tile.graphics.destroy()
      }
      delete this.tiles[mapX][mapY]
    }

    this.removeTileGraphic(tile)
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

  graphicsUpdate () {
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
          thing.move()
          thing.graphicsUpdate()
        })
      }
    }

    this.thingsGroup.sort('y', Phaser.Group.SORT_ASCENDING)
  }

  getThingsGroup () {
    return this.thingsGroup
  }

  removeTileGraphic (tile) {
    if (tile.things.length > 0 &&
      tile.things[0].isBlocking()) {
      return // it's still blocking so leave the graphic
    }
    if (tile.graphics) {
      tile.graphics.clear()
    }
  }

  addTileGraphic (tile, mapX, mapY) {
    if (tile.graphics) {
      // already exists
      return
    }
    tile.graphics = this.game.add.graphics(0, 0)

    this.floorGroup.add(tile.graphics)

    tile.graphics.lineStyle(0.5, 0xFF0000, 0.75)

    tile.graphics.drawRect(
      this.getTileStartX(mapX),
      this.getTileStartY(mapY),
      Defines.mapTileWidth,
      Defines.mapTileHeight
    )
  }
}
