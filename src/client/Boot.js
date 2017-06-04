import Phaser from 'phaser'
import AssetLoader from '../client/AssetLoader'

import config from '../config'

export default class extends Phaser.State {
  init () {
    this.stage.backgroundColor = '#EDEEC9'
  }

  preload () {
    this.load.image('loaderBg', './assets/images/loader-bg.png')
    this.load.image('loaderBar', './assets/images/loader-bar.png')

    AssetLoader.loadThingsDefinitions(this.load, config)
  }

  render () {
    this.state.start('Splash')
  }
}
