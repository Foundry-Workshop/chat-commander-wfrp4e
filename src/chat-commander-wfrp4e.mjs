import "../styles/chat-commander-wfrp4e.scss";

import {constants}      from 'constants.mjs';
import registerSettings from 'settings.mjs';
import Utility          from 'utility/Utility.mjs';
import ChatCommands     from "ChatCommands.mjs";

Hooks.once('init', () => {
  registerSettings();

  Hooks.callAll(`${constants.moduleId}:afterInit`);
});

Hooks.once('setup', () => {

  Hooks.callAll(`${constants.moduleId}:afterSetup`);
});

Hooks.once('ready', () => {
  ChatCommands.register();

  Hooks.callAll(`${constants.moduleId}:afterReady`);
  Utility.notify(`${constants.moduleLabel} ready`, {consoleOnly: true});
});
