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
      id="id"
      options={options}
      placeholder="Add autosplit: Select or type to search..."
      onChange={baseSelectOnChange}
      components={{ Option: SplitSelectOption }}
      value={value}
      controlStyleOverrides={controlStyleOverrides}
    />
  );
}
export default SplitSelect;
