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

  //#region table Command helpers

  static get tableExamples() {
    return [
      {
        params: `table=wrath`,
        label: game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.TableExamples.Wrath"),
      },
      {
        params: `table=career column=welf`,
        label: game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.TableExamples.WelfCareer"),
      },
      {
        params: `table=critbody modifier=35`,
        label: game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.TableExamples.CritBody35"),
      },
      {
        params: `table=job column=Who modifier=-10`,
        label: game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.TableExamples.JobWho"),
      }
    ]
  }
  //#endregion


  //#region Pay Command helpers

  static get _currencyLabels() {
    const gc = game.i18n.localize("MARKET.Abbrev.GC").toLowerCase();
    const ss = game.i18n.localize("MARKET.Abbrev.SS").toLowerCase();
    const bp = game.i18n.localize("MARKET.Abbrev.BP").toLowerCase();
    return {gc, ss, bp};
  }

  static get amountExamples() {
    const {gc, ss, bp} = this._currencyLabels;

    return [`10${gc}3${ss} 7${bp}`, `3${gc} 2${bp}`, `10${bp}350${ss}`];
  }

  static get reasonExamples() {
    return [
      game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.ReasonExamples.CheapAle"),
      game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.ReasonExamples.RoomBoard"),
      game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.ReasonExamples.UnfairTax"),
    ];
  }

  static get payExamples() {
    const {gc, ss, bp} = this._currencyLabels;
    const wordFor = game.i18n.localize("Forien.ChatCommanderWFRP4e.for");
    const wordAnd = game.i18n.localize("Forien.ChatCommanderWFRP4e.and");

    const cheapAle = game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.ReasonExamples.CheapAle");
    const roomBoard = game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.ReasonExamples.RoomBoard");
    const unfairTax = game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.ReasonExamples.UnfairTax");

    return [
      {
        params: `amount=3${bp} for=${cheapAle}`,
        label: `3${bp} ${wordFor} "${cheapAle}"`,
      },
      {
        params: `amount=2${ss} 6${bp} for=${roomBoard}`,
        label: `2${ss} ${wordAnd} 6${bp} ${wordFor} "${roomBoard}"`,
      },
      {
        params: `amount=10${gc} 15${ss} 8${bp} for=${unfairTax}`,
        label: `10${gc} 15/8 ${wordFor} "${unfairTax}"`,
      }
    ]
  }

  static get creditExamples() {
    const {gc, ss, bp} = this._currencyLabels;

    const wordFor = game.i18n.localize("Forien.ChatCommanderWFRP4e.for");
    const wordAnd = game.i18n.localize("Forien.ChatCommanderWFRP4e.and");
    const splitThree = game.i18n.format("Forien.ChatCommanderWFRP4e.split", {count: 3});
    const each = game.i18n.localize("Forien.ChatCommanderWFRP4e.each");
    const cleaningCellar = game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.ReasonExamples.CleaningCellar");
    const savingPrincess = game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.ReasonExamples.SavingPrincess");

    return [
      {
        params: `amount=2${ss} 6${bp} reason=${cleaningCellar}`,
        label: `2/6 ${each} ${wordFor} "${cleaningCellar}"`,
      },
      {
        params: `amount=1${gc} 10${ss} reason=${savingPrincess} mode=split split=3`,
        label: `1${gc} ${wordAnd} 10${ss} ${wordFor} "${savingPrincess}", ${splitThree}`,
      }
    ]
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

  static createPlayersAndActorsHint(alias, params, currentArg, currentValue) {
    const entries = [];
    const hints = [...ChatCommandsHelper.onlinePlayers, ...ChatCommandsHelper.actors];
    for (const hint of hints.filter(h => h.name.toLowerCase().includes(currentValue))) {
      const tag = hint instanceof Actor ? ChatCommandsHelper.actorTag : ChatCommandsHelper.userTag;
      entries.push(ChatCommandsHelper.createElement(
        [alias, params, `${currentArg}=${hint.name.toLowerCase()}`],
        `${hint.name} — ${ChatCommandsHelper.parseTagToHTML(tag)}`,
      ));
    }

    return entries;
  }

  //#region Corruption Helper

  static get corruption() {
    return {
      minor: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CorruptionMinor'),
      moderate: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CorruptionModerate'),
      major: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CorruptionMajor'),
    }
  }

  static get exampleCorruptionSources() {
    return [
      game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.CorruptionExamples.WitnessedLesserDaemon"),
      game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.CorruptionExamples.ExposureToWarpstone"),
      game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.CorruptionExamples.DealWithDaemon"),
    ]
  }

  static get corruptionExamples() {
    const sources = ChatCommandsHelper.exampleCorruptionSources;
    const cool = game.i18n.localize("NAME.Cool");
    const endurance = game.i18n.localize("NAME.Endurance");

    return [
      {
        params: `strength=minor skill=${cool} reason=${sources[0]}`,
        label: game.i18n.format("Forien.ChatCommanderWFRP4e.Commands.CorruptionExamples.MinorExample", {reason: sources[0]}),
      },
      {
        params: `strength=moderate skill=${endurance} reason=${sources[1]}`,
        label: game.i18n.format("Forien.ChatCommanderWFRP4e.Commands.CorruptionExamples.ModerateExample", {reason: sources[1]}),
      },
      {
        params: `strength=major reason=${sources[2]}`,
        label: game.i18n.format("Forien.ChatCommanderWFRP4e.Commands.CorruptionExamples.MajorExample", {reason: sources[2]}),
      }
    ]
  }
  //#endregion

  //#region Fear Helper

  static get exampleFearSources() {
    return [
      game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.FearExamples.Paranoia"),
      game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.FearExamples.Skeleton"),
      game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.FearExamples.CloseMorsslieb"),
    ]
  }

  static get fearExamples() {
    const sources = ChatCommandsHelper.exampleFearSources;

    return [
      {
        params: `rating=1 source=${sources[0]}`,
        label: game.i18n.format("Forien.ChatCommanderWFRP4e.Commands.FearExamples.example", {
            rating: 1,
            source: sources[0]
          },
        ),
      },
      {
        params: `rating=2 source=${sources[1]}`,
        label: game.i18n.format("Forien.ChatCommanderWFRP4e.Commands.FearExamples.example", {
            rating: 2,
            source: sources[1]
          },
        ),
      },
      {
        params: `rating=4 source=${sources[2]}`,
        label: game.i18n.format("Forien.ChatCommanderWFRP4e.Commands.FearExamples.example", {
            rating: 4,
            source: sources[2]
          },
        ),
      },
    ]
  }
  //#endregion
}