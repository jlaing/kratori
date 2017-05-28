import Phaser from 'phaser'
import Thing from '../things/Thing'

import config from '../config'

export default class extends Phaser.State {
  init () {
    this.stage.backgroundColor = '#EDEEC9'
  }

  preload () {
    this.load.image('loaderBg', './assets/images/loader-bg.png')
    this.load.image('loaderBar', './assets/images/loader-bar.png')

    config.load.things.forEach((thing) => {
      Thing.cacheDefinition(this.load, thing)
    })
  }

  render () {
    this.state.start('Splash')
  }
}
