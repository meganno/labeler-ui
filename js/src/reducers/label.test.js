import _ from "lodash";
import { reducer } from "../components/context/AnnotatorContext";
const dummy_data = [
    { annotation_list: [], data: "text 1", uuid: 1 },
    { annotation_list: [], data: "text 2", uuid: 2 },
    { annotation_list: [], data: "text 3", uuid: 3 },
    { annotation_list: [], data: "text 4", uuid: 4 },
    { annotation_list: [], data: "text 5", uuid: 5 },
];
const dummy_label = {
    label_name: "test_label",
    label_value: ["test_value"],
};
describe("Annotation setters", () => {
    test("1. [BATCH_SET_RECORD_LEVEL_LABEL] sets multiple data points with the same label", () => {
        var data = _.cloneDeep(dummy_data);
        const action = {
            type: "BATCH_SET_RECORD_LEVEL_LABEL",
            payload: {
                type: "test_label",
                value: "test_value",
            },
        };

        const initialState = {
            tagSchemaNames: new Set(),
            selectedDatapointIds: new Set([1, 2, 3]),
            originalData: dummy_data,
            data: dummy_data,
        };
        for (var i = 0; i < data.length; i++) {
            if (initialState.selectedDatapointIds.has(data[i].uuid)) {
                data[i].annotation_list = [
                    {
                        annotator: "labeler-ui",
                        labels_record: [dummy_label],
                    },
                ];
            }
        }
        expect(reducer(initialState, action)).toEqual({
            ...initialState,
            recentlyUpdatedDataIds: initialState.selectedDatapointIds,
            data: data,
            originalData: data,
        });
    });
    test("2. [SET_NEW_LABEL] sets 1 data point with a span label", () => {
        var data = _.cloneDeep(dummy_data);
        const initialState = {
            dataFocusIndex: 0,
            data: dummy_data,
            originalData: dummy_data,
        };
        const label = {
            ...dummy_label,
            start_idx: 0,
            end_idx: 2,
        };
        const action = {
            type: "SET_NEW_LABEL",
            payload: {
                path: ["labels_span_ch"],
                label: label,
            },
        };
        data[0].annotation_list = [
            {
                annotator: "labeler-ui",
                labels_span_ch: [label],
            },
        ];
        expect(reducer(initialState, action)).toEqual({
            ...initialState,
            data: data,
            originalData: data,
            recentlyUpdatedDataIds: new Set([1]),
        });
    });
});
