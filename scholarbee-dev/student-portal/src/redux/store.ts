import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  PERSIST,
  REHYDRATE
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './reducers/rootReducer';
import { programsApi } from './api/programApi';
import { userApi } from './api/userApi';
import { applicationsApi } from './api/applicationApi';
import { universitiesApi } from './api/universitiesApi';
import { contactApi } from './api/contactApi';
import { specializationsApi } from './api/specializationApi';
import { compareFiltersApi } from './api/compareFiltersApi';
import { scholarshipsApi } from './api/scholarshipApi';
import { chatApi } from './api/chatApi';
import { analyticsApi } from './api/analyticsApi';
import { majorApi } from './api/majorApi';
import { notificationsApi } from './api/notificationsApi';

const createNoopStorageWrapper = () => ({
  getItem() {
    return Promise.resolve(null);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setItem(key: string, value: any) {
    return Promise.resolve(value);
  },
  removeItem() {
    return Promise.resolve();
  }
});
import { externalApplicationApi } from './api/externalApplication';
import { admissionProgramsApi } from './api/admissionProgramsApi';
import { feeStructureApi } from './api/feeStructureApi';
import { programsApi as programsApiLegacy } from './api/programApiLagacy';
import { campusesApi } from './api/campusesApi';
import { statsApi } from './api/statsApi';

const persistConfig = {
  key: 'root',
  storage: typeof window !== 'undefined' ? storage : createNoopStorageWrapper(),
  whitelist: ['admission', 'auth', 'scholarship', 'chat']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [PERSIST, REHYDRATE],
        ignoredPaths: ['register']
      }
    }).concat(
      programsApi.middleware,
      specializationsApi.middleware,
      userApi.middleware,
      applicationsApi.middleware,
      universitiesApi.middleware,
      contactApi.middleware,
      compareFiltersApi.middleware,
      scholarshipsApi.middleware,
      chatApi.middleware,
      analyticsApi.middleware,
      majorApi.middleware,
      notificationsApi.middleware,
      externalApplicationApi.middleware,
      admissionProgramsApi.middleware,
      feeStructureApi.middleware,
      programsApiLegacy.middleware,
      campusesApi.middleware,
      statsApi.middleware
    )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);

export default store;
