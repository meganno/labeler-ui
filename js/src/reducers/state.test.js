import { reducer } from "../components/context/AnnotatorContext";
describe("Context state setters", () => {
    test("1. [SET_STATE_BY_KEY] sets the key and its state ", () => {
        const action = {
            type: "SET_STATE_BY_KEY",
            payload: {
                key: "pass",
                value: true,
            },
        };
        const initialState = { pass: false };
        expect(reducer(initialState, action)).toEqual({
            pass: true,
        });
    });
});
describe("Table checkbox actions", () => {
    const data = [{ uuid: 1 }, { uuid: 2 }];
    const initialGlobalState = {
        selectedDatapointIds: new Set(),
        data: data,
        tableCheckboxChecked: false,
    };
    const test1Expectation = {
        ...initialGlobalState,
        tableCheckboxChecked: true,
        selectedDatapointIds: new Set([1]),
    };
    test("1. [SET_SELECTED_ROW_INDEX] sets the selected row (partially checked)", () => {
        const action = {
            type: "SET_SELECTED_ROW_INDEX",
            payload: {
                rowIndex: 0,
                checked: true,
            },
        };
        const initialState = initialGlobalState;
        expect(reducer(initialState, action)).toEqual(test1Expectation);
    });
    const test2Expectation = {
        ...initialGlobalState,
        selectedDatapointIds: new Set([1, 2]),
        tableCheckboxChecked: true,
    };
    test("2. [SET_SELECTED_ROW_INDEX] sets the selected rows (all checked)", () => {
        const action = {
            type: "SET_SELECTED_ROW_INDEX",
            payload: {
                rowIndex: 1,
                checked: true,
            },
        };
        const initialState = test1Expectation;
        expect(reducer(initialState, action)).toEqual(test2Expectation);
    });
    const test3Expectation = {
        ...initialGlobalState,
        selectedDatapointIds: new Set([2]),
        tableCheckboxChecked: true,
    };
    test("3. [SET_SELECTED_ROW_INDEX] sets the selected row (1 unchecked)", () => {
        const action = {
            type: "SET_SELECTED_ROW_INDEX",
            payload: {
                rowIndex: 0,
                checked: false,
            },
        };
        const initialState = test2Expectation;
        expect(reducer(initialState, action)).toEqual(test3Expectation);
    });
    const test4Expectation = {
        data: data,
        selectedDatapointIds: new Set([1]),
        recentlyUpdatedDataIds: new Set([1]),
        tableCheckboxChecked: true,
    };
    test("4. [SELECT_RECENTLY_UPDATED] selects the recently updated row(s)", () => {
        const action = {
            type: "SELECT_RECENTLY_UPDATED",
        };
        const initialState = {
            data: data,
            selectedDatapointIds: new Set(),
            recentlyUpdatedDataIds: new Set([1]),
        };
        expect(reducer(initialState, action)).toEqual(test4Expectation);
    });
    const test5Expectation = {
        data: data,
        selectedDatapointIds: new Set([1, 2]),
        tableCheckboxChecked: true,
    };
    test("5. [SET_TABLE_CHECKBOX_CHECKED] checks all rows", () => {
        const action = {
            type: "SET_TABLE_CHECKBOX_CHECKED",
            payload: true,
        };
        const initialState = {
            data: data,
            selectedDatapointIds: new Set(),
        };
        expect(reducer(initialState, action)).toEqual(test5Expectation);
    });
    const test6Expectation = {
        data: data,
        selectedDatapointIds: new Set(),
        tableCheckboxChecked: false,
    };
    test("6. [SET_TABLE_CHECKBOX_CHECKED] unchecks all rows", () => {
        const action = {
            type: "SET_TABLE_CHECKBOX_CHECKED",
            payload: false,
        };
        const initialState = {
            data: data,
            selectedDatapointIds: new Set(),
        };
        expect(reducer(initialState, action)).toEqual(test6Expectation);
    });
});
describe("Reconciliation map", () => {
    const test1Expectation = {
        reconciliation: {
            data: {
                1: {},
                2: {},
                3: {},
            },
        },
    };
    test("1. [BUILD_RECONCILIATION_MAP] sets the querying annotation state", () => {
        const action = {
            type: "BUILD_RECONCILIATION_MAP",
            payload: ["1", "2", "3"],
        };
        const initialState = {
            reconciliation: { data: {} },
        };
        expect(reducer(initialState, action)).toEqual(test1Expectation);
    });
    test("2. [BUILD_RECONCILIATION_MAP] sets the fetched annotation state", () => {
        const action = {
            type: "BUILD_RECONCILIATION_MAP",
            payload: [
                {
                    uuid: "1",
                    annotation_list: [
                        {
                            annotator: "reconciliation",
                            labels_record: [
                                {
                                    label_name: "test_label",
                                    label_value: ["correct"],
                                },
                            ],
                        },
                    ],
                },
                { uuid: "2", annotation_list: [] },
            ],
        };
        const initialState = test1Expectation;
        expect(reducer(initialState, action)).toEqual({
            reconciliation: {
                data: {
                    1: {
                        test_label: { reconciliation: ["correct"] },
                    },
                    2: null,
                    3: {},
                },
            },
        });
    });
});
