import { combineReducers } from 'redux';
import authSlice from '../slices/authSlice';
import admissionSlice from '../slices/admissionSlice';
import scholarshipSlice from '../slices/scholarshipSlice';
import chatSlice from '../slices/chatSlice';
import { programsApi } from '../api/programApi';
import { userApi } from '../api/userApi';
import { universitiesApi } from '../api/universitiesApi';
import { contactApi } from '../api/contactApi';
import { applicationsApi } from '../api/applicationApi';
import { specializationsApi } from '../api/specializationApi';
import { compareFiltersApi } from '../api/compareFiltersApi';
import { scholarshipsApi } from '../api/scholarshipApi';
import { chatApi } from '../api/chatApi';
import { analyticsApi } from '../api/analyticsApi';
import { majorApi } from '../api/majorApi';
import { notificationsApi } from '../api/notificationsApi';
import { externalApplicationApi } from '../api/externalApplication';
import { admissionProgramsApi } from '../api/admissionProgramsApi';
import { feeStructureApi } from '../api/feeStructureApi';
import { programsApi as programsApiLegacy } from '../api/programApiLagacy';
import { campusesApi } from '../api/campusesApi';
import { statsApi } from '../api/statsApi';

const rootReducer = combineReducers({
  auth: authSlice,
  admission: admissionSlice,
  scholarship: scholarshipSlice,
  chat: chatSlice,
  [programsApi.reducerPath]: programsApi.reducer,
  [specializationsApi.reducerPath]: specializationsApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [applicationsApi.reducerPath]: applicationsApi.reducer,
  [universitiesApi.reducerPath]: universitiesApi.reducer,
  [contactApi.reducerPath]: contactApi.reducer,
  [compareFiltersApi.reducerPath]: compareFiltersApi.reducer,
  [scholarshipsApi.reducerPath]: scholarshipsApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [analyticsApi.reducerPath]: analyticsApi.reducer,
  [majorApi.reducerPath]: majorApi.reducer,
  [notificationsApi.reducerPath]: notificationsApi.reducer,
  [externalApplicationApi.reducerPath]: externalApplicationApi.reducer,
  [admissionProgramsApi.reducerPath]: admissionProgramsApi.reducer,
  [feeStructureApi.reducerPath]: feeStructureApi.reducer,
  [programsApiLegacy.reducerPath]: programsApiLegacy.reducer,
  [campusesApi.reducerPath]: campusesApi.reducer,
  [statsApi.reducerPath]: statsApi.reducer
});

export default rootReducer;
