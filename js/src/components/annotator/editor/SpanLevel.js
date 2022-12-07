import { useEffect, useState, useContext } from "react";
import { Tag } from "@blueprintjs/core";
import { AnnotatorContext } from "../../context/AnnotatorContext";
import _ from "lodash";
import { Popover2 } from "@blueprintjs/popover2";
import { OptionList } from "../OptionList";
import {
    EXPANDABLE_CHARS,
    LABEL_SCHEMA_OKP,
    SPAN_LEVEL_CHAR_SCHEMA_KEY,
} from "../../constant";
import Highlighter from "react-highlight-words";
export const SpanLevel = ({
    rowIndex,
    mode,
    isInPopover,
    smartHighlight,
    isTableCell,
    focusLabel,
}) => {
    const { annotatorState, annotatorAction } = useContext(AnnotatorContext);
    const [labelName, setLabelName] = useState(null);
    const isEdit = mode === "edit",
        isView = mode === "view";
    const labelSchemas = _.get(annotatorState, LABEL_SCHEMA_OKP, []);
    useEffect(() => {
        for (var i = 0; i < labelSchemas.length; i++) {
            const schema = labelSchemas[i];
            if (schema.level === SPAN_LEVEL_CHAR_SCHEMA_KEY) {
                setLabelName(schema.name);
                break;
            }
        }
    }, [labelSchemas]);
    useEffect(() => {
        if (oldSelection != null) {
            let autoAssignLabel = {
                label_name: labelName,
                start_idx: oldSelection.start,
                end_idx: oldSelection.end,
            };
            _.set(autoAssignLabel, "label_value", [focusLabel.value]);
            annotatorAction.setNewLabel({
                path: ["labels_span_ch"],
                label: autoAssignLabel,
            });
            annotatorAction.setRecentlyUpdatedStatus({
                state: "updated",
                uuids: [datapoint.uuid],
            });
            setOldSelection(null);
        }
    }, [focusLabel]);
    const isAlpha = (char) => {
        return /[a-z]/i.test(char);
    };
    const [datapoint, setDatapoint] = useState({});
    useEffect(() => {
        setDatapoint(
            _.cloneDeep(_.get(annotatorState, ["data", rowIndex], {}))
        );
    }, [annotatorState.data, rowIndex]);
    const [nodes, setNodes] = useState([]);
    const [selection, setSelection] = useState(null);
    const [oldSelection, setOldSelection] = useState(null);
    const SCHEMA_LEVEL = {
        character: "labels_span_ch",
        token: "labels_span_tok",
    };
    useEffect(() => {
        annotationRenderer();
    }, [datapoint, selection]);
    const text = _.get(datapoint, "data", "");
    const annotationHighlighter = () => {
        const elementSelection = window.getSelection();
        if (
            elementSelection === undefined ||
            elementSelection.anchorNode === null
        )
            return;
        const childNodes = Array.prototype.slice.call(
            elementSelection.anchorNode.parentNode.parentNode.childNodes
        );
        const startNode = elementSelection.anchorNode,
            endNode = elementSelection.focusNode;
        const startNodeIndex = childNodes.indexOf(startNode.parentNode),
            endNodeIndex = childNodes.indexOf(endNode.parentNode);
        const startOffset = elementSelection.anchorOffset,
            endOffset = elementSelection.focusOffset;
        if (startOffset === endOffset) return;
        var actualStartIndex = 0,
            actualEndIndex = 0;
        for (var i = 0; i < startNodeIndex; i++) {
            actualStartIndex += nodes[i].content.length;
        }
        var validStartIndex = actualStartIndex,
            validEndIndex = 0;
        actualStartIndex += startOffset;
        for (var i = 0; i <= endNodeIndex; i++) {
            if (i === endNodeIndex) {
                validEndIndex = actualEndIndex + nodes[i].content.length;
                break;
            }
            actualEndIndex += nodes[i].content.length;
        }
        actualEndIndex += endOffset;
        const selectionRange = [actualStartIndex, actualEndIndex].sort(
            (a, b) => a - b
        );
        if (
            text.substring(selectionRange[0], selectionRange[1]).trim()
                .length === 0
        )
            return;
        // SMART HIGHLIGHT LOGIC [BEGIN]
        const canExpand = (char) => {
            if (isAlpha(char)) return true;
            if (EXPANDABLE_CHARS.indexOf(char) !== -1) return true;
            return false;
        };
        var smartStartIndex = selectionRange[0],
            smartEndIndex = selectionRange[1];
        while (smartStartIndex < smartEndIndex) {
            if (text[smartStartIndex] === " ") smartStartIndex += 1;
            else break;
        }
        while (smartEndIndex > smartStartIndex) {
            if (text[smartEndIndex - 1] === " ") smartEndIndex -= 1;
            else break;
        }
        while (
            smartStartIndex - 1 >= validStartIndex &&
            canExpand(text[smartStartIndex - 1])
        ) {
            smartStartIndex -= 1;
        }
        while (
            smartEndIndex < validEndIndex &&
            canExpand(text[smartEndIndex])
        ) {
            smartEndIndex += 1;
        }
        if (smartHighlight) {
            selectionRange[0] = smartStartIndex;
            selectionRange[1] = smartEndIndex;
        }
        // SMART HIGHLIGHT LOGIC [END]
        const existingLabels = _.get(
            datapoint,
            ["annotation_list", 0, SCHEMA_LEVEL.character],
            []
        );
        let hasOverlapLabel = false;
        existingLabels.forEach((label) => {
            if (
                label.start_idx <= selectionRange[1] - 1 &&
                label.end_idx - 1 >= selectionRange[0]
            )
                hasOverlapLabel = true;
        });
        if (hasOverlapLabel) setSelection(null);
        else if (focusLabel !== null) {
            let autoAssignLabel = {
                label_name: labelName,
                start_idx: selectionRange[0],
                end_idx: selectionRange[1],
            };
            _.set(autoAssignLabel, "label_value", [focusLabel.value]);
            annotatorAction.setNewLabel({
                path: ["labels_span_ch"],
                label: autoAssignLabel,
            });
            annotatorAction.setRecentlyUpdatedStatus({
                state: "updated",
                uuids: [datapoint.uuid],
            });
        } else
            setSelection({
                start: selectionRange[0],
                end: selectionRange[1],
            });
    };
    const annotationRenderer = () => {
        const labels = _.get(
            datapoint,
            ["annotation_list", 0, SCHEMA_LEVEL.character],
            []
        );
        if (labels.length === 0 && selection === null) {
            setNodes([{ content: datapoint.data, type: "text" }]);
            return;
        }
        let nodes = [],
            segment = "";
        const pushSegmentIfNotEmpty = () => {
            if (segment === "") return;
            nodes.push({ content: segment, type: "text" });
            segment = "";
        };
        const pushSpanWithPopover2 = ({ type, attr, isOpen = false }) => {
            nodes.push({
                content: segment,
                type: type,
                attr: attr,
                isOpen: isOpen,
            });
            segment = "";
        };
        for (var i = 0; i < text.length; i++) {
            let isLabeled = false;
            labels.forEach((label) => {
                if (label.start_idx <= i && i < label.end_idx) {
                    isLabeled = true;
                    pushSegmentIfNotEmpty();
                    while (label.start_idx <= i && i < label.end_idx)
                        segment += text[i++];
                    i--;
                    pushSpanWithPopover2({
                        type: "tag",
                        attr: label,
                    });
                }
            });
            if (
                selection !== null &&
                selection.start <= i &&
                i < selection.end
            ) {
                isLabeled = true;
                pushSegmentIfNotEmpty();
                while (selection.start <= i && i < selection.end)
                    segment += text[i++];
                i--;
                pushSpanWithPopover2({
                    type: "selection",
                    attr: {
                        start_idx: selection.start,
                        end_idx: selection.end,
                    },
                    isOpen: true,
                });
            }
            if (!isLabeled) segment += text[i];
        }
        pushSegmentIfNotEmpty();
        setNodes(nodes);
    };
    return (
        <div style={isTableCell ? { width: "max-content" } : null}>
            <div
                className={isEdit ? "bp3-text-large" : null}
                style={
                    isEdit
                        ? { lineHeight: "36px" }
                        : isInPopover
                        ? { lineHeight: "24px" }
                        : null
                }
                onMouseUp={isEdit ? annotationHighlighter : null}
            >
                {nodes.map((node, index) => {
                    if (node.type === "text") {
                        if (isView)
                            return (
                                <Highlighter
                                    key={`span-level-highlighter-text-${index}`}
                                    autoEscape
                                    highlightClassName="search-words-highlight"
                                    searchWords={
                                        annotatorState.filter.highlightWords
                                    }
                                    textToHighlight={
                                        node.content === undefined
                                            ? ""
                                            : node.content
                                    }
                                />
                            );
                        else
                            return (
                                <span
                                    key={`span-level-span-text-${index}`}
                                    style={{ cursor: "text" }}
                                >
                                    {node.content}
                                </span>
                            );
                    } else if (["tag", "selection"].includes(node.type)) {
                        const labelValue = _.get(
                            node,
                            "attr.label_value[0]",
                            null
                        );
                        const onClick = () => {
                            if (isView) return;
                            let newNodes = [...nodes];
                            newNodes[index]["isOpen"] =
                                !newNodes[index]["isOpen"];
                            setNodes(newNodes);
                        };
                        const onClose = () => {
                            let newNodes = [...nodes];
                            newNodes[index]["isOpen"] = false;
                            setNodes(newNodes);
                            if (node.type === "selection") {
                                setSelection(null);
                                setOldSelection(selection);
                                setTimeout(() => setOldSelection(null), 1000);
                            }
                        };
                        const tagStyle = _.get(
                            annotatorState,
                            [
                                "labelTagStyles",
                                labelName,
                                labelValue,
                                "minimal",
                            ],
                            {}
                        );
                        const tagElement = (
                            <Tag
                                className="user-select-none"
                                large={isEdit}
                                key={`span-level-tag-label-${index}`}
                                minimal
                                onClick={onClick}
                                interactive={isEdit}
                                rightIcon={
                                    !_.get(
                                        annotatorState,
                                        "settings.hideSpanLabelValue",
                                        false
                                    ) &&
                                    node.type === "tag" &&
                                    labelValue !== null ? (
                                        <span
                                            key={`span-level-tag-value-${index}`}
                                            style={{ fontWeight: "bolder" }}
                                        >
                                            {labelValue}
                                        </span>
                                    ) : null
                                }
                                style={{
                                    ...tagStyle,
                                    fontSize: isEdit
                                        ? "16px"
                                        : isInPopover
                                        ? "14px"
                                        : "12px",
                                    ...(!_.get(
                                        annotatorState,
                                        "settings.hideSpanLabelValue",
                                        false
                                    )
                                        ? null
                                        : {
                                              padding: 0,
                                              color: "#10161A",
                                          }),
                                }}
                            >
                                <span
                                    key={`span-level-tag-span-${index}`}
                                    style={{ whiteSpace: "pre-wrap" }}
                                >
                                    {isEdit ? (
                                        node.content
                                    ) : (
                                        <Highlighter
                                            key={`span-level-tag-span-highlighter-${index}`}
                                            autoEscape
                                            highlightClassName="search-words-highlight"
                                            searchWords={
                                                annotatorState.filter
                                                    .highlightWords
                                            }
                                            textToHighlight={
                                                node.content === undefined
                                                    ? ""
                                                    : node.content
                                            }
                                        />
                                    )}
                                </span>
                            </Tag>
                        );
                        if (isView) return tagElement;
                        else if (isEdit) {
                            return (
                                <Popover2
                                    key={`span-level-popover2-${index}`}
                                    placement="bottom-start"
                                    isOpen={node.isOpen}
                                    onClose={onClose}
                                    content={
                                        <OptionList
                                            attr={node.attr}
                                            schemaLevel={
                                                SPAN_LEVEL_CHAR_SCHEMA_KEY
                                            }
                                            labelName={labelName}
                                            rowIndex={rowIndex}
                                        />
                                    }
                                >
                                    {tagElement}
                                </Popover2>
                            );
                        }
                    }
                })}
            </div>
        </div>
    );
};
