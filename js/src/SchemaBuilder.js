import {
    H3,
    H4,
    Navbar,
    NavbarHeading,
    NavbarGroup,
    Card,
    Menu,
    Tree,
    MenuItem,
    Button,
    Tag,
    FormGroup,
    InputGroup,
    HTMLSelect,
    ControlGroup,
    EditableText,
} from "@blueprintjs/core";
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import {
    faICursor,
    faListUl,
    faPlus,
    faTimes,
    faTrash,
} from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { Base } from "./Base";
import { NAV_BAR_HEIGHT } from "./components/constant";
import { SchemaBuilderContext } from "./components/context/SchemaBuilderContext";
import { faIcon } from "./components/icon";
import { StickyContainer, Sticky } from "react-sticky";
import { Row, Col } from "react-grid-system";
export const SchemaBuilder = ({
    config,
    label_schema,
    ipy_set_label_schema,
}) => {
    const INITIAL_NODES = [
        {
            id: 0,
            hasCaret: true,
            icon: faIcon({ icon: faListUl, style: { marginRight: 7 } }),
            label: "Record level",
            isExpanded: true,
            childNodes: [],
        },
        {
            id: 1,
            hasCaret: true,
            icon: faIcon({ icon: faICursor, style: { marginRight: 7 } }),
            label: "Span level",
            isExpanded: true,
            childNodes: [],
        },
    ];
    const [treeNodes, setTreeNodes] = useState(INITIAL_NODES);
    const [currentStickyHeader, setCurrentStickyHeader] = useState(null);
    const { schemaBuilderState, schemaBuilderAction } =
        useContext(SchemaBuilderContext);
    useEffect(() => {
        let tempTreeNodes = [...treeNodes];
        tempTreeNodes[0].secondaryLabel =
            schemaBuilderState.count.record === 0 ? null : (
                <Tag intent="primary" minimal>
                    {schemaBuilderState.count.record}
                </Tag>
            );
        tempTreeNodes[1].secondaryLabel =
            schemaBuilderState.count.span === 0 ? null : (
                <Tag intent="primary" minimal>
                    {schemaBuilderState.count.span}
                </Tag>
            );
        setTreeNodes(tempTreeNodes);
    }, [schemaBuilderState.count]);
    useEffect(() => {
        schemaBuilderAction.setLabelSchema(label_schema);
        schemaBuilderAction.setStateByKey({
            key: "ipySetLabelSchema",
            value: ipy_set_label_schema,
        });
        let tempTreeNodes = _.cloneDeep(treeNodes);
        label_schema.forEach((schema) => {
            if (schema.level === "record") {
                tempTreeNodes[0].childNodes.push({
                    id: tempTreeNodes[0].childNodes.length + 1,
                    label: schema.label_name,
                });
            } else if (["span_ch"].includes(schema.level)) {
                tempTreeNodes[1].childNodes.push({
                    id: tempTreeNodes[1].childNodes.length + 1,
                    label: schema.label_name,
                });
            }
        });
        setTreeNodes(tempTreeNodes);
    }, []);
    const toggleNodeExpandStatus = ({ path, isExpanded }) => {
        let tempTreeNodes = _.cloneDeep(treeNodes);
        const forNodeAtPath = (nodes, path, callback) => {
            callback(Tree.nodeFromPath(path, nodes));
        };
        forNodeAtPath(
            tempTreeNodes,
            path,
            (node) => (node.isExpanded = isExpanded)
        );
        setTreeNodes(tempTreeNodes);
    };
    const labelSchemaRenderer = (schema, labelIndex) => (
        <Col xs={6}>
            <Card
                interactive
                style={{
                    position: "relative",
                    zIndex: 1,
                    marginTop: 20,
                    cursor: "initial",
                }}
            >
                <H4
                    style={{
                        lineHeight: "30px",
                        maxWidth: "calc(100% - 94.8px)",
                    }}
                >
                    <EditableText
                        onChange={(value) =>
                            schemaBuilderAction.updateLabelSchema({
                                order: labelIndex,
                                labelName: schema.label_name,
                                label: {
                                    label_name: value,
                                },
                            })
                        }
                        placeholder="Edit label name..."
                        value={schema.label_name}
                    />
                </H4>
                <div style={{ position: "absolute", top: 20, right: 20 }}>
                    <Tooltip2 position="bottom" minimal content="Delete label">
                        <Button
                            onClick={() =>
                                schemaBuilderAction.removeLabelSchema({
                                    labelName: schema.label_name,
                                    order: labelIndex,
                                })
                            }
                            text="Delete"
                            intent="danger"
                            icon={faIcon({ icon: faTrash })}
                            minimal
                        />
                    </Tooltip2>
                </div>
                <FormGroup
                    label="Options"
                    style={{ marginBottom: schema.options.length > 0 ? 5 : 0 }}
                >
                    {schema.options.map((option, optionIndex) => (
                        <ControlGroup
                            fill
                            style={{
                                marginBottom:
                                    optionIndex < schema.options.length - 1
                                        ? 5
                                        : 0,
                            }}
                        >
                            <InputGroup
                                onChange={(event) => {
                                    const value = event.target.value;
                                    const newOptions = schema.options.map(
                                        (option, editIndex) => {
                                            if (editIndex === optionIndex)
                                                option.text = value;
                                            return option;
                                        }
                                    );
                                    schemaBuilderAction.updateLabelSchema({
                                        order: labelIndex,
                                        labelName: schema.label_name,
                                        label: {
                                            options: newOptions,
                                        },
                                    });
                                }}
                                value={option.text}
                                placeholder="Text"
                            />
                            <InputGroup
                                onChange={(event) => {
                                    const value = event.target.value;
                                    const newOptions = schema.options.map(
                                        (option, editIndex) => {
                                            if (editIndex === optionIndex)
                                                option.value = value;
                                            return option;
                                        }
                                    );
                                    schemaBuilderAction.updateLabelSchema({
                                        order: labelIndex,
                                        labelName: schema.label_name,
                                        label: {
                                            options: newOptions,
                                        },
                                    });
                                }}
                                value={option.value}
                                placeholder="Value"
                            />
                            <Button
                                minimal
                                icon={faIcon({ icon: faTimes })}
                                onClick={() => {
                                    const newOptions = schema.options.filter(
                                        (option, removalIndex) =>
                                            optionIndex !== removalIndex
                                    );
                                    schemaBuilderAction.updateLabelSchema({
                                        order: labelIndex,
                                        labelName: schema.label_name,
                                        label: {
                                            options: newOptions,
                                        },
                                    });
                                }}
                            />
                        </ControlGroup>
                    ))}
                </FormGroup>
                <Button
                    minimal
                    outlined
                    fill
                    intent="primary"
                    text="Add option"
                    style={{ border: "1px dashed", width: "calc(100% - 28px)" }}
                    onClick={() => {
                        schemaBuilderAction.updateLabelSchema({
                            order: labelIndex,
                            labelName: schema.label_name,
                            label: {
                                options: [
                                    ...schema.options,
                                    {
                                        text: "",
                                        value: "",
                                    },
                                ],
                            },
                        });
                    }}
                />
            </Card>
        </Col>
    );
    const stickyHeaderRenderer = ({ isSticky, shouldDisplay, style, text }) => {
        return (
            <div
                className={isSticky ? "bp3-card bp3-elevation-3" : null}
                style={{
                    ...style,
                    padding: 0,
                    zIndex: 2,
                    display: shouldDisplay ? "" : "none",
                    ...(isSticky
                        ? {
                              position: "absolute",
                              left: 220,
                              borderRadius: 0,
                              width: "calc(100% - 220px)",
                          }
                        : {
                              position: "initial",
                              left: 0,
                              width: "100%",
                          }),
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        paddingTop: 20,
                        paddingLeft: 20,
                        paddingBottom: isSticky ? 10 : 0,
                        backgroundColor: "white",
                    }}
                >
                    <H3
                        style={{
                            color: "#106BA3",
                            margin: 0,
                            marginRight: 20,
                            lineHeight: "30px",
                        }}
                    >
                        {text}
                    </H3>
                    {/* {text === "Span level" ? (
                        <Tooltip2
                            content={`Click to ${
                                schemaBuilderState.tokenized
                                    ? "disable"
                                    : "enable"
                            }`}
                            minimal
                            position="bottom-left"
                        >
                            <Button
                                active={schemaBuilderState.tokenized}
                                outlined
                                onClick={() =>
                                    schemaBuilderAction.setStateByKey({
                                        key: "tokenized",
                                        value: !schemaBuilderState.tokenized,
                                    })
                                }
                                minimal
                                text={"Tokenized text?"}
                                rightIcon={
                                    schemaBuilderState.tokenized
                                        ? faIcon({
                                              icon: faCheck,
                                              style: {
                                                  color: GREEN_CHECK_COLOR,
                                              },
                                          })
                                        : null
                                }
                            />
                        </Tooltip2>
                    ) : null} */}
                </div>
            </div>
        );
    };
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
                                Schema
                            </H3>
                        </NavbarHeading>
                    </NavbarGroup>
                </Navbar>
                <div
                    style={{
                        overflow: "hidden",
                        position: "relative",
                        height: _.get(config, "height", 400),
                    }}
                >
                    <Card
                        interactive
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            padding: 0,
                            width: 220,
                            height: "100%",
                            borderRadius: 0,
                            zIndex: 3,
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                height: "100%",
                                paddingTop: 20,
                            }}
                        >
                            <div style={{ marginLeft: 20 }}>
                                <Popover2
                                    content={
                                        <Menu>
                                            <MenuItem
                                                onClick={() =>
                                                    schemaBuilderAction.addLabelSchema(
                                                        { level: "record" }
                                                    )
                                                }
                                                text="Record level"
                                                icon={faIcon({
                                                    icon: faListUl,
                                                })}
                                            />
                                            <MenuItem
                                                onClick={() =>
                                                    schemaBuilderAction.addLabelSchema(
                                                        { level: "span_ch" }
                                                    )
                                                }
                                                text="Span level"
                                                icon={faIcon({
                                                    icon: faICursor,
                                                })}
                                            />
                                        </Menu>
                                    }
                                    minimal
                                    position="right-top"
                                >
                                    <Button
                                        large
                                        minimalx
                                        outlined
                                        text="Add label"
                                        icon={faIcon({ icon: faPlus })}
                                        intent="primary"
                                    />
                                </Popover2>
                            </div>
                            <div
                                style={{
                                    marginLeft: 13,
                                    marginRight: 13,
                                    marginTop: 20,
                                    height: "calc(100% - 80px)",
                                    overflowY: "auto",
                                }}
                            >
                                <Tree
                                    contents={treeNodes}
                                    onNodeClick={(node) => {
                                        const targetLabel = node.label;
                                    }}
                                    onNodeCollapse={(node, nodePath) =>
                                        toggleNodeExpandStatus({
                                            path: nodePath,
                                            isExpanded: false,
                                        })
                                    }
                                    onNodeExpand={(node, nodePath) =>
                                        toggleNodeExpandStatus({
                                            path: nodePath,
                                            isExpanded: true,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </Card>
                    <StickyContainer
                        style={{
                            marginLeft: 220,
                            padding: 0,
                            paddingBottom: 20,
                            overflowY: "auto",
                            height: "100%",
                        }}
                    >
                        <FormGroup
                            label="Templates"
                            inline
                            style={{ margin: 20 }}
                        >
                            <HTMLSelect></HTMLSelect>
                        </FormGroup>
                        <Sticky relative topOffset={-40}>
                            {({ style, isSticky }) => {
                                if (isSticky)
                                    setCurrentStickyHeader("record-level");
                                return stickyHeaderRenderer({
                                    text: "Record level",
                                    shouldDisplay:
                                        currentStickyHeader ===
                                            "record-level" ||
                                        currentStickyHeader === null ||
                                        !isSticky,
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
                            <Row gutterWidth={20}>
                                {schemaBuilderState.labelSchema.map(
                                    (schema, index) => {
                                        if (schema.level !== "record")
                                            return null;
                                        return labelSchemaRenderer(
                                            schema,
                                            index
                                        );
                                    }
                                )}
                            </Row>
                        </div>
                        <Sticky relative topOffset={-40}>
                            {({ style, isSticky }) => {
                                if (isSticky)
                                    setCurrentStickyHeader("span-level");
                                return stickyHeaderRenderer({
                                    text: "Span level",
                                    shouldDisplay:
                                        currentStickyHeader === "span-level" ||
                                        currentStickyHeader === null ||
                                        !isSticky,
                                    isSticky: isSticky,
                                    style: style,
                                });
                            }}
                        </Sticky>
                        <div style={{ marginLeft: 20, marginRight: 20 }}>
                            <Row gutterWidth={20}>
                                {schemaBuilderState.labelSchema.map(
                                    (schema, index) => {
                                        if (!["span_ch"].includes(schema.level))
                                            return null;
                                        return labelSchemaRenderer(
                                            schema,
                                            index
                                        );
                                    }
                                )}
                            </Row>
                        </div>
                    </StickyContainer>
                </div>
            </Base>
        </div>
    );
};
