import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  scholarshipId: null
};

const scholarshipSlice = createSlice({
  name: 'scholarship',
  initialState,
  reducers: {
    setScholarshipId: (state, action) => {
      state.scholarshipId = action.payload;
    },

    clearScholarshipId: (state) => {
      state.scholarshipId = null;
    },

    resetScholarshipState: () => initialState
  }
});

export const { resetScholarshipState, clearScholarshipId, setScholarshipId } =
  scholarshipSlice.actions;

export default scholarshipSlice.reducer;
