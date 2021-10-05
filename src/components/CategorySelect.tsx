import React from "react";
import Select from "react-select";
import type { CategoryDefinition } from "../asset/categories/category-directory.json";
import BaseSelect from "./BaseSelect";

interface Props {
    id: string;
    onChange: (newValue: CategoryDefinition|null) => void;
    data?: Record<string, Array<CategoryDefinition>>;
    defaultValue: CategoryDefinition | null;
}

interface CategoryOption {
    value: string; label: string;
}

function defToOption({ fileName, displayName, }: CategoryDefinition): CategoryOption {
    return {
        value: fileName, label: displayName,
    };
}

function optionToDef({ value, label, }: CategoryOption): CategoryDefinition {
    return {
        fileName: value, displayName: label,
    };
}

const CategorySelect: React.FC<Props> = ({
    id,
    onChange,
    data,
    defaultValue,
}: Props) => {
    if (!data) {
        return <Select id={id}></Select>;
    }
    const optGroups = Object.entries(data).map(([groupName, groupEntries]) => {
        const options = groupEntries.map(defToOption);
        return {
            label: groupName,
            options: options,
        };
    });
    return (
        <BaseSelect<CategoryOption>
            id={id}
            options={optGroups}
            onChange={newValue => onChange(newValue ? optionToDef(newValue) : null)}
            className={"CategorySelect"}
            classNamePrefix={"CategorySelect"}
            placeholder="Category: Select or type to search..."
            defaultValue={defaultValue ? defToOption(defaultValue) : undefined}
        />
    );
};
export default CategorySelect;
