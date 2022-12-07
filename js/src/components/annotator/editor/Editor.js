import { useContext, useEffect, useState } from "react";
import { Button, Card, H4, NonIdealState } from "@blueprintjs/core";
import { SpanLevel } from "./SpanLevel";
import { AnnotatorContext } from "../../context/AnnotatorContext";
import { RecordLevel } from "./RecordLevel";
import { faIcon } from "../../icon";
import { faFolderOpen } from "@fortawesome/pro-duotone-svg-icons";
import { Tagging } from "./Tagging";
import { MetadataViewer } from "./MetadataViewer";
import _ from "lodash";
import {
    TAG_SCHEMA_OKP,
    LABEL_SCHEMA_OKP,
    SPAN_LEVEL_CHAR_SCHEMA_KEY,
} from "../../constant";
import { StickyContainer, Sticky } from "react-sticky";
import { PersistentLabelSelection } from "./PersistentLabellSelection";
export const Editor = ({ setView, smartHighlight }) => {
    const { annotatorState } = useContext(AnnotatorContext);
    const labelSchemas = _.get(annotatorState, LABEL_SCHEMA_OKP, []);
    const [labelOptions, setLabelOptions] = useState([]);
    const [labelName, setLabelName] = useState(null);
    useEffect(() => {
        let labelOptions = [];
        for (var i = 0; i < labelSchemas.length; i++) {
            const schema = labelSchemas[i];
            if (schema.level === SPAN_LEVEL_CHAR_SCHEMA_KEY) {
                setLabelName(schema.name);
                labelOptions = schema.options;
                break;
            }
        }
        setLabelOptions(labelOptions);
    }, [labelSchemas]);
    const isRecordLevelVisible =
        labelSchemas.filter(
            (schema) => _.get(schema, "level", null) === "record"
        ).length > 0;
    const [stickyHeader, setStickyHeader] = useState(null);
    const [focusLabel, setFocusLabel] = useState(null);
    const stickyHeaderRenderer = ({ isSticky, style, content, visible }) => {
        return (
            <div
                className={isSticky ? "bp3-card bp3-elevation-1" : null}
                style={{
                    ...style,
                    padding: "10px 20px",
                    width: "100%",
                    zIndex: 1,
                    left: 0,
                    display: visible ? "" : "none",
                    ...(isSticky
                        ? {
                              position: "absolute",
                              borderRadius: 0,
                          }
                        : {
                              position: "initial",
                          }),
                }}
            >
                {content}
            </div>
        );
    };
    return (
        <div
            style={{ overflow: "hidden", position: "relative", height: "100%" }}
        >
            {annotatorState.dataFocusIndex === -1 ? (
                <NonIdealState
                    icon={faIcon({ icon: faFolderOpen, size: 30 })}
                    title="Oops! No data available."
                    description={
                        <span>
                            Try modifying or clearing search in Table view to
                            see records here.
                        </span>
                    }
                    action={
                        <Button
                            minimal
                            outlined
                            intent="primary"
                            text="Go to Table view"
                            onClick={() => setView("table")}
                        />
                    }
                />
            ) : (
                <div
                    style={{
                        overflow: "hidden",
                        position: "relative",
                        height: "100%",
                    }}
                >
                    {isRecordLevelVisible ? (
                        <Card
                            interactive
                            style={{
                                zIndex: 2,
                                height: "100%",
                                position: "absolute",
                                right: 0,
                                overflow: "auto",
                                width: 300,
                                borderRadius: 0,
                            }}
                        >
                            <RecordLevel
                                rowIndex={annotatorState.dataFocusIndex}
                            />
                        </Card>
                    ) : null}
                    <div
                        style={{
                            overflow: "hidden",
                            position: "relative",
                            height: "100%",
                            width: `calc(100% - ${
                                isRecordLevelVisible ? 300 : 0
                            }px)`,
                        }}
                    >
                        <StickyContainer
                            className="overscroll-behavior-contain"
                            style={{
                                padding: "10px 0px 20px",
                                overflowY: "auto",
                                height: "100%",
                            }}
                        >
                            <Sticky relative topOffset={0}>
                                {({ style, isSticky }) => {
                                    if (isSticky) setStickyHeader("labels");
                                    return stickyHeaderRenderer({
                                        content: (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "nowrap",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <H4 className="margin-0 margin-right-10">
                                                    {_.isEmpty(labelOptions)
                                                        ? "Data"
                                                        : "Labels"}
                                                </H4>
                                                <div
                                                    className="hide-scrollbar"
                                                    style={{
                                                        display: "flex",
                                                        flexWrap: "nowrap",
                                                        overflowX: "auto",
                                                    }}
                                                >
                                                    <PersistentLabelSelection
                                                        labelName={labelName}
                                                        labelOptions={
                                                            labelOptions
                                                        }
                                                        focusLabel={focusLabel}
                                                        setFocusLabel={
                                                            setFocusLabel
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ),
                                        visible:
                                            !isSticky ||
                                            _.isNull(stickyHeader) ||
                                            _.isEqual(stickyHeader, "labels"),
                                        isSticky: isSticky,
                                        style: style,
                                    });
                                }}
                            </Sticky>
                            <div
                                style={{
                                    marginLeft: 20,
                                    marginRight: 20,
                                }}
                            >
                                <SpanLevel
                                    focusLabel={focusLabel}
                                    smartHighlight={smartHighlight}
                                    mode="edit"
                                    rowIndex={annotatorState.dataFocusIndex}
                                />
                            </div>
                            {_.get(
                                annotatorState,
                                [
                                    "data",
                                    annotatorState.dataFocusIndex,
                                    "metadata",
                                ],
                                []
                            ).length > 0 ? (
                                <>
                                    <Sticky relative topOffset={-31}>
                                        {({ style, isSticky }) => {
                                            if (isSticky)
                                                setStickyHeader("metadata");
                                            return stickyHeaderRenderer({
                                                content: (
                                                    <div>
                                                        <H4 className="margin-0">
                                                            Metadata
                                                        </H4>
                                                    </div>
                                                ),
                                                visible:
                                                    !isSticky ||
                                                    _.isNull(stickyHeader) ||
                                                    _.isEqual(
                                                        stickyHeader,
                                                        "metadata"
                                                    ),
                                                isSticky: isSticky,
                                                style: style,
                                            });
                                        }}
                                    </Sticky>
                                    <div
                                        style={{
                                            marginLeft: 20,
                                            marginRight: 20,
                                        }}
                                    >
                                        <MetadataViewer />
                                    </div>
                                </>
                            ) : null}
                            {_.get(annotatorState, TAG_SCHEMA_OKP, []).length >
                            0 ? (
                                <>
                                    <Sticky relative topOffset={-31}>
                                        {({ style, isSticky }) => {
                                            if (isSticky)
                                                setStickyHeader("tags");
                                            return stickyHeaderRenderer({
                                                content: (
                                                    <div>
                                                        <H4 className="margin-0">
                                                            Tags
                                                        </H4>
                                                    </div>
                                                ),
                                                visible:
                                                    !isSticky ||
                                                    _.isNull(stickyHeader) ||
                                                    _.isEqual(
                                                        stickyHeader,
                                                        "tags"
                                                    ),
                                                isSticky: isSticky,
                                                style: style,
                                            });
                                        }}
                                    </Sticky>
                                    <div
                                        style={{
                                            marginLeft: 20,
                                            marginRight: 20,
                                        }}
                                    >
                                        <Tagging />
                                    </div>
                                </>
                            ) : null}
                        </StickyContainer>
                    </div>
                </div>
            )}
        </div>
    );
};
