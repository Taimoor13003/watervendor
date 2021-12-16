import { createSlice } from '@reduxjs/toolkit';  

const slice = createSlice({
    name: "Options", 
    initialState: {
        value: "" ,
        id : ''
      },
    reducers: {
        ChangeCompany: (state , action) => {
          console.log(action , 'ACTION' )
            state.value = action.payload.title
            state.id = action.payload.id
          },
        
    }
  });

  export const { ChangeCompany } = slice.actions 

  export const reducer = slice.reducer;