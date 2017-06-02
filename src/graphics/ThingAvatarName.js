export default class ThingAvatarName {
  constructor ({thing, group, game}) {
    let style = {
      font: '8pt Courier',
      wordWrap: true,
      wordWrapWidth: 22,
      align: 'center'
    }

    this.group = thing.group
    this.text = game.add.text(0, -30, thing.name, style)
    this.text.anchor.set(0.5)
    this.group.add(this.text)
  }

  stateUpdate () {
  }
}
