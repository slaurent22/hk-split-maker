/* eslint-disable */

const { readFileSync, writeFileSync } = require("fs");

const FILE = {
  EVERY: "./src/asset/hollowknight/categories/every.json",
  SPLITS: "./src/asset/hollowknight/splits.txt",
  ICONS: "./src/asset/hollowknight/icons/icons.ts",
};

// TODO: figure out good way to have tools and web share common code

function parseSplitsDefinitions() {
  const splits = readFileSync(FILE.SPLITS, { encoding: "utf8" });
  const SPLITS_DEFINITIONS_REGEXP =
    /\[Description\("(?<description>.+)"\), ToolTip\("(?<tooltip>.+)"\)\]\s+(?<id>\w+),/g;
  const DESCRIPTION_NAME_REGEXP = /(?<name>.+)\s+\((?<qualifier>.+)\)/;
  const matches = splits.matchAll(SPLITS_DEFINITIONS_REGEXP);
  const definitions = new Map();
  for (const match of matches) {
    if (!match.groups) {
      throw new Error("RegExp match must have groups");
    }

    const { description, id } = match.groups;

    const desMatch = DESCRIPTION_NAME_REGEXP.exec(description);
    if (!desMatch) {
      // throw new Error(`Invalid Description: ${description}`);
      definitions.set(id, {
        id,
        qualifier: "Other",
      });
    } else {
      if (!desMatch.groups) {
        throw new Error("RegExp match must have groups");
      }
      const { qualifier } = desMatch.groups;
      definitions.set(id, {
        id,
        qualifier,
      });
    }
  }

  return definitions;
}

const Splits = [...parseSplitsDefinitions().values()];

const every = {
  categoryName: "EVERY AUTOSPLIT",
  splitIds: Splits.map(({ id }) => id),
  endTriggeringAutosplit: false,
  gameName: "Hollow Knight Category Extensions",
};

function createEvery() {
  const output = JSON.stringify(every, null, 4) + "\n";
  writeFileSync(FILE.EVERY, output);
}

const NEW_ID_MAP = {
  HasDelicateFlower: "DelicateFlower",
  PaleLurkerKey: "SimpleKey",
  Mask2: "Mask1",
  Mask3: "Mask1",
  Mask4: "Mask1",
  Mask5: "Mask1",
  MaskFragment5: "MaskFragment1",
  MaskFragment9: "MaskFragment1",
  MaskFragment13: "MaskFragment1",
  MaskFragment6: "MaskFragment2",
  MaskFragment10: "MaskFragment2",
  MaskFragment14: "MaskFragment2",
  MaskFragment7: "MaskFragment3",
  MaskFragment11: "MaskFragment3",
  MaskFragment15: "MaskFragment3",
  Vessel2: "Vessel1",
  Vessel3: "Vessel1",
  VesselFragment2: "VesselFragment1",
  VesselFragment4: "VesselFragment1",
  VesselFragment5: "VesselFragment1",
  VesselFragment7: "VesselFragment1",
  VesselFragment8: "VesselFragment1",
  CrystalGuardian: "CrystalGuardian1",
  CrystalGuardian2: "CrystalGuardian1",
  EnragedGuardian: "CrystalGuardian1",
  GreyPrince: "GreyPrinceZote",
  Hornet2: "Hornet1",
  FailedKnight: "FalseKnight",
  FailedChampion: "FalseKnight",
  LostKin: "BrokenVessel",
  BlackKnight: "WatcherKnights",
  SoulTyrant: "SoulMaster",
  MegaMossCharger: "MassiveMossCharger",
  OroMatoNailBros: "MatoOroNailBros",
  Dreamer1: "Dreamer",
  Dreamer2: "Dreamer",
  Dreamer3: "Dreamer",
  Hegemol: "Herrah",
  ElegantKeyShoptimised: "ElegantKey",
  SlySimpleKey: "SimpleKey",
  KilledOblobbles: "Oblobbles",
  ManualSplit: "Knight",
  AllUnbreakables: "UnbreakableStrength",
  SoulTyrantEssenceWithSanctumGrub: "SoulTyrantEssence",
  GodhomeLoreRoom: "GodhomeBench",
  OnDefeatGPZ: "GreyPrinceZote",
  OnDefeatWhiteDefender: "WhiteDefender",
};

function getUrl(id, qualifier) {
  switch (id) {
    case "BronzeEnd":
      return getUrl("ColosseumBronze", "Trial");
    case "SilverEnd":
      return getUrl("ColosseumSilver", "Trial");
    case "GoldEnd":
      return getUrl("ColosseumGold", "Trial");
  }

  if (id === "DungDefenderIdol" || id === "GladeIdol") {
    return getUrl("KingsIdol", "Relic");
  }

  if (qualifier === "Start") {
    switch (id) {
      case "StartNewGame":
      case "RandoWake":
        return getUrl("ManualSplit", "Misc");
      case "StartPantheon":
        return getUrl("Godhome", "Area");
    }
  }

  if (qualifier === "Ending") {
    switch (id) {
      case "EndingSplit":
        return getUrl("Knight", "Misc");
      case "EndingA":
      case "EndingB":
        return getUrl("HollowKnightBoss", "Boss");
      case "EndingC":
      case "EndingD":
      case "EndingE":
      case "RadianceP":
        return getUrl("RadianceBoss", "Boss");
    }
  }

  if (qualifier === "Essence") {
    const boss = id.match(/(?<name>.+)Essence/);
    if (boss) {
      return getUrl(boss.groups.name, "Boss");
    }

    const count = id.match(/Essence\d\d\d\d{0,1}/);
    if (count) {
      return getUrl("DreamGate", "Skill");
    }
  }

  if (qualifier === "Pantheon") {
    const match = id.match(/(?<name>.+)P/);
    if (match) {
      return getUrl(match.groups.name, "Boss");
    }
  }
  if (qualifier === "Boss") {
    switch (id) {
      case "Sly":
        return getUrl("SlyNailsage", "Boss");
      case "SoulMasterEncountered":
      case "SoulMasterPhase1":
        return getUrl("SoulMaster", "Boss");
      case "UumuuEncountered":
        return getUrl("Uumuu", "Boss");
    }
  }

  if (qualifier === "Charm Notch") {
    return getUrl("CharmNotch", "Item");
  }

  if (qualifier === "Item") {
    switch (id) {
      case "AllSeals":
      case "SoulSanctumSeal":
        return getUrl("HallownestSeal", "Relic");
      case "AllEggs":
        return getUrl("RancidEgg", "Item");
      case "mapDirtmouth":
      case "mapCrossroads":
      case "mapGreenpath":
      case "mapFogCanyon":
      case "mapRoyalGardens":
      case "mapFungalWastes":
      case "mapCity":
      case "mapWaterways":
      case "mapMines":
      case "mapDeepnest":
      case "mapCliffs":
      case "mapOutskirts":
      case "mapRestingGrounds":
      case "mapAbyss":
        return getUrl("Map", "Misc");
    }
  }

  if (qualifier === "Obtain") {
    switch (id) {
      case "OnObtainGhostMarissa":
        return getUrl("Marissa", "NPC");
      case "OnObtainGhostCaelifFera":
        return getUrl("CaelifFera", "NPC");
      case "OnObtainGhostPoggy":
        return getUrl("Poggy", "NPC");
      case "OnObtainGhostGravedigger":
        return getUrl("Gravedigger", "NPC");
      case "OnObtainGhostJoni":
        return getUrl("Joni", "NPC");
      case "OnObtainGhostCloth":
        return getUrl("Cloth", "NPC");
      case "OnObtainGhostVespa":
        return getUrl("Vespa", "NPC");
      case "OnObtainGhostRevek":
        return getUrl("Revek", "NPC");
      case "OnObtainWanderersJournal":
        return getUrl("WanderersJournal", "Relic");
      case "OnObtainHallownestSeal":
        return getUrl("HallownestSeal", "Relic");
      case "OnObtainKingsIdol":
        return getUrl("KingsIdol", "Relic");
      case "ArcaneEgg8":
      case "OnObtainArcaneEgg":
        return getUrl("ArcaneEgg", "Relic");
      case "OnObtainRancidEgg":
        return getUrl("RancidEgg", "Item");
      case "OnObtainMaskShard":
        return getUrl("MaskShard", "Fragment");
      case "OnObtainVesselFragment":
        return getUrl("VesselFragment1", "Fragment");
      case "OnObtainSimpleKey":
        return getUrl("SimpleKey", "Item");
      case "OnUseSimpleKey":
        return getUrl("SimpleKey", "Item");
      case "OnObtainGrub":
        return getUrl("Grub", "Misc");
      case "OnObtainPaleOre":
        return getUrl("PaleOre", "Item");
      case "OnObtainWhiteFragment":
        return getUrl("WhiteFragmentLeft", "Charm");
      case "OnObtainCharmNotch":
        return getUrl("CharmNotch", "Item");
      case "MaskShardMawlek":
      case "MaskShardGrubfather":
      case "MaskShardGoam":
      case "MaskShardQueensStation":
      case "MaskShardBretta":
      case "MaskShardStoneSanctuary":
      case "MaskShardWaterways":
      case "MaskShardFungalCore":
      case "MaskShardEnragedGuardian":
      case "MaskShardHive":
      case "MaskShardSeer":
      case "MaskShardFlower":
        return getUrl("MaskShard", "Fragment");
      case "VesselFragGreenpath":
      case "VesselFragCrossroadsLift":
      case "VesselFragKingsStation":
      case "VesselFragGarpedes":
      case "VesselFragStagNest":
      case "VesselFragSeer":
      case "VesselFragFountain":
        return getUrl("VesselFragment1", "Fragment");
    }
  }

  if (qualifier === "Event") {
    switch (id) {
      case "PreGrimmShop":
        return getUrl("Sly", "Misc");
      case "CanOvercharm":
        return getUrl("Charmed", "Achievement");
      case "UnchainedHollowKnight":
        return getUrl("BlackEgg", "Misc");
      case "WatcherChandelier":
        return getUrl("WatcherChandelier", "Misc");
      case "CityGateOpen":
        return getUrl("CityKey", "Item");
      case "CityGateAndMantisLords":
        return getUrl("CityKey", "Item");
      case "FlowerQuest":
        return getUrl("DelicateFlower", "Item");
      case "FlowerRewardGiven":
        return getUrl("Solace", "Achievement");
      case "HappyCouplePlayerDataEvent":
        return getUrl("HappyCouple", "Achievement");
      case "AllCharmNotchesLemm2CP":
        return getUrl("Lemm", "Misc");
      case "NailsmithChoice":
      case "NailsmithKilled":
        return getUrl("Purity", "Achievement");
      case "NailsmithSpared":
        return getUrl("HappyCouple", "Achievement");
      case "NightmareLantern":
        return getUrl("Flame", "Misc");
      case "NightmareLanternDestroyed":
        return getUrl("Banishment", "Achievement");
      case "HollowKnightDreamnail":
        return getUrl("HollowKnightBoss", "Boss");
      case "SeerDeparts":
        return getUrl("Ascension", "Achievement");
      case "SpiritGladeOpen":
        return getUrl("Attunement", "Achievement");
      case "BeastsDenTrapBench":
        return getUrl("Bench", "Misc");
      case "PlayerDeath":
        return getUrl("Shade", "Enemy");
      case "ShadeKilled":
        return getUrl("Shade", "Enemy");
      case "SlyShopFinished":
        return getUrl("Sly", "Misc");
      case "AllBreakables":
        return getUrl("FragileStrengthBroken", "Charm");
      case "MetEmilitia":
        return getUrl("Emilitia", "NPC");
      case "EternalOrdealUnlocked":
      case "EternalOrdealAchieved":
        return getUrl("Zote", "Enemy");
      case "SavedCloth":
        return getUrl("Cloth", "NPC");
      case "RidingStag":
      case "StagMoved":
        return getUrl("Stag", "Misc");
      case "MineLiftOpened":
        return getUrl("CrystalCrawler", "Enemy");
      case "AbyssDoor":
        return getUrl("KingsBrand", "Item");
      case "AbyssLighthouse":
        return getUrl("Shade", "Enemy");
      case "PureSnail":
        return getUrl("PureSnail", "Misc");
      case "OnGhostCoinsIncremented":
        return getUrl("Knight", "Misc");
      case "WhiteDefenderStatueUnlocked":
        return getUrl("Stinky", "Misc");
      case "PathOfPainRoom4DDark":
        return getUrl("Wingmould", "Enemy");
    }
  }

  if (qualifier === "Trial") {
    switch (id) {
      case "ColosseumBronzeUnlocked":
        return getUrl("LittleFool", "NPC");
      case "ColosseumSilverUnlocked":
      case "ColosseumBronze":
        return getUrl("Warrior", "Achievement");
      case "ColosseumGoldUnlocked":
      case "ColosseumSilver":
        return getUrl("Conqueror", "Achievement");
      case "ColosseumGold":
        return getUrl("Fool", "Achievement");
      case "Pantheon1":
        return getUrl("Brotherhood", "Achievement");
      case "Pantheon2":
        return getUrl("Inspiration", "Achievement");
      case "Pantheon3":
        return getUrl("Focus", "Achievement");
      case "Pantheon4":
        return getUrl("SoulAndShade", "Achievement");
      case "Pantheon5":
        return getUrl("EmbraceTheVoid", "Achievement");
    }
  }

  if (qualifier === "Completed") {
    switch (id) {
      case "PathOfPain":
        return getUrl("SealOfBinding", "Item");
    }
  }

  if (qualifier === "Mini Boss" || qualifier === "Killed") {
    switch (id) {
      case "AspidHunter":
        return getUrl("AspidHunter", "Enemy");
      case "MossKnight":
        return getUrl("MossKnight", "Enemy");
      case "MushroomBrawler":
        return getUrl("ShrumalOgre", "Enemy");
      case "Zote1":
        return getUrl("VengeflyKing", "Boss");
      case "Zote2":
        return getUrl("Zote", "Enemy");
      case "ZoteKilled":
        return getUrl("Zote", "Enemy");
      case "Aluba":
        return getUrl("Aluba", "Enemy");
      case "CrystalPeakHuntersNotes":
        return getUrl("CrystalCrawler", "Enemy");
      case "RollerHuntersNotes":
        return getUrl("Baldur", "Enemy");
      case "Maggots":
        return getUrl("Maggot", "Enemy");
      case "HuskMiner":
        return getUrl("HuskMiner", "Enemy");
      case "GreatHopper":
        return getUrl("GreatHopper", "Enemy");
      case "GreatHuskSentry":
        return getUrl("GreatHuskSentry", "Enemy");
      case "GorgeousHusk":
        return getUrl("GorgeousHusk", "Enemy");
      case "MenderBug":
        return getUrl("MenderBug", "Enemy");
      case "killedSanctumWarrior":
        return getUrl("SoulWarrior", "Boss");
      case "killedSoulTwister":
        return getUrl("SoulTwister", "Enemy");
      case "Mimic1":
      case "Mimic2":
      case "Mimic3":
      case "Mimic4":
      case "Mimic5":
        return getUrl("Mimic", "Enemy");
    }
  }

  if (qualifier === "Stag Station") {
    return getUrl("Stag", "Misc");
  }

  if (qualifier === "Area") {
    switch (id) {
      case "Abyss":
        return getUrl("ShadowCreeper", "Enemy");
      case "CityOfTears":
        return getUrl("HuskSentry", "Enemy");
      case "Colosseum":
        return getUrl("Colosseum", "Misc");
      case "CrystalPeak":
        return getUrl("CrystalCrawler", "Enemy");
      case "Deepnest":
        return getUrl("Dirtcarver", "Enemy");
      case "DeepnestSpa":
        return getUrl("HotSpring", "Misc");
      case "Dirtmouth":
        return getUrl("Elderbug", "NPC");
      case "FogCanyon":
        return getUrl("Uoma", "Enemy");
      case "ForgottenCrossroads":
        return getUrl("Tiktik", "Enemy");
      case "FungalWastes":
        return getUrl("Ambloom", "Enemy");
      case "Godhome":
        return getUrl("Godseeker", "Misc");
      case "Greenpath":
        return getUrl("Mosscreep", "Enemy");
      case "Hive":
        return getUrl("Hiveling", "Enemy");
      case "InfectedCrossroads":
        return getUrl("FuriousVengefly", "Enemy");
      case "KingdomsEdge":
        return getUrl("PrimalAspid", "Enemy");
      case "QueensGardens":
        return getUrl("SpinyHusk", "Enemy");
      case "RestingGrounds":
        return getUrl("Seer", "Misc");
      case "RoyalWaterways":
        return getUrl("Flukefey", "Enemy");
      case "TeachersArchive":
        return getUrl("ChargedLumafly", "Enemy");
      case "WhitePalace":
        return getUrl("Wingmould", "Enemy");
      case "WhitePalaceSecretRoom":
        return getUrl("Kingsmould", "Enemy");
    }
  }

  if (qualifier === "Transition") {
    switch (id) {
      case "BasinEntry":
      case "BasinSpikePitExit":
        return getUrl("Abyss", "Area");
      case "BlueLake":
        return getUrl("Witness", "Achievement");
      case "BrettaHouse":
      case "BrettaHouseBubbles":
      case "BrettaHouseBumpers":
      case "BrettaHouseSwitches":
      case "BrettaHouseZippers":
        return getUrl("BrettaRescued", "NPC");
      case "CatacombsEntry":
        return getUrl("EntombedHusk", "Enemy");
      case "CrystalMoundExit":
        return getUrl("DescendingDark", "Skill");
      case "CrystalPeakEntry":
        return getUrl("CrystalPeak", "Area");
      case "EnterAnyDream":
        return getUrl("DreamNail", "Skill");
      case "EnterBeastDen":
        return getUrl("Bench", "Misc");
      case "EnterCrown":
        return getUrl("CrystallisedHusk", "Enemy");
      case "EnterCrossroads":
        return getUrl("ForgottenCrossroads", "Area");
      case "EnterDeepnest":
        return getUrl("Deepnest", "Area");
      case "EnterDirtmouth":
        return getUrl("Dirtmouth", "Area");
      case "EnterRafters":
        return getUrl("WingedSentry", "Enemy");
      case "LemmShopExit":
        return getUrl("Lemm", "Misc");
      case "FogCanyonEntry":
        return getUrl("FogCanyon", "Area");
      case "EnterGreenpath":
      case "EnterGreenpathWithOvercharm":
        return getUrl("Greenpath", "Area");
      case "FungalWastesEntry":
        return getUrl("FungalWastes", "Area");
      case "HiveEntry":
        return getUrl("Hive", "Area");
      case "KingsPass":
      case "KingsPassEnterFromTown":
        return getUrl("Vengefly", "Enemy");
      case "KingdomsEdgeEntry":
      case "KingdomsEdgeOvercharmedEntry":
        return getUrl("KingdomsEdge", "Area");
      case "EnterNKG":
        return getUrl("GrimmkinNightmare", "Enemy");
      case "EnterQueensGardensOrDeepnest":
      case "QueensGardensEntry":
        return getUrl("QueensGardens", "Area");
      case "EnterSanctum":
      case "EnterSanctumWithShadeSoul":
        return getUrl("Folly", "Enemy");
      case "EnterJunkPit":
      case "WaterwaysEntry":
        return getUrl("RoyalWaterways", "Area");
      case "TransClaw":
        return getUrl("MantisClaw", "Skill");
      case "TransGorgeousHusk":
        return getUrl("GorgeousHusk", "Enemy");
      case "TransDescendingDark":
        return getUrl("DescendingDark", "Skill");
      case "TransVS":
        return getUrl("VengefulSpirit", "Skill");
      case "TransShadeSoul":
        return getUrl("ShadeSoul", "Skill");
      case "TransMapCrossroads":
        return getUrl("Map", "Misc");
      case "TransTear":
      case "TransTearWithGrub":
        return getUrl("IsmasTear", "Skill");
      case "TransFlame1":
      case "TransFlame2":
      case "TransFlame3":
        return getUrl("FlameConsumed", "Misc");
      case "CorniferAtHome":
        return getUrl("Iselda", "Misc");
      case "QueensGardensFrogsTrans":
        return getUrl("QueensGardens", "Area");
      case "QueensGardensPostArenaTransition":
        return getUrl("QueensGardens", "Area");
      case "WhitePalaceEntry":
        return getUrl("WhitePalace", "Area");
      case "EnterGodhome":
      case "Pantheon1to4Entry":
      case "Pantheon5Entry":
      case "GodhomeLoreRoom":
      case "GodhomeBench":
        return getUrl("Godhome", "Area");
      case "TransitionAfterSaveState":
      case "TransitionExcludingDiscontinuities":
      case "AnyTransition":
        return getUrl("ManualSplit", "Misc");
      case "EnterCityTollBenchRoom":
        return getUrl("Bench", "Misc");
      case "ColosseumBronzeExit":
        return getUrl("ColosseumBronze", "Trial");
      case "ColosseumSilverExit":
        return getUrl("ColosseumSilver", "Trial");
      case "ColosseumGoldExit":
        return getUrl("ColosseumGold", "Trial");
      case "ColosseumBronzeEntry":
        return getUrl("ColosseumBronze", "Trial");
      case "ColosseumSilverEntry":
        return getUrl("ColosseumSilver", "Trial");
      case "ColosseumGoldEntry":
        return getUrl("ColosseumGold", "Trial");
      case "EnterBroodingMawlek":
        return getUrl("BroodingMawlek", "Boss");
      case "EnterNosk":
        return getUrl("Nosk", "Boss");
      case "EnterHornet1":
        return getUrl("Hornet1", "Boss");
      case "EnterSoulMaster":
        return getUrl("SoulMaster", "Boss");
      case "EnterHornet2":
        return getUrl("Hornet2", "Boss");
      case "EnterHiveKnight":
        return getUrl("HiveKnight", "Boss");
      case "EnterTMG":
        return getUrl("TroupeMasterGrimm", "Boss");
      case "EnterLoveTower":
        return getUrl("Collector", "Boss");
      case "VengeflyKingTrans":
        return getUrl("VengeflyKing", "Boss");
      case "MegaMossChargerTrans":
        return getUrl("MassiveMossCharger", "Boss");
      case "ElderHuTrans":
        return getUrl("ElderHu", "Boss");
      case "BlackKnightTrans":
        return getUrl("BlackKnight", "Boss");
      case "BrokenVesselTrans":
        return getUrl("BrokenVessel", "Boss");
      case "PreGrimmShopTrans":
      case "SlyShopFinished":
        return getUrl("Sly", "Misc");
      case "LumaflyLanternTransition":
        return getUrl("LumaflyLantern", "Item");
      case "TransCollector":
        return getUrl("Collector", "Boss");
      case "AncestralMound":
        return getUrl("ManualSplit", "Misc");
      case "SalubraExit":
        return getUrl("SalubrasBlessing", "Item");
      case "SpireBenchExit":
        return getUrl("Bench", "Misc");
    }
  }

  if (qualifier === "Menu") {
    switch (id) {
      case "Menu":
        return getUrl("MapQuill", "Misc");
      case "MenuClaw":
        return getUrl("MantisClaw", "Skill");
      case "MenuCloak":
        return getUrl("MothwingCloak", "Skill");
      case "MenuDashmaster":
        return getUrl("Dashmaster", "Charm");
      case "MenuDreamNail":
        return getUrl("DreamNail", "Skill");
      case "MenuDreamGate":
        return getUrl("DreamGate", "Skill");
      case "MenuDreamer3":
        return getUrl("Dreamer", "Dreamer");
      case "MenuGorgeousHusk":
        return getUrl("GorgeousHusk", "Enemy");
      case "MenuShadeSoul":
        return getUrl("ShadeSoul", "Skill");
      case "MenuVoidHeart":
        return getUrl("VoidHeart", "Charm");
      case "MenuHegemol":
        return getUrl("Herrah", "Dreamer");
      case "MenuLurien":
        return getUrl("Lurien", "Dreamer");
      case "MenuMonomon":
        return getUrl("Monomon", "Dreamer");
      case "MenuIsmasTear":
        return getUrl("IsmasTear", "Skill");
    }
  }

  if (qualifier === "NPC") {
    switch (id) {
      case "MetGreyMourner":
      case "GreyMournerSeerAscended":
        return getUrl("GreyMourner", "NPC");
      case "Lemm2":
        return getUrl("Lemm", "Misc");
      case "BrummFlame":
        return getUrl("FlameConsumed", "Misc");
      case "givenGodseekerFlower":
      case "givenOroFlower":
      case "givenWhiteLadyFlower":
      case "givenEmilitiaFlower":
        return getUrl("DelicateFlower", "Item");
    }
  }

  if (qualifier === "Flame") {
    return getUrl("FlameConsumed", "Misc");
  }

  if (qualifier === "Ore") {
    return getUrl("PaleOre", "Item");
  }

  if (qualifier === "Grub") {
    return getUrl("Grub", "Misc");
  }

  if (qualifier === "Tram") {
    return getUrl("Tram", "Misc");
  }

  if (qualifier === "Toll" || qualifier === "Bench") {
    return getUrl("Bench", "Misc");
  }

  if (qualifier === "Lever" || qualifier === "Room") {
    return getUrl("WhitePalace", "Area");
  }

  if (id.match(/MrMushroom./)) {
    return getUrl("MrMushroom", "NPC");
  }

  if (id.match(/Tree.+/)) {
    return getUrl("WhisperingRoot", "Misc");
  }

  if (id === "DgateKingdomsEdgeAcid") {
    return getUrl("DreamGate", "Skill");
  }

  if (qualifier === "Old Dreamer Timing") {
    switch (id) {
      case "HegemolDreamer":
        return getUrl("Hegemol", "Dreamer");
      case "LurienDreamer":
        return getUrl("Lurien", "Dreamer");
      case "MonomonDreamer":
        return getUrl("Monomon", "Dreamer");
    }
  }

  if (qualifier === "Other") {
    return getUrl("ManualSplit", "Misc");
  }
  const newId = NEW_ID_MAP[id] || id;
  return `./${qualifier}/${newId}.png`;
}

function createIconImports() {
  let output =
    "/* eslint-disable */\n/* THIS FILE IS AUTOMATICALLY GENERATED */\n";
  for (const { id, qualifier } of Splits) {
    output += `import ${id} from "${getUrl(id, qualifier)}";\n`;
  }

  // non-split icons
  output += `import TheHollowKnight from "./Achievement/TheHollowKnight.png";\n`;
  output += `import SealedSiblings from "./Achievement/SealedSiblings.png";\n`;
  output += `import DreamNoMore from "./Achievement/DreamNoMore.png";\n`;

  // console.log(output);
  output += "export default {\n";
  for (const { id } of Splits) {
    output += `  ${id},\n`;
  }
  output += `  TheHollowKnight,\n`;
  output += `  SealedSiblings,\n`;
  output += `  DreamNoMore,\n`;
  output += "};\n";

  // console.log(output);
  writeFileSync(FILE.ICONS, output);
}

createEvery();
createIconImports();
