import {getWrapActors, applyMarkWhenWearerDamaged, clearRevengeOnTurnEnd, applyRevengeStrikeEffects} from "./RevengersWrap.mjs";

const MODULE_ID = 'draw-steel-rewards-automation'
const REVENGERS_WRAP_NAME = 'Revenger’s Wrap';

console.log("Hello World! This code runs immediately when the file is loaded.");

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
    onChange: () => {if (window._revengeHook || window._eotHook || window._revengeRollHook) {Hooks.off('updateActor', window._revengeHook); Hooks.off('combatTurnChange', window._eotHook); Hooks.off('createChatMessage', window._revengeRollHook);}},
  });

  game.settings.register(MODULE_ID, "bloodboundBand", {
    name: `${MODULE_ID}.Settings.BloodboundBand.Name`,
    hint: `${MODULE_ID}.Settings.BloodboundBand.Hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  console.log(game.settings.get(MODULE_ID, "revengersWrap"));

});
Hooks.on("ready", () => {
  console.log("<strong>Ready Hook:</strong> This code runs once the Foundry VTT software is ready and all game data has been loaded.");

  const wrapActors = getWrapActors(game);
  const combatActors = game.combat?.combatants.filter(c => c.actor).map(c => c.actor) ?? [];
  /* -------------------------------------------------- */
  /*   Revenger's Wrap Hooks                            */
  /* -------------------------------------------------- */
  /* -------------------------apply a mark to the actor that is selected when Revenger's Wrap wearer takes damage------------------------- */
  if (game.settings.get(MODULE_ID, "revengersWrap")) {
    console.log('revengers wrap setting is enabled');

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
  }
  
});
