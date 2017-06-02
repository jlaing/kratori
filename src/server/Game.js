import config from '../config'

export default class Game {
  constructor () {
    this.world = {
      width: config.gameWidth,
      height: config.gameHeight,
      centerX: Math.ceil(config.gameWidth),
      centerY: Math.ceil(config.gameHeight)
    }
  }
}
