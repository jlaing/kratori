import Phaser from 'phaser'
import Thing from '../things/Thing'

import config from '../config'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBg.anchor.setTo(0.5)
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    this.loaderBar.anchor.setTo(0.5)

    this.load.setPreloadSprite(this.loaderBar)

    config.load.things.forEach((thing) => {
      Thing.cacheAssets(this.load, thing)
    })
  }

  create () {
    this.state.start('Game')
  }
}
