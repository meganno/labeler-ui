import { createContext, useReducer } from "react";
import _ from "lodash";
const AuthenticationContext = createContext();
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
        case "SET_USER":
            nonBlockingipySetCallback(
                state,
                "ipySetIdToken",
                payload === null ? "" : payload.accessToken
            );
            return {
                ...state,
                user: payload,
            };
        default:
            return { ...state };
    }
};
const initialState = {
    provider: null,
    ipySetIdToken: null,
    user: null,
};
const AuthenticationProvider = (props) => {
    const [authenticationState, dispatch] = useReducer(reducer, initialState);
    const action = {
        setStateByKey: (keyValue) =>
            dispatch({ type: "SET_STATE_BY_KEY", payload: keyValue }),
        setUser: (user) => dispatch({ type: "SET_USER", payload: user }),
    };
    return (
        <AuthenticationContext.Provider
            value={{
                authenticationState: authenticationState,
                authenticationAction: action,
            }}
        >
            {props.children}
        </AuthenticationContext.Provider>
    );
};
export { AuthenticationProvider, AuthenticationContext };
