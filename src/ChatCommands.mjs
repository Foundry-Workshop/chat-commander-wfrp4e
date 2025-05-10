import Utility            from "utility/Utility.mjs";
import ChatCommandsHelper from "ChatCommandsHelper.mjs";
import {constants}        from "constants.mjs";

export default class ChatCommands {
  static register() {
    if (ChatCommands.installed) {
      ChatCommands.registerCommands();
    }
  }

  static get installed() {
    return game.modules.get(constants.chatCommanderCoreId)?.active === true;
  }

  static get canTrade() {
    return ChatCommands.installedDotR || ChatCommands.installedSoC;
  }

  static get installedSoC() {
    return game.modules.get(constants.socId)?.active === true;
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

    if (ChatCommands.canTrade) {
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
    ChatCommands.registerTravelCommand();

    if (ChatCommands.canTrade) {
      ChatCommands.registerTradeCommand();
    }
  }

  static _buildAutocompleteSuggestions(menu, entries, suggestions, unusedArguments) {
    if (unusedArguments.length) {
      entries.push(
        game.chatCommands.createSeparatorElement(),
        game.chatCommands.createInfoElement(game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.Arguments")),
        ...unusedArguments,
      );

      menu.maxEntries += 2 + unusedArguments.length;
    }

    if (suggestions.length) {
      entries.push(
        game.chatCommands.createSeparatorElement(),
        ...suggestions,
      );

      menu.maxEntries++;
    }
  }

  static registerTableCommand() {
    const tables = game.tables.map(a => a.flags?.wfrp4e).filter(t => t?.key);

    game.chatCommands.register({
      name: "/table",
      module: "wfrp4e",
      icon: "<i class='fas fa-table-rows'></i>",
      description: game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.TableDescription"),
      closeOnComplete: false,
      autocompleteCallback: (menu, alias, parameters) => {
        const {defaultArg, args, currentArg, currentValue} = ChatCommandsHelper.parseParams("table", parameters);
        const unusedArguments = [];
        let params = ChatCommandsHelper.argsToParameters(args);
        let keys;

        for (const arg in args) {
          if (arg === currentArg) continue;
          if (args[arg] !== null) continue;

          unusedArguments.push(ChatCommandsHelper.createElement(
            [alias, params, `${arg}=`],
            game.i18n.localize(`Forien.ChatCommanderWFRP4e.Commands.Table.${arg}`),
          ));
        }

        params = ChatCommandsHelper.argsToParameters(args, currentArg || defaultArg);
        const suggestions = [];

        switch (currentArg) {
          case "":
          case "table":
            keys = tables.map(t => t.key).filter(Utility.onlyUnique).filter(k => k.includes(currentValue));
            for (const key of keys) {
              if (key === currentValue) continue;
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${defaultArg}=${key}`], key));
            }
            break;
          case "column":
            keys = tables.filter(t => t.key === args.table)
                         .map(t => t.column)
                         .filter(k => k && k.includes(currentValue));
            if (keys && keys.length) {
              for (const key of keys) {
                if (key === currentValue) continue;
                suggestions.push(ChatCommandsHelper.createElement([alias, params, `${currentArg}=${key}`], key));
              }
            }
            break;
          case "modifier":
            suggestions.push(...ChatCommandsHelper.createModifierSuggestions(alias, params, currentArg, currentValue));
            break;
          default:
            return false;
        }

        const entries = [
        ];

        if (currentValue === "") {
          entries.push(
            game.chatCommands.createInfoElement(game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.ExampleCommands")),
            game.chatCommands.createCommandElement(
              `${alias}`,
              game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.TableHelp"),
            ),
          )
          for (const example of ChatCommandsHelper.tableExamples) {
            entries.push(ChatCommandsHelper.createElement([alias, example.params], example.label))
          }
        }

        menu.maxEntries++;

        this._buildAutocompleteSuggestions(menu, entries, suggestions, unusedArguments);

        return entries;
      },
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

        for (const value of Object.values(conditions).filter(c => c.toLocaleLowerCase().includes(parameters))) {
          entries.push(game.chatCommands.createCommandElement(`${alias} ${value.toLocaleLowerCase().replaceAll(" ", "_")} `, value));
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

        for (const prop of props.filter(p => p.value.toLocaleLowerCase().includes(parameters))) {
          entries.push(game.chatCommands.createCommandElement(`${alias} ${prop.value.toLocaleLowerCase().replaceAll(" ", "_")} `, prop.description));
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
    const SPECIES = [
      {id: "human", label: game.i18n.localize("Human")},
      {id: "dwarf", label: game.i18n.localize("Dwarf")},
      {id: "helf", label: game.i18n.localize("High Elf")},
      {id: "welf", label: game.i18n.localize("Wood Elf")},
      {id: "halfling", label: game.i18n.localize("Halfling")},
    ];

    const GENDERS = [
      {id: "female", label: game.i18n.localize("Forien.ChatCommanderWFRP4e.NameGen.Female")},
      {id: "male", label: game.i18n.localize("Forien.ChatCommanderWFRP4e.NameGen.Male")},
    ];

    game.chatCommands.register({
      name: "/name",
      module: "wfrp4e",
      icon: "<i class='fas fa-file-signature'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.NameGenDescription'),
      closeOnComplete: false,
      autocompleteCallback: (menu, alias, parameters) => {
        const {defaultArg, args, currentArg, currentValue} = ChatCommandsHelper.parseParams("name", parameters);
        const unusedArguments = [];
        let params = ChatCommandsHelper.argsToParameters(args);

        for (const arg in args) {
          if (arg === currentArg) continue;
          if (args[arg] !== null) continue;

          unusedArguments.push(ChatCommandsHelper.createElement(
            [alias, params, `${arg}=`],
            game.i18n.localize(`Forien.ChatCommanderWFRP4e.Commands.Name.${arg}`),
          ));
        }

        params = ChatCommandsHelper.argsToParameters(args, currentArg || defaultArg);
        const suggestions = [];

        switch (currentArg) {
          case "":
          case "gender":
            const genders = GENDERS.filter(g => g.id.includes(currentValue) || g.label.toLowerCase().includes(currentValue.toLowerCase()));
            for (const gender of genders) {
              if (gender.id === currentValue) continue;
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${defaultArg}=${gender.id}`], gender.label));
            }
            break;
          case "species":
            const species = SPECIES.filter(g => g.id.includes(currentValue) || g.label.toLowerCase().includes(currentValue.toLowerCase()));
            for (const specie of species) {
              if (specie.id === currentValue) continue;
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${currentArg}=${specie.id}`], specie.label));
            }
            break;
          default:
            return false;
        }

        const entries = [];

        this._buildAutocompleteSuggestions(menu, entries, suggestions, unusedArguments);

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
        const {defaultArg, args, currentArg, currentValue} = ChatCommandsHelper.parseParams("avail", parameters);
        const unusedArguments = [];
        let params = ChatCommandsHelper.argsToParameters(args);

        for (const arg in args) {
          if (arg === currentArg) continue;
          if (args[arg] !== null) continue;

          unusedArguments.push(ChatCommandsHelper.createElement(
            [alias, params, `${arg}=`],
            game.i18n.localize(`Forien.ChatCommanderWFRP4e.Commands.Availability.${arg}`),
          ));
        }

        params = ChatCommandsHelper.argsToParameters(args, currentArg || defaultArg);
        const suggestions = [];

        switch (currentArg) {
          case "":
          case "rarity":
            if (ChatCommandsHelper.rarities.includes(currentValue)) break;
            for (const rarity of ChatCommandsHelper.rarities) {
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${defaultArg}=${rarity}`], rarity.capitalize()))
            }
            break;
          case "size":
            if (ChatCommandsHelper.settlements.includes(currentValue)) break;
            for (const settlement of ChatCommandsHelper.settlements) {
              suggestions.push(ChatCommandsHelper.createElement(
                [alias, params, `${currentArg}=${settlement}`],
                settlement.capitalize(),
              ));
            }
            break;
          case "modifier":
            suggestions.push(...ChatCommandsHelper.createModifierSuggestions(alias, params, currentArg, currentValue));
            break;
          default:
            return false;
        }

        const entries = [
          game.chatCommands.createCommandElement(
            `${alias}`,
            game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.AvailabilityHelp"),
          ),
        ];
        menu.maxEntries++;

        this._buildAutocompleteSuggestions(menu, entries, suggestions, unusedArguments);

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
        const {defaultArg, args, currentArg, currentValue} = ChatCommandsHelper.parseParams("pay", parameters);
        const unusedArguments = [];
        let params = ChatCommandsHelper.argsToParameters(args);

        for (const arg in args) {
          if (arg === currentArg) continue;
          if (args[arg] !== null) continue;

          unusedArguments.push(ChatCommandsHelper.createElement(
            [alias, params, `${arg}=`],
            game.i18n.localize(`Forien.ChatCommanderWFRP4e.Commands.Pay.${arg}`),
          ));
        }

        params = ChatCommandsHelper.argsToParameters(args, currentArg || defaultArg);
        const suggestions = [];

        switch (currentArg) {
          case "":
          case "amount":
            const amountExamples = ChatCommandsHelper.amountExamples;
            suggestions.push(
              game.chatCommands.createInfoElement(game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.AmountExample")),
            );
            for (const example of amountExamples)
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${defaultArg}=${example}`], example));
            break;
          case "for":
            const reasonExamples = ChatCommandsHelper.reasonExamples;
            suggestions.push(
              game.chatCommands.createInfoElement(game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.ReasonExample")),
            );
            for (const example of reasonExamples)
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${currentArg}=${example}`], example));
            break;
          case "target":
            suggestions.push(...ChatCommandsHelper.createPlayersAndActorsHint(alias, params, currentArg, currentValue));
            break;
          default:
            return false;
        }

        const entries = [];

        if (currentArg === "") {
          entries.push(
            game.chatCommands.createInfoElement(game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.ExampleCommands")),
          )
          for (const example of ChatCommandsHelper.payExamples) {
            entries.push(ChatCommandsHelper.createElement([alias, example.params], example.label))
          }
        }

        this._buildAutocompleteSuggestions(menu, entries, suggestions, unusedArguments);

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
        const {defaultArg, args, currentArg, currentValue} = ChatCommandsHelper.parseParams("credit", parameters);
        const unusedArguments = [];
        let params = ChatCommandsHelper.argsToParameters(args);

        for (const arg in args) {
          if (arg === currentArg) continue;
          if (args[arg] !== null) continue;
          if (args.mode !== "split" && arg === "split") continue;

          unusedArguments.push(ChatCommandsHelper.createElement(
            [alias, params, `${arg}=`],
            game.i18n.localize(`Forien.ChatCommanderWFRP4e.Commands.Credit.${arg}`),
          ));
        }

        params = ChatCommandsHelper.argsToParameters(args, currentArg || defaultArg);
        const suggestions = [];

        switch (currentArg) {
          case "":
          case "amount":
            const amountExamples = ChatCommandsHelper.amountExamples;
            suggestions.push(
              game.chatCommands.createInfoElement(game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.AmountExample")),
            );
            for (const example of amountExamples)
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${defaultArg}=${example}`], example));
            break;
          case "mode":
            suggestions.push(
              ChatCommandsHelper.createElement([alias, params, `${currentArg}=each`], game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.Each")),
              ChatCommandsHelper.createElement([alias, params, `${currentArg}=split`], game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.Split")),
            )
            break;
          case "split":
            if (currentValue !== "") break;
            const playersOnline = ChatCommandsHelper.onlinePlayers.length;
            for (let i = 1; i <= playersOnline; i++) {
              suggestions.push(
                ChatCommandsHelper.createElement([alias, params, `${currentArg}=${i}`], game.i18n.format("Forien.ChatCommanderWFRP4e.split", {count: i}).capitalize()),
              );
            }
            break;
          case "reason":
            const reasonExamples = ChatCommandsHelper.reasonExamples;
            suggestions.push(
              game.chatCommands.createInfoElement(game.i18n.localize("Forien.ChatCommanderWFRP4e.Commands.ReasonExample")),
            );
            for (const example of reasonExamples)
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${currentArg}=${example}`], example));
            break;
          case "target":
            suggestions.push(...ChatCommandsHelper.createPlayersAndActorsHint(alias, params, currentArg, currentValue));
            break;
          default:
            return false;
        }

        const entries = [];

        if (currentArg === "") {
          entries.push(
            game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CreditAmountHint')),
            game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CreditPlayerHint')),
            game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.CreditActorHint')),
            game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.ExampleCommands')),
          )
          for (const example of ChatCommandsHelper.creditExamples) {
            entries.push(ChatCommandsHelper.createElement([alias, example.params], example.label))
          }
        }

        this._buildAutocompleteSuggestions(menu, entries, suggestions, unusedArguments);

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
      closeOnComplete: false,
      autocompleteCallback: (menu, alias, parameters) => {
        const {defaultArg, args, currentArg, currentValue} = ChatCommandsHelper.parseParams("corruption", parameters);
        const unusedArguments = [];
        let params = ChatCommandsHelper.argsToParameters(args);

        for (const arg in args) {
          if (arg === currentArg) continue;
          if (args[arg] !== null) continue;

          unusedArguments.push(ChatCommandsHelper.createElement(
            [alias, params, `${arg}=`],
            game.i18n.localize(`Forien.ChatCommanderWFRP4e.Commands.Corruption.${arg}`),
          ));
        }

        params = ChatCommandsHelper.argsToParameters(args, currentArg || defaultArg);
        const suggestions = [];

        switch (currentArg) {
          case "":
          case "strength":
            const strengths = Object.keys(ChatCommandsHelper.corruption);
            if (strengths.includes(currentValue)) break;
            for (const [key, label] of Object.entries(ChatCommandsHelper.corruption))
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${defaultArg}=${key}`], label));
            break;
          case "skill":
            if (currentValue !== "") break;
            const skills = [
              game.i18n.localize("NAME.Endurance"),
              game.i18n.localize("NAME.Cool"),
            ];
            for (const skill of skills)
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${currentArg}=${skill}`], skill))
            break;
          case "source":
            for (const example of ChatCommandsHelper.exampleCorruptionSources)
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${currentArg}=${example}`], example));
            break;
          default:
            return false;
        }

        const entries = [];

        if (currentArg === "") {
          entries.push(
            game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.ExampleCommands')),
          )
          for (const example of ChatCommandsHelper.corruptionExamples) {
            entries.push(ChatCommandsHelper.createElement([alias, example.params], example.label))
          }
        }

        this._buildAutocompleteSuggestions(menu, entries, suggestions, unusedArguments);

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
        const {defaultArg, args, currentArg, currentValue} = ChatCommandsHelper.parseParams("fear", parameters);
        const unusedArguments = [];
        let params = ChatCommandsHelper.argsToParameters(args);

        for (const arg in args) {
          if (arg === currentArg) continue;
          if (args[arg] !== null) continue;

          unusedArguments.push(ChatCommandsHelper.createElement(
            [alias, params, `${arg}=`],
            game.i18n.localize(`Forien.ChatCommanderWFRP4e.Commands.Fear.${arg}`),
          ));
        }

        params = ChatCommandsHelper.argsToParameters(args, currentArg || defaultArg);
        const suggestions = [];

        switch (currentArg) {
          case "":
          case "rating":
            if (Number(currentValue) > 0) break;
            for (let strength = 1; strength < 6; strength += 1) {
              suggestions.push(
                ChatCommandsHelper.createElement(
                  [alias, params, `${defaultArg}=${strength}`],
                  game.i18n.format("Forien.ChatCommanderWFRP4e.Commands.FearStrengthExample", {strength}),
                ),
              );
            }
            break;
          case "source":
            for (const example of ChatCommandsHelper.exampleFearSources)
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${currentArg}=${example}`], example));
            break;
          default:
            return false;
        }

        const entries = [];

        if (currentArg === "") {
          entries.push(
            game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.ExampleCommands')),
          )
          for (const example of ChatCommandsHelper.fearExamples) {
            entries.push(ChatCommandsHelper.createElement([alias, example.params], example.label))
          }
        }

        this._buildAutocompleteSuggestions(menu, entries, suggestions, unusedArguments);

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
        const {defaultArg, args, currentArg, currentValue} = ChatCommandsHelper.parseParams("terror", parameters);
        const unusedArguments = [];
        let params = ChatCommandsHelper.argsToParameters(args);

        for (const arg in args) {
          if (arg === currentArg) continue;
          if (args[arg] !== null) continue;

          unusedArguments.push(ChatCommandsHelper.createElement(
            [alias, params, `${arg}=`],
            game.i18n.localize(`Forien.ChatCommanderWFRP4e.Commands.Terror.${arg}`),
          ));
        }

        params = ChatCommandsHelper.argsToParameters(args, currentArg || defaultArg);
        const suggestions = [];

        switch (currentArg) {
          case "":
          case "rating":
            if (Number(currentValue) > 0) break;
            for (let strength = 1; strength < 6; strength += 1) {
              suggestions.push(
                ChatCommandsHelper.createElement(
                  [alias, params, `${defaultArg}=${strength}`],
                  game.i18n.format("Forien.ChatCommanderWFRP4e.Commands.TerrorStrengthExample", {strength}),
                ),
              );
            }
            break;
          case "source":
            for (const example of ChatCommandsHelper.exampleTerrorSources)
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${currentArg}=${example}`], example));
            break;
          default:
            return false;
        }

        const entries = [];

        if (currentArg === "") {
          entries.push(
            game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.ExampleCommands')),
          )
          for (const example of ChatCommandsHelper.terrorExamples) {
            entries.push(ChatCommandsHelper.createElement([alias, example.params], example.label))
          }
        }

        this._buildAutocompleteSuggestions(menu, entries, suggestions, unusedArguments);

        return entries;
      }
    });
  }

  static registerTravelCommand() {
    const travelData = TravelDistanceWFRP4e.travel_data.map(t => {
      return {from: t.from.toLowerCase(), to: t.to.toLowerCase()}
    }).filter(t => t.from && t.to);

    game.chatCommands.register({
      name: "/travel",
      module: "wfrp4e",
      icon: "<i class='fas fa-person-hiking'></i>",
      description: game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.TravelDescription'),
      closeOnComplete: false,
      autocompleteCallback: (menu, alias, parameters) => {
        const {defaultArg, args, currentArg, currentValue} = ChatCommandsHelper.parseParams("travel", parameters);
        const unusedArguments = [];
        let params = ChatCommandsHelper.argsToParameters(args);
        let locations;

        for (const arg in args) {
          if (arg === currentArg) continue;
          if (args[arg] !== null) continue;

          unusedArguments.push(ChatCommandsHelper.createElement(
            [alias, params, `${arg}=`],
            game.i18n.localize(`Forien.ChatCommanderWFRP4e.Commands.Travel.${arg}`),
          ));
        }

        params = ChatCommandsHelper.argsToParameters(args, currentArg || defaultArg);
        const suggestions = [];

        switch (currentArg) {
          case "":
          case "from":
            locations = travelData.map(t => t.from).filter(Utility.onlyUnique).filter(t => t.includes(currentValue))
            for (const location of locations) {
              if (location === currentValue) continue;
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${defaultArg}=${location}`], location.capitalize()));
            }
            break;
          case "to":
            locations = travelData.filter(t => t.from === args.from).map(t => t.to).filter(t => t && t.includes(currentValue))
            if (!locations || locations.length < 1) break;
            for (const location of locations) {
              if (location === currentValue) continue;
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${currentArg}=${location}`], location.capitalize()));
            }
            break;
          default:
            return false;
        }

        const entries = [];

        this._buildAutocompleteSuggestions(menu, entries, suggestions, unusedArguments);

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
        const {defaultArg, args, currentArg, currentValue} = ChatCommandsHelper.parseParams("exp", parameters);
        const unusedArguments = [];
        let params = ChatCommandsHelper.argsToParameters(args);

        for (const arg in args) {
          if (arg === currentArg) continue;
          if (args[arg] !== null) continue;

          unusedArguments.push(ChatCommandsHelper.createElement(
            [alias, params, `${arg}=`],
            game.i18n.localize(`Forien.ChatCommanderWFRP4e.Commands.Exp.${arg}`),
          ));
        }

        params = ChatCommandsHelper.argsToParameters(args, currentArg || defaultArg);
        const suggestions = [];

        switch (currentArg) {
          case "":
          case "amount":
            if (Number(currentValue) > 0) break;
            for (let exp = 25; exp <= 150; exp += 25) {
              suggestions.push(ChatCommandsHelper.createElement(
                [alias, params, `${defaultArg}=${exp}`],
                game.i18n.format("Forien.ChatCommanderWFRP4e.Commands.ExpExample", {exp}),
              ));
            }
            break;
          case "reason":
            for (const example of ChatCommandsHelper.expReasons)
              suggestions.push(ChatCommandsHelper.createElement([alias, params, `${currentArg}=${example}`], example));
            break;
          default:
            return false;
        }

        const entries = [];

        if (currentArg === "") {
          entries.push(
            game.chatCommands.createInfoElement(game.i18n.localize('Forien.ChatCommanderWFRP4e.Commands.ExampleCommands')),
          )
          for (const example of ChatCommandsHelper.expExamples) {
            entries.push(ChatCommandsHelper.createElement([alias, example.params], example.label))
          }
        }

        this._buildAutocompleteSuggestions(menu, entries, suggestions, unusedArguments);

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