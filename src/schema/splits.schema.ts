import SplitConfigSchemaSource from "../schema/splits.schema.json";
import Splits from "../splits.json";

const splitsSchema = Splits.map(({ title, description, id, }) => {
    return {
        title,
        description,
        const: id,
    };
});

const subsplitsSchema = Splits.map(({ title, description, id, }) => {
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

export default SplitConfigSchemaSource;
