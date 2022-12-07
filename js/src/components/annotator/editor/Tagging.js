import { Button, Menu, Tag, MenuItem, Divider } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { faUserTag } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import {
    LABEL_SCHEMA_OKP,
    RECORD_LEVEL_LABEL_OKP,
    DEFAULT_ANNOTATOR,
} from "../../constant";
import { AnnotatorContext } from "../../context/AnnotatorContext";
import { faIcon } from "../../icon";
export const Tagging = () => {
    const { annotatorState, annotatorAction } = useContext(AnnotatorContext);
    const [labelNameValue, setLabelNameValue] = useState({});
    const [availableTags, setAvailableTags] = useState([]);
    useEffect(() => {
        let newLabelNameValue = {};
        _.get(
            annotatorState,
            ["data", annotatorState.dataFocusIndex, ...RECORD_LEVEL_LABEL_OKP],
            []
        ).forEach(
            (record) =>
                (newLabelNameValue[record.label_name] = record.label_value[0])
        );
        const newAvailableTags = _.get(
            annotatorState,
            LABEL_SCHEMA_OKP,
            []
        ).filter((schema) => {
            return (
                schema.tagging === true &&
                !newLabelNameValue.hasOwnProperty(schema.name)
            );
        });
        setAvailableTags(newAvailableTags);
        setLabelNameValue(newLabelNameValue);
    }, [annotatorState.dataFocusIndex, annotatorState.data]);
    const handleTagChange = (value, labelName) => {
        let found = false;
        let newData = [..._.get(annotatorState, "data", [])];
        newData = newData.map((datapoint, index) => {
            if (index !== annotatorState.dataFocusIndex) return datapoint;
            let labelRecord = _.get(datapoint, [...RECORD_LEVEL_LABEL_OKP], [])
                .filter((record) => {
                    if (value === null && record.label_name === labelName)
                        return false;
                    return true;
                })
                .map((record) => {
                    if (record.label_name !== labelName) return record;
                    found = true;
                    record.label_value = [value];
                    return record;
                });
            if (!found && value !== null) {
                labelRecord.push({
                    label_name: labelName,
                    label_value: [value],
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
            return _.set(datapoint, [...RECORD_LEVEL_LABEL_OKP], labelRecord);
        });
        annotatorAction.setData(newData);
    };
    return (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Popover2
                disabled={availableTags.length === 0}
                minimal
                content={
                    <Menu>
                        {availableTags.map((schema, tagIdx) => {
                            const hasValue = labelNameValue.hasOwnProperty(
                                schema.name
                            );
                            if (!hasValue) {
                                return (
                                    <MenuItem
                                        key={`tagging-tags-${tagIdx}`}
                                        text={schema.name}
                                    >
                                        {schema.options.map(
                                            (option, optionIdx) => (
                                                <MenuItem
                                                    key={`tagging-tags-option-${optionIdx}`}
                                                    text={option.text}
                                                    labelElement={
                                                        <span
                                                            style={{
                                                                fontWeight:
                                                                    "bolder",
                                                            }}
                                                        >
                                                            {option.value}
                                                        </span>
                                                    }
                                                    onClick={() =>
                                                        handleTagChange(
                                                            option.value,
                                                            schema.name
                                                        )
                                                    }
                                                />
                                            )
                                        )}
                                    </MenuItem>
                                );
                            }
                        })}
                    </Menu>
                }
                position="bottom-left"
            >
                <Button
                    style={{ marginRight: 7, marginBottom: 4 }}
                    minimal
                    outlined
                    disabled={availableTags.length === 0}
                    text="Add new tag"
                    icon={faIcon({ icon: faUserTag })}
                />
            </Popover2>
            {Array.from(_.get(annotatorState, "tagSchemaNames", new Set())).map(
                (tagName, tagIndex) => {
                    if (labelNameValue.hasOwnProperty(tagName)) {
                        const tagStyle = _.get(
                            annotatorState,
                            [
                                "labelTagStyles",
                                tagName,
                                labelNameValue[tagName],
                                "minimal",
                            ],
                            {}
                        );
                        return (
                            <Popover2
                                key={`tagging-popover2-${tagIndex}`}
                                position="bottom-left"
                                content={
                                    <Menu>
                                        {_.get(
                                            annotatorState,
                                            ["labelNameOptions", tagName],
                                            []
                                        )
                                            .filter(
                                                (option) =>
                                                    option.value !==
                                                    labelNameValue[tagName]
                                            )
                                            .map((option, index) => (
                                                <MenuItem
                                                    key={`tagging-popover2-menuitem-${index}`}
                                                    text={option.text}
                                                    labelElement={
                                                        <span
                                                            style={{
                                                                fontWeight:
                                                                    "bolder",
                                                            }}
                                                        >
                                                            {option.value}
                                                        </span>
                                                    }
                                                    onClick={() =>
                                                        handleTagChange(
                                                            option.value,
                                                            tagName
                                                        )
                                                    }
                                                />
                                            ))}
                                    </Menu>
                                }
                            >
                                <Tag
                                    onRemove={() =>
                                        handleTagChange(null, tagName)
                                    }
                                    large
                                    interactive
                                    minimal
                                    style={{
                                        ...tagStyle,
                                        marginRight: 7,
                                        marginBottom: 4,
                                    }}
                                >
                                    <span
                                        style={{ display: "flex" }}
                                        key={`tagging-popover2-span-${tagIndex}`}
                                    >
                                        {[
                                            tagName,
                                            <span
                                                key={`tagging-popover2-span-tag-name-${tagIndex}`}
                                                style={{
                                                    fontWeight: "bolder",
                                                }}
                                            >
                                                {labelNameValue[tagName]}
                                            </span>,
                                        ].reduce((prev, curr) => [
                                            prev,
                                            <Divider
                                                key={`tagging-popover2-tag-divider-${tagIndex}`}
                                            />,
                                            curr,
                                        ])}
                                    </span>
                                </Tag>
                            </Popover2>
                        );
                    }
                }
            )}
        </div>
    );
};
