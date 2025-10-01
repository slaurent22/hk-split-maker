/* eslint-disable */

const { readFileSync, writeFileSync } = require("fs");

const FILE = {
  EVERY: "./src/asset/silksong/categories/every.json",
  ICONS: "./src/asset/silksong/icons/icons.ts",
};

const splits = require("../src/asset/silksong/splits.json");

// TODO: figure out good way to have tools and web share common code
const DESCRIPTION_NAME_REGEXP = /(?<name>.+)\s+\((?<qualifier>.+)\)/;
function getNameAndGroup({ description }) {
  const match = DESCRIPTION_NAME_REGEXP.exec(description);
  let name = description;
  let qualifier = "Other";

  if (match && match.groups) {
    ({ name, qualifier } = match.groups);
  }

  return [name, qualifier];
}
function parseSplitsDefinitions() {
  const splitDefinitions = new Map();
  for (const { description, key, tooltip } of splits) {
    const id = key;
    const [name, qualifier] = getNameAndGroup({ description });
    splitDefinitions.set(id, {
      id,
      qualifier,
    });
  }

  return splitDefinitions;
}

const Splits = [...parseSplitsDefinitions().values()];

const every = {
  categoryName: "EVERY AUTOSPLIT",
  splitIds: ["StartNewGame", ...Splits.map(({ id }) => id)],
  gameName: "Hollow Knight: Silksong Category Extensions",
};

function createEvery() {
  const output = JSON.stringify(every, null, 4) + "\n";
  writeFileSync(FILE.EVERY, output);
}

const NEW_ID_MAP = {};

function getUrl(qualifier, id) {
  switch (id) {
    // Misc
    case "ManualSplit":
    case "StartNewGame":
    case "PlayerDeath":
    case "AnyTransition":
    case "Act1Start":
      return getUrl("Misc", "Hornet");

    // Menu
    case "Menu":
      return getUrl("Item", "Map");

    // Bell
    case "MarrowBell":
    case "DeepDocksBell":
    case "GreymoorBell":
    case "ShellwoodBell":
    case "BellhartBell":
    case "SongclaveBell":
      return getUrl("Misc", "Bell");

    // Skill Transition
    case "SilkSpearTrans":
      return getUrl("Skill", "SilkSpear");
    case "SwiftStepTrans":
      return getUrl("Skill", "SwiftStep");
    case "DriftersCloakTrans":
      return getUrl("Skill", "DriftersCloak");
    case "ClingGripTrans":
      return getUrl("Skill", "ClingGrip");
    case "ClawlineTrans":
      return getUrl("Skill", "Clawline");

    // Crest Transition
    case "ReaperCrestTrans":
      return getUrl("Crest", "Reaper");

    // Area Transition
    case "EnterGreymoor":
      return getUrl("Enemy", "Craw");
    case "EnterMist":
    case "LeaveMist":
      return getUrl("Enemy", "Wraith");
    case "EnterHighHalls":
      return getUrl("Enemy", "Minister");
    case "EnterHighHallsArena":
      return getUrl("Enemy", "Maestro");
    case "EnterWormways":
      return getUrl("Enemy", "Grom");
    case "EnterShellwood":
      return getUrl("Enemy", "Phacia");
    case "EnterBellhart":
      return getUrl("Enemy", "Furm");
    case "EnterFarFields":
      return getUrl("Enemy", "Fertid");

    // Boss Transition
    case "MossMotherTrans":
      return getUrl("Boss", "MossMother");
    case "BellBeastTrans":
      return getUrl("Boss", "BellBeast");
    case "Lace1Trans":
      return getUrl("Boss", "Lace");
    case "MoorwingTrans":
      return getUrl("Boss", "Moorwing");
    case "TrobbioTrans":
      return getUrl("Boss", "Trobbio");

    // Melody Transition
    case "VaultkeepersMelodyTrans":
      return getUrl("Melody", "VaultkeepersMelody");
    case "ArchitectsMelodyTrans":
      return getUrl("Melody", "ArchitectsMelody");
    case "ConductorsMelodyTrans":
      return getUrl("Melody", "ConductorsMelody");

    // Mini Boss
    case "WhisperingVaultsArena":
      return getUrl("Enemy", "Vaultkeeper");
    case "HighHallsArena":
      return getUrl("Enemy", "ChoirClapper");

    // Needle Upgrade
    case "NeedleUpgrade1":
      return getUrl("Item", "Needle1");
    case "NeedleUpgrade2":
      return getUrl("Item", "Needle2");
    case "NeedleUpgrade3":
      return getUrl("Item", "Needle3");
    case "NeedleUpgrade4":
      return getUrl("Item", "Needle4");

    // Boss
    case "Lace1":
    case "Lace2":
      return getUrl("Boss", "Lace");
    case "Conchflies1":
      return getUrl("Boss", "Conchfly");
    case "SavageBeastfly1":
    case "SavageBeastfly2":
      return getUrl("Boss", "SavageBeastfly");
    case "SkullTyrant1":
      return getUrl("Boss", "SkullTyrant");

    // Flea
    case "SavedFleaHuntersMarch":
    case "SavedFleaBellhart":
    case "SavedFleaMarrow":
    case "SavedFleaDeepDocksSprint":
    case "SavedFleaFarFieldsPilgrimsRest":
    case "SavedFleaFarFieldsTrap":
    case "SavedFleaSandsOfKarak":
    case "SavedFleaBlastedSteps":
    case "SavedFleaWormways":
    case "SavedFleaDeepDocksArena":
    case "SavedFleaDeepDocksBellway":
    case "SavedFleaBilewaterOrgan":
    case "SavedFleaSinnersRoad":
    case "SavedFleaGreymoorRoof":
    case "SavedFleaGreymoorLake":
    case "SavedFleaWhisperingVaults":
    case "SavedFleaSongclave":
    case "SavedFleaMountFay":
    case "SavedFleaBilewaterTrap":
    case "SavedFleaBilewaterThieves":
    case "SavedFleaShellwood":
    case "SavedFleaSlabBellway":
    case "SavedFleaSlabCage":
    case "SavedFleaChoralChambersWind":
    case "SavedFleaChoralChambersCage":
    case "SavedFleaUnderworksCauldron":
    case "SavedFleaUnderworksWispThicket":
    case "SavedFleaGiantFlea":
    case "SavedFleaVog":
    case "SavedFleaKratt":
      return getUrl("NPC", "Flea");

    case "SeenFleatopiaEmpty":
    case "CaravanTroupeGreymoor":
    case "CaravanTroupeFleatopia":
      return getUrl("NPC", "Mooshka");

    // Bellway
    case "PutrifiedDuctsStation":
    case "BellhartStation":
    case "FarFieldsStation":
    case "GrandBellwayStation":
    case "BlastedStepsStation":
    case "DeepDocksStation":
    case "GreymoorStation":
    case "SlabStation":
    case "BilewaterStation":
    case "ShellwoodStation":
      return getUrl("Misc", "Bellway");

    // Ventrica
    case "ChoralChambersTube":
    case "UnderworksTube":
    case "GrandBellwayTube":
    case "HighHallsTube":
    case "SongclaveTube":
    case "MemoriumTube":
      return getUrl("Misc", "Ventrica");

    // NPCs
    case "SeenShakraBonebottom":
    case "SeenShakraMarrow":
    case "SeenShakraDeepDocks":
    case "SeenShakraFarFields":
    case "SeenShakraWormways":
    case "SeenShakraGreymoor":
    case "SeenShakraBellhart":
    case "SeenShakraShellwood":
    case "SeenShakraHuntersMarch":
    case "SeenShakraBlastedSteps":
    case "SeenShakraSinnersRoad":
    case "SeenShakraMountFay":
    case "SeenShakraBilewater":
    case "SeenShakraSandsOfKarak":
      return getUrl("NPC", "Shakra");

    case "MetJubilanaEnclave":
    case "JubilanaRescuedMemorium":
    case "JubilanaRescuedChoralChambers":
      return getUrl("NPC", "Jubilana");

    case "MetShermaEnclave":
    case "ShermaReturned":
      return getUrl("NPC", "Sherma");

    case "UnlockedPrinceCage":
    case "GreenPrinceInVerdania":
      return getUrl("NPC", "GreenPrince");

    case "BellhouseKeyConversation":
      return getUrl("Item", "BellhomeKey");
    case "PavoTimePassed":
      return getUrl("NPC", "Pavo");

    case "BallowMoved":
      return getUrl("NPC", "Ballow");

    // Events
    case "VerdaniaOrbsCollected":
      return getUrl("Enemy", "Verdanir");
    case "SoldRelic":
      return getUrl("NPC", "Scrounge");
    case "SilkAndSoulOffered":
    case "SoulSnareReady":
      return getUrl("Event", "SilkAndSoul");
    case "AbyssEscape":
      return getUrl("Event", "Act3Started");

    // Hearts and Memories
    case "HeartNyleth":
      return getUrl("Item", "PollenHeart");
    case "HeartKhann":
      return getUrl("Item", "EncrustedHeart");
    case "HeartKarmelita":
      return getUrl("Item", "HuntersHeart");
    case "HeartClover":
      return getUrl("Item", "ConjoinedHeart");
    case "RedMemory":
      return getUrl("Item", "Everbloom");

    // Ending
    case "EndingSplit":
    case "EndingA":
      return getUrl("Boss", "GrandMotherSilk");
  }

  const newId = NEW_ID_MAP[id] || id;
  return `./${qualifier}/${newId}.png`;
}

function createIconImports() {
  let output =
    "/* eslint-disable */\n/* THIS FILE IS AUTOMATICALLY GENERATED */\n";
  for (const { id, qualifier } of Splits) {
    output += `import ${id} from "${getUrl(qualifier, id)}";\n`;
  }

  // non-split icons
  output += `import SisteroftheVoid from "./Achievement/SisteroftheVoid.png";\n`;
  output += `import Compass from "./Tool/Compass.png";\n`;
  output += `import DruidsEye from "./Tool/DruidsEye.png";\n`;
  output += `import MagnetiteBrooch from "./Tool/MagnetiteBrooch.png";\n`;
  output += `import ShardPendant from "./Tool/ShardPendant.png";\n`;
  output += `import StraightPin from "./Tool/StraightPin.png";\n`;
  output += `import MaskShard4 from "./Item/Mask.png";\n`;

  // console.log(output);
  output += "export default {\n";
  for (const { id } of Splits) {
    output += `  ${id},\n`;
  }
  output += `  SisteroftheVoid,\n`;
  output += `  Compass,\n`;
  output += `  DruidsEye,\n`;
  output += `  MagnetiteBrooch,\n`;
  output += `  ShardPendant,\n`;
  output += `  StraightPin,\n`;
  output += `  MaskShard4,\n`;
  output += "};\n";

  // console.log(output);
  writeFileSync(FILE.ICONS, output);
}

createEvery();
createIconImports();
