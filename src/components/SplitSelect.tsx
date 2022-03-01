import React, { ReactElement } from "react";
import { GroupBase, OptionProps, components, PropsValue } from "react-select";
import Tooltip from "@atlaskit/tooltip";
import { getSelectOptionGroups } from "../lib/hollowknight-splits";
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
  const options = getSelectOptionGroups();
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
