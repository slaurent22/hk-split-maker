import type { ReactElement } from "react";
import React from "react";
import type { GroupBase, OptionProps, SingleValueProps } from "react-select";
import { components } from "react-select";
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
    data?: {
        routeNotesURL?: string;
    };
}

function defToOption({ fileName, displayName, data, }: CategoryDefinition): CategoryOption {
    return {
        value: fileName, label: displayName, data,
    };
}

function optionToDef({ value, label, data, }: CategoryOption): CategoryDefinition {
    return {
        fileName: value, displayName: label, data,
    };
}
interface RouteNotesLinkProps {
    url: string;
    isSelected: boolean;
}
function RouteNotesLink({ url, isSelected, }: RouteNotesLinkProps): ReactElement {
    const color = isSelected ? "hsl(0, 0%, 20%)" : "hsl(0, 0%, 80%)";
    return (
        <a href={url} target="_blank" rel="noopener noreferrer"
            style={{
                float: "right", color,
            }}
        >
            Route Notes
        </a>
    );
}

function CategorySelectOption<
  IsMulti extends boolean = false,
  Group extends GroupBase<CategoryOption> = GroupBase<CategoryOption>
>({ children, ...rest }: OptionProps<CategoryOption, IsMulti, Group>): ReactElement {
    const { data, isSelected, } = rest;
    return (
        <components.Option {...rest}>
            {children}
            {data.data?.routeNotesURL &&
                <RouteNotesLink
                    url={data.data.routeNotesURL}
                    isSelected={isSelected}
                />
            }
        </components.Option>
    );
}

function CategorySelectSingleValue<
    IsMulti extends boolean = false,
    Group extends GroupBase<CategoryOption> = GroupBase<CategoryOption>
>({ children, ...rest }: SingleValueProps<CategoryOption, IsMulti, Group>): ReactElement {
    return (
        <components.SingleValue {...rest}>
            {children}
            {rest.data.data?.routeNotesURL &&
                <em
                    style={{ float: "right", }}
                >
                    Notes available
                </em>
            }
        </components.SingleValue>
    );
}


const CategorySelect: React.FC<Props> = ({
    id,
    onChange,
    data,
    defaultValue,
}: Props) => {
    if (!data) {
        return <BaseSelect id={id}></BaseSelect>;
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
            placeholder="Pre-made Category: Select or type to search..."
            defaultValue={defaultValue ? defToOption(defaultValue) : undefined}
            components={{
                Option: CategorySelectOption,
                SingleValue: CategorySelectSingleValue,
            }}
        />
    );
};
export default CategorySelect;
