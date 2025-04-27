import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice"; // Adjust the path as needed

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;
