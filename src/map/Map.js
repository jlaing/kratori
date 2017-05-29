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
    return this.getMapXFromPixel(this.game.world.width - 1)
  }
  getHeight () {
    return this.getMapYFromPixel(this.game.world.height - 1)
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
    let x = thing.getMapDestinationX()
    let y = thing.getMapDestinationY()
    let tile = this.getTile(x, y, true)

    if (tile.things.indexOf(thing) === -1) {
      // only add if we are not already on this tile
      if (thing.isBlocking()) {
        // always put blocking elements at the thingsGroup
        tile.things.unshift(thing)
      } else {
        tile.things.push(thing)
      }
    }
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
      // wasn't on map try destination
      mapX = thing.getMapDestinationX()
      mapY = thing.getMapDestinationY()
      tile = this.getTile(mapX, mapY)

      if (tile === null) {
        // wasn't on the map
        return
      }
    }

    // fine the thing in the current tile
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
  }

  moveThing (thing, dx, dy) {
    if (dx === 0 && dy === 0) {
      return false
    }

    // where am I moving to?
    let newMapX = thing.getMapX() + dx
    let newMapY = thing.getMapY() + dy

    if (newMapX === thing.getMapDestinationX() &&
      newMapY === thing.getMapDestinationY()) {
      // we are already moving to this destination
      return true
    }

    if (newMapX < 0 || newMapX >= this.getWidth() ||
      newMapY < 0 || newMapY >= this.getHeight()) {
      // out of bounds
      return false
    }

    // is it blocked?
    if (this.isBlocked(newMapX, newMapY)) {
      // if it is then just bail and let the caller deal with the fail
      return false
    }

    // remove from old tile
    this.removeThing(thing)

    // put myself on the new tile
    // this will start a tween to this new position
    thing.setMapDestinationX(newMapX)
    thing.setMapDestinationY(newMapY)

    // and put us on the new tile
    // this uses the destination
    this.addThing(thing)

    return true
  }

  getThingsGroup () {
    return this.thingsGroup
  }

  update () {
    let width = this.getWidth()
    let height = this.getHeight()
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        this.updateTile(x, y)
      }
    }

    this.thingsGroup.sort('y', Phaser.Group.SORT_ASCENDING)
  }

  updateTile (mapX, mapY) {
    let tile = this.getTile(mapX, mapY)
    if (tile === null) {
      return
    }

    if (tile.things.length === 0 ||
      !tile.things[0].isBlocking()) {
      if (tile.graphics) {
        tile.graphics.clear()
      }
      return
    }

    if (tile.graphics) {
      // already drawn
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
