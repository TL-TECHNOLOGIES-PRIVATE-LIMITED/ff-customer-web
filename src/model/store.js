import { applyMiddleware, configureStore } from "@reduxjs/toolkit";
import reducers from './reducer/index';
import {
    persistStore,
    persistReducer
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { thunk } from "redux-thunk";

const persistConfig = {
    key: 'root',
    storage,
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
    reducer: persistedReducer,
    // reducer:reducers,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false, // Disable ImmutableStateInvariantMiddleware
        serializableCheck: false, // Disable SerializableStateInvariantMiddleware
        applyMiddleware: thunk
    }),

});

const Persiststore = persistStore(store);
export { Persiststore };

export default store;