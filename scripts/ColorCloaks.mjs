const MODULE_ID = "draw-steel-combat-tracker";
const BLUECLOAK_NAME = 'Color Cloak (Blue)';
const REDCLOAK_NAME = 'Color Cloak (Red)';
const YELLOWCLOAK_NAME = 'Color Cloak (Yellow)';

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
        content: `<strong>${BLUECLOAK_NAME}:</strong> ${blueCloakActors[0].name} was targeted by an effect dealing cold damage, and may shift ${Math.ceil(blueCloakActors[0].system.hero.xp / 16)} square(s) as a <i>triggered action</i>.`,
      });
    }
  }
  if (targetedRedCloakWearers.length > 0) {
    const hasFireDamage = itemData.system.power.effects.some(effect =>
      effect.type === "damage" &&
      Object.values(effect.damage).some(tier => tier.types?.has("fire"))
    );
    if (hasFireDamage) {
      await ChatMessage.create({
        content: `<strong>${REDCLOAK_NAME}:</strong> ${redCloakActors[0].name} was targeted by an effect dealing fire damage, and may reduce that damage to 0 as a <i>triggered action</i>.`,
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
        content: `<strong>${YELLOWCLOAK_NAME}:</strong> ${yellowCloakActors[0].name} was targeted by an effect dealing lightning damage, and may have their next damaging ability deal ${Math.ceil(yellowCloakActors[0].system.hero.xp / 16)} extra damage as a <i>triggered action</i>.`,
      });
    }
  }

  // //check for if the message ability has a reactive effect that would trigger a cloak
  // if (itemData.system.power.effects)
  // {    
    
  //   const hasFireDamage = itemData.system.power.effects.some(effect =>
  //     effect.type === "damage" &&
  //     Object.values(effect.damage).some(tier => tier.types?.has("fire"))
  //   );
  //   const hasLightningDamage = itemData.system.power.effects.some(effect =>
  //     effect.type === "damage" &&
  //     Object.values(effect.damage).some(tier => tier.types?.has("electric"))
  //   );

  // }

}