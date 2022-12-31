import { MenuItem, Button, Intent, Menu } from "@blueprintjs/core";
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import {
    faHighlighterLine,
    faCaretDown,
    faHandshakeSimple,
} from "@fortawesome/pro-duotone-svg-icons";
import { useContext, useEffect } from "react";
import { faIcon } from "../icon";
import { AnnotatorContext } from "../context/AnnotatorContext";
import _ from "lodash";
export const WidgetModeSwitcher = () => {
    const { annotatorState, annotatorAction } = useContext(AnnotatorContext);
    const widgetMode = _.get(annotatorState, "widgetMode", "annotating");
    const editorModeLookUp = {
        annotating: {
            text: "Annotating",
            info: <div>Annotate data with different labels</div>,
            icon: faHighlighterLine,
            intent: Intent.PRIMARY,
            buttonStyle: {
                backgroundColor: "rgba(19, 124, 189, 0.1)",
            },
            iconStyle: {
                color: "#137CBD",
            },
        },
        reconciling: {
            text: "Reconciling",
            info: <div>Aggregate labels from different annotators</div>,
            icon: faHandshakeSimple,
            intent: Intent.SUCCESS,
            buttonStyle: {
                backgroundColor: "rgba(15, 153, 96, 0.1)",
            },
            iconStyle: {
                color: "#0F9960",
            },
        },
    };
    useEffect(() => {
        annotatorAction.onFilterChange({
            ...annotatorState.filter,
        });
    }, [annotatorState.widgetMode]);
    return (
        <div>
            <Popover2
                usePortal={false}
                minimal
                position="bottom-right"
                content={
                    <Menu>
                        {["annotating", "reconciling"].map((mode) => (
                            <MenuItem
                                key={`widget-mode-switcher-${mode}`}
                                onClick={() => {
                                    annotatorAction.setStateByKey({
                                        key: "widgetMode",
                                        value: mode,
                                    });
                                }}
                                icon={faIcon({
                                    icon: editorModeLookUp[mode].icon,
                                    size: 20,
                                    style: editorModeLookUp[mode].iconStyle,
                                })}
                                text={
                                    <div>
                                        <strong>
                                            {editorModeLookUp[mode].text}
                                        </strong>
                                        <div className="bp3-text-muted bp3-text-small">
                                            {editorModeLookUp[mode].info}
                                        </div>
                                    </div>
                                }
                            />
                        ))}
                    </Menu>
                }
            >
                <Tooltip2
                    usePortal={false}
                    minimal
                    position="bottom"
                    content={`Currently: ${editorModeLookUp[widgetMode].text} mode`}
                >
                    <Button
                        className="user-select-none"
                        active
                        style={{ ...editorModeLookUp[widgetMode].buttonStyle }}
                        intent={editorModeLookUp[widgetMode].intent}
                        minimal
                        icon={faIcon({
                            icon: editorModeLookUp[widgetMode].icon,
                        })}
                        rightIcon={faIcon({
                            icon: faCaretDown,
                        })}
                        text={
                            <strong>{editorModeLookUp[widgetMode].text}</strong>
                        }
                    />
                </Tooltip2>
            </Popover2>
        </div>
    );
};
