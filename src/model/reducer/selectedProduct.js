// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    status: 'loading', //fulfill
    selectedProduct_id: null
};

export const selectedProductReducer = createSlice({
    name: "selectedProduct",
    initialState,
    reducers: {
        setSelectedProduct: (state, action) => {
            state.status = "fulfill";
            state.selectedProduct_id = action.payload.data;
        },
        clearSelectedProduct: (state, action) => {
            state.status = "fulfill";
            state.selectedProduct_id = null;
        }
    }
    //     switch(type) {
    //         case ActionTypes.SET_SELECTED_PRODUCT:
    //     return {
    //         ...state,
    //         status: "fulfill",
    //         selectedProduct_id: payload,
    //     };
    //     case ActionTypes.CLEAR_SELECTED_PRODUCT:
    //     return {
    //         ...state,
    //         status: "loading",
    //         selectedProduct_id: null,
    //     };
    //     default:
    //             return state;
    // }
});


export const { setSelectedProduct, clearSelectedProduct } = selectedProductReducer.actions;
export default selectedProductReducer.reducer;