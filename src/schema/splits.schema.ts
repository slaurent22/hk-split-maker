import SplitConfigSchemaSource from "../schema/splits.schema.json";
import { parseSplitsDefinitions } from "../lib/splits";

const Splits = [...parseSplitsDefinitions().values()];

const splitsSchema = Splits.map(({ description: title, tooltip: description, id, }) => {
    return {
        title,
        description,
        const: id,
    };
});

const subsplitsSchema = Splits.map(({ description: title, tooltip: description, id, }) => {
    return {
        title,
        description: `(subsplit) ${description}`,
        const: `-${id}`,
    };
});

const manualSplit = {
    "title": "Manual Split",
    "description": "A mid-run manual split",
    "type": "string",
    "pattern": "^%.+",
};

type SplitIdItem = typeof manualSplit | {
    title: string;
    description: string;
    const: string;
};

const items = SplitConfigSchemaSource.properties.splitIds.items as {
    oneOf: Array<SplitIdItem>;
};

items.oneOf = items.oneOf.concat(splitsSchema).concat(subsplitsSchema).concat(manualSplit);

interface NamePropItem {
    oneOf: [
        {
            type: "string";
            description: string;
        },
        {
            type: "array";
            description: string;
            items: {
                type: "string";
            };
        }
    ];
}

const namesProperties: Record<string, NamePropItem> = {};
for (const split of splitsSchema.concat(subsplitsSchema)) {
    namesProperties[split.const] = {
        oneOf: [
            {
                type: "string",
                description: split.description,
            },
            {
                type: "array",
                description: split.description,
                items: {
                    type: "string",
                },
            }
        ],
    }
    ;
}
const names = SplitConfigSchemaSource.properties.names;
names.properties = namesProperties;

export default SplitConfigSchemaSource;
