import _ from "lodash";
import { RECORD_LEVEL_LABEL_OKP } from "../components/constant";
export const updateOriginalDataFromSource = ({ updates, original }) => {
    let result = [];
    // "original" is already sorted because it starts as []
    updates.sort((a, b) => a.uuid < b.uuid);
    let original_idx = 0;
    let updates_idx = 0;
    while (original_idx < original.length && updates_idx < updates.length) {
        const t = original[original_idx];
        const u = updates[updates_idx];
        if (t.uuid == u.uuid) {
            original_idx++;
            updates_idx++;
            result.push(u);
        } else if (t.uuid < u.uuid) {
            original_idx++;
            result.push(t);
        } else {
            updates_idx++;
            result.push(u);
        }
    }
    for (; original_idx < original.length; original_idx++) {
        result.push(original[original_idx]);
    }
    for (; updates_idx < updates.length; updates_idx++) {
        result.push(updates[updates_idx]);
    }
    return result;
};
export const separateTaggings = ({ tagSchemaNames, datapoint }) => {
    let newDatapoint = _.cloneDeep(datapoint);
    const taggings = _.get(newDatapoint, RECORD_LEVEL_LABEL_OKP, []).filter(
        (label) => tagSchemaNames.has(label.label_name)
    );
    const newRecordLabels = _.get(
        newDatapoint,
        RECORD_LEVEL_LABEL_OKP,
        []
    ).filter((label) => !tagSchemaNames.has(label.label_name));
    let tags = {};
    for (var i = 0; i < taggings.length; i++) {
        const current = taggings[i];
        tags[current.label_name] = current.label_value;
    }
    if (!_.isEmpty(newRecordLabels)) {
        _.set(newDatapoint, RECORD_LEVEL_LABEL_OKP, newRecordLabels);
    }
    if (!_.isEmpty(tags)) {
        _.set(newDatapoint, "tags", tags);
    }
    return newDatapoint;
};
