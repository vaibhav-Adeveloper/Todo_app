// we will create a state that will tell us if the user is logged in user or logged out user.
// from this knowledge we can show different components to the user based on their auth status.
// for example if the user is logged in we can show them the todo list otherwise we can show them the login/signup page.
// we will also store the user info in the state so that we can use it in different parts of the app.

// from this knowledge we will perform "conditional rendering" in our components based on the auth status and user info.

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    userData: null,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        markAsLoggedInUser: (state, action) => {
            state.isAuthenticated = true;
            state.userData = action.payload; // assuming payload contains user info
        },
        markAsLoggedOutUser: (state) => {
            state.isAuthenticated = false;
            state.userData = null;
        }
    }
})

export const { markAsLoggedInUser, markAsLoggedOutUser } = authSlice.actions;

export default authSlice.reducer;