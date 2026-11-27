import { describe, expect, test } from "vitest";
import type { Config } from "../src/lib/lss";
import { createSplitsXml } from "../src/lib/lss";

const silksongConfig: Config = {
  categoryName: "Category Name",
  gameName: "Hollow Knight: Silksong",
  splitIds: ["StartNewGame", "BenchAny", "GainedCurse", "PlayerDeath"],
};

const hkConfig: Config = {
  categoryName: "Category Name",
  endTriggeringAutosplit: false,
  gameName: "Hollow Knight",
  splitIds: ["BenchAny", "BeastsDenTrapBench", "PlayerDeath", "PathOfPain"],
};

describe("createSplitsXml", () => {
  describe("silksong", () => {
    test("should create splits xml for silksong", async () => {
      const splitsXml = await createSplitsXml(
        silksongConfig,
        "silksong",
        false,
      );
      expect(splitsXml).toBeDefined();
      expect(splitsXml).toContain(
        "<GameName>Hollow Knight: Silksong</GameName>",
      );
      expect(splitsXml).toContain("<CategoryName>Category Name</CategoryName>");
      expect(splitsXml).toContain(
        '<Setting type="string" value="StartNewGame">',
      );
      expect(splitsXml).toContain('<Setting type="string" value="BenchAny">');
      expect(splitsXml).toContain(
        '<Setting type="string" value="GainedCurse">',
      );
      expect(splitsXml).toContain(
        '<Setting type="string" value="PlayerDeath">',
      );
    });
  });
  describe("hollowknight", () => {
    test("should create splits xml for hollowknight", async () => {
      const splitsXml = await createSplitsXml(hkConfig, "hollowknight", false);
      expect(splitsXml).toBeDefined();
      expect(splitsXml).toContain("<GameName>Hollow Knight</GameName>");
      expect(splitsXml).toContain("<CategoryName>Category Name</CategoryName>");
      expect(splitsXml).toContain("<Split>BenchAny</Split>");
      expect(splitsXml).toContain("<Split>BeastsDenTrapBench</Split>");
      expect(splitsXml).toContain("<Split>PlayerDeath</Split>");
      expect(splitsXml).toContain("<Split>PathOfPain</Split>");
    });
  });
});
