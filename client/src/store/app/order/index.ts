// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

// ** Types
import { Dispatch } from 'redux'
import {
  OrderType,
  UpdateOrderLabelType,
  FetchOrderParamsType,
  UpdateOrderParamsType,
  PaginateOrderParamsType
} from 'src/types/app/orderTypes'

interface ReduxType {
  getState: any
  dispatch: Dispatch<any>
}

// ** Fetch Orders
export const fetchOrders = createAsyncThunk('appOrder/fetchOrders', async (params: FetchOrderParamsType) => {
  const response = await axios.get('/app/order/orders', {
    params
  })

  return { ...response.data, filter: params }
})

// ** Get Current Order
export const getCurrentOrder = createAsyncThunk('appOrder/selectOrder', async (id: number | string) => {
  const response = await axios.get('/app/order/get-order', {
    params: {
      id
    }
  })

  return response.data
})

// ** Update Order
export const updateOrder = createAsyncThunk(
  'appOrder/updateOrder',
  async (params: UpdateOrderParamsType, { dispatch, getState }: ReduxType) => {
    const response = await axios.post('/app/order/update-orders', {
      data: { orderIds: params.orderIds, dataToUpdate: params.dataToUpdate }
    })

    await dispatch(fetchOrders(getState().order.filter))
    if (Array.isArray(params.orderIds)) {
      await dispatch(getCurrentOrder(params.orderIds[0]))
    }

    return response.data
  }
)

// ** Update Order Label
export const updateOrderLabel = createAsyncThunk(
  'appOrder/updateOrderLabel',
  async (params: UpdateOrderLabelType, { dispatch, getState }: ReduxType) => {
    const response = await axios.post('/app/order/update-orders-label', {
      data: { orderIds: params.orderIds, label: params.label }
    })

    await dispatch(fetchOrders(getState().order.filter))

    if (Array.isArray(params.orderIds)) {
      await dispatch(getCurrentOrder(params.orderIds[0]))
    }

    return response.data
  }
)

// ** Prev/Next Orders
export const paginateOrder = createAsyncThunk('appOrder/paginateOrder', async (params: PaginateOrderParamsType) => {
  const response = await axios.get('/app/order/paginate-order', { params })

  return response.data
})

export const appOrderSlice = createSlice({
  name: 'appOrder',
  initialState: {
    mails: null,
    mailMeta: null,
    filter: {
      q: '',
      label: '',
      folder: 'inbox'
    },
    currentOrder: null,
    selectedOrders: []
  },
  reducers: {
    handleSelectOrder: (state, action) => {
      const mails: any = state.selectedOrders
      if (!mails.includes(action.payload)) {
        mails.push(action.payload)
      } else {
        mails.splice(mails.indexOf(action.payload), 1)
      }
      state.selectedOrders = mails
    },
    handleSelectAllOrder: (state, action) => {
      const selectAllOrders: number[] = []
      if (action.payload && state.mails !== null) {
        selectAllOrders.length = 0

        // @ts-ignore
        state.mails.forEach((mail: OrderType) => selectAllOrders.push(mail.id))
      } else {
        selectAllOrders.length = 0
      }
      state.selectedOrders = selectAllOrders as any
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchOrders.fulfilled, (state, action) => {
      state.mails = action.payload.orders
      state.filter = action.payload.filter
      state.mailMeta = action.payload.ordersMeta
    })
    builder.addCase(getCurrentOrder.fulfilled, (state, action) => {
      state.currentOrder = action.payload
    })
    builder.addCase(paginateOrder.fulfilled, (state, action) => {
      state.currentOrder = action.payload
    })
  }
})

export const { handleSelectOrder, handleSelectAllOrder } = appOrderSlice.actions

export default appOrderSlice.reducer
