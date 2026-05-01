import { importSplitsXml } from "../lib/lss";
import ss_vanilla_lss from "./fixtures/ss_vanilla.lss";
import ss_no_category_name_lss from "./fixtures/ss_no_category_name.lss";
import ss_no_autosplitter_lss from "./fixtures/ss_no_autosplitter.lss";
import hk_vanilla_lss from "./fixtures/hk_vanilla.lss";
import hk_custom_offset_lss from "./fixtures/hk_custom_offset.lss";
import ss_custom_offset_lss from "./fixtures/ss_custom_offset.lss";
import ss_variables_lss from "./fixtures/ss_variables.lss";
import ss_subsplits_lss from "./fixtures/ss_subsplits.lss";
import ss_subsplit_ending_split_lss from "./fixtures/ss_subsplit_ending_split.lss";
import ss_repeating_splitid_lss from "./fixtures/ss_repeating_splitid.lss";
import ss_ending_split_manual_lss from "./fixtures/ss_ending_split_manual.lss";

describe("lss", () => {
  test("should import silksong vanilla splits", () => {
    const config = importSplitsXml(ss_vanilla_lss, "silksong");
    expect(config).toBeDefined();
    expect(config.categoryName).toBe("Category Name");
    expect(config.gameName).toBe("Hollow Knight: Silksong");
  });
  test("should import hk vanilla splits", () => {
    const config = importSplitsXml(hk_vanilla_lss, "hollowknight");
    expect(config).toBeDefined();
    expect(config.categoryName).toBe("Category Name");
  });
  test("should import silksong no category name splits", () => {
    const config = importSplitsXml(ss_no_category_name_lss, "silksong");
    expect(config).toBeDefined();
    expect(config.categoryName).toBe("Any%");
  });
  test("should throw for silksong no autosplitter splits", () => {
    expect(() => importSplitsXml(ss_no_autosplitter_lss, "silksong")).toThrow(
      "Failed to import splits: missing AutoSplitterSettings"
    );
  });
  test("should import hk custom offset splits", () => {
    const config = importSplitsXml(hk_custom_offset_lss, "hollowknight");
    expect(config).toBeDefined();
    expect(config.offset).toBe("00:00:01");
  });
  test("should import silksong custom offset splits", () => {
    const config = importSplitsXml(ss_custom_offset_lss, "silksong");
    expect(config).toBeDefined();
    expect(config.offset).toBe("00:00:01");
  });
  test("should import silksong variables", () => {
    const config = importSplitsXml(ss_variables_lss, "silksong");
    expect(config).toBeDefined();
    expect(config.variables).toBeDefined();
    expect(config.variables?.["key"]).toBe("value");
  });
  test("should import silksong subsplits", () => {
    const config = importSplitsXml(ss_subsplits_lss, "silksong");
    expect(config).toBeDefined();
  });

  test("TODO: should import silksong ending split subsplit", () => {
    const config = importSplitsXml(ss_subsplit_ending_split_lss, "silksong");
    expect(config).toBeDefined();
  });

  test("TODO: should import silksong with repeating split IDs", () => {
    const config = importSplitsXml(ss_repeating_splitid_lss, "silksong");
    expect(config).toBeDefined();
  });

  // currently we get an unexpected error
  test.skip("TODO: should import silksong with extra split", () => {
    const config = importSplitsXml(ss_ending_split_manual_lss, "silksong");
    expect(config).toBeDefined();
    expect(config.endingSplit?.name).toBe("Ending");
  });
});
