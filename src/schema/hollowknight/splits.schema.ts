import { parseSplitsDefinitions } from "../../lib/hollowknight-splits";
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

interface SplitIdItem {
  title: string;
  description: string;
  const: string;
}

const startTriggers = SplitConfigSchemaSource.properties
  .startTriggeringAutosplit as {
  enum: Array<string>;
};

startTriggers.enum = startTriggers.enum.concat(SPLITS.map(({ id }) => id));

const items = SplitConfigSchemaSource.properties.splitIds.items as {
  oneOf: Array<SplitIdItem>;
};

items.oneOf = items.oneOf.concat(SPLITS_SCHEMA).concat(SUBSPLITS_SCHEMA);

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
