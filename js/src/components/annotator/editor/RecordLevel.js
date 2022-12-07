import {
    FormGroup,
    RadioGroup,
    Radio,
    Divider,
    H4,
    Button,
} from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { faEraser } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useState, useEffect } from "react";
import {
    DEFAULT_ANNOTATOR,
    LABEL_SCHEMA_OKP,
    RECORD_LEVEL_LABEL_OKP,
    RECORD_LEVEL_SCHEMA_KEY,
} from "../../constant";
import { AnnotatorContext } from "../../context/AnnotatorContext";
import { faIcon } from "../../icon";
export const RecordLevel = ({ rowIndex }) => {
    const { annotatorState, annotatorAction } = useContext(AnnotatorContext);
    const [labelNameValue, setLabelNameValue] = useState({});
    useEffect(() => {
        let newLabelNameValue = {};
        _.get(
            annotatorState,
            ["data", rowIndex, ...RECORD_LEVEL_LABEL_OKP],
            []
        ).forEach(
            (record) =>
                (newLabelNameValue[record.label_name] = record.label_value[0])
        );
        setLabelNameValue(newLabelNameValue);
    }, [rowIndex, annotatorState.data]);
    const handleRadioChange = (event, labelName) => {
        let found = false;
        let newData = [..._.get(annotatorState, "data", [])];
        var ipy_payload = {};
        newData = newData.map((datapoint, index) => {
            if (index !== rowIndex) return datapoint;
            let labelRecord = _.get(datapoint, [...RECORD_LEVEL_LABEL_OKP], [])
                .filter((record) => {
                    if (event === null && record.label_name === labelName)
                        return false;
                    return true;
                })
                .map((record) => {
                    if (record.label_name !== labelName) return record;
                    found = true;
                    record.label_value = [event.target.value];
                    return record;
                });
            if (!found && event !== null) {
                labelRecord.push({
                    label_name: labelName,
                    label_value: [event.target.value],
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
            _.set(datapoint, [...RECORD_LEVEL_LABEL_OKP], labelRecord);
            _.set(
                ipy_payload,
                "labels",
                _.get(datapoint, ["annotation_list", 0])
            );
            return datapoint;
        });
        annotatorAction.setIpySubsetAnnotations(ipy_payload);
        annotatorAction.setData(newData);
    };
    const labelSchemas = _.get(annotatorState, LABEL_SCHEMA_OKP, []);
    return (
        <div>
            {labelSchemas.map((schema, index) => {
                const isClearButtonShowing = labelNameValue.hasOwnProperty(
                    schema.name
                );
                if (
                    schema.tagging === true ||
                    schema.level !== RECORD_LEVEL_SCHEMA_KEY
                )
                    return null;
                return (
                    <div
                        key={`record-level-form-group-${index}`}
                        style={{ position: "relative" }}
                    >
                        <FormGroup
                            label={
                                <Tooltip2
                                    minimal
                                    position="left"
                                    className="margin-0-important"
                                    content={schema.name}
                                >
                                    <H4
                                        style={{
                                            maxWidth: isClearButtonShowing
                                                ? "calc(100% - 86.88px)"
                                                : null,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            marginBottom: 0,
                                            lineHeight: "30px",
                                        }}
                                    >
                                        {schema.name}
                                    </H4>
                                </Tooltip2>
                            }
                        >
                            {schema.options.length === 0 ? (
                                <div
                                    style={{
                                        marginTop: 7,
                                        cursor: "not-allowed",
                                    }}
                                    className="bp3-text-disabled"
                                >
                                    No label option
                                </div>
                            ) : null}
                            <RadioGroup
                                onChange={(event) =>
                                    handleRadioChange(event, schema.name)
                                }
                                selectedValue={labelNameValue[schema.name]}
                            >
                                {schema.options.map((option, index) => (
                                    <Radio
                                        key={`editor-record-level-radio-${index}`}
                                        label={`${option.text} (${option.value})`}
                                        value={option.value}
                                    />
                                ))}
                            </RadioGroup>
                        </FormGroup>
                        {isClearButtonShowing ? (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    width: 117.16,
                                }}
                            >
                                <Tooltip2
                                    content="Remove labels"
                                    minimal
                                    usePortal={false}
                                    position="bottom-right"
                                >
                                    <div
                                        style={{
                                            width: 117.16,
                                            marginBottom: 30,
                                        }}
                                    >
                                        <Button
                                            style={{
                                                position: "absolute",
                                                right: 0,
                                                top: 0,
                                            }}
                                            intent="danger"
                                            minimal
                                            text="Clear"
                                            icon={faIcon({
                                                icon: faEraser,
                                            })}
                                            onClick={() =>
                                                handleRadioChange(
                                                    null,
                                                    schema.name
                                                )
                                            }
                                        />
                                    </div>
                                </Tooltip2>
                            </div>
                        ) : null}
                        {index !== annotatorState.lastRecordLevelSchemaIndex ? (
                            <Divider style={{ marginBottom: 20 }} />
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
};
