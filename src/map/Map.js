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
          this.getTileStartY(x),
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
    let x = thing.getMapX()
    let y = thing.getMapY()

    if (!Array.isArray(this.tiles[x])) {
      this.tiles[x] = []
    }
    if (!Array.isArray(this.tiles[x][y])) {
      // each tile is an array of things
      this.tiles[x][y] = []
    }
    if (this.tiles[x][y].indexOf(thing) === -1) {
      // only add if we are not already on this tile
      this.tiles[x][y].push(thing)
    }
  }

  isBlocked (mapX, mapY) {
    if (this.tiles[mapX][mapY] === undefined ||
      !Array.isArray(this.tiles[mapX][mapY])) {
      return false
    }

  }

  moveThing (thing, dx, dy) {

  }

  getThingsGroup () {
    return this.thingsGroup
  }

  update () {
    this.things.forEach((mapObj) => { this.updateThingTile(mapObj) })

    this.thingsGroup.sort('y', Phaser.Group.SORT_ASCENDING)
  }

  updateThingTile (mapObj) {
    let x = Math.floor(mapObj.thing.x / Defines.mapTileWidth)
    let y = Math.floor(mapObj.thing.y / Defines.mapTileHeight)
    if (mapObj.x === null) {
      mapObj.x = x
    }
    if (mapObj.y === null) {
      mapObj.y = y
    }
    let draw = false
    if (mapObj.tileGraphics === null) {
      mapObj.tileGraphics = this.game.add.graphics(0, 0)
      this.floorGroup.add(mapObj.tileGraphics)
      this.setID(mapObj.x, mapObj.y, mapObj.id)
      draw = true
    } else if (x !== mapObj.x || y !== mapObj.y) {
      if (this.getID(mapObj.x, mapObj.y) === mapObj.id) {
        this.removeID(mapObj.x, mapObj.y)
      }
      this.setID(mapObj.x, mapObj.y, mapObj.id)
      mapObj.tileGraphics.clear()
      draw = true
    }
    if (draw) {
      mapObj.tileGraphics.lineStyle(0.5, 0xFF0000, 0.75)
      mapObj.tileGraphics.drawRect(
        x * Defines.mapTileWidth,
        y * Defines.mapTileHeight,
        16,
        16
      )
    }
    mapObj.x = x
    mapObj.y = y
  }
}
