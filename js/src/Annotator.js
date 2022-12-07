import {
    Alignment,
    H3,
    Navbar,
    NavbarGroup,
    NavbarHeading,
    Button,
    Card,
    ButtonGroup,
    InputGroup,
    Intent,
    Tag,
    Divider,
} from "@blueprintjs/core";
import copy from "copy-to-clipboard";
import { useEffect, useContext, useState, useRef, useCallback } from "react";
import { Base } from "./Base";
import { faIcon } from "./components/icon";
import { browserName } from "react-device-detect";
import {
    faSpinnerThird,
    faHighlighter,
    faSearch,
    faTableLayout,
} from "@fortawesome/pro-duotone-svg-icons";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import { AnnotatorContext } from "./components/context/AnnotatorContext";
import { Table } from "./components/annotator/table/Table";
import { Editor } from "./components/annotator/editor/Editor";
import {
    Popover2,
    Popover2InteractionKind,
    Tooltip2,
} from "@blueprintjs/popover2";
import { actionToaster, createToast } from "./components/toaster";
import {
    DEFAULT_ANNOTATOR,
    ipy_function,
    MINIMUM_ANNOTATION_WIDGET_VIEW_HEIGHT,
    NAV_BAR_HEIGHT,
    SEARCH_FORMAT_TAGS,
} from "./components/constant";
import { SearchPopoverContent } from "./components/annotator/table/SearchPopoverContent";
import { EditorToolStrip } from "./components/annotator/editor/EditorToolStrip";
import { TableToolStrip } from "./components/annotator/table/TableToolStrip";
import { NetworkRequestProgress } from "./components/annotator/NetworkRequestProgress";
import _ from "lodash";
import { ViewConfigurator } from "./components/annotator/ViewConfigurator";
import { WidgetModeSwitcher } from "./components/annotator/WidgetModeSwitcher";
import { LoadingScreen } from "./components/annotator/LoadingScreen";
export const Annotator = (payload) => {
    const { annotatorState, annotatorAction } = useContext(AnnotatorContext);
    const [initStages, setInitStages] = useState([
        { text: "Fetching schemas" },
        { text: "Retrieving annotator" },
        { text: "Loading data" },
    ]);
    const isInitFinished =
        _.isEmpty(
            initStages.filter((stage) => !_.get(stage, "complete", false))
        ) || _.isNil(payload.ipy_subset);
    const completeStage = (stageIdx) => {
        var stageState = [...initStages];
        for (var i = 0; i < stageState.length; i++) {
            if (_.isEqual(i, stageIdx)) {
                _.set(stageState, [i, "complete"], true);
            }
        }
        setInitStages(stageState);
    };
    useEffect(() => {
        const subset = payload.ipy_subset;
        if (!_.isNil(subset)) {
            const get_active_schemas_command = `${payload.ipy_service}.get_schemas().get_active_schemas()`;
            ipy_function(get_active_schemas_command)
                .then((schemas) => {
                    completeStage(0);
                    const active_schemas = _.get(
                        JSON.parse(schemas),
                        [0, "schemas", "label_schema"],
                        []
                    );
                    payload.config.label_schema = active_schemas;
                    const get_annotator_command = `${payload.ipy_service}.get_annotator()`;
                    ipy_function(get_annotator_command)
                        .then((annotator) => {
                            completeStage(1);
                            payload.config.annotator = JSON.parse(annotator);
                            const get_subset_value = `${subset}.value()`;
                            ipy_function(get_subset_value)
                                .then((result) => {
                                    initializations(
                                        payload,
                                        JSON.parse(result),
                                        true
                                    );
                                    completeStage(2);
                                })
                                .catch((error) => {
                                    actionToaster.show(
                                        createToast({
                                            intent: Intent.DANGER,
                                            action: {
                                                text: "Copy code",
                                                icon: faIcon({
                                                    icon: faPython,
                                                }),
                                                onClick: () =>
                                                    copy(get_subset_value),
                                            },
                                            message: (
                                                <div>
                                                    Can't get value of the
                                                    subset; the operation
                                                    couldn't be completed.
                                                    <br />
                                                    {error}
                                                </div>
                                            ),
                                        })
                                    );
                                });
                        })
                        .catch((error) => {
                            actionToaster.show(
                                createToast({
                                    intent: Intent.DANGER,
                                    action: {
                                        text: "Copy code",
                                        icon: faIcon({ icon: faPython }),
                                        onClick: () =>
                                            copy(get_annotator_command),
                                    },
                                    message: (
                                        <div>
                                            Can't get annotator; the operation
                                            couldn't be completed.
                                            <br />
                                            {error}
                                        </div>
                                    ),
                                })
                            );
                        });
                })
                .catch((error) => {
                    actionToaster.show(
                        createToast({
                            intent: Intent.DANGER,
                            action: {
                                text: "Copy code",
                                icon: faIcon({ icon: faPython }),
                                onClick: () => copy(get_active_schemas_command),
                            },
                            message: (
                                <div>
                                    Can't get active schemas; the operation
                                    couldn't be completed.
                                    <br />
                                    {error}
                                </div>
                            ),
                        })
                    );
                });
        } else {
            const annotator = _.get(payload, "config.annotator", {});
            if (typeof annotator === "string") {
                payload.config.annotator = {
                    name: annotator,
                    user_id: annotator,
                };
            }
            initializations(payload, payload.data, false);
        }
    }, []);
    const initializations = (payload, data, hasSubmit) => {
        annotatorAction.setStateByKey({
            key: "isIndexingDocuments",
            value: true,
        });
        annotatorAction.setStateByKey({
            key: "ipy_interface",
            value: {
                subset: payload.ipy_subset,
                service: payload.ipy_service,
            },
        });
        annotatorAction.setStateByKey({
            key: "ipySetData",
            value: payload.ipy_set_data,
        });
        annotatorAction.setStateByKey({
            key: "hasSubmit",
            value: hasSubmit,
        });
        annotatorAction.setStateByKey({
            key: "widgetMode",
            value: _.get(payload.config, "mode", "annotating"),
        });
        annotatorAction.indexDocuments(data);
        annotatorAction.setData(data);
        annotatorAction.setConfig(payload.config);
    };
    const title = _.get(annotatorState.config, "title", "Annotation");
    const containerRef = useRef(null);
    const [view, setView] = useState(_.get(payload, "config.view", "single"));
    const [queryString, setQueryString] = useState("");
    const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    useEffect(() => {
        setQueryString(annotatorState.filter.query);
    }, [annotatorState.filter]);
    useEffect(() => {
        var scrollPosition = 0;
        if (view === "table") {
            scrollPosition =
                51 +
                _.get(
                    payload.config,
                    "height",
                    MINIMUM_ANNOTATION_WIDGET_VIEW_HEIGHT
                );
        }
        containerRef.current.scrollTop = scrollPosition;
    }, [view, isInitFinished]);
    useEffect(() => {
        setView(
            _.get(
                annotatorState.config,
                "view",
                _.get(payload, "config.view", "single")
            )
        );
    }, [annotatorState.config]);
    const [isSmartHighlightEnabled, setIsSmartHighlightEnabled] =
        useState(true);
    const handleSearchQuery = useCallback(
        _.debounce(({ query, state }) => {
            setIsTyping(false);
            annotatorAction.onFilterChange({
                ...state.filter,
                query: query,
            });
        }, 800),
        []
    );
    return (
        <div>
            <Base>
                <Navbar
                    style={{
                        height: NAV_BAR_HEIGHT,
                        paddingLeft: 20,
                        paddingRight: 20,
                    }}
                >
                    <NavbarGroup style={{ height: NAV_BAR_HEIGHT }}>
                        <NavbarHeading
                            style={{ display: "flex", alignItems: "center" }}
                        >
                            <H3 style={{ margin: 0, marginRight: 5 }}>
                                {title}
                            </H3>
                        </NavbarHeading>
                    </NavbarGroup>
                    <NavbarGroup
                        style={{ height: NAV_BAR_HEIGHT }}
                        align={Alignment.RIGHT}
                    >
                        {view === "table" ? (
                            <div
                                style={{ marginRight: 15, width: 340 }}
                                className={
                                    !isInitFinished ? "bp3-skeleton" : null
                                }
                            >
                                <Popover2
                                    minimal
                                    interactionKind={
                                        Popover2InteractionKind.CLICK
                                    }
                                    onInteraction={(nextState) =>
                                        setIsSearchPopoverOpen(nextState)
                                    }
                                    isOpen={isSearchPopoverOpen}
                                    className="full-parent-width"
                                    position="bottom-left"
                                    content={
                                        <div style={{ width: 400 }}>
                                            <SearchPopoverContent
                                                queryString={queryString}
                                                isTyping={isTyping}
                                            />
                                        </div>
                                    }
                                    autoFocus={false}
                                    enforceFocus={false}
                                >
                                    <InputGroup
                                        onClick={(event) => {
                                            if (isSearchPopoverOpen)
                                                event.stopPropagation();
                                        }}
                                        value={queryString}
                                        disabled={
                                            annotatorState.isIndexingDocuments
                                        }
                                        placeholder={
                                            annotatorState.isIndexingDocuments
                                                ? "Indexing records..."
                                                : "Search..."
                                        }
                                        onChange={(event) => {
                                            setQueryString(event.target.value);
                                            setIsTyping(true);
                                            handleSearchQuery.call(
                                                {},
                                                {
                                                    query: event.target.value,
                                                    state: annotatorState,
                                                }
                                            );
                                        }}
                                        rightElement={
                                            queryString === ""
                                                ? null
                                                : SEARCH_FORMAT_TAGS[
                                                      annotatorState.filter.mode
                                                  ]
                                        }
                                        leftIcon={
                                            annotatorState.isIndexingDocuments
                                                ? faIcon({
                                                      icon: faSpinnerThird,
                                                      className: "fa-spin",
                                                  })
                                                : faIcon({ icon: faSearch })
                                        }
                                    />
                                </Popover2>
                            </div>
                        ) : null}
                        <ButtonGroup
                            minimal
                            className={!isInitFinished ? "bp3-skeleton" : null}
                        >
                            <Button
                                icon={faIcon({ icon: faHighlighter })}
                                text="Single"
                                active={view === "single"}
                                onClick={() => setView("single")}
                            />
                            <Button
                                icon={faIcon({ icon: faTableLayout })}
                                text="Table"
                                active={view === "table"}
                                onClick={() => setView("table")}
                            />
                        </ButtonGroup>
                    </NavbarGroup>
                </Navbar>
                <Card
                    style={{
                        borderRadius: 0,
                        padding: 5,
                        position: "relative",
                        zIndex: 3,
                        height: 40,
                    }}
                >
                    <div
                        style={{
                            marginLeft: 15,
                            marginRight: 15,
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <div
                            className={!isInitFinished ? "bp3-skeleton" : null}
                        >
                            {view === "single" ? (
                                <EditorToolStrip
                                    isSmartHighlightEnabled={
                                        isSmartHighlightEnabled
                                    }
                                    setIsSmartHighlightEnabled={
                                        setIsSmartHighlightEnabled
                                    }
                                />
                            ) : null}
                            {view === "table" ? <TableToolStrip /> : null}
                        </div>
                        <div
                            style={{ display: "inline-flex" }}
                            className={!isInitFinished ? "bp3-skeleton" : null}
                        >
                            {!_.isNil(
                                _.get(
                                    annotatorState,
                                    "ipy_interface.service",
                                    null
                                )
                            ) ? (
                                <>
                                    <WidgetModeSwitcher />
                                    <Divider />
                                </>
                            ) : null}
                            <ViewConfigurator />
                        </div>
                    </div>
                </Card>
                <div
                    ref={containerRef}
                    style={{
                        overflow: "hidden",
                        width: "100%",
                        height: _.get(
                            payload.config,
                            "height",
                            MINIMUM_ANNOTATION_WIDGET_VIEW_HEIGHT
                        ),
                        marginBottom: 31,
                    }}
                >
                    {isInitFinished ? (
                        <div
                            style={{
                                overflow: "hidden",
                                position: "relative",
                                height: "100%",
                                marginBottom: 1,
                            }}
                        >
                            <Editor
                                currentView={view}
                                setView={setView}
                                smartHighlight={isSmartHighlightEnabled}
                            />
                        </div>
                    ) : null}
                    {isInitFinished ? (
                        <div style={{ height: "100%" }}>
                            <Table setView={setView} />
                        </div>
                    ) : null}
                    {!isInitFinished ? (
                        <LoadingScreen
                            title="Initializing annotation widget..."
                            initStages={initStages}
                        />
                    ) : null}
                </div>
                <div
                    style={{
                        padding: 5,
                        paddingLeft: 20,
                        paddingRight: 20,
                        borderTop: "1px solid lightgray",
                        position: "absolute",
                        bottom: 0,
                        left: 1,
                        right: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Tooltip2
                            className="margin-top--1"
                            content="Annotator"
                            minimal
                            usePortal={false}
                            position="top-left"
                        >
                            <Tag
                                className={
                                    !isInitFinished ? "bp3-skeleton" : null
                                }
                                minimal
                                style={{ marginRight: 10 }}
                            >
                                {_.get(
                                    annotatorState,
                                    "config.annotator.name",
                                    DEFAULT_ANNOTATOR.name
                                )}
                            </Tag>
                        </Tooltip2>
                        {isInitFinished
                            ? _.get(annotatorState, "data", []).length ===
                              _.get(annotatorState, "originalData", []).length
                                ? `${
                                      _.get(annotatorState, "data", []).length
                                  } showing`
                                : `${
                                      _.get(annotatorState, "data", []).length
                                  } of ${
                                      _.get(annotatorState, "originalData", [])
                                          .length
                                  } showing`
                            : null}
                        {annotatorState.selectedDatapointIds.size > 0 ? (
                            <Divider
                                style={{
                                    display: "inline",
                                    height: 18,
                                    margin: "0px 5px",
                                }}
                            />
                        ) : null}
                        {annotatorState.selectedDatapointIds.size > 0
                            ? `${annotatorState.selectedDatapointIds.size} selected`
                            : null}
                        {annotatorState.networkRequests.queued ===
                        annotatorState.networkRequests.completed ? null : (
                            <div
                                style={{
                                    display: "inline-flex",
                                    marginLeft: 10,
                                    marginTop: -2,
                                }}
                                className={
                                    !isInitFinished ? "bp3-skeleton" : null
                                }
                            >
                                <NetworkRequestProgress />
                            </div>
                        )}
                    </div>
                    {!_.isEqual(browserName, "Chrome") ? (
                        <div>
                            <Tooltip2
                                position="top-right"
                                minimal
                                content={
                                    <div style={{ width: 300 }}>
                                        Your current browser is:{" "}
                                        <strong>{browserName}</strong>.
                                        <br />
                                        To avoid hidden Javascript/CSS
                                        compatibility issues, it is highly
                                        recommended to use the latest Google
                                        Chrome Browser.
                                    </div>
                                }
                            >
                                <Tag minimal intent="warning">
                                    Potential browser compatibility issues
                                </Tag>
                            </Tooltip2>
                        </div>
                    ) : null}
                </div>
            </Base>
        </div>
    );
};
