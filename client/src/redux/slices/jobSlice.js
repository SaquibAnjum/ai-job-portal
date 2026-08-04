import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const res = await axios.get(`/api/v1/jobs?${queryParams}`);
  return res.data;
});

export const fetchJobById = createAsyncThunk('jobs/fetchJobById', async (id) => {
  const res = await axios.get(`/api/v1/jobs/${id}`);
  return res.data.data;
});

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    selectedJob: null,
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.selectedJob = action.payload;
      });
  },
});

export default jobSlice.reducer;
