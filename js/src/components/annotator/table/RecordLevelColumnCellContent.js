import { useEffect, useState, useContext } from "react";
import { OptionList } from "../OptionList";
import { DEFAULT_ROW_HEIGHT, RECORD_LEVEL_SCHEMA_KEY } from "../../constant";
import { DoubleClickPopover } from "./DoubleClickPopover";
import _ from "lodash";
import { Tag } from "@blueprintjs/core";
import { AnnotatorContext } from "../../context/AnnotatorContext";
export const RecordLevelColumnCellContent = ({ rowIndex, labelName }) => {
    const SCHEMA_LEVEL = "labels_record";
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [attr, setAttr] = useState(null);
    const { annotatorState } = useContext(AnnotatorContext);
    const widgetMode = _.get(annotatorState, "widgetMode", "annotating");
    useEffect(() => {
        let found = false,
            attr = null;
        const datapoint = _.get(annotatorState, ["data", rowIndex], {});
        if (widgetMode === "annotating") {
            const annotations = _.get(
                datapoint,
                ["annotation_list", 0, SCHEMA_LEVEL],
                []
            );
            for (var i = 0; i < annotations.length; i++) {
                const label = annotations[i];
                if (label !== null && label.label_name === labelName) {
                    attr = label;
                    found = true;
                    setSelectedOptions(label.label_value);
                }
            }
        } else if (widgetMode === "reconciling") {
            const uuid = _.get(datapoint, "uuid", null);
            if (uuid !== null) {
                const labelValue = _.get(
                    annotatorState,
                    [
                        "reconciliation",
                        "data",
                        uuid,
                        labelName,
                        "reconciliation",
                    ],
                    null
                );
                if (labelValue !== null) {
                    attr = {
                        label_name: labelName,
                        label_value: labelValue,
                    };
                    found = true;
                    setSelectedOptions(labelValue);
                }
            }
        }
        if (!found) setSelectedOptions([]);
        setAttr(attr);
    }, [annotatorState.data, annotatorState.reconciliation.data]);
    return (
        <DoubleClickPopover
            content={
                <OptionList
                    schemaLevel={RECORD_LEVEL_SCHEMA_KEY}
                    labelName={labelName}
                    rowIndex={rowIndex}
                    attr={attr}
                />
            }
            target={
                <div
                    style={{
                        height: DEFAULT_ROW_HEIGHT + "px",
                        display: "inline-flex",
                        lineHeight: DEFAULT_ROW_HEIGHT + "px",
                        alignItems: "center",
                    }}
                >
                    {selectedOptions.length === 0
                        ? "-"
                        : selectedOptions.map((value, index) => {
                              const tagStyle = _.get(
                                  annotatorState,
                                  [
                                      "labelTagStyles",
                                      labelName,
                                      value,
                                      "minimal",
                                  ],
                                  {}
                              );
                              return (
                                  <Tag
                                      key={`record-level-column-cell-content-row-${rowIndex}-tag-${index}`}
                                      large
                                      minimal
                                      style={{ ...tagStyle }}
                                  >
                                      {value}
                                  </Tag>
                              );
                          })}
                </div>
            }
        />
    );
};
