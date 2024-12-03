import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: 'loading', //fulfill
    address: null,
    selected_address: null
};

export const addressReducer = createSlice({
    name: "address",
    initialState,
    reducers: {
        setAddress: (state, action) => {
            state.address = action.payload.data;
            state.status = "fulfill";
        },
        setSelectedAddress: (state, action) => {
            state.selected_address = action.payload.data;
            state.status = "fulfill";

        }
    }
    // switch (type) {
    //     case ActionTypes.SET_ADDRESS:
    //         return {
    //             ...state,
    //             status: "fulfill",
    //             address: payload,
    //         };

    //     case ActionTypes.SET_SELECTED_ADDRESS:
    //         return {
    //             ...state,
    //             status: "fulfill",
    //             selected_address: payload,
    //         };
    //     default:
    //         return state;
    // }
});

export const {
    setAddress,
    setSelectedAddress
} = addressReducer.actions;



export default addressReducer.reducer;