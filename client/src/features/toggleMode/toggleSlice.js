import { createSlice } from "@reduxjs/toolkit";

const getSavedTheme = () => {
    try {
        return localStorage.getItem("todo-theme") === "dark";
    } catch {
        return false;
    }
};

const initialState = {
    isDarkMode: getSavedTheme(),
}

export const toggleSlice = createSlice({
    name: 'toggleMode',
    initialState,
    reducers: {
        toggleDarkMode: (state) => {
            state.isDarkMode = !state.isDarkMode;
        }
    }
})

export const { toggleDarkMode } = toggleSlice.actions;

export default toggleSlice.reducer;