// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    status: "loading", //fulfill
    current_language: null,
    available_languages: null
};

export const languageReducer = createSlice({
    name: "language",
    initialState,
    reducers: {
        setLanguage: (state, action) => {
            state.status = "fulfill";
            state.current_language = action.payload.data;
        },
        setLanguageList: (state, action) => {
            state.state = "fulfill";
            state.available_languages = action.payload.data;
        }
    }
    // switch (type) {
    //     case ActionTypes.SET_LANGUAGE:
    //         return {
    //             ...state,
    //             status: "fulfill",
    //             current_language: payload,
    //         };
    //     case ActionTypes.SET_LANGUAGE_LIST:
    //         return {
    //             ...state,
    //             status: "fulfill",
    //             available_languages: payload,
    //         };

    //     default:
    //         return state;
    // }
});

export const { setLanguage, setLanguageList } = languageReducer.actions;
export const languageState = (state) => state.language;
export default languageReducer.reducer;