import type { ReactElement, ReactNode } from "react";
import { useCallback, useMemo } from "react";
import type {
  CSSObjectWithLabel,
  GroupBase,
  OptionProps,
  PropsValue,
  SingleValue,
} from "react-select";
import { components } from "react-select";
import { useSplitsFunctions } from "../hooks";
import BaseSelect from "./BaseSelect";
import Tooltip from "./Tooltip";

export interface SplitOption {
  label: string;
  tooltip: string;
  value: string;
}

interface Props {
  controlStyleOverrides?: CSSObjectWithLabel;
  onChange: (newValue: SplitOption | null) => void;
  value?: PropsValue<SplitOption>;
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
            float: "right",
            fontFamily: "monospace",
            fontSize: "14px",
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
  const baseSelectOnChange = useCallback(
    (newValue: SingleValue<SplitOption>): void => onChange(newValue ?? null),
    [onChange],
  );
  return (
    <BaseSelect<SplitOption>
      components={{ Option: SplitSelectOption }}
      controlStyleOverrides={controlStyleOverrides}
      id="id"
      onChange={baseSelectOnChange}
      options={options}
      placeholder="Add autosplit: Select or type to search..."
      value={value}
    />
  );
}
export default SplitSelect;
