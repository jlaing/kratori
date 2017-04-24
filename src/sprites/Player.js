// import Phaser from 'phaser'

export default class {
  constructor ({ game, x, y, asset }) {
    this.sprite = game.add.sprite(x, y, asset)
    this.sprite.scale.setTo(1)
    this.sprite.anchor.setTo(0.5)
    this.anim = this.sprite.animations.add(
      'walk',
      [
        'character1',
        'character2',
        'character3',
        'character4'
      ],
      5,
      true)
    this.anim.play('walk')
  }

  update () {
    this.sprite.angle += 1
  }
}
