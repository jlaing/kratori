export default class CharacterAvatarHealth {
  constructor ({character, group, game}) {
    let style = {
      font: '8pt Courier',
      wordWrap: true,
      wordWrapWidth: 22,
      align: 'center'
    }

    this.character = character
    this.group = group
    this.text = game.add.text(0, -18, String(character.health), style)
    this.text.anchor.set(0.5)
    group.add(this.text)
  }

  stateUpdate () {
    this.text.text = String(this.character.health)
  }
}
