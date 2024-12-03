import { createSlice } from '@reduxjs/toolkit';

const promoCodeSlice = createSlice({
    name: 'promoCode',
    initialState: {
        code: null,
        discount: 0,
        isPromoCode: false
    },
    reducers: {
        setPromoCode: (state, action) => {
            state.code = action.payload.code;
            state.discount = action.payload.discount;
            state.isPromoCode = action.payload.isPromoCode
        },
    },
});

export const { setPromoCode } = promoCodeSlice.actions;
export default promoCodeSlice.reducer;