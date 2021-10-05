import type { ReactElement } from "react";
import React from "react";
import type { GroupBase, OptionProps } from "react-select";
import { components } from "react-select";
import type { SplitDefinition } from "../lib/splits";
import { parseSplitsDefinitions } from "../lib/splits";
import BaseSelect from "./BaseSelect";

export interface SplitOption {
    value: string; label: string;
}

interface Props {
    onChange: (newValue: SplitOption|null) => void;
}

function groupSplits(splitDefinitions: Map<string, SplitDefinition>) {
    const groupedSplits = new Map<string, Array<SplitDefinition>>();
    for (const split of splitDefinitions.values()) {
        if (!groupedSplits.has(split.group)) {
            groupedSplits.set(split.group, []);
        }
        const group = groupedSplits.get(split.group) as Array<SplitDefinition>;
        group.push(split);
    }
    return groupedSplits;
}

function getSelectOptionGroups(groupedSplits: Map<string, Array<SplitDefinition>>) {
    return [...groupedSplits].map(([groupName, splits]) => {
        return {
            label: groupName,
            options: splits.map(split => ({
                value: split.id, label: split.description,
            })),
        };
    });
}

function CustomSplitSelectOption<
  IsMulti extends boolean = false,
  Group extends GroupBase<SplitOption> = GroupBase<SplitOption>
>({ children, ...rest }: OptionProps<SplitOption, IsMulti, Group>): ReactElement {
    return (
        <components.Option {...rest}>
            {children}
            <span
                style={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    marginLeft: "5px",
                }}
            >
                {rest.data.value}
            </span>
        </components.Option>
    );
}


const SplitSelect: React.FC<Props> = ({ onChange, }: Props) => {
    const options = getSelectOptionGroups(groupSplits(parseSplitsDefinitions()));
    return (
        <BaseSelect<SplitOption>
            id={"id"}
            options={options}
            className ={"SplitSelect"}
            classNamePrefix={"SplitSelect"}
            placeholder="Add autosplit: Select or type to search..."
            onChange={newValue => onChange(newValue ?? null)}
            components={{ Option: CustomSplitSelectOption, }}
        />
    );
};
export default SplitSelect;
