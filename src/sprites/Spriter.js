/*
animations json format
[
  {
    name: 'animation_name'
    frames: ['frame1', 'frame2']
    rate: 5
    loop: true
  }
]
*/
export default class Spriter {
  static getAnimationsAssetName (name) {
    return name + '.animations'
  }
  static getAnimationsPath (name) {
    return 'assets/sprites/' + name + '_animations.json'
  }
  static getAtlasPNGPath (name) {
    return 'assets/sprites/' + name + '.png'
  }
  static getAtlasJSONPath (name) {
    return 'assets/sprites/' + name + '.json'
  }
  static cache (loader, name) {
    loader.json(
      Spriter.getAnimationsAssetName(name),
      Spriter.getAnimationsPath(name)
    )
    loader.atlas(
      name,
      Spriter.getAtlasPNGPath(name),
      Spriter.getAtlasJSONPath(name)
    )
  }

  constructor ({ game, name, x, y }) {
    this.game = game
    this.name = name
    this.startingPoint = [x, y]
    this.sprite = null

    this.sprite = this.addSprite()
    this.sprite.scale.setTo(2)

    this.animationsData = this.loadAnimationsData()
    this.animations = this.addAnimations()

    this.game.add.existing(this.sprite)
  }

  loadAnimationsData () {
    return this.game.cache.getJSON(Spriter.getAnimationsAssetName(this.name))
  }

  addSprite () {
    return this.game.add.sprite(
      this.startingPoint[0],
      this.startingPoint[1],
      this.name
    )
  }

  addAnimations () {
    let animations = {}
    this.animationsData.forEach((anim) => {
      animations[anim.name] = this.sprite.animations.add(
        anim.name,
        anim.frames,
        anim.rate,
        anim.loop
      )
    })
    return animations
  }

  playAnimation (name) {
    this.animations[name].play()
  }

  update () {
    // this.sprite.angle += 1
  }
}
