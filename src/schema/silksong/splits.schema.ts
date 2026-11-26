import type { SplitDefinition } from "../../lib/silksong-splits";
import { parseSplitsDefinitions } from "../../lib/silksong-splits";
import type {
  SchemaOverridePropItem,
  SchemaPropertyOptions,
} from "../../types/schema.d";
import SplitConfigSchemaSource from "./splits.schema.json";

const SPLITS: Array<SplitDefinition> = [...parseSplitsDefinitions().values()];

const SPLITS_SCHEMA = SPLITS.map(
  ({ description: title, tooltip: description, id }) => {
    return {
      title,
      description,
      const: id,
    };
  },
);

const SUBSPLITS_SCHEMA = SPLITS.map(
  ({ description: title, tooltip: description, id }) => {
    return {
      title,
      description: `(subsplit) ${description}`,
      const: `-${id}`,
    };
  },
);

interface SplitIdItem {
  title: string;
  description: string;
  const: string;
}

const items = SplitConfigSchemaSource.properties.splitIds.items as {
  oneOf: Array<SplitIdItem>;
};

items.oneOf = items.oneOf.concat(SPLITS_SCHEMA).concat(SUBSPLITS_SCHEMA);

const overrideSchemaPropItem = (
  description: string,
): SchemaOverridePropItem => ({
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
const names: SchemaPropertyOptions = SplitConfigSchemaSource.properties.names;
names.properties = namesProperties;

const icons: SchemaPropertyOptions = SplitConfigSchemaSource.properties.icons;
icons.properties = iconsProperties;

export default SplitConfigSchemaSource;
