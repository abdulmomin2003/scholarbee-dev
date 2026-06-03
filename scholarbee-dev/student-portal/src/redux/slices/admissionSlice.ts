/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProgramsApi } from '@/endpoints/programs';
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction
} from '@reduxjs/toolkit';

export type AdmissionContextIds = {
  campusId: string | null;
  programId: string | null;
  admissionId: string | null;
  admissionProgramId: string | null;
  universityId: string | null;
  departmentId: string | null;
};

interface Program {
  id: string;
  name: string;
  degree_level: string;
  major: string;
  duration: string;
  credit_hours: number;
}

interface Department {
  id: string;
  name: string;
  process_fee: number;
  head: string;
  contact_email: string;
  contact_phone: string;
  programs: Program[];
}

interface AdmissionState {
  campusId: string | null;
  programId: string | null;
  admissionId: string | null;
  admissionProgramId: string | null;
  applicationId: string | null;
  departments: Department[];
  programs: any[];
  loading: boolean;
  error: string;
  departmentId: string | null;
  universityId: string | null;
}

const transformApiDataToDepartments = (apiResponse: any): Department[] => {
  const departmentsMap = new Map<string, Department>();

  apiResponse.docs.forEach((doc: any) => {
    const program = doc.program;
    const department = program.academic_departments;

    if (department) {
      if (!departmentsMap.has(department.id)) {
        departmentsMap.set(department.id, {
          id: department.id,
          name: department.name || 'Unknown Department',
          process_fee: 1000, // Default processing fee
          head: department.head_of_department || 'Not Specified',
          contact_email: department.contact_email || 'Not Available',
          contact_phone: department.contact_phone || 'Not Available',
          programs: []
        });
      }

      // Only add program if it's not already in the department
      const dept = departmentsMap.get(department.id);
      const programExists = dept?.programs.some((p) => p.id === program.id);

      if (!programExists && dept) {
        dept.programs.push({
          id: program.id,
          name: program.name,
          degree_level: program.degree_level,
          major: program.major,
          duration: program.duration,
          credit_hours: program.credit_hours
        });
      }
    }
  });

  return Array.from(departmentsMap.values());
};

export const fetchPrograms = createAsyncThunk(
  'admission/fetchPrograms',
  async (campusId: string, { rejectWithValue }) => {
    const programsApi = new ProgramsApi();
    try {
      const response = await programsApi.getCampusPrograms(campusId);
      const departments = transformApiDataToDepartments(response);
      return { departments, programs: response.docs };
    } catch (error) {
      console.error('Error fetching programs:', error);
      return rejectWithValue('Failed to fetch programs');
    }
  }
);

const initialState: AdmissionState = {
  campusId: null,
  programId: null,
  admissionId: null,
  admissionProgramId: null,
  applicationId: null,
  departments: [],
  programs: [],
  loading: false,
  error: '',
  universityId: null,
  departmentId: null
};

const admissionSlice = createSlice({
  name: 'admission',
  initialState,
  reducers: {
    setApplicationId: (state, action) => {
      state.applicationId = action.payload;
    },
    setCampusId: (state, action) => {
      state.campusId = action.payload;
    },
    setProgramId: (state, action) => {
      state.programId = action.payload;
    },
    setAdmissionId: (state, action) => {
      state.admissionId = action.payload;
    },
    setAdmissionProgramId: (state, action) => {
      state.admissionProgramId = action.payload;
    },
    setUniversityId: (state, action) => {
      state.universityId = action.payload;
    },
    setDepartmentId: (state, action) => {
      state.departmentId = action.payload;
    },
    setAdmissionContextIds: (
      state,
      action: PayloadAction<AdmissionContextIds>
    ) => {
      const p = action.payload;
      state.campusId = p.campusId ?? null;
      state.programId = p.programId ?? null;
      state.admissionId = p.admissionId ?? null;
      state.admissionProgramId = p.admissionProgramId ?? null;
      state.universityId = p.universityId ?? null;
      state.departmentId = p.departmentId ?? null;
      // New apply flow: prior application id belongs to another admission program.
      state.applicationId = null;
    },
    clearCampusId: (state) => {
      state.campusId = null;
    },
    clearDepartmentId: (state) => {
      state.departmentId = null;
    },
    clearProgramId: (state) => {
      state.programId = null;
    },
    clearAdmissionId: (state) => {
      state.admissionId = null;
    },
    clearApplicationId: (state) => {
      state.applicationId = null;
    },
    clearAdmissionProgramId: (state) => {
      state.admissionProgramId = null;
    },
    clearUniversityId: (state) => {
      state.universityId = null;
    },
    resetAdmissionState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrograms.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload.departments;
        state.programs = action.payload.programs;
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.departments = [];
      });
  }
});

export const {
  setCampusId,
  setAdmissionId,
  setProgramId,
  clearAdmissionId,
  clearProgramId,
  clearCampusId,
  setApplicationId,
  clearApplicationId,
  resetAdmissionState,
  clearAdmissionProgramId,
  setAdmissionProgramId,
  setUniversityId,
  clearUniversityId,
  setDepartmentId,
  clearDepartmentId,
  setAdmissionContextIds
} = admissionSlice.actions;

export default admissionSlice.reducer;
