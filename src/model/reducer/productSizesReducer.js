// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: 'loading', //fulfill
    sizes: null,
};

export const productSizesReducer = createSlice({

    name: "productSizes",
    initialState,
    reducers: {
        setProductSizes: (state, action) => {
            state.status = "fulfill";
            state.sizes = action.payload.data;
        }
    }
    //     switch(type) {
    //         case ActionTypes.SET_PRODUCT_SIZES:
    //     return {
    //         ...state,
    //         status: "fulfill",
    //         sizes: payload,
    //     };

    //     default:
    //             return state;
    // }
});


export const { setProductSizes } = productSizesReducer.actions;
export default productSizesReducer.reducer;