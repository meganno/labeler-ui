import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import {
    Button,
    HTMLSelect,
    Menu,
    MenuDivider,
    MenuItem,
    Switch,
    Tag,
} from "@blueprintjs/core";
import { faSlidersH } from "@fortawesome/pro-duotone-svg-icons";
import { faIcon } from "../icon";
import { useContext } from "react";
import { AnnotatorContext } from "../context/AnnotatorContext";
import _ from "lodash";
export const ViewConfigurator = () => {
    const { annotatorState, annotatorAction } = useContext(AnnotatorContext);
    const updateSettingState = (key, value) => {
        annotatorAction.setStateByKey({
            key: "settings",
            value: {
                ..._.get(annotatorState, "settings", {}),
                [key]: value,
            },
        });
    };
    const hideSpanLabelValue = _.get(
            annotatorState,
            "settings.hideSpanLabelValue",
            false
        ),
        showFullMetadataValue = _.get(
            annotatorState,
            "settings.showFullMetadataValue",
            false
        ),
        metadataFocusName = _.get(
            annotatorState,
            "settings.metadataFocusName",
            ""
        );
    return (
        <div>
            <Popover2
                usePortal={false}
                minimal
                position="bottom-right"
                content={
                    <div>
                        <Menu>
                            <MenuDivider title="View" />
                            <MenuItem
                                onClickCapture={() =>
                                    updateSettingState(
                                        "hideSpanLabelValue",
                                        !hideSpanLabelValue
                                    )
                                }
                                shouldDismissPopover={false}
                                icon={
                                    <Switch
                                        checked={hideSpanLabelValue}
                                        readOnly
                                        style={{
                                            margin: 0,
                                            pointerEvents: "none",
                                        }}
                                    />
                                }
                                text="Hide span-level label value"
                                popoverProps={{ position: "left" }}
                            >
                                <MenuDivider title="Example" />
                                <div style={{ margin: "5px 8px" }}>
                                    Readability&nbsp;
                                    <Tag
                                        style={{
                                            fontSize: "14px",
                                            padding: !hideSpanLabelValue
                                                ? null
                                                : 0,
                                        }}
                                        minimal
                                        rightIcon={
                                            !hideSpanLabelValue ? (
                                                <span
                                                    style={{
                                                        fontWeight: "bolder",
                                                    }}
                                                >
                                                    value
                                                </span>
                                            ) : null
                                        }
                                    >
                                        text
                                    </Tag>
                                    &nbsp;test
                                </div>
                            </MenuItem>
                            <MenuItem
                                onClickCapture={() =>
                                    updateSettingState(
                                        "showFullMetadataValue",
                                        !showFullMetadataValue
                                    )
                                }
                                shouldDismissPopover={false}
                                icon={
                                    <Switch
                                        checked={showFullMetadataValue}
                                        readOnly
                                        style={{
                                            margin: 0,
                                            pointerEvents: "none",
                                        }}
                                    />
                                }
                                text="Show full metadata value"
                                popoverProps={{ position: "left" }}
                            >
                                <MenuDivider title="Metadata" />
                                <div style={{ margin: "5px 8px" }}>
                                    <HTMLSelect
                                        fill
                                        value={metadataFocusName}
                                        onChange={(event) =>
                                            updateSettingState(
                                                "metadataFocusName",
                                                event.currentTarget.value
                                            )
                                        }
                                    >
                                        <option disabled value="">
                                            -
                                        </option>
                                        {Array.from(
                                            _.get(
                                                annotatorState,
                                                "metadataNames",
                                                new Set()
                                            )
                                        ).map((name, index) => (
                                            <option
                                                key={`view-configurator-metadata-focus-name-${index}`}
                                                value={name}
                                            >
                                                {name}
                                            </option>
                                        ))}
                                    </HTMLSelect>
                                </div>
                            </MenuItem>
                        </Menu>
                    </div>
                }
            >
                <Tooltip2
                    usePortal={false}
                    minimal
                    position="bottom-right"
                    content="Settings"
                >
                    <Button
                        minimal
                        style={{ padding: 0 }}
                        icon={faIcon({ icon: faSlidersH })}
                    />
                </Tooltip2>
            </Popover2>
        </div>
    );
};
