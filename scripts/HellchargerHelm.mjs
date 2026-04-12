const MODULE_ID = "draw-steel-rewards-automation";
const ITEM_NAME = 'Hellcharger Helm';

const CHARGE_EFFECT_DATA = {
  name: 'Marked for Revenge',
  img: "icons/skills/ranged/target-bullseye-arrow-glowing.webp",
  type: "base",
  system: {
    end: { type: "turn", roll: "1d10 + @combat.save.bonus" }
  },
  changes: [],
  disabled: false,
  duration: {
    startTime: 0, combat: null, seconds: null,
    rounds: null, turns: null, startRound: 0, startTurn: 0
  },
  description: "", tint: "#ffffff", transfer: false, statuses: [], sort: 0, flags: {}
};
const CHARGE_ORIGIN = 'module.draw-steel-rewards-automation';

export async function checkForCharge(message, game, helmActors) {

    const attackingActor = game.actors.get(message.speaker?.actor)
    ?? canvas.tokens.get(message.speaker?.token)?.actor;

    if (!attackingActor) return;
    if (!helmActors.some(a => a.id === attackingActor.id)) return;

    const abilityName = message.content;
    if (abilityName !== "Charge") return;

    //TODO: create and apply an ability that gives a bonus to speed

    await ChatMessage.create({
        content: `<strong>${ITEM_NAME}:</strong> ${attackingActor.name} used Charge, gaining a +5 bonus to speed until the end of the current turn. After charging, you can use the Knockback maneuver as a free maneuver, regardless of the target creature's size.`
    });
}