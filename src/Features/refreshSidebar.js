import { createSlice } from "@reduxjs/toolkit";

const refreshSidebar = createSlice({
  name: "refreshSidebar",
  initialState: false,
  reducers: {
    refreshSidebarFun: (state) => !state, // toggles boolean
  },
});

export const { refreshSidebarFun } = refreshSidebar.actions;
export default refreshSidebar.reducer;
