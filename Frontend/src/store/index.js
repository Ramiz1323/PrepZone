import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import trackerReducer from './slices/trackerSlice';
import mistakesReducer from './slices/mistakesSlice';
import revisionReducer from './slices/revisionSlice';
import practiceReducer from './slices/practiceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    tracker: trackerReducer,
    mistakes: mistakesReducer,
    revision: revisionReducer,
    practice: practiceReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
