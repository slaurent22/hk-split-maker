/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { ReactElement } from "react";
import React from "react";
import type { GroupBase, Props, StylesConfig, Theme } from "react-select";
import Select from "react-select";

function createOnMenuOpen(classNamePrefix: string) {
    // https://stackoverflow.com/a/66710895
    // workaround for scrolling to selected item
    return () => {
        setTimeout(() => {
            const selectedEl = document.getElementsByClassName(`${classNamePrefix}__option--is-selected`)[0];
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: "center", });
            }
        }, 15);
    };
}

// https://coolors.co/06080f-091d66-040e33-061f78-071752
function getGroupColor(section: string): string {
    switch (section) {
        case "Main":                return "#06080f";
        case "Glitched":            return "#091d66";
        case "Individual Level":    return "#040e33";
        case "Mods":                return "#061f78";
        case "Category Extensions": return "#071752";
        default:                    return "";
    }
}

function createCustomStyles<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>
>(): StylesConfig<Option, IsMulti, Group> {
    return {
        groupHeading: (provided) => ({
            ...provided,
            fontSize: "18px",
            fontFamily: "serif",
            fontWeight: "bold",
            color: "white",
        }),
        group: (provided, state) => ({
            ...provided,
            backgroundColor: getGroupColor(state.data.label ?? ""),
        }),
        option: (provided) => ({
            ...provided,
            fontFamily: "sans-serif",
        }),
        control: (provided) => {
            return {
                ...provided,
                display: "flex",
                border: "1px solid white",
                borderRadius: "3px",
                fontSize: "18px",
                fontFamily: "serif",
                margin: "8px 8px 8px 0",
                backgroundColor: "#2f3136",
            };
        },
        container: (provided) => {
            return {
                ...provided,
                flex: "1 1 0%",
            };
        },
    };
}

function customTheme(theme: Theme): Theme {
    return {
        ...theme,
        spacing: {
            ...theme.spacing,
        },
        colors: {
            ...theme.colors,
            primary: theme.colors.primary25,
            primary75: theme.colors.primary50,
            primary50: theme.colors.primary75,
            primary25: theme.colors.primary,
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
        },
    };
}


export default function BaseSelect<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>
>(props: Props<Option, IsMulti, Group>): ReactElement {
    return (
        <Select
            styles={createCustomStyles<Option, IsMulti, Group>()}
            onMenuOpen={createOnMenuOpen(props.classNamePrefix ?? "BaseSelect")}
            theme={customTheme}
            {...props}
        />
    );
}
