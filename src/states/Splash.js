import Phaser from 'phaser'
import { centerGameObjects } from '../utils'
import Spriter from '../sprites/Spriter'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //
    // this.load.atlas('character', 'assets/atlas/character.png', 'assets/atlas/character.json')
    this.load.image('mushroom', 'assets/images/mushroom2.png')

    Spriter.cache(this.load, 'character')
  }

  create () {
    // this.game.time.events.add(Phaser.Timer.SECOND * 3, function () {
    this.state.start('Game')
    // },
    // this)
  }
}
