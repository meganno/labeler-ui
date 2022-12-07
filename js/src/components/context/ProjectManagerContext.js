import _ from "lodash";
import { createContext, useReducer } from "react";
const ProjectManagerContext = createContext();
const reducer = (state, action) => {
    const { payload, type } = action;
    switch (type) {
        case "SET_STATE_BY_KEY":
            const { key, value } = payload;
            return { ...state, [key]: value };
        case "SET_SERVER_STATUS":
            var newServerStatus = { ...state.serverStatus };
            _.set(newServerStatus, payload.path, payload.value);
            return { ...state, serverStatus: newServerStatus };
        case "ADD_STACK":
            var nextStackIds = [...state.stackIds];
            if (!nextStackIds.includes(payload["stack_id"]))
                nextStackIds.push(payload["stack_id"]);
            var newStackMap = { ...state.stackMap };
            _.set(newStackMap, payload["stack_id"], payload["project_name"]);
            return {
                ...state,
                stackIds: nextStackIds,
                stackMap: newStackMap,
            };
        default:
            return { ...state };
    }
};
const initialState = {
    serverStatus: {},
    stackIds: [],
    stackMap: {},
};
const ProjectManagerProvider = (props) => {
    const [projectManagerState, dispatch] = useReducer(reducer, initialState);
    const action = {
        setStateByKey: (keyValue) =>
            dispatch({ type: "SET_STATE_BY_KEY", payload: keyValue }),
        setServerStatus: (payload) =>
            dispatch({ type: "SET_SERVER_STATUS", payload: payload }),
        addStack: (payload) =>
            dispatch({ type: "ADD_STACK", payload: payload }),
    };
    return (
        <ProjectManagerContext.Provider
            value={{
                projectManagerState: projectManagerState,
                projectManagerAction: action,
            }}
        >
            {props.children}
        </ProjectManagerContext.Provider>
    );
};
export { ProjectManagerProvider, ProjectManagerContext };
