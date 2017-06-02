import Defines from '../Defines'

export default class MapRender {
  constructor ({map}) {
    this.map = map
    this.game = map.game

    map.getEvents().listen('removeThing', this.removeTileGraphic.bind(this))
    map.getEvents().listen('addThing', this.addTileGraphic.bind(this))

    this.floorGroup = this.game.add.group(0, 0, this.game)

    let graphics = this.game.add.graphics(0, 0)
    graphics.lineStyle(0.25, 0x000000, 0.5)
    let width = this.map.getWidth()
    let height = this.map.getHeight()
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        graphics.drawRect(
          this.map.getTileStartX(x),
          this.map.getTileStartY(y),
          Defines.mapTileWidth,
          Defines.mapTileHeight
        )
      }
    }

    this.floorGroup.add(graphics)
  }

  removeTileGraphic ({tile, thing, mapX, mapY}) {
    if (tile.things.length === 0) {
      // the tile is empty so let's delete it
      if (tile.graphics !== null) {
        // if we had a graphics cause it was a blocking tile, we want to
        // destroy it also
        tile.graphics.destroy()
      }
    }
    if (tile.things.length > 0 &&
      tile.things[0].isBlocking()) {
      return // it's still blocking so leave the graphic
    }
    if (tile.graphics) {
      tile.graphics.clear()
    }
  }

  addTileGraphic ({tile, thing, mapX, mapY}) {
    if (tile.graphics) {
      // already exists
      return
    }
    tile.graphics = this.game.add.graphics(0, 0)

    this.floorGroup.add(tile.graphics)

    tile.graphics.lineStyle(0.5, 0xFF0000, 0.75)

    tile.graphics.drawRect(
      this.map.getTileStartX(mapX),
      this.map.getTileStartY(mapY),
      Defines.mapTileWidth,
      Defines.mapTileHeight
    )
  }
}
