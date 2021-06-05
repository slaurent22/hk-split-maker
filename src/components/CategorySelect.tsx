import React from "react";
import type { CategoryDefinition } from "../asset/categories/category-directory.json";
import "./CategorySelect.css";

interface Props {
    id: string;
    onChange: () => void;
    data?: Record<string, Array<CategoryDefinition>>;
    initial: string;
}

const CategorySelect: React.FC<Props> = ({
    id,
    onChange,
    data,
    initial,
}: Props) => {
    if (!data) {
        return <select id={id}></select>;
    }
    const optGroups = Object.entries(data).map(([groupName, values]) => {
        const categories = values.map(value => {
            return <option value={value.fileName} key={value.fileName}>{value.displayName}</option>;
        });
        return <optgroup label={groupName} key={groupName}>{categories}</optgroup>;
    });
    return <select id={id} defaultValue={initial} onChange={onChange} className="catsel">{optGroups}</select>;
};
export default CategorySelect;
