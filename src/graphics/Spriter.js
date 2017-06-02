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

  constructor ({ game, name, group }) {
    this.game = game
    this.name = name
    this.group = group
    this.sprite = null

    this.sprite = this.addSprite()
    // this.sprite.scale.setTo(2)
    this.sprite.anchor.x = 0.5
    this.sprite.anchor.y = 0.7

    this.animationsData = this.loadAnimationsData()
    this.animations = this.addAnimations()
  }

  loadAnimationsData () {
    return this.game.cache.getJSON(Spriter.getAnimationsAssetName(this.name))
  }

  addSprite () {
    return this.group.create(
      0,
      0,
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

  playAnimation (name, onComplete, onCompleteContext) {
    if (onComplete !== undefined) {
      this.animations[name].onComplete.addOnce(onComplete, onCompleteContext)
    }
    this.animations[name].play()
  }

  kill () {
    this.sprite.kill()
  }
}
