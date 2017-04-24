/* globals __DEV__ */
import Phaser from 'phaser'
import Spriter from '../sprites/Spriter'

export default class extends Phaser.State {
  init () {}
  preload () {}

  create () {
    const bannerText = 'Phaser + ES6 + Webpack'
    let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText)
    banner.font = 'Bangers'
    banner.padding.set(10, 16)
    banner.fontSize = 40
    banner.fill = '#77BFA3'
    banner.smoothed = false
    banner.anchor.setTo(0.5)

    this.character = new Spriter({
      game: this.game,
      name: 'character',
      x: this.world.centerX,
      y: this.world.centerY
    })
    this.character.playAnimation('all')
  }

  render () {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.character.sprite, 32, 32)
    }
  }
}
