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
    case "TransitionExcludingDiscontinuities":
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

    // Mask Shard
    case "MaskShard1":
    case "MaskShard2":
    case "MaskShard3":
    case "MaskShard5":
    case "MaskShard6":
    case "MaskShard7":
    case "MaskShard9":
    case "MaskShard10":
    case "MaskShard11":
    case "MaskShard13":
    case "MaskShard14":
    case "MaskShard15":
    case "MaskShard17":
    case "MaskShard18":
    case "MaskShard19":
      return getUrl("Item", "MaskShard");

    case "Mask1":
    case "Mask2":
    case "Mask3":
    case "Mask4":
    case "Mask5":
      return getUrl("Item", "Mask");

    // Spool Fragment
    case "SpoolFragment1":
    case "SpoolFragment3":
    case "SpoolFragment5":
    case "SpoolFragment7":
    case "SpoolFragment9":
    case "SpoolFragment11":
    case "SpoolFragment13":
    case "SpoolFragment15":
    case "SpoolFragment17":
      return getUrl("Item", "SpoolFragment");

    case "Spool1":
    case "Spool2":
    case "Spool3":
    case "Spool4":
    case "Spool5":
    case "Spool6":
    case "Spool7":
    case "Spool8":
    case "Spool9":
      return getUrl("Item", "Spool");

    // Item
    case "BoneBottomSimpleKey":
      return getUrl("Item", "SimpleKey");

    case "ToolPouch1":
    case "ToolPouch2":
    case "ToolPouch3":
    case "ToolPouch4":
      return getUrl("Item", "ToolPouch");

    case "CraftingKit1":
    case "CraftingKit2":
    case "CraftingKit3":
    case "CraftingKit4":
      return getUrl("Item", "CraftingKit");

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
    case "SharpdartTrans":
      return getUrl("Skill", "Sharpdart");
    case "ThreadStormTrans":
      return getUrl("Skill", "ThreadStorm");
    case "CrossStitchTrans":
      return getUrl("Skill", "CrossStitch");
    case "RuneRageTrans":
      return getUrl("Skill", "RuneRage");
    case "PaleNailsTrans":
      return getUrl("Skill", "PaleNails");
    case "NeedleStrikeTrans":
      return getUrl("Skill", "NeedleStrike");
    case "SylphsongTrans":
      return getUrl("Skill", "Sylphsong");

    // Crest Transition
    case "ReaperCrestTrans":
      return getUrl("Crest", "ReaperCrest");
    case "WandererCrestTrans":
      return getUrl("Crest", "WandererCrest");
    case "BeastCrestTrans":
      return getUrl("Crest", "BeastCrest");
    case "ArchitectCrestTrans":
      return getUrl("Crest", "ArchitectCrest");
    case "ShamanCrestTrans":
      return getUrl("Crest", "ShamanCrest");
    case "WitchCrestTrans":
      return getUrl("Crest", "WitchCrest");

    // Area Transition
    case "EnterGreymoor":
      return getUrl("Enemy", "Craw");
    case "EnterMist":
    case "LeaveMist":
    case "MistCrossing":
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
    case "EnterHuntersMarch":
      return getUrl("Enemy", "Skarrlid");
    case "EnterBilewater":
      return getUrl("Enemy", "Stilkin");
    case "EnterMosshome":
      return getUrl("Enemy", "OvergrownPilgrim");
    case "EnterBlastedSteps":
      return getUrl("Enemy", "Judge");
    case "EnterSinnersRoad":
      return getUrl("Enemy", "Muckroach");
    case "EnterExhaustOrgan":
      return getUrl("Boss", "Phantom");
    case "EnterMemorium":
      return getUrl("Enemy", "Rhinogrund");
    case "EnterUpperWormways":
      return getUrl("Enemy", "Gromling");
    case "HuntersMarchPostMiddleArenaTransition":
      return getUrl("Enemy", "SkarrScout");
    case "EnterBoneBottom":
      return getUrl("NPC", "Pebb");
    case "EnterCitadelFrontGate":
      return getUrl("Event", "Act2Started");
    case "EnterWhisperingVaults":
      return getUrl("Enemy", "Lampbearer");
    case "EnterPutrifiedDucts":
      return getUrl("Enemy", "Barnak");
    case "EnterTheSlab":
      return getUrl("Enemy", "Wardenfly");
    case "EnterMountFay":
      return getUrl("Enemy", "Driftlin");
    case "EnterBrightvein":
      return getUrl("Enemy", "Mnemonord");
    case "DivingBellAbyssTrans":
      return getUrl("Item", "DivingBellKey");
    case "EnterAbyss":
      return getUrl("Enemy", "ShadowCreeper");
    case "LastDiveTrans":
      return getUrl("Event", "LastDive");
    case "EnterWispThicket":
      return getUrl("Enemy", "Wisp");
    case "UpperMountFayTrans":
      return getUrl("Enemy", "Mnemonid");
    case "EnterWeavenestAtla":
      return getUrl("Enemy", "ServitorIgnim");
    case "EnterHalfwayHomeBasement":
      return getUrl("Enemy", "SkarrStalker");
    case "EnterSongclave":
      return getUrl("NPC", "Caretaker");
    case "EnterWhiteward":
      return getUrl("Enemy", "Surgeon");
    case "PostWhitewardElevatorTrans":
      return getUrl("Enemy", "Mortician");

    // Boss Transition/Encountered
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
    case "EnterLastJudge":
      return getUrl("Boss", "LastJudge");
    case "EnterNylethMemory":
      return getUrl("Boss", "Nyleth");
    case "EnterKhannMemory":
      return getUrl("Boss", "Khann");
    case "EnterKarmelitaMemory":
      return getUrl("Boss", "Karmelita");
    case "EnterVerdaniaMemory":
      return getUrl("Enemy", "LeafGlider");
    case "EnterSeth":
      return getUrl("Boss", "Seth");
    case "EnterBellEater":
      return getUrl("Boss", "BellEater");
    case "EnterVerdaniaCastle":
      return getUrl("Boss", "CloverDancers");
    case "GurrTheOutcastEncountered":
      return getUrl("Boss", "GurrTheOutcast");
    case "EnterFirstSinner":
    case "FirstSinnerEncountered":
      return getUrl("Boss", "FirstSinner");
    case "LostLaceEncountered":
      return getUrl("Boss", "LostLace");
    case "EnterFatherOfTheFlame":
      return getUrl("Boss", "FatherOfTheFlame");
    case "LastJudgeEncountered":
      return getUrl("Boss", "LastJudge");
    case "EnterCogworkDancers":
    case "CogworkDancersEncountered":
      return getUrl("Boss", "CogworkDancers");
    case "EnterRedMemory":
      return getUrl("NPC", "ShamanSeeker");
    case "EnterDestroyedCogworks":
      return getUrl("Misc", "ShiningCog");
    case "TheUnravelledEncountered":
      return getUrl("Boss", "TheUnravelled");

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
    case "DestroyedCogworksVoidArena":
      return getUrl("Enemy", "Undercrank");

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

    case "MetMergwin":
      return getUrl("NPC", "Mergwin");

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
    case "VerdaniaLakeFountainOrbs":
      return getUrl("Enemy", "Nuphar");
    case "CurseCrest":
    case "GainedCurse":
      return getUrl("Event", "Cursed");
    case "TrailsEndTrans":
      return getUrl("NPC", "Shakra");
    case "GivenCouriersRasher":
      return getUrl("Item", "CouriersRasher");

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
  output += `import LostLace from "./Boss/LostLace.png";\n`;
  output += `import Compass from "./Tool/Compass.png";\n`;
  output += `import DruidsEye from "./Tool/DruidsEye.png";\n`;
  output += `import MagnetiteBrooch from "./Tool/MagnetiteBrooch.png";\n`;
  output += `import ShardPendant from "./Tool/ShardPendant.png";\n`;
  output += `import StraightPin from "./Tool/StraightPin.png";\n`;
  output += `import WardingBell from "./Tool/WardingBell.png";\n`;
  output += `import Weavelight from "./Tool/Weavelight.png";\n`;
  output += `import Voltvessels from "./Tool/Voltvessels.png";\n`;
  output += `import MemoryLocket from "./Item/MemoryLocket.png";\n`;
  output += `import HunterCrest from "./Crest/HunterCrest.png";\n`;

  // console.log(output);
  output += "export default {\n";
  for (const { id } of Splits) {
    output += `  ${id},\n`;
  }
  output += `  LostLace,\n`;
  output += `  Compass,\n`;
  output += `  DruidsEye,\n`;
  output += `  MagnetiteBrooch,\n`;
  output += `  ShardPendant,\n`;
  output += `  StraightPin,\n`;
  output += `  WardingBell,\n`;
  output += `  Weavelight,\n`;
  output += `  Voltvessels,\n`;
  output += `  MemoryLocket,\n`;
  output += `  HunterCrest,\n`;
  output += "};\n";

  // console.log(output);
  writeFileSync(FILE.ICONS, output);
}

createEvery();
createIconImports();
