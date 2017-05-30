
export default class Attack {
  constructor ({ character, map }) {
    this.character = character
    this.map = map
  }

  execute () {
    // get the direction
    let dir = this.character.getDirection()
    let mapX = this.character.getMapX()
    let mapY = this.character.getMapY()

    let attackPositions = []
    switch (dir) {
      case 'up':
        attackPositions.push([mapX - 1, mapY - 1])
        attackPositions.push([mapX, mapY - 1])
        attackPositions.push([mapX + 1, mapY - 1])
        break
      case 'down':
        attackPositions.push([mapX - 1, mapY + 1])
        attackPositions.push([mapX, mapY + 1])
        attackPositions.push([mapX + 1, mapY + 1])
        break
      case 'left':
        attackPositions.push([mapX - 1, mapY - 1])
        attackPositions.push([mapX - 1, mapY])
        attackPositions.push([mapX - 1, mapY + 1])
        break
      case 'right':
        attackPositions.push([mapX + 1, mapY - 1])
        attackPositions.push([mapX + 1, mapY])
        attackPositions.push([mapX + 1, mapY + 1])
        break
    }
    // get from the map what things are reachable
    let things = []
    attackPositions.forEach((pos) => {
      let tileThings = this.map.getThingsAt(pos[0], pos[1])
      if (tileThings !== null) {
        tileThings.forEach((thing) => { things.push(thing) })
      }
    })
    // do damage to those things
    things.forEach((thing) => {
      thing.damage(1)
    })
  }
}
