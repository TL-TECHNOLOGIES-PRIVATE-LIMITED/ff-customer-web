// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: 'loading', //fulfill
    notification: null,
};

export const notificationReducer = createSlice({
    name: "notification",
    initialState,
    reducers: {
        setNotification: (state, action) => {
            state.status = "fulfill";
            state.notification = action.payload.data;
        }
    }
    // switch (type) {
    //     case ActionTypes.SET_NOTIFICATION:
    //         return {
    //             ...state,
    //             status: "fulfill",
    //             notification: payload,
    //         };

    //     default:
    //         return state;
    // }
});

export const { setNotification } = notificationReducer.actions;
export default notificationReducer.reducer;