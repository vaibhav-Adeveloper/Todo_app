import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import todoReducer from '../features/todo/todoSlice';
import toggleReducer from '../features/toggleMode/toggleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    todo: todoReducer,
    toggle: toggleReducer
  },
}); 