import { importSplitsXml } from "../src/lib/lss";
import hk_custom_offset_lss from "./fixtures/hk_custom_offset.lss?raw";
import hk_path_of_pain_lss from "./fixtures/hk_path_of_pain.lss?raw";
import hk_pause_on_main_menu_false_lss from "./fixtures/hk_pause_on_main_menu_false.lss?raw";
import hk_vanilla_lss from "./fixtures/hk_vanilla.lss?raw";
import ss_custom_name_lss from "./fixtures/ss_custom_name.lss?raw";
import ss_custom_offset_lss from "./fixtures/ss_custom_offset.lss?raw";
import ss_no_autosplitter_lss from "./fixtures/ss_no_autosplitter.lss?raw";
import ss_no_category_name_lss from "./fixtures/ss_no_category_name.lss?raw";
import ss_pause_on_file_select_false from "./fixtures/ss_pause_on_file_select_false.lss?raw";
import ss_repeating_splitid_lss from "./fixtures/ss_repeating_splitid.lss?raw";
import ss_subsplits_lss from "./fixtures/ss_subsplits.lss?raw";
import ss_vanilla_lss from "./fixtures/ss_vanilla.lss?raw";
import ss_variables_lss from "./fixtures/ss_variables.lss?raw";

describe("importSplitsXml", () => {
  describe("hollowknight", () => {
    test("1. should import hk vanilla splits", () => {
      const config = importSplitsXml(hk_vanilla_lss, "hollowknight");
      expect(config.categoryName).toBe("Category Name");
      expect(config.gameName).toBe("Hollow Knight");
      expect(config.splitIds).toStrictEqual(["BenchAny", "PlayerDeath"]);
      expect(config.pauseOnMainMenu).toBe(true);
      expect(config.pauseOnFileSelect).toBe(undefined);
    });

    test("2. should import hk path of pain splits", () => {
      const config = importSplitsXml(hk_path_of_pain_lss, "hollowknight");
      expect(config.categoryName).toBe("Path of Pain");
      expect(config.endTriggeringAutosplit).toBe(true);
      expect(config.endingSplit).toBe(undefined);
      expect(config.gameName).toBe("Hollow Knight");
      expect(config.icons).toBe(undefined);
      expect(config.names).toStrictEqual({
        PathOfPain: "Room 4",
        PathOfPainTransition1: "Room 1",
        PathOfPainTransition2: "Room 2",
        PathOfPainTransition3: "Room 3",
      });
      expect(config.offset).toBe(undefined);
      expect(config.ordered).toBe(undefined);
      expect(config.splitIds.length).toBe(4);
      expect(config.startTriggeringAutosplit).toBe("PathOfPainEntry");
      expect(config.variables).toBe(undefined);
    });

    test("3. should import hk custom offset splits", () => {
      const config = importSplitsXml(hk_custom_offset_lss, "hollowknight");
      expect(config.offset).toBe("00:00:21.76");
    });

    test("4. should import hk splits with PauseOnMainMenu False", () => {
      const config = importSplitsXml(
        hk_pause_on_main_menu_false_lss,
        "hollowknight",
      );
      expect(config.pauseOnMainMenu).toBe(false);
    });
  });
  describe("silksong", () => {
    test("1. should import silksong vanilla splits", () => {
      const config = importSplitsXml(ss_vanilla_lss, "silksong");
      expect(config.categoryName).toBe("Category Name");
      expect(config.gameName).toBe("Hollow Knight: Silksong");
      expect(config.pauseOnFileSelect).toBe(true);
      expect(config.pauseOnMainMenu).toBe(undefined);
    });
    test("2. should import silksong no category name splits", () => {
      const config = importSplitsXml(ss_no_category_name_lss, "silksong");
      expect(config.categoryName).toBe("Any%");
    });
    test("3. should throw for silksong no autosplitter splits", () => {
      expect(() => importSplitsXml(ss_no_autosplitter_lss, "silksong")).toThrow(
        "Failed to import splits: missing AutoSplitterSettings",
      );
    });
    test("4. should import silksong custom offset splits", () => {
      const config = importSplitsXml(ss_custom_offset_lss, "silksong");
      expect(config.offset).toBe("00:00:21.76");
    });
    test("5. should import silksong variables", () => {
      const config = importSplitsXml(ss_variables_lss, "silksong");
      expect(config.variables).toBeDefined();
      expect(config.variables?.["key"]).toBe("value");
    });
    test("6. should import silksong subsplits", () => {
      const config = importSplitsXml(ss_subsplits_lss, "silksong");
      expect(config.splitIds).toStrictEqual([
        "StartNewGame",
        "BenchAny",
        "-Groal",
        "PlayerDeath",
      ]);
    });
    test("7. should import silksong with repeating split IDs", () => {
      const config = importSplitsXml(ss_repeating_splitid_lss, "silksong");
      expect(config.splitIds).toStrictEqual([
        "StartNewGame",
        "BenchAny",
        "-Groal",
        "BenchAny",
        "PlayerDeath",
      ]);
      expect(config.names).toStrictEqual({
        BenchAny: ["First Bench", "Second Bench"],
      });
    });
    test("8. should import silksong with custom names", () => {
      const config = importSplitsXml(ss_custom_name_lss, "silksong");
      expect(config.splitIds).toStrictEqual([
        "StartNewGame",
        "EndingSplit",
        "PlayerDeath",
        "EndingSplit",
      ]);
      expect(config.names).toStrictEqual({
        EndingSplit: ["Grand Mother Silk", "Lost Lace"],
      });
    });
    test("9. should import silksong splits with pause_on_file_select False", () => {
      const config = importSplitsXml(ss_pause_on_file_select_false, "silksong");
      expect(config.pauseOnFileSelect).toBe(false);
    });
  });
});
