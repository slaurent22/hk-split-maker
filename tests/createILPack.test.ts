import { describe, expect, test } from "vitest";
import type { Config } from "../src/lib/lss";
import { createILPack, importSplitsXml } from "../src/lib/lss";

const hkSplitIds = [
  "BenchAny",
  "BeastsDenTrapBench",
  "PlayerDeath",
  "PathOfPain",
];

const hkConfig: Config = {
  categoryName: "Category Name",
  splitIds: hkSplitIds,
  endTriggeringAutosplit: true,
  gameName: "Hollow Knight",
};

const silksongConfig: Config = {
  categoryName: "Category Name",
  splitIds: ["StartNewGame", "BenchAny", "GainedCurse", "PlayerDeath"],
  gameName: "Hollow Knight: Silksong",
};

describe("createILPack", () => {
  test("should throw when config is missing", async () => {
    await expect(createILPack(null, "hollowknight", false)).rejects.toThrow(
      "Invalid app state, splitConfig missing",
    );
  });

  describe("hollowknight", () => {
    test("should create one IL per split when endTriggeringAutosplit is true", async () => {
      const { output, outputNames, zipName } = await createILPack(
        hkConfig,
        "hollowknight",
        false,
      );

      expect(zipName).toBe("category_name_il_pack.zip");
      expect(outputNames).toStrictEqual([
        "000_BenchAny.lss",
        "001_BeastsDenTrapBench.lss",
        "002_PlayerDeath.lss",
        "003_PathOfPain.lss",
      ]);

      const ils = output.map((lss) => importSplitsXml(lss, "hollowknight"));
      expect(ils.map(({ splitIds }) => splitIds)).toStrictEqual(
        hkSplitIds.map((splitId) => [splitId]),
      );
      expect(
        ils.map(({ startTriggeringAutosplit }) => startTriggeringAutosplit),
      ).toStrictEqual([
        undefined,
        "BenchAny",
        "BeastsDenTrapBench",
        "PlayerDeath",
      ]);
      for (const il of ils) {
        expect(il.categoryName).toBe("Category Name ILs");
        expect(il.gameName).toBe("Hollow Knight");
        expect(il.endTriggeringAutosplit).toBe(true);
        expect(il.endingSplit).toBe(undefined);
      }
    });

    test("should add a credits IL after the last split when endTriggeringAutosplit is false", async () => {
      const config: Config = {
        ...hkConfig,
        endTriggeringAutosplit: false,
        endingSplit: { name: "The Hollow Knight" },
      };
      const { output, outputNames } = await createILPack(
        config,
        "hollowknight",
        false,
      );

      expect(outputNames).toStrictEqual([
        "000_BenchAny.lss",
        "001_BeastsDenTrapBench.lss",
        "002_PlayerDeath.lss",
        "003_PathOfPain.lss",
        "004_EndingSplit.lss",
      ]);

      const ils = output.map((lss) => importSplitsXml(lss, "hollowknight"));
      expect(ils.map(({ splitIds }) => splitIds)).toStrictEqual([
        ...hkSplitIds.map((splitId) => [splitId]),
        ["EndingSplit"],
      ]);
      expect(
        ils.map(({ startTriggeringAutosplit }) => startTriggeringAutosplit),
      ).toStrictEqual([
        undefined,
        "BenchAny",
        "BeastsDenTrapBench",
        "PlayerDeath",
        "PathOfPain",
      ]);
      for (const il of ils) {
        expect(il.endTriggeringAutosplit).toBe(true);
      }

      // the credits IL is named after the endingSplit
      expect(output[4]).toContain("<Name>The Hollow Knight</Name>");
    });

    test("should name the credits IL End when endingSplit is missing", async () => {
      const config: Config = {
        ...hkConfig,
        splitIds: ["BenchAny"],
        endTriggeringAutosplit: false,
      };
      const { output, outputNames } = await createILPack(
        config,
        "hollowknight",
        false,
      );

      expect(outputNames).toStrictEqual([
        "000_BenchAny.lss",
        "001_EndingSplit.lss",
      ]);
      expect(output[1]).toContain("<Name>End</Name>");
    });

    test("should start the first IL on startTriggeringAutosplit", async () => {
      const config: Config = {
        ...hkConfig,
        startTriggeringAutosplit: "PathOfPainEntry",
        splitIds: ["PathOfPainTransition1", "PathOfPain"],
      };
      const { output, outputNames } = await createILPack(
        config,
        "hollowknight",
        false,
      );

      expect(outputNames).toStrictEqual([
        "000_PathOfPainTransition1.lss",
        "001_PathOfPain.lss",
      ]);
      const ils = output.map((lss) => importSplitsXml(lss, "hollowknight"));
      expect(
        ils.map(({ startTriggeringAutosplit }) => startTriggeringAutosplit),
      ).toStrictEqual(["PathOfPainEntry", "PathOfPainTransition1"]);
      expect(ils.map(({ splitIds }) => splitIds)).toStrictEqual([
        ["PathOfPainTransition1"],
        ["PathOfPain"],
      ]);
    });

    test("should group subsplits into the IL of the following split", async () => {
      const config: Config = {
        ...hkConfig,
        splitIds: ["-BenchAny", "BeastsDenTrapBench", "PlayerDeath"],
      };
      const { output, outputNames } = await createILPack(
        config,
        "hollowknight",
        false,
      );

      expect(outputNames).toStrictEqual([
        "000_BeastsDenTrapBench.lss",
        "001_PlayerDeath.lss",
      ]);
      const ils = output.map((lss) => importSplitsXml(lss, "hollowknight"));
      expect(ils.map(({ splitIds }) => splitIds)).toStrictEqual([
        ["-BenchAny", "BeastsDenTrapBench"],
        ["PlayerDeath"],
      ]);
      expect(ils[1].startTriggeringAutosplit).toBe("BeastsDenTrapBench");
    });
  });

  describe("silksong", () => {
    test("should create one IL per split, starting on the previous split", async () => {
      const { output, outputNames } = await createILPack(
        silksongConfig,
        "silksong",
        false,
      );

      expect(outputNames).toStrictEqual([
        "000_BenchAny.lss",
        "001_GainedCurse.lss",
        "002_PlayerDeath.lss",
      ]);
      const ils = output.map((lss) => importSplitsXml(lss, "silksong"));
      expect(ils.map(({ splitIds }) => splitIds)).toStrictEqual([
        ["StartNewGame", "BenchAny"],
        ["BenchAny", "GainedCurse"],
        ["GainedCurse", "PlayerDeath"],
      ]);
    });
  });
});
