// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    status: "loading", //fulfill
    cssmode: "light",
};

export const cssmodeReducer = createSlice({
    name: "cssmode",
    initialState,
    reducers: {
        setCSSMode: (state, action) => {
            state.status = "fulfill";
            state.cssmode = action.payload.data;
        }
    }
});

export const { setCSSMode } = cssmodeReducer.actions;
export default cssmodeReducer.reducer;