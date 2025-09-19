import { parseSplitsDefinitions } from "../../lib/silksong-splits";
import SplitConfigSchemaSource from "./splits.schema.json";

const SPLITS = [...parseSplitsDefinitions().values()];

const SPLITS_SCHEMA = SPLITS.map(
  ({ description: title, tooltip: description, id }) => {
    return {
      title,
      description,
      const: id,
    };
  }
);

const SUBSPLITS_SCHEMA = SPLITS.map(
  ({ description: title, tooltip: description, id }) => {
    return {
      title,
      description: `(subsplit) ${description}`,
      const: `-${id}`,
    };
  }
);

const MANUAL_SPLIT_SCHEMA = {
  title: "Manual Split",
  description: "A mid-run manual split",
  type: "string",
  pattern: "^%.+",
};

type SplitIdItem =
  | typeof MANUAL_SPLIT_SCHEMA
  | {
      title: string;
      description: string;
      const: string;
    };

const items = SplitConfigSchemaSource.properties.splitIds.items as {
  oneOf: Array<SplitIdItem>;
};

items.oneOf = items.oneOf
  .concat(SPLITS_SCHEMA)
  .concat(SUBSPLITS_SCHEMA)
  .concat(MANUAL_SPLIT_SCHEMA);

const overrideSchemaPropItem = (description: string) => ({
  oneOf: [
    {
      type: "string",
      description,
    },
    {
      type: "array",
      description,
      items: {
        type: "string",
      },
    },
  ],
});

const namesProperties: Record<string, unknown> = {};
const iconsProperties: Record<string, unknown> = {};
for (const split of SPLITS_SCHEMA) {
  namesProperties[split.const] = overrideSchemaPropItem(split.description);
  iconsProperties[split.const] = overrideSchemaPropItem(split.description);
}
const names = SplitConfigSchemaSource.properties.names;
names.properties = namesProperties;

const icons = SplitConfigSchemaSource.properties.icons;
icons.properties = iconsProperties;

export default SplitConfigSchemaSource;
