import { useContext } from "react";
import { AnnotatorContext } from "../../context/AnnotatorContext";
import { Tag } from "@blueprintjs/core";
import _ from "lodash";
export const PersistentLabelSelection = ({
    setFocusLabel,
    focusLabel,
    labelOptions,
    labelName,
}) => {
    const { annotatorState } = useContext(AnnotatorContext);
    return labelOptions.map((option, index) => {
        const isSelected =
            focusLabel !== null && focusLabel.value === option.value;
        const tagStyle = _.get(
            annotatorState,
            ["labelTagStyles", labelName, option.value, "regular"],
            {}
        );
        return (
            <Tag
                key={`span-level-persistent-labeling-selection-tag-${index}`}
                minimal={!isSelected}
                interactive
                style={{
                    marginRight: _.isEqual(index, labelOptions.length - 1)
                        ? 0
                        : 10,
                    display: "inline-table",
                    ...(isSelected ? tagStyle : {}),
                    borderLeft: `10px solid ${tagStyle.backgroundColor}`,
                }}
                className="user-select-none"
                onClick={() => setFocusLabel(option)}
            >
                {option.text} ({option.value})
            </Tag>
        );
    });
};
