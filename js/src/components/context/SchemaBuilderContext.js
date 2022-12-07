import { createContext, useReducer } from "react";
import _ from "lodash";
import { mergeUpdateLabelSchema } from "../../reducers/schema";
const SchemaBuilderContext = createContext();
const nonBlockingipySetCallback = (state, functionKey, payload) => {
    setTimeout(() => {
        if (state[functionKey] !== null) state[functionKey](payload);
    }, 0);
};
const reducer = (state, action) => {
    const { payload, type } = action;
    switch (type) {
        case "SET_STATE_BY_KEY":
            const { key, value } = payload;
            return { ...state, [key]: value };
        case "SET_LABEL_SCHEMA":
            var newCount = { ...state.count };
            for (var i = 0; i < payload.length; i++) {
                const curSchema = payload[i];
                if (curSchema.level === "record") newCount.record += 1;
                else if (["span_ch"].includes(curSchema.level))
                    newCount.span += 1;
            }
            nonBlockingipySetCallback(state, "ipySetLabelSchema", payload);
            return { ...state, labelSchema: payload, count: newCount };
        case "REMOVE_LABEL_SCHEMA":
            const { labelName, order } = payload;
            const removedLabelSchema = state.labelSchema.filter(
                (label, index) =>
                    label.label_name !== labelName || index !== order
            );
            nonBlockingipySetCallback(
                state,
                "ipySetLabelSchema",
                removedLabelSchema
            );
            return {
                ...state,
                labelSchema: removedLabelSchema,
            };
        case "ADD_LABEL_SCHEMA":
            const { level } = payload;
            const addedLabelSchema = [
                ...state.labelSchema,
                {
                    label_name: "",
                    level: level,
                    options: [],
                },
            ];
            nonBlockingipySetCallback(
                state,
                "ipySetLabelSchema",
                addedLabelSchema
            );
            return {
                ...state,
                labelSchema: addedLabelSchema,
            };
        case "UPDATE_LABEL_SCHEMA":
            var updatedLabelSchema = [...state.labelSchema];
            for (var i = 0; i < updatedLabelSchema.length; i++) {
                const target = updatedLabelSchema[i];
                if (
                    payload.order === i &&
                    target.label_name === payload.labelName
                ) {
                    updatedLabelSchema[i] = mergeUpdateLabelSchema(
                        payload.label,
                        target
                    );
                }
            }
            nonBlockingipySetCallback(
                state,
                "ipySetLabelSchema",
                updatedLabelSchema
            );
            return {
                ...state,
                labelSchema: updatedLabelSchema,
            };
    }
};
const initialState = {
    labelSchema: [],
    count: {
        span: 0,
        record: 0,
    },
    ipySetLabelSchema: null,
};
const SchemaBuilderProvider = (props) => {
    const [schemaBuilderState, dispatch] = useReducer(reducer, initialState);
    const action = {
        setStateByKey: (keyValue) =>
            dispatch({ type: "SET_STATE_BY_KEY", payload: keyValue }),
        setLabelSchema: (labelSchema) =>
            dispatch({ type: "SET_LABEL_SCHEMA", payload: labelSchema }),
        removeLabelSchema: (payload) =>
            dispatch({ type: "REMOVE_LABEL_SCHEMA", payload: payload }),
        addLabelSchema: (payload) =>
            dispatch({ type: "ADD_LABEL_SCHEMA", payload: payload }),
        updateLabelSchema: (payload) =>
            dispatch({ type: "UPDATE_LABEL_SCHEMA", payload: payload }),
    };
    return (
        <SchemaBuilderContext.Provider
            value={{
                schemaBuilderState: schemaBuilderState,
                schemaBuilderAction: action,
            }}
        >
            {props.children}
        </SchemaBuilderContext.Provider>
    );
};
export { SchemaBuilderProvider, SchemaBuilderContext };
