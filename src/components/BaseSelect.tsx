import type { ReactElement } from "react";
import type {
  CSSObjectWithLabel,
  GroupBase,
  GroupProps,
  Props,
  StylesConfig,
  Theme,
} from "react-select";
import Select from "react-select";

function createOnMenuOpen(classNamePrefix: string) {
  // https://stackoverflow.com/a/66710895
  // workaround for scrolling to selected item
  return (): void => {
    setTimeout(() => {
      const selectedEl = document.getElementsByClassName(
        `${classNamePrefix}__option--is-selected`,
      )[0];
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "center" });
      }
    }, 15);
  };
}

type GroupColor =
  | "#06080f"
  | "#091d66"
  | "#040e33"
  | "#061f78"
  | "#071752"
  | "";

// https://coolors.co/06080f-091d66-040e33-061f78-071752
function getGroupColor(section: string): GroupColor {
  switch (section) {
    case "Main":
      return "#06080f";
    case "Glitched":
      return "#091d66";
    case "Individual Level":
      return "#040e33";
    case "Mods":
      return "#061f78";
    case "Category Extensions":
      return "#071752";
    default:
      return "";
  }
}

function createCustomStyles<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  controlStyleOverrides,
}: {
  controlStyleOverrides?: CSSObjectWithLabel;
}): StylesConfig<Option, IsMulti, Group> {
  return {
    container: (provided: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...provided,
      flex: "1 1 0%",
    }),
    control: (provided: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...provided,
      backgroundColor: "#2f3136",
      border: "1px solid white",
      borderRadius: "3px",
      display: "flex",
      fontFamily: "serif",
      fontSize: "18px",
      margin: "8px 8px 8px 0",
      ...controlStyleOverrides,
    }),
    group: (
      provided: CSSObjectWithLabel,
      state: GroupProps<Option, IsMulti, Group>,
    ): CSSObjectWithLabel => ({
      ...provided,
      backgroundColor: getGroupColor(state.data.label ?? ""),
    }),
    groupHeading: (provided: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...provided,
      color: "white",
      fontFamily: "serif",
      fontSize: "18px",
      fontWeight: "bold",
    }),
    option: (provided: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...provided,
      fontFamily: "sans-serif",
    }),
  };
}

function customTheme(theme: Theme): Theme {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      danger: theme.colors.danger,
      dangerLight: theme.colors.dangerLight,
      neutral0: theme.colors.neutral80,
      neutral5: theme.colors.neutral70,
      neutral10: theme.colors.neutral60,
      neutral20: theme.colors.neutral50,
      neutral30: theme.colors.neutral40,
      neutral40: theme.colors.neutral30,
      neutral50: theme.colors.neutral20,
      neutral60: theme.colors.neutral10,
      neutral70: theme.colors.neutral5,
      neutral80: theme.colors.neutral0,
      neutral90: theme.colors.neutral0,
      primary: theme.colors.primary25,
      primary25: theme.colors.primary,
      primary50: theme.colors.primary75,
      primary75: theme.colors.primary50,
    },
    spacing: {
      ...theme.spacing,
    },
  };
}

export default function BaseSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: Props<Option, IsMulti, Group> & {
    controlStyleOverrides?: CSSObjectWithLabel;
  },
): ReactElement {
  return (
    <Select
      onMenuOpen={createOnMenuOpen(props.classNamePrefix ?? "BaseSelect")}
      styles={createCustomStyles<Option, IsMulti, Group>({
        controlStyleOverrides: props.controlStyleOverrides,
      })}
      theme={customTheme}
      {...props}
    />
  );
}
