// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    status: "loading", //fulfill
    city: null,
};

export const locationReducer = createSlice({
    name: "city",
    initialState,
    reducers: {
        setCity: (state, action) => {
            state.status = "fulfill";
            state.city = action.payload.data;
        }
    }

    //     switch(type) {
    //         case ActionTypes.SET_CITY:
    //     return {
    //         status: "fulfill",
    //         city: payload,
    //     };

    //     default:
    //             return state;
    // }
});

export const { setCity } = locationReducer.actions;
export default locationReducer.reducer;