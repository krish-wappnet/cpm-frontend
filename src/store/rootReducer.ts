import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./slices/authSlice";
import userReducer, { resetState as resetUserState } from "./slices/userSlice";
import okrReducer from "./slices/okrSlice";
import kpiReducer from "./slices/kpiSlice";
import feedbackReducer from "./slices/feedbackSlice";

// Persist configuration for auth slice
const authPersistConfig = {
  key: "auth",
  storage,
};

// Combine all reducers
const appReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  users: userReducer,
  okrs: okrReducer,
  kpis: kpiReducer,
  feedback: feedbackReducer,
});

// Root reducer with state reset on logout
export const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: import("redux").AnyAction
) => {
  if (action.type === "auth/logout") {
    // Reset users state using the resetState action
    const newState = appReducer(state, resetUserState());
    // Clear other state as needed
    return {
      ...newState,
      auth: undefined,
    };
  }
  return appReducer(state, action);
};

// Export the RootState type
export type RootState = ReturnType<typeof rootReducer>;

// Export the persisted reducer
export default rootReducer;
