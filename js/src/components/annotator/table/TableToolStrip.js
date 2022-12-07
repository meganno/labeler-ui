import {
    ButtonGroup,
    Button,
    Divider,
    Intent,
    Tag,
    MenuDivider,
    MenuItem,
    Menu,
    Icon,
    Callout,
} from "@blueprintjs/core";
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import { useCallback, useContext, useEffect, useState } from "react";
import { AnnotatorContext } from "../../context/AnnotatorContext";
import { faIcon } from "../../icon";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import copy from "copy-to-clipboard";
import {
    faArrowUp,
    faCaretDown,
    faColumns,
    faEraser,
    faFilterList,
    faCheck,
    faStamp,
    faInfoCircle,
    faFilterSlash,
} from "@fortawesome/pro-duotone-svg-icons";
import {
    GREEN_CHECK_COLOR,
    LABEL_SCHEMA_OKP,
    RECORD_LEVEL_SCHEMA_KEY,
    DEFAULT_COLUMN_STATE,
    ipy_function,
    FIXED_COLUMN,
    HIDDEN_COLUMN_UNDER_RECONCILING,
} from "../../constant";
import { actionToaster, createToast } from "../../../components/toaster";
import _ from "lodash";
export const TableToolStrip = () => {
    const { annotatorState, annotatorAction } = useContext(AnnotatorContext);
    const widgetMode = _.get(annotatorState, "widgetMode", "annotating");
    const [submitting, setSubmitting] = useState(false);
    const [columnFilterInfo, setColumnFilterInfo] = useState([]);
    const [enableResetFilter, setEnableResetFilter] = useState(false);
    useEffect(() => {
        let shouldEnableResetFilter = false;
        const columnFilter = _.get(annotatorState, ["filter", "column"], {});
        const columnFilterKeys = Object.keys(columnFilter);
        for (var i = 0; i < columnFilterKeys.length; i++) {
            const columnFilterKey = columnFilterKeys[i];
            if (
                Array.isArray(columnFilter[columnFilterKey]) &&
                columnFilter[columnFilterKey].length > 0
            )
                shouldEnableResetFilter = true;
        }
        setEnableResetFilter(shouldEnableResetFilter);
        if (annotatorState.filter.column !== undefined) {
            var tempColumnFilterInfo = [];
            const filterKeys = Object.keys(annotatorState.filter.column);
            for (var i = 0; i < filterKeys.length; i++) {
                const filterKey = filterKeys[i];
                tempColumnFilterInfo.push(
                    `${filterKey} with "${_.get(
                        annotatorState,
                        ["filter", "column", filterKey],
                        []
                    ).join('", "')}"`
                );
            }
            setColumnFilterInfo(tempColumnFilterInfo);
        } else {
            setColumnFilterInfo([]);
        }
    }, [annotatorState.filter]);
    const updateAnnotations = (command, count, message) => {
        ipy_function(command)
            .then((result) => {
                annotatorAction.trackNetworkRequest({
                    state: "completed",
                    count: count,
                });
                const result_list = JSON.parse(result);
                for (var i = 0; i < result_list.length; i++) {
                    const hasError =
                            _.get(result_list[i], "error", false) !== false,
                        uuid = _.get(result_list[i], "uuid");
                    if (hasError) {
                        annotatorAction.updateSubmissionAudit({
                            uuid: uuid,
                            content: {
                                state: "error",
                                message: _.get(result_list[i], "error"),
                            },
                        });
                    } else {
                        annotatorAction.updateSubmissionAudit({
                            uuid: uuid,
                            content: { state: "success" },
                        });
                    }
                }
            })
            .catch((error) => {
                annotatorAction.trackNetworkRequest({
                    state: "completed",
                    count: count,
                });
                actionToaster.show(
                    createToast({
                        intent: Intent.DANGER,
                        action: {
                            text: "Copy code",
                            icon: faIcon({ icon: faPython }),
                            onClick: () => copy(submit_annotation_command),
                        },
                        message: (
                            <div>
                                <div>
                                    {message}
                                    <br />
                                    {error}
                                </div>
                            </div>
                        ),
                    })
                );
            });
    };
    const handleSubmitAnnotation = () => {
        const selectedDatapointIds = Array.from(
            _.get(annotatorState, "selectedDatapointIds", new Set())
        );
        setSubmitting(true);
        const BATCH_SIZE = 6;
        var start_idx = 0;
        const currentLabel = _.get(
            annotatorState,
            "reconciliation.currentLabel",
            null
        );
        while (start_idx < selectedDatapointIds.length) {
            var processing = [];
            for (var i = 0; i < BATCH_SIZE; i++) {
                if (start_idx + i >= selectedDatapointIds.length) continue;
                processing.push(selectedDatapointIds[start_idx + i]);
            }
            start_idx += BATCH_SIZE;
            annotatorAction.setRecentlyUpdatedStatus({
                state: "submitted",
                uuids: processing,
            });
            annotatorAction.trackNetworkRequest({
                state: "queued",
                count: processing.length,
            });
            if (_.isEqual(widgetMode, "annotating")) {
                const submit_annotation_command = `${_.get(
                    annotatorState,
                    "ipy_interface.service"
                )}.submit_annotations(uuid_list=['${processing.join(
                    "','"
                )}'], subset=${_.get(annotatorState, [
                    "ipy_interface",
                    "subset",
                ])})`;
                updateAnnotations(
                    submit_annotation_command,
                    processing.length,
                    "Can't submit annotations; the operation couldn't be completed."
                );
            } else if (
                _.isEqual(widgetMode, "reconciling") &&
                !_.isNull(currentLabel)
            ) {
                var recon_list = [];
                for (var i = 0; i < processing.length; i++) {
                    const uuid = processing[i];
                    const labelValue = _.get(
                        annotatorState,
                        [
                            "reconciliation",
                            "data",
                            uuid,
                            currentLabel,
                            "reconciliation",
                        ],
                        null
                    );
                    recon_list.push({
                        uuid: uuid,
                        label: {
                            label_name: currentLabel,
                            label_level: "record",
                            label_value: labelValue,
                        },
                    });
                }
                const set_reconciliation_command = `${_.get(
                    annotatorState,
                    "ipy_interface.service"
                )}.set_reconciliation_data(recon_list=json.loads('${JSON.stringify(
                    recon_list
                )}'))`;
                updateAnnotations(
                    set_reconciliation_command,
                    processing.length,
                    "Can't reconcile annotations; the operation couldn't be completed."
                );
            }
        }
        setSubmitting(false);
    };
    const shouldDividerShow =
        annotatorState.filter.highlightWords.length > 0 ||
        columnFilterInfo.length > 0;
    const toggleColumnState = ({ state, columnKey }) => {
        var currentColumnState = _.cloneDeep(state);
        for (var i = 0; i < currentColumnState.length; i++) {
            if (_.isEqual(currentColumnState[i].key, columnKey)) {
                const nextValue = !currentColumnState[i].visible;
                if (_.isEqual(widgetMode, "reconciling")) {
                    if (!nextValue) continue;
                    const columnLabelName = currentColumnState[i].name;
                    if (nextValue && !_.isNil(columnLabelName)) {
                        annotatorAction.setStateByKey({
                            key: "reconciliation",
                            value: {
                                ...annotatorState.reconciliation,
                                currentLabel: columnLabelName,
                            },
                        });
                    }
                }
                currentColumnState[i].visible = nextValue;
            } else if (
                _.isEqual(widgetMode, "reconciling") &&
                !_.includes(
                    Object.keys(DEFAULT_COLUMN_STATE),
                    currentColumnState[i].key
                )
            ) {
                currentColumnState[i].visible = false;
            }
        }
        annotatorAction.setStateByKey({
            key: "columns",
            value: {
                ...annotatorState.columns,
                [widgetMode]: currentColumnState,
            },
        });
    };
    const resetColumnState = () => {
        var newColumnState = _.cloneDeep(DEFAULT_COLUMN_STATE);
        const labelSchemas = _.get(annotatorState, LABEL_SCHEMA_OKP, []);
        for (var i = 0; i < labelSchemas.length; i++) {
            const schema = labelSchemas[i];
            if (schema.level !== RECORD_LEVEL_SCHEMA_KEY) continue;
            newColumnState[`table-column-${schema.name}`] = {
                order: Object.keys(newColumnState).length,
                width: 150,
            };
        }
        annotatorAction.setStateByKey({
            key: "columns",
            value: {
                ...annotatorState.columns,
                [widgetMode]: _.get(annotatorState, ["columns", widgetMode], [])
                    .sort(
                        (a, b) =>
                            _.get(newColumnState, [a.key, "order"]) -
                            _.get(newColumnState, [b.key, "order"])
                    )
                    .map((column) => {
                        column.visible = !_.isEqual(
                            column.key,
                            "table-column-reconciliation-summary"
                        )
                            ? true
                            : false;
                        column.width = _.get(
                            newColumnState,
                            [column.key, "width"],
                            150
                        );
                        column.order = _.get(
                            newColumnState,
                            [column.key, "order"],
                            150
                        );
                        return column;
                    }),
            },
        });
    };
    return (
        <>
            <ButtonGroup>
                {_.get(annotatorState, "hasSubmit", false) ? (
                    <>
                        <Button
                            intent={
                                widgetMode === "annotating"
                                    ? "primary"
                                    : "success"
                            }
                            text={
                                widgetMode === "annotating"
                                    ? "Submit"
                                    : "Reconcile"
                            }
                            loading={submitting}
                            disabled={
                                annotatorState.selectedDatapointIds.size === 0
                            }
                            icon={faIcon({
                                icon:
                                    widgetMode === "annotating"
                                        ? faArrowUp
                                        : faStamp,
                            })}
                            minimal
                            onClick={handleSubmitAnnotation}
                        />
                        <Divider />
                    </>
                ) : null}
                <Popover2
                    disabled={!enableResetFilter}
                    minimal
                    position="bottom-left"
                    usePortal={false}
                    content={
                        <div style={{ padding: 5, maxWidth: 400 }}>
                            {columnFilterInfo.length > 0 ? (
                                <div style={{ margin: "5px 11px 10px" }}>
                                    <Tag minimal>Filtering on</Tag>
                                    <div style={{ padding: "0px 6px" }}>
                                        {columnFilterInfo
                                            .map((element) => (
                                                <span>{element}</span>
                                            ))
                                            .reduce((prev, curr) => [
                                                prev,
                                                <br />,
                                                curr,
                                            ])}
                                    </div>
                                </div>
                            ) : null}
                            {shouldDividerShow ? (
                                <Divider
                                    style={{
                                        marginBottom: 5,
                                        marginLeft: 0,
                                        marginRight: 0,
                                    }}
                                />
                            ) : null}
                            <Button
                                disabled={!enableResetFilter}
                                minimal
                                fill
                                intent="danger"
                                text="Reset filters"
                                icon={faIcon({ icon: faEraser })}
                                onClick={() =>
                                    annotatorAction.onFilterChange({
                                        filter: {
                                            query: "",
                                        },
                                    })
                                }
                            />
                        </div>
                    }
                >
                    <Tooltip2
                        disabled={!enableResetFilter}
                        minimal
                        usePortal={false}
                        position="bottom"
                        content="Filters"
                    >
                        <Button
                            disabled={!enableResetFilter}
                            minimal
                            icon={faIcon({
                                icon: enableResetFilter
                                    ? faFilterList
                                    : faFilterSlash,
                            })}
                            rightIcon={faIcon({ icon: faCaretDown })}
                        />
                    </Tooltip2>
                </Popover2>
                <Divider />
                <Popover2
                    position="bottom-left"
                    minimal
                    usePortal={false}
                    content={
                        <div>
                            <Menu>
                                <MenuDivider title="Column Visibility" />
                                {_.get(
                                    annotatorState,
                                    ["columns", widgetMode],
                                    []
                                ).map((column, index) => {
                                    const hidden =
                                        _.isUndefined(column.name) ||
                                        (widgetMode === "reconciling" &&
                                            (column.tagging ||
                                                _.includes(
                                                    HIDDEN_COLUMN_UNDER_RECONCILING,
                                                    column.name
                                                ))) ||
                                        _.includes(FIXED_COLUMN, column.name);
                                    if (hidden) return null;
                                    return (
                                        <MenuItem
                                            key={`table-tool-strip-column-visibility-col-${index}`}
                                            shouldDismissPopover={false}
                                            onClick={() => {
                                                toggleColumnState.call(
                                                    {},
                                                    {
                                                        state: _.get(
                                                            annotatorState,
                                                            [
                                                                "columns",
                                                                widgetMode,
                                                            ],
                                                            []
                                                        ),
                                                        columnKey: column.key,
                                                    }
                                                );
                                            }}
                                            icon={
                                                column.visible ? (
                                                    faIcon({
                                                        icon: faCheck,
                                                        style: {
                                                            color: GREEN_CHECK_COLOR,
                                                        },
                                                    })
                                                ) : (
                                                    <Icon icon="blank" />
                                                )
                                            }
                                            text={column.name}
                                        />
                                    );
                                })}
                                {widgetMode === "annotating" ? (
                                    <>
                                        <MenuDivider />
                                        <Button
                                            minimal
                                            fill
                                            intent="danger"
                                            text="Reset columns"
                                            icon={faIcon({ icon: faEraser })}
                                            onClick={resetColumnState}
                                        />
                                    </>
                                ) : null}
                                {widgetMode === "reconciling" ? (
                                    <Callout
                                        style={{ marginTop: 5, maxWidth: 270 }}
                                        intent="primary"
                                        icon={faIcon({
                                            icon: faInfoCircle,
                                            style: { marginTop: 13 },
                                        })}
                                    >
                                        Only 1 label column can be shown at a
                                        time under reconciling mode.
                                    </Callout>
                                ) : null}
                            </Menu>
                        </div>
                    }
                >
                    <Tooltip2
                        content="Columns"
                        minimal
                        position="bottom"
                        usePortal={false}
                    >
                        <Button
                            minimal
                            icon={faIcon({ icon: faColumns })}
                            style={{ padding: 0 }}
                        />
                    </Tooltip2>
                </Popover2>
            </ButtonGroup>
        </>
    );
};
