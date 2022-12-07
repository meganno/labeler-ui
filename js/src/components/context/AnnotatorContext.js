import { createContext, useReducer } from "react";
import _ from "lodash";
import MiniSearch from "minisearch";
import isRegex from "is-regex";
import RegexParser from "regex-parser";
import {
    RECORD_LEVEL_SCHEMA_KEY,
    RECORD_LEVEL_LABEL_OKP,
    DEFAULT_ANNOTATOR,
    DEFAULT_LABEL_COLOR_PALETTE,
    MINIMUM_ANNOTATION_WIDGET_VIEW_HEIGHT,
    ipy_function,
} from "../constant";
import {
    separateTaggings,
    updateOriginalDataFromSource,
} from "../../reducers/data";
import { actionToaster, createToast } from "../toaster";
import { Intent } from "@blueprintjs/core";
import { faIcon } from "../icon";
import copy from "copy-to-clipboard";
import { faPython } from "@fortawesome/free-brands-svg-icons";
const AnnotatorContext = createContext();
const miniSearchOptions = {
    fields: ["data"],
    idField: "uuid",
};
const nonBlockingipySetCallback = (state, functionKey, payload) => {
    setTimeout(() => {
        if (!_.isNil(state[functionKey])) {
            state[functionKey](payload);
        }
    }, 0);
};
const isPotentialRegex = (s) => {
    try {
        const m = s.match(/^\/((?:\\\/|[^/])+)\/([gimsuy]{0,5})?$/);
        return m ? !!new RegExp(m[2], m[3]) : false;
    } catch (error) {
        return false;
    }
};
const reducer = (state, action) => {
    const { payload, type } = action;
    switch (type) {
        case "SET_CONFIG":
            let labelNameOptions = {},
                lastRecordLevelSchemaIndex = -1;
            var labelSchemas = _.get(payload, "label_schema", []);
            const tagSchemas = _.get(payload, "tag_schema", []);
            var existingLabelSchemas = new Set();
            for (var i = 0; i < labelSchemas.length; i++) {
                const schema = labelSchemas[i];
                existingLabelSchemas.add(schema.name);
                const labelName = _.get(schema, "name", null);
                const options = _.get(schema, "options", []);
                if (!(labelName === null || options.length === 0)) {
                    labelNameOptions[labelName] = options;
                }
                if (schema.level === RECORD_LEVEL_SCHEMA_KEY)
                    lastRecordLevelSchemaIndex = i;
            }
            let newTagSchemaNames = new Set();
            for (var i = 0; i < tagSchemas.length; i++) {
                const schema = tagSchemas[i];
                if (!existingLabelSchemas.has(schema.name)) {
                    labelSchemas.push({
                        name: schema.name,
                        level: "record",
                        options: schema.options,
                        tagging: true,
                    });
                    const name = _.get(schema, "name", null);
                    if (name !== null) newTagSchemaNames.add(name);
                    const options = _.get(schema, "options", []);
                    if (!(name === null || options.length === 0)) {
                        labelNameOptions[name] = options;
                    }
                }
            }
            _.set(payload, "label_schema", labelSchemas);
            var labelTagStyles = {};
            const labelNameOptionKeys = Object.keys(labelNameOptions);
            for (var i = 0; i < labelNameOptionKeys.length; i++) {
                const labelNameKey = labelNameOptionKeys[i];
                labelTagStyles[labelNameKey] = {};
                var newLabelOptions = labelNameOptions[labelNameKey];
                for (var j = 0; j < Math.min(10, newLabelOptions.length); j++) {
                    labelTagStyles[labelNameKey][newLabelOptions[j]["value"]] =
                        DEFAULT_LABEL_COLOR_PALETTE[j];
                }
            }
            if (
                _.isUndefined(payload.height) ||
                Number(payload.height) < MINIMUM_ANNOTATION_WIDGET_VIEW_HEIGHT
            ) {
                payload.height = MINIMUM_ANNOTATION_WIDGET_VIEW_HEIGHT;
            }
            return {
                ...state,
                config: payload,
                tagSchemaNames: newTagSchemaNames,
                lastRecordLevelSchemaIndex: lastRecordLevelSchemaIndex,
                labelNameOptions: labelNameOptions,
                labelTagStyles: labelTagStyles,
            };
        case "SET_DATA":
            if (payload === null) payload = [];
            let tempOriginalData = updateOriginalDataFromSource({
                updates: payload,
                original: state.originalData,
            });
            var metadataNames = new Set();
            for (var i = 0; i < payload.length; i++) {
                const metadata = _.get(payload, [i, "metadata"], []);
                for (var j = 0; j < metadata.length; j++) {
                    const metadataName = metadata[j].name;
                    if (!_.isNil(metadataName)) metadataNames.add(metadataName);
                }
            }
            nonBlockingipySetCallback(
                state,
                "ipySetData",
                tempOriginalData.map((datapoint) =>
                    separateTaggings({
                        datapoint: datapoint,
                        tagSchemaNames: state.tagSchemaNames,
                    })
                )
            );
            return {
                ...state,
                data: payload,
                originalData: tempOriginalData,
                metadataNames: metadataNames,
                dataFocusIndex:
                    payload.length === 0
                        ? -1
                        : Math.min(
                              payload.length - 1,
                              Math.max(0, state.dataFocusIndex)
                          ),
            };
        case "BATCH_SET_RECONCILIATION_LABEL":
            var nextReconciliationData = _.cloneDeep(state.reconciliation.data);
            let nextRecentlyUpdatedIds = _.get(
                state,
                "recentlyUpdatedDataIds",
                new Set()
            );
            const batchOnIds = Array.from(state.selectedDatapointIds);
            for (var i = 0; i < batchOnIds.length; i++) {
                const uuid = batchOnIds[i];
                nextRecentlyUpdatedIds.add(uuid);
                _.set(
                    nextReconciliationData,
                    [uuid, payload.type, "reconciliation"],
                    [payload.value]
                );
            }
            return {
                ...state,
                recentlyUpdatedDataIds: nextRecentlyUpdatedIds,
                reconciliation: {
                    ...state.reconciliation,
                    data: nextReconciliationData,
                },
            };
        case "BATCH_SET_RECORD_LEVEL_LABEL":
            let tempBatchData = _.cloneDeep(_.get(state, "data", []));
            let nextRecentlyUpdatedState = _.get(
                state,
                "recentlyUpdatedDataIds",
                new Set()
            );
            tempBatchData = tempBatchData.map((datapoint) => {
                if (state.selectedDatapointIds.has(datapoint.uuid)) {
                    var ipy_payload = {};
                    _.set(ipy_payload, "uuid", datapoint.uuid);
                    nextRecentlyUpdatedState.add(datapoint.uuid);
                    let didOverwrite = false;
                    let newlabelValues = _.get(
                        datapoint,
                        [...RECORD_LEVEL_LABEL_OKP],
                        []
                    )
                        .filter((label) => {
                            if (
                                payload.value === null &&
                                label.label_name === payload.type
                            )
                                return false;
                            return true;
                        })
                        .map((label) => {
                            if (label.label_name !== payload.type) return label;
                            didOverwrite = true;
                            label.label_value = [payload.value];
                            return label;
                        });
                    if (!didOverwrite && payload.value !== null) {
                        newlabelValues.push({
                            label_name: payload.type,
                            label_value: [payload.value],
                        });
                    }
                    _.set(
                        datapoint,
                        ["annotation_list", 0, "annotator"],
                        _.get(
                            state,
                            "config.annotator.user_id",
                            DEFAULT_ANNOTATOR.user_id
                        )
                    );
                    _.set(
                        datapoint,
                        [...RECORD_LEVEL_LABEL_OKP],
                        newlabelValues
                    );
                    _.set(
                        ipy_payload,
                        "labels",
                        _.get(datapoint, ["annotation_list", 0])
                    );
                    if (_.get(state, "hasSubmit", false)) {
                        const label_json_loads = `json.loads('${JSON.stringify(
                            ipy_payload.labels
                        )}')`;
                        const set_annotation_command = `${_.get(state, [
                            "ipy_interface",
                            "subset",
                        ])}.set_annotations(uuid='${
                            ipy_payload.uuid
                        }', labels=${label_json_loads})`;
                        ipy_function(set_annotation_command).catch((error) =>
                            actionToaster.show(
                                createToast({
                                    intent: Intent.DANGER,
                                    action: {
                                        text: "Copy code",
                                        icon: faIcon({ icon: faPython }),
                                        onClick: () =>
                                            copy(set_annotation_command),
                                    },
                                    message: (
                                        <div>
                                            Can't set annotations; the operation
                                            couldn't be completed.
                                            <br />
                                            {error}
                                        </div>
                                    ),
                                })
                            )
                        );
                    }
                }
                return datapoint;
            });
            let newOriginaBatchlData = updateOriginalDataFromSource({
                updates: tempBatchData,
                original: state.originalData,
            });
            nonBlockingipySetCallback(
                state,
                "ipySetData",
                newOriginaBatchlData.map((datapoint) =>
                    separateTaggings({
                        datapoint: datapoint,
                        tagSchemaNames: state.tagSchemaNames,
                    })
                )
            );
            return {
                ...state,
                data: tempBatchData,
                recentlyUpdatedDataIds: nextRecentlyUpdatedState,
                originalData: newOriginaBatchlData,
            };
        case "SET_NEW_LABEL":
            const { label } = payload;
            let tempData = _.cloneDeep(_.get(state, "data", []));
            const SET_PATH = [state.dataFocusIndex, "annotation_list", 0];
            const labelValues = _.get(
                tempData,
                [...SET_PATH, ...payload.path],
                []
            );
            if (label === null) {
                _.set(tempData, [...SET_PATH, ...payload.path], []);
            } else {
                _.set(
                    tempData,
                    [...SET_PATH, ...payload.path],
                    [...labelValues, label]
                );
            }
            _.set(
                tempData,
                [...SET_PATH, "annotator"],
                _.get(
                    state,
                    "config.annotator.user_id",
                    DEFAULT_ANNOTATOR.user_id
                )
            );
            let newOriginalData = updateOriginalDataFromSource({
                updates: tempData,
                original: state.originalData,
            });
            let tempRecentlyUpdatedState = _.get(
                state,
                "recentlyUpdatedDataIds",
                new Set()
            );
            const updatedUUID = _.get(
                tempData,
                [state.dataFocusIndex, "uuid"],
                null
            );
            if (updatedUUID !== null) {
                tempRecentlyUpdatedState.add(updatedUUID);
            }
            nonBlockingipySetCallback(state, "ipySetData", newOriginalData);
            return {
                ...state,
                data: tempData,
                originalData: newOriginalData,
                recentlyUpdatedDataIds: tempRecentlyUpdatedState,
            };
        case "SET_STATE_BY_KEY":
            const { key, value } = payload;
            return { ...state, [key]: value };
        case "SET_SELECTED_ROW_INDEX":
            var newSelectedDatapointIds = new Set(state.selectedDatapointIds);
            const id = _.get(state, ["data", payload.rowIndex, "uuid"], null);
            if (id !== null) {
                if (payload.checked) newSelectedDatapointIds.add(id);
                else newSelectedDatapointIds.delete(id);
            }
            return {
                ...state,
                selectedDatapointIds: newSelectedDatapointIds,
                tableCheckboxChecked: newSelectedDatapointIds.size > 0,
            };
        case "SET_TABLE_CHECKBOX_CHECKED":
            var newSelectedDatapointIds = new Set();
            if (payload)
                newSelectedDatapointIds = new Set(
                    state.data.map((datapoint) => datapoint.uuid)
                );
            return {
                ...state,
                tableCheckboxChecked: payload,
                selectedDatapointIds: newSelectedDatapointIds,
            };
        case "INDEX_DOCUMENTS":
            let indexedDocs = new Set(state.indexedDocuments);
            let newMiniSearch = new MiniSearch(miniSearchOptions);
            if (state.miniSearch !== null) newMiniSearch = state.miniSearch;
            const newDocs = payload.filter((doc) => !indexedDocs.has(doc.uuid));
            for (var i = 0; i < newDocs.length; i++) {
                const doc = newDocs[i];
                if (!_.isUndefined(doc.uuid)) indexedDocs.add(doc.uuid);
            }
            newMiniSearch.addAll(newDocs);
            return {
                ...state,
                isIndexingDocuments: false,
                miniSearch: newMiniSearch,
                indexedDocuments: indexedDocs,
            };
        case "ON_FILTER_CHANGE":
            const userQuery = _.isUndefined(payload.query) ? "" : payload.query;
            let filteredResult = [],
                isRegexQuery = false,
                searchMode = "fuzzy",
                searchTerms = [];
            if (userQuery.length === 0) {
                filteredResult = state.originalData;
            } else {
                isRegexQuery = false;
                try {
                    if (isPotentialRegex(userQuery))
                        isRegexQuery = isRegex(RegexParser(userQuery));
                } catch (error) {
                    actionToaster.show(
                        createToast({
                            intent: Intent.DANGER,
                            message: error.name + ": " + error.message,
                        })
                    );
                }
                const quoted =
                    userQuery.startsWith('"') && userQuery.endsWith('"');
                const exactMatchTerms = userQuery.match(
                    /((?<![\\])["])(?:[^"\\]*(?:\\.)?)*"/gmu
                );
                if (isRegexQuery) {
                    searchMode = "regex";
                    const regexQuery = RegexParser(userQuery);
                    let pushedTerms = new Set();
                    filteredResult = _.get(state, "originalData", []).filter(
                        (datapoint) => {
                            const matchedStrings =
                                datapoint.data.match(regexQuery);
                            if (matchedStrings !== null) {
                                for (
                                    var i = 0;
                                    i < matchedStrings.length;
                                    i++
                                ) {
                                    if (pushedTerms.has(matchedStrings[i]))
                                        continue;
                                    pushedTerms.add(matchedStrings[i]);
                                    searchTerms.push(matchedStrings[i]);
                                }
                            }
                            return regexQuery.test(datapoint.data);
                        }
                    );
                } else if (quoted && exactMatchTerms !== null) {
                    searchMode = "exact";
                    let terms = exactMatchTerms
                        .map((term) => term.slice(1, -1))
                        .filter((term) => term.trim().length > 0);
                    filteredResult = _.get(state, "originalData", []).filter(
                        (datapoint) => {
                            for (var i = 0; i < terms.length; i++) {
                                if (
                                    _.get(datapoint, "data", "")
                                        .toLowerCase()
                                        .indexOf(terms[i]) === -1
                                )
                                    return false;
                            }
                            return true;
                        }
                    );
                    searchTerms = terms;
                } else {
                    searchMode = "fuzzy";
                    const searchOptions = {
                        prefix: (term) => term.length >= 2,
                        fuzzy: (term) => (term.length > 3 ? 0.2 : null),
                    };
                    let result = state.miniSearch.search(
                        userQuery,
                        searchOptions
                    );
                    let filteredIds = [],
                        pushedTerms = new Set();
                    for (var i = 0; i < result.length; i++) {
                        filteredIds.push(result[i].id);
                        const docTerms = result[i].terms;
                        for (var j = 0; j < docTerms.length; j++) {
                            if (pushedTerms.has(docTerms[j])) continue;
                            pushedTerms.add(docTerms[j]);
                            searchTerms.push(docTerms[j]);
                        }
                    }
                    filteredResult = _.get(state, "originalData", []).filter(
                        (datapoint) =>
                            filteredIds.includes(datapoint.uuid) ||
                            datapoint.uuid === userQuery.trim()
                    );
                }
            }
            const currentLabel = _.get(
                state,
                "reconciliation.currentLabel",
                null
            );
            if (!_.isUndefined(payload.sorter)) {
                const { path, desc, type, mode } = payload.sorter;
                filteredResult.sort((left, right) => {
                    if (mode === "DIRECT_VALUE") {
                        const a = _.get(left, path, ""),
                            b = _.get(right, path, "");
                        if (type === "string") return a.localeCompare(b);
                    } else if (mode === "LABEL_VALUE") {
                        const truePath = path.slice(0, -1),
                            [labelName] = path.slice(-1);
                        const a = _.get(
                                _.get(left, truePath, []).filter(
                                    (cur) => cur.label_name === labelName
                                ),
                                [0, "label_value"],
                                []
                            ),
                            b = _.get(
                                _.get(right, truePath, []).filter(
                                    (cur) => cur.label_name === labelName
                                ),
                                [0, "label_value"],
                                []
                            );
                        for (var i = 0; i < Math.max(a.length, b.length); i++) {
                            const itemA = _.get(a, i, ""),
                                itemB = _.get(b, i, "");
                            if (type === "string")
                                return itemA.localeCompare(itemB);
                        }
                    } else if (mode === "reconciling") {
                        const leftId = _.get(left, "uuid", null),
                            rightId = _.get(right, "uuid", null);
                        if (
                            currentLabel !== null &&
                            leftId !== null &&
                            rightId !== null
                        ) {
                            const leftValue = _.get(
                                    state,
                                    [
                                        "reconciliation",
                                        "data",
                                        leftId,
                                        currentLabel,
                                        "reconciliation",
                                    ],
                                    []
                                ),
                                rightValue = _.get(
                                    state,
                                    [
                                        "reconciliation",
                                        "data",
                                        rightId,
                                        currentLabel,
                                        "reconciliation",
                                    ],
                                    []
                                );
                            for (
                                var i = 0;
                                i <
                                Math.max(leftValue.length, rightValue.length);
                                i++
                            ) {
                                const itemA = _.get(leftValue, i, ""),
                                    itemB = _.get(rightValue, i, "");
                                if (type === "string")
                                    return itemA.localeCompare(itemB);
                            }
                        }
                    }
                });
                if (desc) filteredResult = filteredResult.reverse();
            }
            if (!_.isUndefined(payload.column)) {
                filteredResult = filteredResult.filter((result) => {
                    let shouldInclude = [];
                    const payloadColumnKeys = Object.keys(payload.column);
                    for (var i = 0; i < payloadColumnKeys.length; i++) {
                        const labelType = payloadColumnKeys[i];
                        if (payload.column[labelType].length === 0)
                            shouldInclude.push(true);
                        else {
                            var recordLabels = [];
                            if (state.widgetMode === "annotating") {
                                recordLabels = _.get(
                                    result,
                                    [...RECORD_LEVEL_LABEL_OKP],
                                    []
                                );
                            } else if (state.widgetMode === "reconciling") {
                                recordLabels = _.get(
                                    state,
                                    [
                                        "reconciliation",
                                        "data",
                                        _.get(result, "uuid", null),
                                        labelType,
                                        "reconciliation",
                                    ],
                                    []
                                ).map((value) => ({
                                    label_name: labelType,
                                    label_value: [value],
                                }));
                            }
                            if (recordLabels.length === 0)
                                shouldInclude.push(false);
                            else {
                                let foundMatch = false;
                                for (var j = 0; j < recordLabels.length; j++) {
                                    const label = recordLabels[j];
                                    if (label.label_name === labelType) {
                                        foundMatch =
                                            _.intersection(
                                                label.label_value,
                                                payload.column[labelType]
                                            ).length > 0;
                                    }
                                }
                                shouldInclude.push(foundMatch);
                            }
                        }
                    }
                    return (
                        shouldInclude.length === 0 ||
                        shouldInclude.filter((state) => state === false)
                            .length === 0
                    );
                });
            }
            return {
                ...state,
                filter: {
                    ...state.filter,
                    mode: searchMode,
                    query: userQuery,
                    column: payload.column,
                    sorter: payload.sorter,
                    highlightWords: searchTerms,
                },
                ...(payload.justSort
                    ? {}
                    : { selectedDatapointIds: new Set() }),
                tableCheckboxChecked: false,
                dataFocusIndex: filteredResult.length === 0 ? -1 : 0,
                data: [...filteredResult],
            };
        case "UPDATE_SUBMISSION_AUDIT":
            let newSubmissionAudit = { ...state.submissionAudit };
            _.set(newSubmissionAudit, payload.uuid, {
                ...payload.content,
                timestamp: new Date(),
            });
            return {
                ...state,
                submissionAudit: newSubmissionAudit,
            };
        case "SET_RECENTLY_UPDATED_STATUS":
            let newRecentlyUpdatedState = _.get(
                state,
                "recentlyUpdatedDataIds",
                new Set()
            );
            if (!_.isNil(payload.uuids)) {
                if (payload.state === "updated") {
                    for (var i = 0; i < payload.uuids.length; i++) {
                        newRecentlyUpdatedState.add(payload.uuids[i]);
                    }
                } else if (payload.state === "submitted") {
                    for (var i = 0; i < payload.uuids.length; i++) {
                        newRecentlyUpdatedState.delete(payload.uuids[i]);
                    }
                }
            }
            return {
                ...state,
                recentlyUpdatedDataIds: newRecentlyUpdatedState,
            };
        case "SELECT_RECENTLY_UPDATED":
            const shouldAnyChecked = _.get(
                state,
                ["recentlyUpdatedDataIds"],
                new Set()
            );
            var intersection = new Set();
            for (var i = 0; i < state.data.length; i++) {
                const datapoint = state.data[i];
                const uuid = _.get(datapoint, "uuid", null);
                if (!_.isNil(uuid) && shouldAnyChecked.has(uuid)) {
                    intersection.add(datapoint.uuid);
                }
            }
            return {
                ...state,
                tableCheckboxChecked: intersection.size > 0,
                selectedDatapointIds: intersection,
            };
        case "SELECT_DATA_WITH_SUBMISSION_ERROR":
            var dataWithError = new Set();
            for (let auditKey in state.submissionAudit) {
                if (state.submissionAudit[auditKey]["state"] === "error")
                    dataWithError.add(auditKey);
            }
            return {
                ...state,
                selectedDatapointIds: dataWithError,
                tableCheckboxChecked: dataWithError.size > 0,
            };
        case "TRACK_NETWORK_REQUEST":
            let newState = { ...state };
            newState.networkRequests[payload.state] += payload.count;
            if (
                newState.networkRequests.queued ===
                newState.networkRequests.completed
            ) {
                newState.networkRequests.queued = 0;
                newState.networkRequests.completed = 0;
            }
            return newState;
        case "BUILD_RECONCILIATION_MAP":
            var newReconciliationState = _.cloneDeep(state.reconciliation.data);
            for (var i = 0; i < payload.length; i++) {
                const data = payload[i];
                if (_.isString(data)) {
                    // querying annotation
                    newReconciliationState[data] = {};
                } else if (_.isObject(data)) {
                    const annotation_list = _.get(data, ["annotation_list"]);
                    const uuid = _.get(data, "uuid", null);
                    if (uuid === null) continue;
                    var labels = _.get(newReconciliationState, [uuid], {});
                    if (labels === null) labels = {};
                    for (var j = 0; j < annotation_list.length; j++) {
                        const target = annotation_list[j];
                        if (_.isUndefined(target.annotator)) continue;
                        const annotation_labels = [
                            ..._.get(target, "labels_record", []),
                        ];
                        for (var k = 0; k < annotation_labels.length; k++) {
                            const cur_label = annotation_labels[k];
                            if (
                                _.isUndefined(cur_label.label_name) ||
                                _.isUndefined(cur_label.label_value)
                            )
                                continue;
                            _.set(
                                labels,
                                [cur_label.label_name, target.annotator],
                                cur_label.label_value
                            );
                        }
                    }
                    _.set(
                        newReconciliationState,
                        [uuid],
                        _.isEmpty(labels) ? null : labels
                    );
                }
            }
            return {
                ...state,
                reconciliation: {
                    ...state.reconciliation,
                    data: newReconciliationState,
                },
            };
        case "SET_IPY_SUBSET_ANNOTATIONS":
            if (_.get(state, "hasSubmit", false)) {
                const ipy_payload = payload;
                const label_json_loads = `json.loads('${JSON.stringify(
                    ipy_payload.labels
                )}')`;
                const set_annotation_command = `${_.get(state, [
                    "ipy_interface",
                    "subset",
                ])}.set_annotations(uuid='${
                    ipy_payload.uuid
                }', labels=${label_json_loads})`;
                ipy_function(set_annotation_command).catch((error) =>
                    actionToaster.show(
                        createToast({
                            intent: Intent.DANGER,
                            action: {
                                text: "Copy code",
                                icon: faIcon({ icon: faPython }),
                                onClick: () => copy(set_annotation_command),
                            },
                            message: (
                                <div>
                                    Can't set annotations; the operation
                                    couldn't be completed.
                                    <br />
                                    {error}
                                </div>
                            ),
                        })
                    )
                );
            }
        case "UPDATE_UID_MAPPING":
            return {
                ...state,
                uidMap: _.merge(state.uidMap, payload),
            };
        default:
            return { ...state };
    }
};
const initialState = {
    data: [],
    hasSubmit: false,
    columns: {},
    originalData: [],
    isIndexingDocuments: false,
    config: {},
    selectedDatapointIds: new Set(),
    dataFocusIndex: -1,
    lastRecordLevelSchemaIndex: -1,
    labelNameOptions: {},
    tagSchemaNames: new Set(),
    metadataNames: new Set(),
    tableCheckboxChecked: false,
    filter: {
        query: "",
        highlightWords: [],
    },
    labelTagStyles: {},
    indexedDocuments: new Set(),
    miniSearch: null,
    ipySetData: null,
    submissionAudit: {},
    recentlyUpdatedDataIds: new Set(),
    networkRequests: {
        completed: 0,
        queued: 0,
    },
    widgetMode: "annotating",
    reconciliation: {
        data: {},
        currentLabel: null,
    },
};
const AnnotatorProvider = (props) => {
    const [annotatorState, dispatch] = useReducer(reducer, initialState);
    const action = {
        trackNetworkRequest: (payload) =>
            dispatch({ type: "TRACK_NETWORK_REQUEST", payload: payload }),
        setConfig: (config) =>
            dispatch({ type: "SET_CONFIG", payload: config }),
        setData: (data) => dispatch({ type: "SET_DATA", payload: data }),
        updateSubmissionAudit: (payload) =>
            dispatch({ type: "UPDATE_SUBMISSION_AUDIT", payload: payload }),
        setSelectedRowIndex: (payload) =>
            dispatch({
                type: "SET_SELECTED_ROW_INDEX",
                payload: payload,
            }),
        buildReconciliationMap: (payload) => {
            var uids = new Set();
            for (var i = 0; i < payload.length; i++) {
                const data = payload[i];
                if (_.isObject(data)) {
                    const annotation_list = _.get(data, ["annotation_list"]);
                    for (var j = 0; j < annotation_list.length; j++) {
                        const target = annotation_list[j];
                        if (_.isUndefined(target.annotator)) continue;
                        uids.add(target.annotator);
                    }
                }
            }
            const get_user_names_command = `${_.get(
                annotatorState,
                "ipy_interface.service"
            )}.get_users_by_uid(uid_list=${JSON.stringify(Array.from(uids))})`;
            ipy_function(get_user_names_command).then((result) => {
                dispatch({
                    type: "UPDATE_UID_MAPPING",
                    payload: JSON.parse(result),
                });
            });
            dispatch({
                type: "BUILD_RECONCILIATION_MAP",
                payload: payload,
            });
        },
        setTableCheckboxChecked: (checked) =>
            dispatch({ type: "SET_TABLE_CHECKBOX_CHECKED", payload: checked }),
        onFilterChange: (filter) =>
            dispatch({ type: "ON_FILTER_CHANGE", payload: filter }),
        indexDocuments: (payload) =>
            dispatch({ type: "INDEX_DOCUMENTS", payload: payload }),
        setStateByKey: (keyValue) =>
            dispatch({ type: "SET_STATE_BY_KEY", payload: keyValue }),
        setNewLabel: (label) =>
            dispatch({ type: "SET_NEW_LABEL", payload: label }),
        selectDataWithSubmissionError: () =>
            dispatch({ type: "SELECT_DATA_WITH_SUBMISSION_ERROR" }),
        selectRecentlyUpdated: () =>
            dispatch({ type: "SELECT_RECENTLY_UPDATED" }),
        setRecentlyUpdatedStatus: (payload) =>
            dispatch({ type: "SET_RECENTLY_UPDATED_STATUS", payload: payload }),
        setIpySubsetAnnotations: (payload) =>
            dispatch({ type: "SET_IPY_SUBSET_ANNOTATIONS", payload: payload }),
        batchSetRecordLevelLabel: (payload) =>
            dispatch({
                type: "BATCH_SET_RECORD_LEVEL_LABEL",
                payload: payload,
            }),
        batchSetReconciliationLabel: (payload) => {
            dispatch({
                type: "BATCH_SET_RECONCILIATION_LABEL",
                payload: payload,
            });
        },
        updateUidMapping: (payload) =>
            dispatch({ type: "UPDATE_UID_MAPPING", payload: payload }),
    };
    return (
        <AnnotatorContext.Provider
            value={{
                annotatorState: annotatorState,
                annotatorAction: action,
            }}
        >
            {props.children}
        </AnnotatorContext.Provider>
    );
};
export { AnnotatorProvider, AnnotatorContext, reducer };
