/* eslint-disable */

const {
    readFileSync,
    writeFileSync
} = require("fs");

const FILE = {
    // DIRECTORY: "./src/asset/icons/icon-directory.json",
    EVERY: "./src/asset/categories/every.json",
    SPLITS: "./src/asset/splits.txt",
    ICONS: "./src/asset/icons/icons.ts"
}

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

        const {
            description,
            id,
            tooltip,
        } = match.groups;

        const desMatch = DESCRIPTION_NAME_REGEXP.exec(description);
        if (!desMatch) {
            throw new Error(`Invalid Description: ${description}`);
        }
        if (!desMatch.groups) {
            throw new Error("RegExp match must have groups");
        }

        const { name, qualifier, } = desMatch.groups;



        definitions.set(id, {
            id,
            qualifier,
        });
    }

    return definitions;
}

const Splits = [...parseSplitsDefinitions().values()];

const every = {
    "categoryName": "EVERY AUTOSPLIT",
    "splitIds": Splits.map(({ id }) => id),
    "ordered": true,
    "endTriggeringAutosplit": false,
    "gameName": "Hollow Knight Category Extensions",
    "variables": {
        "platform": "PC",
        "patch": "1.5.75"
    }
}

function createEvery() {
    const output = JSON.stringify(every, null, 4) + "\n";
    writeFileSync(FILE.EVERY, output);
}

const NEW_ID_MAP = {
    "HasDelicateFlower": "DelicateFlower",
    "PaleLurkerKey": "SimpleKey",
    "Mask2": "Mask1",
    "Mask3": "Mask1",
    "Mask4": "Mask1",
    "MaskFragment5": "MaskFragment1",
    "MaskFragment9": "MaskFragment1",
    "MaskFragment13": "MaskFragment1",
    "MaskFragment6": "MaskFragment2",
    "MaskFragment10": "MaskFragment2",
    "MaskFragment14": "MaskFragment2",
    "MaskFragment7": "MaskFragment3",
    "MaskFragment11": "MaskFragment3",
    "MaskFragment15": "MaskFragment3",
    "Vessel2": "Vessel1",
    "Vessel3": "Vessel1",
    "VesselFragment2": "VesselFragment1",
    "VesselFragment4": "VesselFragment1",
    "VesselFragment5": "VesselFragment1",
    "VesselFragment7": "VesselFragment1",
    "VesselFragment8": "VesselFragment1",
    "CrystalGuardian": "CrystalGuardian1",
    "CrystalGuardian2": "CrystalGuardian1",
    "EnragedGuardian": "CrystalGuardian1",
    "GreyPrince": "GreyPrinceZote",
    "Hornet2": "Hornet1",
    "FailedKnight": "FalseKnight",
    "FailedChampion": "FalseKnight",
    "LostKin": "BrokenVessel",
    "BlackKnight": "WatcherKnights",
    "SoulTyrant": "SoulMaster",
    "MegaMossCharger": "MassiveMossCharger",
    "OroMatoNailBros": "MatoOroNailBros",
    "Dreamer1": "Dreamer",
    "Dreamer2": "Dreamer",
    "Dreamer3": "Dreamer",
    "Hegemol": "Herrah",
    "ElegantKeyShoptimised": "ElegantKey",
    "SlySimpleKey": "SimpleKey",
    "KilledOblobbles": "Oblobbles",
    "ManualSplit": "Knight",
    "AllUnbreakables": "UnbreakableStrength",
    "SoulTyrantEssenceWithSanctumGrub": "SoulTyrantEssence",
    "ColosseumBronzeUnlocked": "ColosseumBronze",
    "ColosseumBronzeExit": "ColosseumBronze",
    "ColosseumSilverUnlocked": "ColosseumSilver",
    "ColosseumSilverExit": "ColosseumSilver",
    "ColosseumGoldUnlocked": "ColosseumGold",
    "ColosseumGoldExit": "ColosseumGold",
    "GodhomeLoreRoom": "GodhomeBench"
};

function getUrl(id, qualifier) {
    if (id === "DungDefenderIdol") {
        return getUrl("KingsIdol", "Relic");
    }

    if (qualifier === "Essence") {
        const match = id.match(/(?<name>.+)Essence/);
        if (match) {
            return getUrl(match.groups.name, "Boss");
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
            case "Sly": return getUrl("SlyNailsage", "Boss");
        }
    }

    if (qualifier === "Charm Notch") {
        return getUrl("CharmNotch", "Item");
    }

    if (qualifier === "Item") {
        switch (id) {
            case "AllSeals": return getUrl("HallownestSeal", "Relic");
            case "AllEggs":  return getUrl("RancidEgg", "Item");
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
                return getUrl("Map", "Misc")
        }
    }

    if (qualifier === "Obtain") {
        switch (id) {
            case "OnObtainGhostMarissa":     return getUrl("Marissa", "NPC");
            case "OnObtainGhostCaelifFera":  return getUrl("CaelifFera", "NPC");
            case "OnObtainGhostPoggy":       return getUrl("Poggy", "NPC");
            case "OnObtainGhostGravedigger": return getUrl("Gravedigger", "NPC");
            case "OnObtainGhostJoni":        return getUrl("Joni", "NPC");
            case "OnObtainGhostCloth":       return getUrl("Cloth", "NPC");
            case "OnObtainGhostVespa":       return getUrl("Vespa", "NPC");
            case "OnObtainGhostRevek":       return getUrl("Revek", "NPC");
            case "OnObtainWanderersJournal": return getUrl("WanderersJournal", "Relic");
            case "OnObtainHallownestSeal":   return getUrl("HallownestSeal", "Relic");
            case "OnObtainKingsIdol":        return getUrl("KingsIdol", "Relic");
            case "OnObtainArcaneEgg":        return getUrl("ArcaneEgg", "Relic");
            case "OnObtainRancidEgg":        return getUrl("RancidEgg", "Item");
            case "OnObtainMaskShard":        return getUrl("MaskShard", "Fragment");
            case "OnObtainVesselFragment":   return getUrl("VesselFragment1", "Fragment");
            case "OnObtainSimpleKey":        return getUrl("SimpleKey", "Item");
            case "OnUseSimpleKey":           return getUrl("SimpleKey", "Item");
            case "OnObtainGrub":             return getUrl("Grub", "NPC");
        }
    }

    if (qualifier === "Event") {
        switch (id) {
            case "PreGrimmShop":               return getUrl("TroupeMasterGrimm", "Boss");
            case "CanOvercharm":               return getUrl("Charmed", "Achievement");
            case "UnchainedHollowKnight":      return getUrl("HollowKnightBoss", "Boss");
            case "WatcherChandelier":          return getUrl("WatcherChandelier", "Misc");
            case "CityGateOpen":               return getUrl("CityKey", "Item");
            case "FlowerQuest":                return getUrl("DelicateFlower", "Item");
            case "FlowerRewardGiven":          return getUrl("Solace", "Achievement");
            case "HappyCouplePlayerDataEvent": return getUrl("HappyCouple", "Achievement");
            case "AllCharmNotchesLemm2CP":     return getUrl("Lemm", "Misc");
            case "NailsmithKilled":            return getUrl("Purity", "Achievement");
            case "NailsmithSpared":            return getUrl("HappyCouple", "Achievement");
            case "NightmareLantern":           return getUrl("Flame", "Misc");
            case "NightmareLanternDestroyed":  return getUrl("Banishment", "Achievement");
            case "HollowKnightDreamnail":      return getUrl("HollowKnightBoss", "Boss");
            case "SeerDeparts":                return getUrl("Ascension", "Achievement");
            case "SpiritGladeOpen":            return getUrl("Attunement", "Achievement");
            case "BeastsDenTrapBench":         return getUrl("Bench", "Misc");
            case "PlayerDeath":                return getUrl("Shade", "Enemy");
            case "SlyShopFinished":            return getUrl("Sly", "Misc");
            case "AllBreakables":              return getUrl("FragileStrengthBroken", "Charm");
            case "MetEmilitia":                return getUrl("Emilitia", "NPC");
            case "EndingSplit":                return getUrl("Knight", "Misc");
            case "EternalOrdealUnlocked":
            case "EternalOrdealAchieved":      return getUrl("Zote", "Enemy");
        }
    }

    if (qualifier === "Trial") {
        switch (id) {
            case "ColosseumBronzeUnlocked":
            case "ColosseumBronze": return getUrl("Warrior", "Achievement")
            case "ColosseumSilverUnlocked":
            case "ColosseumSilver": return getUrl("Conqueror", "Achievement")
            case "ColosseumGoldUnlocked":
            case "ColosseumGold":   return getUrl("Fool", "Achievement")
            case "Pantheon1":       return getUrl("Brotherhood", "Achievement")
            case "Pantheon2":       return getUrl("Inspiration", "Achievement")
            case "Pantheon3":       return getUrl("Focus", "Achievement")
            case "Pantheon4":       return getUrl("SoulAndShade", "Achievement")
            case "Pantheon5":       return getUrl("EmbraceTheVoid", "Achievement")
        }
    }

    if (qualifier === "Completed") {
        switch (id) {
            case "PathOfPain": return getUrl("SealOfBinding", "Item");
        }
    }

    if (qualifier === "Mini Boss" || qualifier === "Killed") {
        switch (id) {
            case "AspidHunter":          return getUrl("AspidHunter", "Enemy");
            case "MossKnight":           return getUrl("MossKnight", "Enemy");
            case "MushroomBrawler":      return getUrl("ShrumalOgre", "Enemy");
            case "Zote1":                return getUrl("VengeflyKing", "Boss");
            case "Zote2":                return getUrl("Zote", "Enemy");
            case "ZoteKilled":           return getUrl("Zote", "Enemy");
            case "Aluba":                return getUrl("Aluba", "Enemy");
            case "HuskMiner":            return getUrl("HuskMiner", "Enemy");
            case "GreatHopper":          return getUrl("GreatHopper", "Enemy");
            case "GorgeousHusk":         return getUrl("GorgeousHusk", "Enemy");
            case "MenderBug":            return getUrl("MenderBug", "Enemy");
            case "killedSanctumWarrior": return getUrl("SoulWarrior", "Boss");
            case "killedSoulTwister":    return getUrl("SoulTwister", "Enemy");
        }
    }

    if (qualifier === "Stag Station") {
        return getUrl("Stag", "Misc");
    }

    if (qualifier === "Area") {
        switch (id) {
            case "Abyss":                 return getUrl("ShadowCreeper", "Enemy");
            case "CityOfTears":           return getUrl("HuskSentry", "Enemy");
            case "Colosseum":             return getUrl("Colosseum", "Misc");
            case "CrystalPeak":           return getUrl("CrystalCrawler", "Enemy");
            case "Deepnest":              return getUrl("Dirtcarver", "Enemy");
            case "DeepnestSpa":           return getUrl("HotSpring", "Misc");
            case "Dirtmouth":             return getUrl("Elderbug", "NPC");
            case "FogCanyon":             return getUrl("Uoma", "Enemy");
            case "ForgottenCrossroads":   return getUrl("Tiktik", "Enemy");
            case "FungalWastes":          return getUrl("Ambloom", "Enemy");
            case "Godhome":               return getUrl("Godseeker", "Misc");
            case "Greenpath":             return getUrl("Mosscreep", "Enemy");
            case "Hive":                  return getUrl("Hiveling", "Enemy");
            case "InfectedCrossroads":    return getUrl("FuriousVengefly", "Enemy");
            case "KingdomsEdge":          return getUrl("PrimalAspid", "Enemy");
            case "QueensGardens":         return getUrl("SpinyHusk", "Enemy");
            case "RestingGrounds":        return getUrl("Seer", "Misc");
            case "RoyalWaterways":        return getUrl("Flukefey", "Enemy");
            case "TeachersArchive":       return getUrl("ChargedLumafly", "Enemy");
            case "WhitePalace":           return getUrl("Wingmould", "Enemy");
            case "WhitePalaceSecretRoom": return getUrl("Kingsmould", "Enemy");
        }
    }

    if (qualifier === "Transition") {
        switch (id) {
            case "BasinEntry":                   return getUrl("Abyss", "Area");
            case "BlueLake":                     return getUrl("Witness", "Achievement");
            case "CrystalPeakEntry":             return getUrl("CrystalPeak", "Area");
            case "EnterAnyDream":                return getUrl("DreamNail", "Skill");
            case "FogCanyonEntry":               return getUrl("FogCanyon", "Area");
            case "EnterGreenpath":
            case "EnterGreenpathWithOvercharm":  return getUrl("Greenpath", "Area");
            case "HiveEntry":                    return getUrl("Hive", "Area");
            case "KingsPass":
            case "KingsPassEnterFromTown":       return getUrl("Vengefly", "Enemy");
            case "KingdomsEdgeEntry":
            case "KingdomsEdgeOvercharmedEntry": return getUrl("KingdomsEdge", "Area");
            case "EnterNKG":                     return getUrl("GrimmkinNightmare", "Enemy");
            case "QueensGardensEntry":           return getUrl("QueensGardens", "Area");
            case "EnterSanctum":
            case "EnterSanctumWithShadeSoul":    return getUrl("Folly", "Enemy");
            case "WaterwaysEntry":               return getUrl("RoyalWaterways", "Area");
            case "TransClaw":                    return getUrl("MantisClaw", "Skill");
            case "TransGorgeousHusk":            return getUrl("GorgeousHusk", "Enemy");
            case "TransDescendingDark":          return getUrl("DescendingDark", "Skill");
            case "CorniferAtHome":               return getUrl("Iselda", "Misc");
            case "QueensGardensFrogsTrans":      return getUrl("QueensGardens", "Area");
            case "QueensGardensPostArenaTransition":
                                                 return getUrl("QueensGardens", "Area");
            case "WhitePalaceEntry":             return getUrl("WhitePalace", "Area");
            case "Pantheon1to4Entry":
            case "Pantheon5Entry":
            case "GodhomeLoreRoom":
            case "GodhomeBench":                 return getUrl("Godhome", "Area");
            case "TransitionAfterSaveState":
            case "AnyTransition":                return getUrl("ManualSplit", "Misc");
            case "ColosseumBronzeExit":          return getUrl("ColosseumBronze", "Trial");
            case "ColosseumSilverExit":          return getUrl("ColosseumSilver", "Trial");
            case "ColosseumGoldExit":            return getUrl("ColosseumGold", "Trial");

        }
    }

    if (qualifier === "Menu") {
        switch (id) {
            case "Menu": return getUrl("MapQuill", "Misc");
            case "MenuClaw":                     return getUrl("MantisClaw", "Skill");
            case "MenuGorgeousHusk":             return getUrl("GorgeousHusk", "Enemy");
        }
    }

    if (qualifier === "NPC") {
        switch (id) {
            case "MetGreyMourner":
            case "GreyMournerSeerAscended": return getUrl("GreyMourner", "NPC");
            case "Lemm2": return getUrl("Lemm", "Misc");
            case "BrummFlame": return getUrl("FlameConsumed", "Misc");
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
        return getUrl("PaleOre", "Item")
    }

    if (qualifier === "Grub") {
        return getUrl("Grub", "NPC")
    }

    if (qualifier === "Tram") {
        return getUrl("Tram", "Misc");
    }

    if (qualifier === "Toll") {
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

    if (id === "SoulMasterEncountered") {
        return getUrl("SoulMaster", "Boss");
    }

    const newId = NEW_ID_MAP[id] || id;
    return `./${qualifier}/${newId}.png`;
}

function createIconImports() {
    let output = "/* eslint-disable */\n/* THIS FILE IS AUTOMATICALLY GENERATED */\n";
    for (const { id, qualifier } of Splits) {
        output += `import ${id} from "${getUrl(id, qualifier)}";\n`;
    }

    // console.log(output);
    output += "export default {\n";
    for (const { id } of Splits) {
        output += `    ${id},\n`;
    }
    output += "};\n";


    // console.log(output);
    writeFileSync(FILE.ICONS, output);
}


createEvery();
createIconImports();
