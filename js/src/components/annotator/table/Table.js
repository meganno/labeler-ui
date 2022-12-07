import { useEffect, useState, useContext } from "react";
import {
    Column,
    Table2,
    Cell,
    ColumnHeaderCell,
    Utils,
    SelectionModes,
} from "@blueprintjs/table";
import { AnnotatorContext } from "../../context/AnnotatorContext";
import {
    Checkbox,
    MenuItem,
    Menu,
    MenuDivider,
    Icon,
    Button,
    Intent,
} from "@blueprintjs/core";
import { SpanLevel } from "../editor/SpanLevel";
import {
    LABEL_SCHEMA_OKP,
    DEFAULT_COLUMN_CELL_ATTR,
    DEFAULT_ROW_HEIGHT,
    RECORD_LEVEL_SCHEMA_KEY,
    SORT_ICONS,
    GREEN_CHECK_COLOR,
    ipy_function,
    FIXED_COLUMN,
} from "../../constant";
import _ from "lodash";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import copy from "copy-to-clipboard";
import { RecordLevelColumnCellContent } from "./RecordLevelColumnCellContent";
import { HeaderCell } from "@blueprintjs/table/lib/esm/headers/headerCell";
import { faIcon } from "../../icon";
import {
    faAngleDown,
    faCaretDown,
    faCaretUp,
    faCheck,
    faListCheck,
    faTags,
    faTasks,
} from "@fortawesome/pro-duotone-svg-icons";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import { LastSubmittedCell } from "./LastSubmittedCell";
import { actionToaster, createToast } from "../../toaster";
import { ReconciliationSummaryCell } from "./ReconciliationSummaryCell";
import { NoSearchResult } from "./NoSearchResult";
import { MetadataCell } from "./MetadataCell";
import classNames from "classnames";
export const Table = ({ setView }) => {
    const { annotatorState, annotatorAction } = useContext(AnnotatorContext);
    const [tableKey, setTableKey] = useState(new Date().getTime());
    const [highlightedRegions, setHighlightedRegions] = useState([]);
    const DEFAULT_ROW_HEIGHT_PX = DEFAULT_ROW_HEIGHT + "px";
    const widgetMode = _.get(annotatorState, "widgetMode", "annotating");
    useEffect(() => {
        // force table to re-render
        setTableKey(new Date().getTime());
    }, [annotatorState.filter, annotatorState.columns, widgetMode]);
    const handleSortData = ({
        path,
        desc = false,
        mode = "DIRECT_VALUE",
        type = "string",
    }) => {
        annotatorAction.onFilterChange({
            ...annotatorState.filter,
            justSort: true,
            sorter: {
                path: path,
                desc: desc,
                mode: mode,
                type: type,
            },
        });
    };
    const handleColumnFilterChange = (column, value) => {
        let columnFilter = _.cloneDeep(
            _.get(annotatorState, ["filter", "column"], {})
        );
        if (columnFilter.hasOwnProperty(column)) {
            if (columnFilter[column].includes(value))
                columnFilter[column] = columnFilter[column].filter(
                    (filterValue) => filterValue !== value
                );
            else columnFilter[column].push(value);
        } else columnFilter[column] = [value];
        const keys = Object.keys(columnFilter);
        for (var i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (
                Array.isArray(columnFilter[key]) &&
                columnFilter[key].length === 0
            )
                delete columnFilter[key];
        }
        annotatorAction.onFilterChange({
            ...annotatorState.filter,
            column: columnFilter,
        });
    };
    useEffect(() => {
        let regions = [],
            indexes = [];
        annotatorState.data.map((datapoint, index) => {
            if (annotatorState.selectedDatapointIds.has(datapoint.uuid))
                indexes.push(index);
        });
        for (var i = 0; i < indexes.length; i++) {
            var startIndex = i,
                endIndex = i + 1;
            while (endIndex < indexes.length) {
                if (indexes[endIndex - 1] + 1 >= indexes[endIndex]) endIndex++;
                else break;
            }
            endIndex--;
            regions.push({
                cols: [
                    0,
                    _.get(annotatorState, ["columns", widgetMode], []).length -
                        1,
                ],
                rows: [indexes[startIndex] + 1, indexes[endIndex] + 1],
            });
            i = endIndex;
        }
        setHighlightedRegions(regions);
    }, [annotatorState.selectedDatapointIds]);
    const headerMenuRenderer = (column) => {
        if (column.key === "table-column-checkbox") {
            return (
                <Menu>
                    {/* <MenuDivider title="checkbox" />
                    <MenuItem
                        disabled
                        icon={faIcon({ icon: faTasks })}
                        text="Sort selected first"
                    /> */}
                    <MenuDivider title="Bulk select" />
                    <MenuItem
                        text="Recently updated"
                        onClick={() => annotatorAction.selectRecentlyUpdated()}
                    />
                    <MenuItem
                        text="With submit error"
                        onClick={() =>
                            annotatorAction.selectDataWithSubmissionError()
                        }
                    />
                </Menu>
            );
        } else if (column.name === "data")
            return (
                <Menu>
                    <MenuDivider title={column.name} />
                    <MenuItem
                        onClick={() =>
                            handleSortData({
                                path: "data",
                            })
                        }
                        icon={faIcon({ icon: SORT_ICONS.asc.string })}
                        text="Sort asc."
                    />
                    <MenuItem
                        onClick={() =>
                            handleSortData({
                                path: "data",
                                desc: true,
                            })
                        }
                        icon={faIcon({
                            icon: SORT_ICONS.desc.string,
                        })}
                        text="Sort desc."
                    />
                </Menu>
            );
        else {
            return (
                <Menu>
                    <MenuDivider title={column.name} />
                    <MenuItem
                        onClick={() => {
                            if (widgetMode === "annotating") {
                                handleSortData({
                                    path: [
                                        "annotation_list",
                                        0,
                                        "labels_record",
                                        column.name,
                                    ],
                                    mode: "LABEL_VALUE",
                                });
                            } else if (widgetMode === "reconciling") {
                                handleSortData({
                                    mode: "reconciling",
                                });
                            }
                        }}
                        icon={faIcon({
                            icon: SORT_ICONS["asc"][column.labelOptionType],
                        })}
                        text={`Sort asc.`}
                    />
                    <MenuItem
                        onClick={() => {
                            if (widgetMode === "annotating") {
                                handleSortData({
                                    path: [
                                        "annotation_list",
                                        0,
                                        "labels_record",
                                        column.name,
                                    ],
                                    desc: true,
                                    mode: "LABEL_VALUE",
                                });
                            } else if (widgetMode === "reconciling") {
                                handleSortData({
                                    desc: true,
                                    mode: "reconciling",
                                });
                            }
                        }}
                        icon={faIcon({
                            icon: SORT_ICONS["desc"][column.labelOptionType],
                        })}
                        text={`Sort desc.`}
                    />
                    <MenuDivider title="Filter by" />
                    {_.get(
                        annotatorState,
                        ["labelNameOptions", column.name],
                        []
                    ).length === 0 ? (
                        <MenuItem
                            disabled
                            text={`No ${
                                column.tagging ? "tag" : "label"
                            } option`}
                        />
                    ) : null}
                    {_.get(
                        annotatorState,
                        ["labelNameOptions", column.name],
                        []
                    ).map((option, index) => {
                        return (
                            <MenuItem
                                key={`table-column-${column.name}-filter-by-menuitem-label-${index}`}
                                onClick={() =>
                                    handleColumnFilterChange(
                                        column.name,
                                        option.value
                                    )
                                }
                                icon={
                                    _.get(
                                        annotatorState,
                                        ["filter", "column", column.name],
                                        []
                                    ).includes(option.value) ? (
                                        faIcon({
                                            icon: faCheck,
                                            style: { color: GREEN_CHECK_COLOR },
                                        })
                                    ) : (
                                        <Icon icon="blank" />
                                    )
                                }
                                labelElement={
                                    <span
                                        style={{
                                            fontWeight: "bolder",
                                        }}
                                    >
                                        {option.value}
                                    </span>
                                }
                                text={option.text}
                            />
                        );
                    })}
                </Menu>
            );
        }
    };
    const MIN_COLUMN_WIDTH = 55;
    const INITIAL_COLUMNS = [
        {
            ...DEFAULT_COLUMN_CELL_ATTR,
            key: "table-column-last-submitted",
            visible: true,
            width: MIN_COLUMN_WIDTH,
            cellRenderer: ({ rowIndex }) => (
                <LastSubmittedCell rowIndex={rowIndex} />
            ),
        },
        {
            key: "table-column-checkbox",
            visible: true,
            cellStyle: {
                lineHeight: DEFAULT_ROW_HEIGHT_PX,
                marginLeft: 5,
            },
            width: MIN_COLUMN_WIDTH,
            headerMenu: true,
            cellRenderer: ({ rowIndex, state }) => {
                return (
                    <Checkbox
                        large
                        checked={state.selectedDatapointIds.has(
                            state.data[rowIndex].uuid
                        )}
                        style={{ margin: 0, marginLeft: 2 }}
                        onChange={(event) => {
                            annotatorAction.setSelectedRowIndex({
                                rowIndex: rowIndex,
                                checked: event.target.checked,
                            });
                        }}
                    />
                );
            },
        },
        {
            ...DEFAULT_COLUMN_CELL_ATTR,
            key: "table-column-data",
            visible: true,
            name: "data",
            width: 300,
            headerMenu: true,
            cellRenderer: ({ rowIndex }) => (
                <Popover2
                    key={`table-row-data-popover2-${rowIndex}`}
                    className="full-parent-width"
                    position="top-left"
                    minimal
                    interactionKind={Popover2InteractionKind.HOVER_TARGET_ONLY}
                    content={
                        <div
                            className="popover2-content-view-dimension"
                            style={{
                                padding: 10,
                                overflow: "hidden",
                            }}
                        >
                            <SpanLevel
                                isInPopover={true}
                                mode="view"
                                rowIndex={rowIndex}
                            />
                        </div>
                    }
                >
                    <div
                        onDoubleClick={() => {
                            annotatorAction.setStateByKey({
                                key: "dataFocusIndex",
                                value: rowIndex,
                            });
                            setView("single");
                        }}
                        style={{ overflow: "hidden", height: "100%" }}
                    >
                        <SpanLevel
                            isTableCell={true}
                            mode="view"
                            rowIndex={rowIndex}
                        />
                    </div>
                </Popover2>
            ),
        },
    ];
    useEffect(() => {
        var newColumns = INITIAL_COLUMNS;
        const labelSchemas = _.get(annotatorState, LABEL_SCHEMA_OKP, []);
        var numOfVisibleColumns = 0;
        for (var i = 0; i < labelSchemas.length; i++) {
            const schema = labelSchemas[i];
            if (schema.level !== RECORD_LEVEL_SCHEMA_KEY) continue;
            var labelOptionType = null;
            for (var j = 0; j < schema.options.length; j++) {
                const option = schema.options[j];
                labelOptionType = typeof option.value;
            }
            var visibility = true;
            if (widgetMode === "reconciling") {
                if (numOfVisibleColumns >= 1 || schema.tagging === true)
                    visibility = false;
                if (visibility) {
                    annotatorAction.setStateByKey({
                        key: "reconciliation",
                        value: {
                            ...annotatorState.reconciliation,
                            currentLabel: schema.name,
                        },
                    });
                }
            }
            numOfVisibleColumns += 1;
            newColumns.push({
                ...DEFAULT_COLUMN_CELL_ATTR,
                key: `table-column-${schema.name}`,
                visible: visibility,
                name: schema.name,
                headerMenu: true,
                batchAssign: true,
                tagging: schema.tagging === true,
                labelOptionType: labelOptionType,
                cellRenderer: ({ rowIndex }) => (
                    <RecordLevelColumnCellContent
                        rowIndex={rowIndex}
                        labelName={schema.name}
                    />
                ),
            });
        }
        newColumns.push({
            ...DEFAULT_COLUMN_CELL_ATTR,
            key: "table-column-metadata-popover-view",
            visible: true,
            width: 300,
            name: "metadata",
            headerMenu: false,
            cellRenderer: ({ rowIndex }) => (
                <MetadataCell rowIndex={rowIndex} />
            ),
        });
        newColumns.push({
            ...DEFAULT_COLUMN_CELL_ATTR,
            key: "table-column-reconciliation-summary",
            visible: widgetMode === "reconciling",
            width: 300,
            headerMenu: false,
            cellRenderer: ({ rowIndex }) => (
                <ReconciliationSummaryCell rowIndex={rowIndex} />
            ),
        });
        annotatorAction.setStateByKey({
            key: "columns",
            value: {
                ...annotatorState.columns,
                annotating: _.cloneDeep(newColumns),
                reconciling: _.cloneDeep(newColumns),
            },
        });
    }, [annotatorState.config.label_schema]);
    const ColumnSorterIndicator = ({ columnName }) => {
        if (columnName === undefined) return null;
        const sorter = annotatorState.filter.sorter;
        if (sorter !== undefined) {
            var pathEnd = null;
            if (sorter.mode === "DIRECT_VALUE") {
                pathEnd = sorter.path;
            } else if (sorter.mode === "LABEL_VALUE") {
                pathEnd = sorter.path[sorter.path.length - 1];
            }
            if (pathEnd === columnName)
                return (
                    <Icon
                        icon={faIcon({
                            style: { marginRight: 3 },
                            icon: sorter.desc ? faCaretDown : faCaretUp,
                        })}
                    />
                );
        }
        return null;
    };
    useEffect(() => {
        var newColumns = _.cloneDeep(
            _.get(annotatorState, ["columns", widgetMode], null)
        );
        if (_.isNull(newColumns)) return;
        for (var i = 0; i < newColumns.length; i++) {
            if (newColumns[i].key === "table-column-reconciliation-summary") {
                newColumns[i].visible = widgetMode === "reconciling";
                break;
            }
        }
        if (widgetMode === "reconciling") {
            const currentReconcilingColumn = _.get(
                annotatorState,
                ["reconciliation", "currentLabel"],
                null
            );
            for (var i = 0; i < newColumns.length; i++) {
                if (
                    !_.isNil(newColumns[i].name) &&
                    !_.includes(FIXED_COLUMN, newColumns[i].name)
                )
                    newColumns[i].visible = false;
            }
            for (var i = 0; i < newColumns.length; i++) {
                if (
                    (!_.isNull(currentReconcilingColumn) &&
                        _.isEqual(
                            newColumns[i].name,
                            currentReconcilingColumn
                        )) ||
                    (_.isNull(currentReconcilingColumn) &&
                        !_.isNil(newColumns[i].name) &&
                        !_.includes(FIXED_COLUMN, newColumns[i].name))
                ) {
                    annotatorAction.setStateByKey({
                        key: "reconciliation",
                        value: {
                            ...annotatorState.reconciliation,
                            currentLabel: newColumns[i].name,
                        },
                    });
                    newColumns[i].visible = true;
                    break;
                }
            }
        }
        annotatorAction.setStateByKey({
            key: "columns",
            value: {
                ...annotatorState.columns,
                [widgetMode]: newColumns,
            },
        });
    }, [widgetMode]);
    useEffect(() => {
        fetchReconciliationAnnotations();
    }, [annotatorState.data]);
    const fetchReconciliationAnnotations = () => {
        if (widgetMode !== "reconciling") return;
        var uuids = _.get(annotatorState, "data", []).map(
            (element) => element.uuid
        );
        const tempReconciliation = _.get(
            annotatorState,
            "reconciliation.data",
            {}
        );
        uuids = uuids.filter(
            (currentId) =>
                _.get(tempReconciliation, currentId, undefined) === undefined
        );
        if (uuids.length === 0) return;
        const batchLimit = 45;
        for (var i = 0; i < uuids.length; i++) {
            var idsToFetch = [],
                counter = 0;
            while (i < uuids.length && counter < batchLimit) {
                counter++;
                idsToFetch.push(uuids[i++]);
            }
            i--;
            annotatorAction.buildReconciliationMap(idsToFetch);
            const get_reconciliation_data_command = `${_.get(
                annotatorState,
                "ipy_interface.service"
            )}.get_reconciliation_data(uuid_list=['${idsToFetch.join(
                "','"
            )}'])`;
            ipy_function(get_reconciliation_data_command)
                .then((result) => {
                    const reconciliation_data = JSON.parse(result);
                    annotatorAction.buildReconciliationMap(reconciliation_data);
                })
                .catch((error) => {
                    actionToaster.show(
                        createToast({
                            intent: Intent.DANGER,
                            action: {
                                text: "Copy code",
                                icon: faIcon({ icon: faPython }),
                                onClick: () =>
                                    copy(get_reconciliation_data_command),
                            },
                            message: (
                                <div>
                                    <div>
                                        Can't get reconciliation data; the
                                        operation couldn't be completed.
                                        <br />
                                        {error}
                                    </div>
                                </div>
                            ),
                        })
                    );
                });
        }
    };
    if (
        _.isEmpty(_.get(annotatorState, "data", [])) &&
        !_.isEmpty(annotatorState.filter.query)
    )
        return <NoSearchResult />;
    return (
        <Table2
            selectedRegions={highlightedRegions}
            selectionModes={SelectionModes.ROWS_AND_CELLS}
            key={tableKey}
            numRows={_.get(annotatorState, "data", []).length + 1}
            defaultRowHeight={DEFAULT_ROW_HEIGHT + 1}
            numFrozenColumns={Math.min(
                _.get(annotatorState, ["columns", widgetMode], []).length,
                3
            )}
            numFrozenRows={1}
            enableRowResizing={false}
            enableColumnReordering
            columnWidths={_.get(annotatorState, ["columns", widgetMode], [])
                .filter((column) => column.visible)
                .filter((column) => {
                    return (
                        widgetMode !== "reconciling" || column.tagging !== true
                    );
                })
                .map((column) => (column.width ? column.width : 150))}
            minColumnWidth={MIN_COLUMN_WIDTH}
            onColumnWidthChanged={(index, size) => {
                var actualIndex = index;
                const columns = _.get(
                    annotatorState,
                    ["columns", widgetMode],
                    []
                );
                for (var i = 0; i < columns.length; i++) {
                    var isHidden =
                        columns[i].visible == false ||
                        (widgetMode === "reconciling" &&
                            columns[i].tagging === true);
                    if (isHidden) if (actualIndex >= i) actualIndex += 1;
                }
                annotatorAction.setStateByKey({
                    key: "columns",
                    value: {
                        ...annotatorState.columns,
                        [widgetMode]: columns.map((column, columnIndex) => {
                            if (columnIndex === actualIndex)
                                column.width = size;
                            return column;
                        }),
                    },
                });
            }}
            onColumnsReordered={(oldIndex, newIndex, length) => {
                var actualOldIndex = oldIndex,
                    actualNewIndex = newIndex;
                var columns = _.cloneDeep(
                    _.get(annotatorState, ["columns", widgetMode], [])
                );
                for (var i = 0; i < columns.length; i++) {
                    var isHidden =
                        columns[i].visible == false ||
                        (widgetMode === "reconciling" &&
                            columns[i].tagging === true);
                    if (isHidden) {
                        if (actualOldIndex >= i) actualOldIndex += 1;
                        if (actualNewIndex >= i) actualNewIndex += 1;
                    }
                }
                if (actualOldIndex === actualNewIndex) return;
                const newColumns = Utils.reorderArray(
                    columns,
                    actualOldIndex,
                    actualNewIndex,
                    length
                );
                annotatorAction.setStateByKey({
                    key: "columns",
                    value: {
                        ...annotatorState.columns,
                        [widgetMode]: newColumns,
                    },
                });
            }}
            rowHeaderCellRenderer={(rowIndex) => {
                return (
                    <HeaderCell>
                        <div
                            className="bp3-table-row-name"
                            style={{
                                textAlign: "center",
                                minWidth: 40,
                                lineHeight: DEFAULT_ROW_HEIGHT_PX,
                            }}
                        >
                            {rowIndex === 0 ? null : rowIndex}
                        </div>
                    </HeaderCell>
                );
            }}
        >
            {_.get(annotatorState, ["columns", widgetMode], [])
                .filter((column) => column.visible)
                .filter((column) => {
                    return (
                        widgetMode !== "reconciling" || column.tagging !== true
                    );
                })
                .map((column, index) => {
                    const isDataColumn = _.isEqual(column.name, "data"),
                        isMetadataColumn = _.isEqual(column.name, "metadata");
                    return (
                        <Column
                            key={`table-column-${column.key}-col-${index}`}
                            columnHeaderCellRenderer={() => (
                                <ColumnHeaderCell
                                    key={`table-column-header-cell-${column.key}`}
                                    className="column-header-initial-pointer-event"
                                    nameRenderer={() => (
                                        <div
                                            style={{
                                                paddingRight: column.headerMenu
                                                    ? 24
                                                    : 10,
                                                marginTop: 1,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            <ColumnSorterIndicator
                                                columnName={column.name}
                                            />
                                            {column.name === undefined ? (
                                                <span>&nbsp;</span>
                                            ) : (
                                                column.name
                                            )}
                                            {column.headerMenu ? (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        right: 10,
                                                        top: -1,
                                                    }}
                                                >
                                                    <Popover2
                                                        placement="bottom"
                                                        content={headerMenuRenderer(
                                                            column
                                                        )}
                                                    >
                                                        <Button
                                                            small
                                                            minimal
                                                            style={{
                                                                marginTop: 1,
                                                            }}
                                                            icon={faIcon({
                                                                icon: faAngleDown,
                                                            })}
                                                        />
                                                    </Popover2>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                />
                            )}
                            cellRenderer={(rowIndex, columnIndex) => {
                                if (rowIndex === 0)
                                    return (
                                        <Cell>
                                            <div
                                                style={{
                                                    height: 37,
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                {column.key ===
                                                "table-column-checkbox" ? (
                                                    <div
                                                        style={{
                                                            marginLeft: 5,
                                                        }}
                                                    >
                                                        <Checkbox
                                                            large
                                                            disabled={
                                                                annotatorState
                                                                    .data
                                                                    .length ===
                                                                0
                                                            }
                                                            indeterminate={
                                                                annotatorState
                                                                    .selectedDatapointIds
                                                                    .size > 0 &&
                                                                annotatorState
                                                                    .data
                                                                    .length !==
                                                                    annotatorState
                                                                        .selectedDatapointIds
                                                                        .size
                                                            }
                                                            checked={
                                                                annotatorState.tableCheckboxChecked
                                                            }
                                                            onChange={(
                                                                event
                                                            ) => {
                                                                annotatorAction.setTableCheckboxChecked(
                                                                    event.target
                                                                        .checked
                                                                );
                                                            }}
                                                            style={{
                                                                margin: 0,
                                                                marginLeft: 2,
                                                            }}
                                                        />
                                                    </div>
                                                ) : null}
                                                {column.batchAssign ? (
                                                    <Popover2
                                                        className="full-parent-width"
                                                        minimal
                                                        position="bottom"
                                                        content={
                                                            <Menu>
                                                                <MenuDivider
                                                                    title={`${
                                                                        column.tagging
                                                                            ? "Tag"
                                                                            : "Label"
                                                                    } as`}
                                                                />
                                                                {_.get(
                                                                    annotatorState,
                                                                    [
                                                                        "labelNameOptions",
                                                                        column.name,
                                                                    ],
                                                                    []
                                                                ).length ===
                                                                0 ? (
                                                                    <MenuItem
                                                                        disabled
                                                                        text={`No ${
                                                                            column.tagging
                                                                                ? "tag"
                                                                                : "label"
                                                                        } option`}
                                                                    />
                                                                ) : null}
                                                                {_.get(
                                                                    annotatorState,
                                                                    [
                                                                        "labelNameOptions",
                                                                        column.name,
                                                                    ],
                                                                    []
                                                                ).map(
                                                                    (
                                                                        option,
                                                                        index
                                                                    ) => (
                                                                        <MenuItem
                                                                            key={`table-batch-assign-col-${column.name}-menuitem-label-${index}`}
                                                                            onClick={() => {
                                                                                if (
                                                                                    widgetMode ===
                                                                                    "reconciling"
                                                                                ) {
                                                                                    annotatorAction.batchSetReconciliationLabel(
                                                                                        {
                                                                                            type: column.name,
                                                                                            value: option.value,
                                                                                        }
                                                                                    );
                                                                                } else if (
                                                                                    widgetMode ===
                                                                                    "annotating"
                                                                                ) {
                                                                                    annotatorAction.batchSetRecordLevelLabel(
                                                                                        {
                                                                                            type: column.name,
                                                                                            value: option.value,
                                                                                        }
                                                                                    );
                                                                                }
                                                                            }}
                                                                            labelElement={
                                                                                <span
                                                                                    style={{
                                                                                        fontWeight:
                                                                                            "bolder",
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        option.value
                                                                                    }
                                                                                </span>
                                                                            }
                                                                            text={
                                                                                option.text
                                                                            }
                                                                        />
                                                                    )
                                                                )}
                                                                <MenuDivider />
                                                                <MenuItem
                                                                    onClick={() => {
                                                                        annotatorAction.batchSetRecordLevelLabel(
                                                                            {
                                                                                type: column.name,
                                                                                value: null,
                                                                            }
                                                                        );
                                                                    }}
                                                                    text={`Remove ${
                                                                        column.tagging
                                                                            ? "tags"
                                                                            : "labels"
                                                                    }`}
                                                                    intent={
                                                                        Intent.DANGER
                                                                    }
                                                                />
                                                            </Menu>
                                                        }
                                                    >
                                                        <Button
                                                            disabled={
                                                                annotatorState
                                                                    .selectedDatapointIds
                                                                    .size === 0
                                                            }
                                                            minimal
                                                            outlined
                                                            icon={faIcon({
                                                                icon: column.tagging
                                                                    ? faTags
                                                                    : faListCheck,
                                                            })}
                                                            fill
                                                            text={`Bulk ${
                                                                column.tagging
                                                                    ? "tag"
                                                                    : "label"
                                                            }`}
                                                            intent="primary"
                                                        />
                                                    </Popover2>
                                                ) : null}
                                            </div>
                                        </Cell>
                                    );
                                return (
                                    <Cell
                                        style={{
                                            padding:
                                                isDataColumn || isMetadataColumn
                                                    ? 0
                                                    : null,
                                        }}
                                    >
                                        <div
                                            className={classNames({
                                                "table-cell-highlight-on-hover":
                                                    isDataColumn,
                                                "table-cell-metadata":
                                                    isMetadataColumn,
                                            })}
                                            style={{
                                                ...column.cellStyle,
                                                ...(isDataColumn ||
                                                isMetadataColumn
                                                    ? {
                                                          padding: `0px ${
                                                              isMetadataColumn
                                                                  ? 9
                                                                  : 10
                                                          }px`,
                                                      }
                                                    : {}),
                                            }}
                                        >
                                            {column.cellRenderer.call(
                                                {},
                                                {
                                                    rowIndex: rowIndex - 1,
                                                    columnIndex: columnIndex,
                                                    state: annotatorState,
                                                    widgetMode: widgetMode,
                                                }
                                            )}
                                        </div>
                                    </Cell>
                                );
                            }}
                        />
                    );
                })}
        </Table2>
    );
};
