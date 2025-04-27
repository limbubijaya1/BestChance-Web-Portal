import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    id: null,
    username: "",
    // Add other user fields as needed
  },
  reducers: {
    setUser(state, action) {
      const { user_id, username } = action.payload;
      state.id = user_id;
      state.username = username;
    },
    clearUser(state) {
      state.id = null;
      state.username = "";
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
