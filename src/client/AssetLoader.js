import Spriter from '../graphics/Spriter'

export default class AssetLoader {
  static loadThingsDefinitions (loader, config) {
    config.load.things.forEach((thing) => {
      AssetLoader.cacheDefinition(loader, thing)
    })
  }

  static loadThingAssets (loader, config) {
    config.load.things.forEach((thing) => {
      AssetLoader.cacheAssets(loader, thing)
    })
  }

  static getDefinitionAssetName (name) {
    return name + '.thing'
  }

  static getDefinitionPath (name) {
    return 'assets/things/' + name + '.json'
  }

  static cacheDefinition (loader, name) {
    loader.json(
      AssetLoader.getDefinitionAssetName(name),
      AssetLoader.getDefinitionPath(name)
    )
  }

  static cacheAssets (loader, name) {
    let definition = AssetLoader.loadDefinition(loader, name)
    let sprites = []
    Object.keys(definition.states).forEach((state) => {
      if (
        definition.states[state].sprite &&
        !sprites.includes(definition.states[state].sprite)
      ) {
        sprites.push(definition.states[state].sprite)
      }
    })
    sprites.forEach((sprite) => {
      Spriter.cache(loader, sprite)
    })
  }

  static loadDefinition (game, name) {
    return game.cache.getJSON(AssetLoader.getDefinitionAssetName(name))
  }
}
