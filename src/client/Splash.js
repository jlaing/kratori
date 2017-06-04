import Phaser from 'phaser'
import AssetLoader from '../client/AssetLoader'

import config from '../config'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBg.anchor.setTo(0.5)
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    this.loaderBar.anchor.setTo(0.5)

    this.load.setPreloadSprite(this.loaderBar)

    AssetLoader.loadThingAssets(this.load, config)
  }

  create () {
    this.state.start('Game')
  }
}
