import Utility from "./utility/Utility.mjs";
import ChatCommandsHelper from "./ChatCommandsHelper.mjs";
import {constants} from "./constants.mjs";

export default class ChatCommands {
  static register() {
    if (ChatCommands.installed) {
      ChatCommands.registerCommands();
    }
  }

  static get installed() {
    return game.modules.get(constants.chatCommanderCoreId)?.active === true;
  }

  static get installedDotR() {
    return game.modules.get(constants.dotrId)?.active === true;
  }

  static registerCommands() {
    if (game.user.isGM)
      ChatCommands.registerGMCommands();
    else
      ChatCommands.registerPlayerCommands();
  }

  static registerGMCommands() {
    ChatCommands.registerTableCommand();
    ChatCommands.registerConditionsCommand();
    ChatCommands.registerPropertiesCommand();
    ChatCommands.registerCharGenCommand();
    ChatCommands.registerNameGenCommand();
    ChatCommands.registerAvailabilityCommand();
    ChatCommands.registerGMPayCommand();
    ChatCommands.registerCreditCommand();
    ChatCommands.registerCorruptionCommand();
    ChatCommands.registerFearCommand();
    ChatCommands.registerTerrorCommand();
    ChatCommands.registerTravelCommand();
    ChatCommands.registerEXPCommand();

    if (ChatCommands.installedDotR) {
      ChatCommands.registerTradeCommand();
    }
  }

  static registerPlayerCommands() {
    ChatCommands.registerTableCommand();
    ChatCommands.registerConditionsCommand();
    ChatCommands.registerPropertiesCommand();
    ChatCommands.registerCharGenCommand();
    ChatCommands.registerNameGenCommand();
    ChatCommands.registerAvailabilityCommand();
    ChatCommands.registerPlayerPayCommand();
    // ChatCommands.registerTravelCommand();

    if (ChatCommands.installedDotR) {
      ChatCommands.registerTradeCommand();
    }
  }

  static registerTableCommand() {
    const tables = game.tables.map(a => a.flags?.wfrp4e).filter(t => t?.key);

    game.chatCommands.register({
      name: "/table",
      module: "wfrp4e",
      icon: "<i class='fas fa-table-rows'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.TableDescription'),
      closeOnComplete: false,
      autocompleteCallback: (menu, alias, parameters) => {
        const params = parameters.toLocaleLowerCase().split(" ");
        const entries = [];
        let keys;

        entries.push(...[
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.TableHint')),
          game.chatCommands.createCommandElement(`${alias}`, game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.TableHelp')),
          game.chatCommands.createSeparatorElement(),
        ]);

        switch (params.length) {
          case 1:
            keys = tables.map(t => t.key).filter(Utility.onlyUnique).filter(k => k.includes(params[0]))
            for (const key of keys) {
              entries.push(game.chatCommands.createCommandElement(`${alias} ${key} `, key));
            }
            break;
          case 2:
            keys = tables.filter(t => t.key === params[0]).map(t => t.column).filter(k => k && k.includes(params[1]))
            if (keys && keys.length) {
              for (const key of keys) {
                entries.push(game.chatCommands.createCommandElement(`${alias} ${params[0]} ${key} `, key));
              }
              break;
            }
          case 3:
            if (/([+-]\d+)/.test(params[1]))
              return false;
            for (let mod = -30; mod < 40; mod += 10) {
              if (mod === 0) continue;
              let modString = (mod > 0) ? `+${mod}` : mod;
              parameters = [params[0], params[1]].filter(e => e).join(" ");
              entries.push(game.chatCommands.createCommandElement(`${alias} ${parameters} ${modString} `, game.i18n.format('Forien.ChatCommanderWFRP4e.Commands.TableModExample', {mod: modString})));
            }
            break;
          default:
            return false;
        }

        return entries;
      }
    });
  }

  static registerConditionsCommand() {
    const conditions = game.wfrp4e.config.conditions;

    game.chatCommands.register({
      name: "/cond",
      module: "wfrp4e",
      icon: "<i class='fas fa-fire-flame-curved'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.ConditionsDescription'),
      closeOnComplete: true,
      autocompleteCallback: (menu, alias, parameters) => {
        const entries = [];

        entries.push(...[
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.ConditionsHint')),
          game.chatCommands.createSeparatorElement(),
        ]);

        for (const key of Object.keys(conditions).filter(c => c.includes(parameters))) {
          entries.push(game.chatCommands.createCommandElement(`${alias} ${key} `, game.wfrp4e.config.conditions[key]));
        }

        return entries;
      }
    });
  }

  static registerPropertiesCommand() {
    const props = ChatCommandsHelper.buildProperties();

    game.chatCommands.register({
      name: "/prop",
      module: "wfrp4e",
      icon: "<i class='fas fa-wrench'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.PropertiesDescription'),
      closeOnComplete: true,
      autocompleteCallback: (menu, alias, parameters) => {
        const entries = [];

        entries.push(...[
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.PropertiesHint')),
          game.chatCommands.createSeparatorElement(),
        ]);

        for (const prop of props.filter(p => p.key.includes(parameters))) {
          entries.push(game.chatCommands.createCommandElement(`${alias} ${prop.key} `, prop.description));
        }

        return entries;
      }
    });
  }

  static registerCharGenCommand() {
    game.chatCommands.register({
      name: "/char",
      module: "wfrp4e",
      icon: "<i class='fas fa-user-gear'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CharGenDescription'),
      closeOnComplete: true
    });
  }

  static registerNameGenCommand() {
    game.chatCommands.register({
      name: "/name",
      module: "wfrp4e",
      icon: "<i class='fas fa-file-signature'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.NameGenDescription'),
      closeOnComplete: false,
      autocompleteCallback: (menu, alias, parameters) => {
        const entries = [];
        const params = parameters.toLocaleLowerCase().split(" ");

        entries.push(...[
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.NameGenHint')),
          game.chatCommands.createSeparatorElement(),
        ]);

        switch (params.length) {
          case 1:
            entries.push(...[
              game.chatCommands.createCommandElement(`${alias} human `, game.i18n.localize('Human')),
              game.chatCommands.createCommandElement(`${alias} dwarf `, game.i18n.localize('Dwarf')),
              game.chatCommands.createCommandElement(`${alias} helf `, game.i18n.localize('High Elf')),
              game.chatCommands.createCommandElement(`${alias} welf `, game.i18n.localize('Wood Elf')),
              game.chatCommands.createCommandElement(`${alias} halfling `, game.i18n.localize('Halfling'))
            ]);
            break;
          case 2:
            entries.push(...[
              game.chatCommands.createCommandElement(`${alias} ${params[0]} female `, game.i18n.localize('Forien.ChatCommanderWFRP4e.NameGen.Female')),
              game.chatCommands.createCommandElement(`${alias} ${params[0]} male `, game.i18n.localize('Forien.ChatCommanderWFRP4e.NameGen.Male'))
            ]);
            break;
          default:
            return false;
        }

        return entries;
      }
    });
  }

  static registerAvailabilityCommand() {
    game.chatCommands.register({
      name: "/avail",
      module: "wfrp4e",
      icon: "<i class='fas fa-box-open'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.AvailabilityDescription'),
      closeOnComplete: false,
      autocompleteCallback: (menu, alias, parameters) => {
        const entries = [];
        const params = parameters.toLocaleLowerCase().split(" ");

        entries.push(...[
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.AvailabilityHint')),
          game.chatCommands.createSeparatorElement(),
        ]);

        switch (params.length) {
          case 1:
            for (const settlement of ChatCommandsHelper.settlements) {
              entries.push(game.chatCommands.createCommandElement(`${alias} ${settlement} `, settlement.capitalize()))
            }
            break;
          case 2:
            for (const rarity of ChatCommandsHelper.rarities) {
              entries.push(game.chatCommands.createCommandElement(`${alias} ${params[0]} ${rarity} `, rarity.capitalize()))
            }
            break;
          default:
            return false;
        }

        return entries;
      }
    });
  }

  static registerPlayerPayCommand() {
    game.chatCommands.register({
      name: "/pay",
      module: "wfrp4e",
      icon: "<i class='fas fa-hand-holding-dollar'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.PlayerPayDescription'),
      closeOnComplete: true,
      autocompleteCallback: () => {
        const entries = [];
        const examples = ChatCommandsHelper.amountExamples;

        entries.push(...[
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.PlayerPayHint')),
          game.chatCommands.createSeparatorElement(),
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.AmountExample')),
          game.chatCommands.createInfoElement(examples[0]),
          game.chatCommands.createInfoElement(examples[1]),
          game.chatCommands.createInfoElement(examples[2]),
          game.chatCommands.createSeparatorElement(),
        ]);

        return entries;
      }
    });
  }

  static registerGMPayCommand() {
    game.chatCommands.register({
      name: "/pay",
      module: "wfrp4e",
      icon: "<i class='fas fa-hand-holding-dollar'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.GMPayDescription'),
      closeOnComplete: false,
      autocompleteCallback: (menu, alias, parameters) => {
        const entries = [];
        const params = parameters.toLocaleLowerCase().split(" ");
        const examples = ChatCommandsHelper.amountExamples;

        entries.push(...[
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.GMPayAmountHint')),
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.GMPayPlayerHint')),
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.GMPayActorHint')),
          game.chatCommands.createSeparatorElement(),
        ]);

        switch (params.length) {
          case 1:
            entries.push(...[
              game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.AmountExample')),
              game.chatCommands.createInfoElement(examples[0]),
              game.chatCommands.createInfoElement(examples[1]),
              game.chatCommands.createInfoElement(examples[2]),
              game.chatCommands.createSeparatorElement(),
            ])
            break;
          case 2:
            ChatCommandsHelper.createPlayersAndActorsHint(params, entries, alias);
            break;
          default:
            return false;
        }

        return entries;
      }
    });
  }

  static registerCreditCommand() {
    game.chatCommands.register({
      name: "/credit",
      module: "wfrp4e",
      icon: "<i class='fas fa-sack-dollar'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CreditDescription'),
      closeOnComplete: false,
      autocompleteCallback: (menu, alias, parameters) => {
        const entries = [];
        const params = parameters.toLocaleLowerCase().split(" ");
        const examples = ChatCommandsHelper.amountExamples;

        entries.push(...[
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CreditAmountHint')),
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CreditPlayerHint')),
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CreditActorHint')),
          game.chatCommands.createSeparatorElement(),
        ]);

        switch (params.length) {
          case 1:
            entries.push(...[
              game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.AmountExample')),
              game.chatCommands.createInfoElement(examples[0]),
              game.chatCommands.createInfoElement(examples[1]),
              game.chatCommands.createInfoElement(examples[2]),
              game.chatCommands.createSeparatorElement(),
            ])
            break;
          case 2:
            if ('split'.includes(params[1]))
              entries.push(game.chatCommands.createCommandElement(`${alias} ${params[0]} split `, game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.Split')));
            if ('each'.includes(params[1]))
              entries.push(game.chatCommands.createCommandElement(`${alias} ${params[0]} each `, game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.Each')));

            ChatCommandsHelper.createPlayersAndActorsHint(params, entries, alias);
            break;
          default:
            return false;
        }

        return entries;
      }
    });
  }

  static registerCorruptionCommand() {
    game.chatCommands.register({
      name: "/corruption",
      module: "wfrp4e",
      icon: "<i class='fas fa-viruses'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CorruptionDescription'),
      closeOnComplete: true,
      autocompleteCallback: (_menu, alias) => {
        const entries = [];

        entries.push(...[
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CorruptionHint')),
          game.chatCommands.createSeparatorElement(),
          game.chatCommands.createCommandElement(`${alias} minor`, game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CorruptionMinor')),
          game.chatCommands.createCommandElement(`${alias} moderate`, game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CorruptionModerate')),
          game.chatCommands.createCommandElement(`${alias} major`, game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CorruptionMajor')),
        ]);

        return entries;
      }
    });
  }

  static registerFearCommand() {
    game.chatCommands.register({
      name: "/fear",
      module: "wfrp4e",
      icon: "<i class='fas fa-ghost'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.FearDescription'),
      closeOnComplete: false,
      autocompleteCallback: (menu, alias, parameters) => {
        const params = parameters.toLocaleLowerCase().split(" ");
        const entries = [];

        entries.push(...[
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.FearHint')),
          game.chatCommands.createSeparatorElement(),
        ]);

        switch (params.length) {
          case 1:
            for (let strength = 1; strength < 6; strength += 1) {
              entries.push(game.chatCommands.createCommandElement(`${alias} ${strength} `, game.i18n.format('Forien.ChatCommanderWFRP4e.Commands.FearStrengthExample', {strength})));
            }
            break;
          case 2:
            break;
          default:
            return false;
        }

        return entries;
      }
    });
  }

  static registerTerrorCommand() {
    game.chatCommands.register({
      name: "/terror",
      module: "wfrp4e",
      icon: "<i class='fas fa-skull'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.TerrorDescription'),
      closeOnComplete: false,
      autocompleteCallback: (menu, alias, parameters) => {
        const params = parameters.toLocaleLowerCase().split(" ");
        const entries = [];

        entries.push(...[
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.TerrorHint')),
          game.chatCommands.createSeparatorElement(),
        ]);

        switch (params.length) {
          case 1:
            for (let strength = 1; strength < 6; strength += 1) {
              entries.push(game.chatCommands.createCommandElement(`${alias} ${strength} `, game.i18n.format('Forien.ChatCommanderWFRP4e.Commands.TerrorStrengthExample', {strength})));
            }
            break;
          case 2:
            break;
          default:
            return false;
        }

        return entries;
      }
    });
  }

  static registerTravelCommand() {
    const travelData = TravelDistanceWfrp4e.travel_data.map(t => {
      return {from: t.from.toLowerCase(), to: t.to.toLowerCase()}
    }).filter(t => t.from && t.to);

    game.chatCommands.register({
      name: "/travel",
      module: "wfrp4e",
      icon: "<i class='fas fa-person-hiking'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.TravelDescription'),
      closeOnComplete: false,
      autocompleteCallback: (menu, alias, parameters) => {
        const params = parameters.toLocaleLowerCase().split(" ");
        const entries = [];
        let locations;

        entries.push(...[
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.TravelHint')),
          game.chatCommands.createCommandElement(`/travel`, game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.TravelHelp')),
          game.chatCommands.createSeparatorElement(),
        ]);

        switch (params.length) {
          case 1:
            locations = travelData.map(t => t.from).filter(Utility.onlyUnique).filter(t => t.includes(params[0]))
            for (const location of locations) {
              entries.push(game.chatCommands.createCommandElement(`${alias} ${location} `, location.capitalize()));
            }
            break;
          case 2:
            locations = travelData.filter(t => t.from === params[0]).map(t => t.to).filter(t => t && t.includes(params[1]))
            if (locations && locations.length) {
              for (const location of locations) {
                entries.push(game.chatCommands.createCommandElement(`${alias} ${params[0]} ${location} `, location.capitalize()));
              }
            }
            break;
          default:
            return false;
        }

        return entries;
      }
    });
  }

  static registerEXPCommand() {
    game.chatCommands.register({
      name: "/exp",
      module: "wfrp4e",
      icon: "<i class='fas fa-graduation-cap'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.ExpDescription'),
      closeOnComplete: false,
      autocompleteCallback: (menu, alias, parameters) => {
        const params = parameters.toLocaleLowerCase().split(" ");
        const entries = [];

        entries.push(...[
          game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.ExpHint')),
          game.chatCommands.createSeparatorElement(),
        ]);

        switch (params.length) {
          case 1:
            for (let exp = 25; exp <= 150; exp += 25) {
              entries.push(game.chatCommands.createCommandElement(`${alias} ${exp} `, game.i18n.format('Forien.ChatCommanderWFRP4e.Commands.ExpExample', {exp})));
            }
            break;
          case 2:
            break;
          default:
            return false;
        }

        return entries;
      }
    });
  }

  static registerTradeCommand() {
    game.chatCommands.register({
      name: "/trade",
      module: "wfrp4e",
      icon: "<i class='fas fa-cash-register'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.TradeDescription'),
      closeOnComplete: true
    });
  }
}