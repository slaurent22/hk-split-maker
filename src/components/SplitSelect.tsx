import React, { ReactElement } from "react";
import { GroupBase, OptionProps, components, PropsValue } from "react-select";
import Tooltip from "@atlaskit/tooltip";
import { SplitDefinition, parseSplitsDefinitions } from "../lib/hollowknight-splits";
import BaseSelect from "./BaseSelect";

export interface SplitOption {
  value: string;
  label: string;
  tooltip: string;
}

interface Props {
  value?: PropsValue<SplitOption>;
  onChange: (newValue: SplitOption | null) => void;
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
        value: split.id,
        label: split.description,
        tooltip: split.tooltip,
      })),
    };
  });
}

function SplitSelectOption<
  IsMulti extends boolean = false,
  Group extends GroupBase<SplitOption> = GroupBase<SplitOption>
>({ children, ...rest }: OptionProps<SplitOption, IsMulti, Group>): ReactElement {
  return (
    <Tooltip content={rest.data.tooltip}>
      <components.Option {...rest}>
        {children}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "14px",
            float: "right",
          }}
        >
          {rest.data.value}
        </span>
      </components.Option>
    </Tooltip>
  );
}


const SplitSelect: React.FC<Props> = ({ onChange, value, }: Props) => {
  const options = getSelectOptionGroups(groupSplits(parseSplitsDefinitions()));
  return (
    <BaseSelect<SplitOption>
      id={"id"}
      options={options}
      className ={"SplitSelect"}
      classNamePrefix={"SplitSelect"}
      placeholder="Add autosplit: Select or type to search..."
      onChange={newValue => onChange(newValue ?? null)}
      components={{ Option: SplitSelectOption, }}
      value={value}
    />
  );
};
export default SplitSelect;
