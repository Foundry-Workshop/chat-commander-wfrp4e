export default class ChatCommandsHelper {


  //#region Register Item Properties Command helpers

  static buildProperties() {
    const collection = [...ChatCommandsHelper.qualityList(), ...ChatCommandsHelper.flawList()]
    ChatCommandsHelper.buildDescription(collection);

    return collection;
  }

  /**
   * Return a list of all qualities
   */
  static qualityList() {
    const weapons = ChatCommandsHelper.convertToArray(game.wfrp4e.config.weaponQualities);
    ChatCommandsHelper.addTagToAll(weapons, ChatCommandsHelper.weaponTag);
    const armour = ChatCommandsHelper.convertToArray(game.wfrp4e.config.armorQualities);
    ChatCommandsHelper.addTagToAll(armour, ChatCommandsHelper.armourTag);
    const items = ChatCommandsHelper.convertToArray(game.wfrp4e.config.itemQualities);
    ChatCommandsHelper.addTagToAll(items, ChatCommandsHelper.itemTag);

    const collection = [...weapons, ...armour, ...items];
    ChatCommandsHelper.addTagToAll(collection, ChatCommandsHelper.qualityTag, true);

    return collection;
  }

  /**
   * Return a list of all flaws
   */
  static flawList() {
    const weapons = ChatCommandsHelper.convertToArray(game.wfrp4e.config.weaponFlaws);
    ChatCommandsHelper.addTagToAll(weapons, ChatCommandsHelper.weaponTag);
    const armour = ChatCommandsHelper.convertToArray(game.wfrp4e.config.armorFlaws);
    ChatCommandsHelper.addTagToAll(armour, ChatCommandsHelper.armourTag);
    const items = ChatCommandsHelper.convertToArray(game.wfrp4e.config.itemFlaws);
    ChatCommandsHelper.addTagToAll(items, ChatCommandsHelper.itemTag);

    const collection = [...weapons, ...armour, ...items];
    ChatCommandsHelper.addTagToAll(collection, ChatCommandsHelper.flawTag, true);

    return collection;
  }

  static convertToArray(oldObject) {
    const newArray = [];

    for (const key in oldObject) {
      newArray.push({
        key: key,
        value: oldObject[key],
        tags: []
      });
    }

    return newArray;
  }

  static get weaponTag() {
    return {name: game.i18n.localize("Forien.ChatCommanderWFRP4e.Tags.Weapon"), colour: 'yellow'};
  }

  static get armourTag() {
    return {name: game.i18n.localize("Forien.ChatCommanderWFRP4e.Tags.Armour"), colour: 'blue'};
  }

  static get qualityTag() {
    return {name: game.i18n.localize("Forien.ChatCommanderWFRP4e.Tags.Quality"), colour: 'green'};
  }

  static get flawTag() {
    return {name: game.i18n.localize("Forien.ChatCommanderWFRP4e.Tags.Flaw"), colour: 'red'};
  }

  static get itemTag() {
    return {name: game.i18n.localize("Forien.ChatCommanderWFRP4e.Tags.Item"), colour: 'grey'};
  }

  static addTagToAll(collection, tag, unshift = false) {
    for (let entry of collection) {
      if (unshift)
        entry.tags.unshift(tag)
      else
        entry.tags.push(tag)
    }
  }

  static buildDescription(collection) {
    for (let entry of collection) {
      entry.description = `${entry.value} — `;
      for (let tag of entry.tags) {
        entry.description += ChatCommandsHelper.parseTagToHTML(tag);
      }
    }
  }

  static parseTagToHTML(tag) {
    return `<span class="tag ${tag.colour}">${tag.name}</span>`
  }

  //#endregion


  //#region Availability Command helpers

  static get settlements() {
    const settlements = ['MARKET.Village', 'MARKET.Town', 'MARKET.City'];
    const settlementsLocalized = [];

    settlements.forEach(s =>
      settlementsLocalized.push(game.i18n.localize(s).toLowerCase())
    );

    return settlementsLocalized;
  }

  static get rarities() {
    const rarities = [
      "WFRP4E.Availability.Common",
      "WFRP4E.Availability.Exotic",
      "WFRP4E.Availability.Rare",
      "WFRP4E.Availability.Scarce"
    ];
    const raritiesLocalized = [];

    rarities.forEach(s =>
      raritiesLocalized.push(game.i18n.localize(s).toLowerCase())
    );

    return raritiesLocalized;
  }

  //#endregion


  //#region Pay Command helpers

  static get amountExamples() {
    const gc = game.i18n.localize("MARKET.Abbrev.GC").toLowerCase();
    const ss = game.i18n.localize("MARKET.Abbrev.SS").toLowerCase();
    const bp = game.i18n.localize("MARKET.Abbrev.BP").toLowerCase();

    return [`10${gc}3${ss}7${bp}`, `3${gc}2${bp}`, `10${bp}350${ss}`];
  }

  static get onlinePlayers() {
    return game.users.filter(u => u.isGM === false && u.active);
  }

  static get actors() {
    return game.actors.filter(a => a.type === 'character');
  }

  static get userTag() {
    return {name: game.i18n.localize("Forien.ChatCommanderWFRP4e.Tags.User"), colour: 'blue'};
  }

  static get actorTag() {
    return {name: game.i18n.localize("Forien.ChatCommanderWFRP4e.Tags.Actor"), colour: 'green'};
  }

  //#endregion

  static createPlayersAndActorsHint(params, entries, alias) {
    const hints = [...ChatCommandsHelper.onlinePlayers, ...ChatCommandsHelper.actors];
    for (const hint of hints.filter(h => h.name.toLowerCase().includes(params[1]))) {
      let tag = hint instanceof Actor ? ChatCommandsHelper.actorTag : ChatCommandsHelper.userTag;
      entries.push(game.chatCommands.createCommandElement(`${alias} ${params[0]} ${hint.name.toLowerCase()} `, `${hint.name} — ${ChatCommandsHelper.parseTagToHTML(tag)}`));
    }
  }
}