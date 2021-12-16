import { createSlice } from '@reduxjs/toolkit';
import axios from 'src/utils/axios';

const initialState = {
  selectedCompany: []
};

const slice = createSlice({
  name: 'selectedCompany',
  initialState,
  reducers: {
    setSelected(state, action) {
      const { selectedCompany } = action.payload;

      state.selectedCompany = selectedCompany;
    }
  }
});

export const reducer = slice.reducer;

export const setSelected = () => async (dispatch) => {
  const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/`);

  dispatch(slice.actions.setSelected(response.data));
};

export default slice;
