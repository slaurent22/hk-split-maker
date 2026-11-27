import type { SplitDefinition } from "../../lib/silksong-splits";
import { parseSplitsDefinitions } from "../../lib/silksong-splits";
import type {
  SchemaOverridePropItem,
  SchemaPropertyOptions,
} from "../../types/schema.d";
import SplitConfigSchemaSource from "./splits.schema.json";

const SPLITS: Array<SplitDefinition> = [...parseSplitsDefinitions().values()];

const SPLITS_SCHEMA = SPLITS.map(
  ({ description: title, tooltip: description, id }) => ({
    const: id,
    description,
    title,
  }),
);

const SUBSPLITS_SCHEMA = SPLITS.map(
  ({ description: title, tooltip: description, id }) => ({
    const: `-${id}`,
    description: `(subsplit) ${description}`,
    title,
  }),
);

interface SplitIdItem {
  const: string;
  description: string;
  title: string;
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
      description,
      type: "string",
    },
    {
      description,
      items: {
        type: "string",
      },
      type: "array",
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
