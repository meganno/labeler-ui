import {
    ButtonGroup,
    Button,
    Divider,
    Menu,
    MenuItem,
} from "@blueprintjs/core";
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import { useContext } from "react";
import { AnnotatorContext } from "../../context/AnnotatorContext";
import { faIcon } from "../../icon";
import {
    faArrowLeft,
    faArrowRight,
    faCaretDown,
    faGear,
    faICursor,
} from "@fortawesome/pro-duotone-svg-icons";
export const EditorToolStrip = ({
    isSmartHighlightEnabled,
    setIsSmartHighlightEnabled,
}) => {
    const { annotatorState, annotatorAction } = useContext(AnnotatorContext);
    return (
        <>
            <ButtonGroup>
                <Tooltip2
                    usePortal={false}
                    content={"Previous"}
                    minimal
                    position="bottom-left"
                    disabled={annotatorState.dataFocusIndex <= 0}
                >
                    <Button
                        disabled={annotatorState.dataFocusIndex <= 0}
                        style={{ padding: 0 }}
                        icon={faIcon({ icon: faArrowLeft })}
                        minimal
                        onClick={() =>
                            annotatorAction.setStateByKey({
                                key: "dataFocusIndex",
                                value: --annotatorState.dataFocusIndex,
                            })
                        }
                    />
                </Tooltip2>
                <Tooltip2
                    usePortal={false}
                    content={"Next"}
                    minimal
                    position="bottom"
                    disabled={
                        annotatorState.dataFocusIndex ===
                        annotatorState.data.length - 1
                    }
                >
                    <Button
                        disabled={
                            annotatorState.dataFocusIndex ===
                            annotatorState.data.length - 1
                        }
                        style={{ padding: 0 }}
                        icon={faIcon({ icon: faArrowRight })}
                        minimal
                        onClick={() =>
                            annotatorAction.setStateByKey({
                                key: "dataFocusIndex",
                                value: ++annotatorState.dataFocusIndex,
                            })
                        }
                    />
                </Tooltip2>
                <Divider />
                <Popover2
                    usePortal={false}
                    content={
                        <Menu>
                            <MenuItem
                                text="Character"
                                active={!isSmartHighlightEnabled}
                                onClick={() =>
                                    setIsSmartHighlightEnabled(false)
                                }
                            />
                            <MenuItem
                                text="Word"
                                active={isSmartHighlightEnabled}
                                onClick={() => setIsSmartHighlightEnabled(true)}
                            />
                        </Menu>
                    }
                    minimal
                    position="bottom-left"
                >
                    <Tooltip2
                        usePortal={false}
                        minimal
                        position="bottom"
                        content="Selection modes"
                    >
                        <Button
                            minimal
                            icon={faIcon({ icon: faICursor })}
                            text={
                                isSmartHighlightEnabled ? "Word" : "Character"
                            }
                        />
                    </Tooltip2>
                </Popover2>
                <Divider />
                <Popover2
                    usePortal={false}
                    minimal
                    position="bottom-left"
                    content={
                        <Menu>
                            <MenuItem
                                intent="danger"
                                text="Clear all span-level labels"
                                onClick={() => {
                                    annotatorAction.setNewLabel({
                                        path: ["labels_span_ch"],
                                        label: null,
                                    });
                                }}
                            />
                            <MenuItem
                                intent="danger"
                                onClick={() => {
                                    annotatorAction.setNewLabel({
                                        path: ["labels_record"],
                                        label: null,
                                    });
                                }}
                                text="Clear all record-level labels"
                            />
                        </Menu>
                    }
                >
                    <Tooltip2
                        content="Actions"
                        minimal
                        position="bottom"
                        usePortal={false}
                        disabled={
                            annotatorState.dataFocusIndex ===
                            annotatorState.data.length - 1
                        }
                    >
                        <Button
                            disabled={annotatorState.dataFocusIndex <= 0}
                            minimal
                            icon={faIcon({ icon: faGear })}
                            rightIcon={faIcon({ icon: faCaretDown })}
                        />
                    </Tooltip2>
                </Popover2>
            </ButtonGroup>
        </>
    );
};
