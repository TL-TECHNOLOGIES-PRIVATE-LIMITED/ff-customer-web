// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: "loading", //fulfill
    shop: null,
};

export const shopReducer = createSlice({
    name: "shop",
    initialState,
    reducers: {
        setShop: (state, action) => {
            state.status = "fulfill";
            state.shop = action.payload.data;
        }
    }
    // switch (type) {
    //     case ActionTypes.SET_SHOP:
    //         return {
    //             status: "fulfill",
    //             shop: payload,
    //         };

    //     default:
    //         return state;
    // }
});
export const { setShop } = shopReducer.actions;
export default shopReducer.reducer;