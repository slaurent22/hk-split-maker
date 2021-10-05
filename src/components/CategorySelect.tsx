import React from "react";
import type { StylesConfig } from "react-select";
import Select from "react-select";
import type { CategoryDefinition } from "../asset/categories/category-directory.json";

interface Props {
    id: string;
    onChange: (newValue: CategoryDefinition|null) => void;
    data?: Record<string, Array<CategoryDefinition>>;
    defaultValue: CategoryDefinition;
}

interface CategoryOption {
 value: string; label: string;
}

const customStyles: StylesConfig<CategoryOption> = {
    groupHeading: (provided) => ({
        ...provided,
        fontSize: "14px",
        fontFamily: "serif",
        fontWeight: "bold",
        fontStyle: "italic",
        color: "white",
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

// https://stackoverflow.com/a/66710895
const onMenuOpen = () => {
    setTimeout(()=>{
        const selectedEl = document.getElementsByClassName("MyDropdown__option--is-selected")[0];
        if (selectedEl) {
            selectedEl.scrollIntoView({ behavior: "smooth", block: "center", });
        }
    }, 15);
};

function defToOption({ fileName, displayName, }: CategoryDefinition): CategoryOption {
    return {
        value: fileName, label: displayName,
    };
}

function optionToDef({ value, label, }: CategoryOption): CategoryDefinition {
    return {
        fileName: value, displayName: label,
    };
}

const CategorySelect: React.FC<Props> = ({
    id,
    onChange,
    data,
}: Props) => {
    if (!data) {
        return <Select id={id}></Select>;
    }
    const optGroups = Object.entries(data).map(([groupName, groupEntries]) => {
        const options = groupEntries.map(defToOption);
        return {
            label: groupName,
            options: options,
        };
    });
    return (
        <Select<CategoryOption>
            id={id}
            options={optGroups}
            styles={customStyles}
            onChange={newValue => onChange(newValue ? optionToDef(newValue) : null)}
            onMenuOpen={onMenuOpen}
            className ={"MyDropdown"}
            classNamePrefix={"MyDropdown"}
            placeholder="Category: Select or type to search..."
            theme={theme => ({
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
            })}
        />
    );
};
export default CategorySelect;
