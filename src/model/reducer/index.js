import { combineReducers } from "@reduxjs/toolkit";
import locationReducer from "./locationReducer";
import cssmodeReducer from './cssmodeReducer';
import languageReducer from "./languageReducer";
import categoryReducer from "./categoryReducer";
import authReducer from './authReducer';
import productFilterReducer from "./productFilterReducer";
import selectedProductReducer from "./selectedProduct";
import cartReducer from './cartReducer';
import productSizesReducer from './productSizesReducer';
import favouriteReducer from "./favouriteReducer";
import shopReducer from "./shopReducer";
import notificationReducer from "./notificationReducer";
import addressReducer from "./addressReducer";
import settingReducer from "./settingReducer";
import promoReducer from "./promoReducer";

const reducers = combineReducers({
    city: locationReducer,
    cssmode: cssmodeReducer,
    shop: shopReducer,
    language: languageReducer,
    category: categoryReducer,
    user: authReducer,
    promoCode: promoReducer,
    productFilter: productFilterReducer,
    selectedProduct: selectedProductReducer,
    cart: cartReducer,
    favourite: favouriteReducer,
    productSizes: productSizesReducer,
    notification: notificationReducer,
    setting: settingReducer,
    address: addressReducer
});

export default reducers;