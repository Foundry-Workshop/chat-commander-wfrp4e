export default class ChatCommandsHelper {
  static parseParams(command, parameters) {
    const cmd = game.wfrp4e.commands.commands[command];
    if (!cmd) return {};

    parameters = parameters.trim();
    const defaultArg = cmd.defaultArg;
    const args = ChatCommandsHelper.getArgs(command, parameters);
    const currentArg = ChatCommandsHelper.getCurrentArg(parameters);
    const currentValue = args[currentArg] ?? (parameters.includes("=") ? "" : parameters);

    return {defaultArg, args, currentArg, currentValue};
  }

  static createElement(parts, content) {
    parts = parts.map(p => p.trim()).filter(p => p.length > 0);
    return game.chatCommands.createCommandElement(parts.join(" "), content);
  }

  static argsToParameters(args, except = null) {
    const parameters = [];
    for (const key in args) {
      if (except && key === except) continue;
      const value = args[key]?.trim() || null;
      if (!value) continue;
      parameters.push(`${key}=${value}`);
    }

    return parameters.join(" ");
  }

  static getArgs(command, parameters) {
    const cmd = game.wfrp4e.commands.commands[command];
    if (!cmd) return {};

    const argValues = game.wfrp4e.commands.parseArgs(command, parameters);
    const args = {};
    cmd?.args.forEach((key, index) => args[key] = argValues[index]);

    return args;
  }

  static getCurrentArg(parameters) {
    const lastEquals = parameters.lastIndexOf("=");
    const lastSpace = parameters.lastIndexOf(" ", lastEquals);

    return parameters.substring(lastSpace + 1, lastEquals);
  }

  static createModifierSuggestions(alias, params, currentArg, currentValue) {
    const suggestions = [];

    for (let mod = -30; mod < 40; mod += 10) {
      if (mod === 0) continue;
      if (mod === Number(currentValue)) continue;
      let modString = (mod > 0) ? `+${mod}` : mod;
      suggestions.push(ChatCommandsHelper.createElement(
        [alias, params, `${currentArg}=${mod}`],
        game.i18n.format("Forien.ChatCommanderWFRP4e.Commands.TableModExample", {mod: modString}),
      ));
    }

    return suggestions;
  }

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
    const settlements = Object.keys(game.wfrp4e.config.availabilityTable);
    const settlementsLocalized = [];

    settlements.forEach(s =>
      settlementsLocalized.push(game.i18n.localize(s).toLowerCase())
    );

    return settlementsLocalized;
  }

  static get rarities() {
    const rarities = foundry.utils.duplicate(game.wfrp4e.config.availability);
    delete rarities.None;

    return Object.values(rarities).map(r => r.toLowerCase());
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