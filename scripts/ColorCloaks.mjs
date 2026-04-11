const MODULE_ID = "draw-steel-combat-tracker";
const BLUECLOAK_NAME = 'Color Cloak (Blue)';
const BLUECLOAK_EFFECT_POSITIVE_NAME = 'Cold Immunity';
const BLUECLOAK_EFFECT_NEGATIVE_NAME = 'Cold Weakness';
const REDCLOAK_NAME = 'Color Cloak (Red)';
const REDCLOAK_EFFECT_POSITIVE_NAME = 'Fire Immunity';
const REDCLOAK_EFFECT_NEGATIVE_NAME = 'Fire Weakness';
const YELLOWCLOAK_NAME = 'Color Cloak (Yellow)';
const YELLOWCLOAK_EFFECT_POSITIVE_NAME = 'Lightning Immunity';
const YELLOWCLOAK_EFFECT_NEGATIVE_NAME = 'Lightning Weakness';

export async function checkColorCloakEffects(message, game, blueCloakActors, redCloakActors, yellowCloakActors) {
  // if (!message.rolls?.length) return;
  // if (message.rolls[0].options?.type !== 'test') return;
  const attackingActor = game.actors.get(message.speaker?.actor)
  ?? canvas.tokens.get(message.speaker?.token)?.actor;
  if (!attackingActor) return;

  const allTargets = game.users.contents.flatMap(u => [...u.targets]);
  const cloakWearerIsTargeted = allTargets.some(t =>
      (t.actor && blueCloakActors.includes(t.actor)) ||
      (t.actor && redCloakActors.includes(t.actor)) ||
      (t.actor && yellowCloakActors.includes(t.actor))
  );
  if (!cloakWearerIsTargeted)  {console.log("No cloak wearer is targeted."); return;}

  const targetedBlueCloakWearers = allTargets.filter(t => t.actor && blueCloakActors.includes(t.actor)).map(t => t.actor);
  const targetedRedCloakWearers = allTargets.filter(t => t.actor && redCloakActors.includes(t.actor)).map(t => t.actor);
  const targetedYellowCloakWearers = allTargets.filter(t => t.actor && yellowCloakActors.includes(t.actor)).map(t => t.actor);

  const abilityName = message.content;
  const itemData = Array.from(attackingActor.collections.items.values()).find(e => e.name === abilityName);
  if (!itemData) return;
  console.log("Checking Color Cloak effects for item:");
  console.log(itemData)

  if (!itemData.system.power.effects) return;

  console.log(allTargets);

  if (targetedBlueCloakWearers.length > 0) {
    const hasColdDamage = itemData.system.power.effects.some(effect =>
      effect.type === "damage" &&
      Object.values(effect.damage).some(tier => tier.types?.has("cold"))
    );
    if (hasColdDamage) {
      await ChatMessage.create({
        content: `<strong>${BLUECLOAK_NAME}:</strong> ${blueCloakActors[0].name} was targeted by an effect dealing cold damage, and may shift ${Math.ceil(blueCloakActors[0].system.hero.xp / 16)} square(s) as a <i>triggered action</i>. If they do, their ${ BLUECLOAK_EFFECT_POSITIVE_NAME } becomes ${ BLUECLOAK_EFFECT_NEGATIVE_NAME } with the same value until the end of the next round. This triggered action cannot be used again until this weakness ends.`,
      });
    }

    console.log(targetedBlueCloakWearers[0]);
    const immunityEffect = targetedBlueCloakWearers[0].effects.find(e => e.name === BLUECLOAK_EFFECT_POSITIVE_NAME);
    const weaknessEffect = targetedBlueCloakWearers[0].effects.find(e => e.name === BLUECLOAK_EFFECT_NEGATIVE_NAME);
  if (!markedActor) return;
  }
  if (targetedRedCloakWearers.length > 0) {
    const hasFireDamage = itemData.system.power.effects.some(effect =>
      effect.type === "damage" &&
      Object.values(effect.damage).some(tier => tier.types?.has("fire"))
    );
    if (hasFireDamage) {
      await ChatMessage.create({
        content: `<strong>${REDCLOAK_NAME}:</strong> ${redCloakActors[0].name} was targeted by an effect dealing fire damage, and may reduce that damage to 0 as a <i>triggered action</i>. If they do, their ${ REDCLOAK_EFFECT_POSITIVE_NAME } becomes ${ REDCLOAK_EFFECT_NEGATIVE_NAME } with the same value until the end of the next round. This triggered action cannot be used again until this weakness ends.`,
      });
    }
  }
  if (targetedYellowCloakWearers.length > 0) {
    const hasLightningDamage = itemData.system.power.effects.some(effect =>
      effect.type === "damage" &&
      Object.values(effect.damage).some(tier => tier.types?.has("lightning"))
    );
    if (hasLightningDamage) {
      await ChatMessage.create({
        content: `<strong>${YELLOWCLOAK_NAME}:</strong> ${yellowCloakActors[0].name} was targeted by an effect dealing lightning damage, and may have their next damaging ability deal ${Math.ceil(yellowCloakActors[0].system.hero.xp / 16)} extra damage as a <i>triggered action</i>. Once that extra damage is dealt, their ${ YELLOWCLOAK_EFFECT_POSITIVE_NAME } becomes ${ YELLOWCLOAK_EFFECT_NEGATIVE_NAME } with the same value until the end of the next round. This triggered action cannot be used again until this weakness ends.`,
      });
    }
  }

}