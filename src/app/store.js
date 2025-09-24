import { configureStore } from '@reduxjs/toolkit';
import authReducer from "./../modules/Users/users.slice";

export const store = configureStore({
  reducer: {
    auth : authReducer,
  },
});