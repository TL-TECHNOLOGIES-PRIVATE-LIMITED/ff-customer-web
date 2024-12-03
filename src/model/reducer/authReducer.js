// import { ActionTypes } from "../action-type";
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    status: "loading", //fulfill
    user: null,
    fcm_token: null,
    authId: "",
    jwtToken: "",
    authType: ""
};

export const authReducer = createSlice({
    name: "user",
    initialState,
    reducers: {
        setCurrentUser: (state, action) => {
            state.status = "fulfill";
            state.user = action.payload.data;
        },
        setAuthType: (state, action) => {
            state.status = "fulfill";
            state.authType = action.payload.data;
        },
        logoutAuth: (state, action) => {
            state.status = "loading";
            state.user = null;
            state.fcm_token = null;
            state.authId = "";
            state.jwtToken = "";
        },
        deductUserBalance: (state, action) => {
            if (state.user) {
                state.user.balance -= action.payload.data;
            }
        },
        addUserBalance: (state, action) => {
            if (state.user) {
                state.user.balance += action.payload.data;
            }
        },
        setFcmToken: (state, action) => {
            state.fcm_token = action.payload.data;
        },
        setAuthId: (state, action) => {
            state.authId = action.payload.data;
        },
        setJWTToken: (state, action) => {
            state.jwtToken = action.payload.data;
        }
    }
});

export const { setCurrentUser, logoutAuth, deductUserBalance, addUserBalance, setFcmToken, setAuthId, setJWTToken, setAuthType } = authReducer.actions;
export default authReducer.reducer;