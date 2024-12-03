// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: "loading", //fulfill
    category: null,
};

export const categoryReducer = createSlice({
    name: "category",
    initialState,
    reducers: {
        setCategory: (state, action) => {
            state.status = "fulfill";
            state.category = action.payload.data;
        },
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload; // Set the selected category
        },
    }
    //     switch(type) {
    //         case ActionTypes.SET_CATEGORY:
    //     return {
    //         status: "fulfill",
    //         category: payload,
    //     }

    //         default:
    //             return state;
    // }
});

export const { setCategory, setSelectedCategory } = categoryReducer.actions;
export default categoryReducer.reducer;