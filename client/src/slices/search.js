import { createSlice } from '@reduxjs/toolkit';
// import axios from 'src/utils/axios';


const slice = createSlice({ 
    name: "sidebar",
    initialState: {
        value: false
      }, 
    reducers: {
        show: state => {
            state.value = true
          },
        hide: state => {
            state.value = false
          },
    }
  });

  export const { show, hide } = slice.actions 

  export const reducer = slice.reducer;