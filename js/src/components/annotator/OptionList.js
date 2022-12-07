import { useContext, useEffect, useState } from "react";
import { Intent, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import _ from "lodash";
import { AnnotatorContext } from "../context/AnnotatorContext";
import {
    DEFAULT_ANNOTATOR,
    LABEL_SCHEMA_OKP,
    RECORD_LEVEL_SCHEMA_KEY,
    SPAN_LEVEL_CHAR_SCHEMA_KEY,
} from "../constant";
export const OptionList = ({ rowIndex, labelName, schemaLevel, attr }) => {
    const { annotatorState, annotatorAction } = useContext(AnnotatorContext);
    const [labelOptions, setLabelOptions] = useState([]);
    const widgetMode = _.get(annotatorState, "widgetMode", "annotating");
    useEffect(() => {
        let labelOptions = [];
        if (!_.isUndefined(labelName)) {
            labelOptions = _.get(
                annotatorState,
                ["labelNameOptions", labelName],
                []
            );
        } else if (!_.isUndefined(schemaLevel)) {
            _.get(annotatorState, LABEL_SCHEMA_OKP, []).forEach((schema) => {
                if (schema.level === schemaLevel) {
                    labelOptions = schema.options;
                }
            });
        }
        setLabelOptions(labelOptions);
    }, []);
    const existingValues = _.get(attr, "label_value", []);
    const handleLabelValueChange = (option, operation = "update") => {
        if (widgetMode === "annotating") {
            let found = false;
            let newData = _.cloneDeep(_.get(annotatorState, "data", []));
            var ipy_payload = {};
            newData = newData.map((datapoint, index) => {
                if (index !== rowIndex) return datapoint;
                let labelSpan = _.get(
                    datapoint,
                    ["annotation_list", 0, `labels_${schemaLevel}`],
                    []
                ).map((label) => {
                    if (operation === "delete") return label;
                    if (
                        schemaLevel === SPAN_LEVEL_CHAR_SCHEMA_KEY &&
                        label.start_idx === attr.start_idx &&
                        label.end_idx === attr.end_idx
                    ) {
                        found = true;
                        return _.set(attr, "label_value", [option.value]);
                    } else if (
                        schemaLevel === RECORD_LEVEL_SCHEMA_KEY &&
                        label.label_name === labelName
                    ) {
                        found = true;
                        return _.set(attr, "label_value", [option.value]);
                    }
                    return label;
                });
                if (!found && operation !== "delete") {
                    if (!_.isNil(labelName)) {
                        labelSpan.push({
                            ...attr,
                            label_name: labelName,
                            label_value: [option.value],
                        });
                    } else {
                        const labelSchemas = _.get(
                            annotatorState,
                            LABEL_SCHEMA_OKP,
                            []
                        );
                        for (var i = 0; i < labelSchemas.length; i++) {
                            const schema = labelSchemas[i];
                            if (schema.level === schemaLevel) {
                                labelName = schema.name;
                            }
                        }
                    }
                }
                if (operation === "delete") {
                    labelSpan = labelSpan.filter((label) => {
                        if (
                            schemaLevel === SPAN_LEVEL_CHAR_SCHEMA_KEY &&
                            label.start_idx === attr.start_idx &&
                            label.end_idx === attr.end_idx
                        )
                            return false;
                        else if (
                            schemaLevel === RECORD_LEVEL_SCHEMA_KEY &&
                            label.label_name === labelName
                        )
                            return false;
                        return true;
                    });
                }
                _.set(
                    datapoint,
                    ["annotation_list", 0, "annotator"],
                    _.get(
                        annotatorState,
                        "config.annotator.user_id",
                        DEFAULT_ANNOTATOR.user_id
                    )
                );
                annotatorAction.setRecentlyUpdatedStatus({
                    state: "updated",
                    uuids: [datapoint.uuid],
                });
                _.set(ipy_payload, "uuid", datapoint.uuid);
                _.set(
                    datapoint,
                    ["annotation_list", 0, `labels_${schemaLevel}`],
                    labelSpan
                );
                _.set(
                    ipy_payload,
                    "labels",
                    _.get(datapoint, ["annotation_list", 0])
                );
                return datapoint;
            });
            annotatorAction.setIpySubsetAnnotations(ipy_payload);
            annotatorAction.setData(newData);
        } else if (widgetMode === "reconciling") {
            var newReconciliationState = _.cloneDeep(
                annotatorState.reconciliation.data
            );
            const uuid = _.get(
                annotatorState,
                ["data", rowIndex, "uuid"],
                null
            );
            if (uuid === null) return;
            if (operation === "delete") {
                _.set(
                    newReconciliationState,
                    [uuid, labelName, "reconciliation"],
                    null
                );
            } else {
                _.set(
                    newReconciliationState,
                    [uuid, labelName, "reconciliation"],
                    [option.value]
                );
            }
            annotatorAction.setStateByKey({
                key: "reconciliation",
                value: {
                    ...annotatorState.reconciliation,
                    data: newReconciliationState,
                },
            });
            annotatorAction.setRecentlyUpdatedStatus({
                state: "updated",
                uuids: [uuid],
            });
        }
    };
    const displayLabels = labelOptions.filter(
        (option) => !existingValues.includes(option.value)
    );
    const isTagging = _.get(annotatorState, "tagSchemaNames", new Set()).has(
        labelName
    );
    return (
        <div onWheelCapture={(event) => event.stopPropagation()}>
            <Menu>
                <MenuDivider title={`${isTagging ? "Tag" : "Label"} as`} />
                {displayLabels.length === 0 ? (
                    <MenuItem
                        disabled
                        text={`No ${isTagging ? "tag" : "label"} option`}
                    />
                ) : null}
                {displayLabels.map((option, index) => {
                    return (
                        <MenuItem
                            key={`option-list-label-${labelName}-menuitem-${index}`}
                            text={option.text}
                            labelElement={
                                <span style={{ fontWeight: "bolder" }}>
                                    {option.value}
                                </span>
                            }
                            onClick={() => handleLabelValueChange(option)}
                        />
                    );
                })}
                {existingValues.length === 0 ? null : (
                    <>
                        <MenuDivider />
                        <MenuItem
                            disabled={existingValues.length === 0}
                            text={`Remove ${isTagging ? "tags" : "labels"}`}
                            intent={Intent.DANGER}
                            onClick={() => handleLabelValueChange({}, "delete")}
                        />
                    </>
                )}
            </Menu>
        </div>
    );
};
