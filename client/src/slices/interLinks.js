import { createSlice } from '@reduxjs/toolkit';
import objFromArray from 'src/utils/objFromArray';


const initialState = {
    showModal: { status: false, title: '', child: '' },
    accounts: [],
    vendors: [],
    reloadParent : false
};

const slice = createSlice({
    name: 'interLinks',
    initialState,
    reducers: {
        modalStatus(state, action) {
            state.showModal = action.payload
        },
        saveAccounts(state, action) {
            state.accounts = action.payload
        },
        editAccounts(state, action) {
            state.accounts[action.payload.index] = action.payload.data
        },
        deleteAccounts(state, action) {
            state.accounts[action.payload.index] = action.payload.data
            state.reloadParent = !state.reloadParent
        },
        saveVendors(state, action) {
            state.vendors = action.payload
        },
    }
})


export const reducer = slice.reducer

export const { modalStatus, saveAccounts, saveVendors, editAccounts, deleteAccounts } = slice.actions
