import {getWrapActors, applyMarkWhenWearerDamaged, clearRevengeMarks, clearRevengeOnTurnEnd, applyRevengeStrikeEffects} from "./RevengersWrap.mjs";

const MODULE_ID = 'draw-steel-rewards-automation'
const REVENGERS_WRAP_NAME = 'Revenger’s Wrap';

Hooks.on("init", function() {
  console.log("This code runs once the Foundry VTT software begins its initialization workflow.");
});



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
  });

});
Hooks.on("ready", () => {
  console.log("Ready Hook: This code runs once the Foundry VTT software is ready and all game data has been loaded.");

  // If the setting is enabled, activate the Revenger's Wrap functionality
  if (game.settings.get(MODULE_ID, "revengersWrap")) {
    toggleRevengersWrap(true);
  }
  
});

  /* -------------------------------------------------- */
  /*   Revenger's Wrap Hook Controls                    */
  /* -------------------------------------------------- */
const toggleRevengersWrap = (enabled) => {
  if (enabled) {
    const wrapActors = getWrapActors(game);
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
