import {applyMarkWhenWearerDamaged, clearRevengeMarks, clearRevengeOnTurnEnd, applyRevengeStrikeEffects} from "./RevengersWrap.mjs";
import {dealSharedDamage} from "./BloodboundBand.mjs";
import {checkColorCloakEffects} from "./ColorCloaks.mjs";
import {checkForCharge} from "./HellchargerHelm.mjs";

const MODULE_ID = 'draw-steel-rewards-automation'
const REVENGERS_WRAP_NAME = 'Revenger’s Wrap';
const BLOODBOUND_BAND_NAME = 'Bloodbound Band';
const COLOR_CLOAKS_NAMES = ['Color Cloak (Blue)', 'Color Cloak (Red)', 'Color Cloak (Yellow)'];
const HELLCHARGER_HELM_NAME = 'Hellcharger Helm';

Hooks.on("init", function() {
  console.log("This code runs once the Foundry VTT software begins its initialization workflow.");
});

export function getActorsWithItem(game, itemName) {
  const actors = game.actors.contents.filter(a => a.items.find(i => i.name === itemName));
  return actors;
};

/* -------------------------------------------------- */
/*   Initialization                                   */
/* -------------------------------------------------- */

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "revengersWrap", {
    name: `${MODULE_ID}.Settings.RevengersWrap.Name`,
    hint: `${MODULE_ID}.Settings.RevengersWrap.Hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {toggleRevengersWrap(value)}
  });

  game.settings.register(MODULE_ID, "bloodboundBand", {
    name: `${MODULE_ID}.Settings.BloodboundBand.Name`,
    hint: `${MODULE_ID}.Settings.BloodboundBand.Hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {toggleBloodboundBand(value)}
  });

  game.settings.register(MODULE_ID, "colorCloaks", {
    name: `${MODULE_ID}.Settings.ColorCloaks.Name`,
    hint: `${MODULE_ID}.Settings.ColorCloaks.Hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {toggleColorCloaks(value)}
  });
  game.settings.register(MODULE_ID, "hellchargerHelm", {
    name: `${MODULE_ID}.Settings.HellchargerHelm.Name`,
    hint: `${MODULE_ID}.Settings.HellchargerHelm.Hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {toggleHellchargerHelm(value)}
  });
});
Hooks.on("ready", () => {
  console.log("Ready Hook: This code runs once the Foundry VTT software is ready and all game data has been loaded.");
  // If the setting is enabled, activate the Revenger's Wrap functionality
  if (game.settings.get(MODULE_ID, "revengersWrap")) {
    toggleRevengersWrap(true);
  }
  // If the setting is enabled, activate the Bloodbound Band functionality
  if (game.settings.get(MODULE_ID, "bloodboundBand")) {
    // The Bloodbound Band functionality is handled within its own module, so we don't need to do anything here
    toggleBloodboundBand(true);
  }
  // If the setting is enabled, activate the Color Cloaks functionality
  if (game.settings.get(MODULE_ID, "colorCloaks")) {
    toggleColorCloaks(true);
  }
  // If the setting is enabled, activate the Hellcharger Helm functionality
  if (game.settings.get(MODULE_ID, "hellchargerHelm")) {
    toggleHellchargerHelm(true);
  }

});

  /* -------------------------------------------------- */
  /*   Revenger's Wrap Hook Controls                    */
  /* -------------------------------------------------- */
const toggleRevengersWrap = (enabled) => {
  if (enabled) {
    //find relevant actors
    const wrapActors = getActorsWithItem(game, REVENGERS_WRAP_NAME);
    const combatActors = game.combat?.combatants.filter(c => c.actor).map(c => c.actor) ?? [];

    /* -------------------------apply a mark to the actor that is selected when Revenger's Wrap wearer takes damage------------------------- */
    window._revengeHook = Hooks.on('updateActor', async (actor, changes, options) => {
      applyMarkWhenWearerDamaged(actor, changes, options, wrapActors, combatActors);
    });

    /* -------------------------clear mark from all actors when Revenger's Wrap wearer's turn ends------------------------- */
    window._eotHook = Hooks.on('combatTurnChange', async (combat, prior, current) => {
      clearRevengeOnTurnEnd(combat, prior, wrapActors, combatActors);
    });

    /* -------------------------roll additional effects when the wearer targets a marked enemy with a strike------------------------- */
    window._revengeRollHook = Hooks.on('createChatMessage', async (message) => {
      applyRevengeStrikeEffects(message, game, wrapActors, combatActors);
    });
  } else {
    Hooks.off('updateActor', window._revengeHook);
    Hooks.off('combatTurnChange', window._eotHook);
    Hooks.off('createChatMessage', window._revengeRollHook);
    window._revengeHook = null;
    window._eotHook = null;
    window._revengeRollHook = null;
    clearRevengeMarks(game.combat?.combatants.filter(c => c.actor).map(c => c.actor) ?? []);
  };
}

  /* -------------------------------------------------- */
  /*   Bloodbound Band Hook Controls                    */
  /* -------------------------------------------------- */
const toggleBloodboundBand = (enabled) => {
  if (enabled) {
    //find relevant actors
    const bandActors = getActorsWithItem(game, BLOODBOUND_BAND_NAME);

    /* -------------------------apply shared damage when an actor with the band takes damage------------------------- */
    window._bloodboundHook = Hooks.on('updateActor', async (actor, changes, options) => {
      dealSharedDamage(bandActors, actor, changes, options);
    });
  } else {
    Hooks.off('updateActor', window._bloodboundHook);
    window._bloodboundHook = null;
  } 
}

  /* -------------------------------------------------- */
  /*   Color Cloaks Hook Controls                       */
  /* -------------------------------------------------- */
const toggleColorCloaks = (enabled) => {
  if (enabled) {
    //find relevant actors
    const blueCloakActors = getActorsWithItem(game, COLOR_CLOAKS_NAMES[0]);
    const redCloakActors = getActorsWithItem(game, COLOR_CLOAKS_NAMES[1]);
    const yellowCloakActors = getActorsWithItem(game, COLOR_CLOAKS_NAMES[2]);

    /* -------------------------apply color cloak effects when an effect occurs on a target wearing a cloak------------------------- */
    window._colorCloakHook = Hooks.on('createChatMessage', async (message) => {
      checkColorCloakEffects(message, game, blueCloakActors, redCloakActors, yellowCloakActors);
    })
  } else {
    Hooks.off('createChatMessage', window._colorCloakHook);
    window._colorCloakHook = null;
  }
}

  /* -------------------------------------------------- */
  /*   Hellcharger Helm Hook Controls                   */
  /* -------------------------------------------------- */
const toggleHellchargerHelm = (enabled) => {
  if (enabled) {
    //find relevant actors
    const helmActors = getActorsWithItem(game, HELLCHARGER_HELM_NAME);

    window._helmHook = Hooks.on('createChatMessage', async (message) => {
      checkForCharge(message, game, helmActors);
    })
  } else {
    Hooks.off('createChatMessage', window._helmHook);
    window._helmHook = null;
  }
}

