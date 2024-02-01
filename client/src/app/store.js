import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { reducer } from "./screenSharingReducer";
import { composeWithDevTools } from "@redux-devtools/extension";
import thunk from "redux-thunk";
export default configureStore({
  reducer: {
    screenSharing: reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
  composeWithDevTools,
});
