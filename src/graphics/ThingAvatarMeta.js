export default class ThingAvatarMeta {
  constructor ({text, thing, group, game}) {
    let style = {
      font: '8pt Courier',
      wordWrap: true,
      wordWrapWidth: 22,
      align: 'center'
    }

    this.group = group
    this.text = game.add.text(0, -40, text, style)
    this.text.anchor.set(0.5)
    group.add(this.text)
  }

  stateUpdate (text) {
    this.text.text = text
  }
}
