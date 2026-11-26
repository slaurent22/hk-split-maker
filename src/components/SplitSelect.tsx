import { type ReactElement, type ReactNode, useMemo } from "react";
import {
  type CSSObjectWithLabel,
  components,
  type GroupBase,
  type OptionProps,
  type PropsValue,
} from "react-select";
import { useSplitsFunctions } from "../hooks";
import BaseSelect from "./BaseSelect";
import Tooltip from "./Tooltip";

export interface SplitOption {
  value: string;
  label: string;
  tooltip: string;
}

interface Props {
  value?: PropsValue<SplitOption>;
  onChange: (newValue: SplitOption | null) => void;
  controlStyleOverrides?: CSSObjectWithLabel;
}

function SplitSelectOption<
  IsMulti extends boolean = false,
  Group extends GroupBase<SplitOption> = GroupBase<SplitOption>,
>({
  children,
  ...rest
}: OptionProps<SplitOption, IsMulti, Group>): ReactElement {
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

function SplitSelect({
  onChange,
  value,
  controlStyleOverrides,
}: Props): ReactNode {
  const { getSelectOptionGroups } = useSplitsFunctions();
  const options = useMemo(
    () => getSelectOptionGroups(),
    [getSelectOptionGroups],
  );
  return (
    <BaseSelect<SplitOption>
      id={"id"}
      options={options}
      className={"SplitSelect"}
      classNamePrefix={"SplitSelect"}
      placeholder="Add autosplit: Select or type to search..."
      onChange={(newValue): void => onChange(newValue ?? null)}
      components={{ Option: SplitSelectOption }}
      value={value}
      controlStyleOverrides={controlStyleOverrides}
    />
  );
}
export default SplitSelect;
