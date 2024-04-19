// ** React Imports
import { useState, useEffect } from 'react'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'

// ** MUI Imports
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Types
import { RootState, AppDispatch } from 'src/store'
import { OrderLayoutType, OrderLabelColors } from 'src/types/app/orderTypes'

// ** Email App Component Imports
import OrderLog from 'src/views/app/order/OrderLog'

// import SidebarLeft from 'src/views/apps/order/SidebarLeft'
// import ComposePopup from 'src/views/apps/order/ComposePopup'

// ** Actions
import {
  fetchOrders,
  updateOrder,
  paginateOrder,
  getCurrentOrder,
  updateOrderLabel,
  handleSelectOrder,
  handleSelectAllOrder
} from 'src/store/app/order'

// ** Variables
const labelColors: OrderLabelColors = {
  private: 'error',
  personal: 'success',
  company: 'primary',
  important: 'warning'
}

const EmailAppLayout = ({ folder, label }: OrderLayoutType) => {
  // ** States
  const [query, setQuery] = useState<string>('')

  // const [composeOpen, setComposeOpen] = useState<boolean>(false)
  const [orderDetailsOpen, setOrderDetailsOpen] = useState<boolean>(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false)

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const dispatch = useDispatch<AppDispatch>()
  const lgAbove = useMediaQuery(theme.breakpoints.up('lg'))

  // const mdAbove = useMediaQuery(theme.breakpoints.up('md'))
  // const smAbove = useMediaQuery(theme.breakpoints.up('sm'))
  const hidden = useMediaQuery(theme.breakpoints.down('lg'))
  const store = useSelector((state: RootState) => state.order)

  // ** Vars
  // const leftSidebarWidth = 260
  const { skin, direction } = settings

  // const composePopupWidth = mdAbove ? 754 : smAbove ? 520 : '100%'
  const routeParams = {
    label: label || '',
    folder: folder || 'inbox'
  }

  useEffect(() => {
    // @ts-ignore
    dispatch(fetchOrders({ q: query || '', folder: routeParams.folder, label: routeParams.label }))
  }, [dispatch, query, routeParams.folder, routeParams.label])

  // const toggleComposeOpen = () => setComposeOpen(!composeOpen)
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: skin === 'bordered' ? 0 : 6,
        ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` })
      }}
    >
      {/* <SidebarLeft
        store={store}
        hidden={hidden}
        lgAbove={lgAbove}
        dispatch={dispatch}
        orderDetailsOpen={orderDetailsOpen}
        leftSidebarOpen={leftSidebarOpen}
        leftSidebarWidth={leftSidebarWidth}
        toggleComposeOpen={toggleComposeOpen}
        setOrderDetailsOpen={setOrderDetailsOpen}
        handleSelectAllOrder={handleSelectAllOrder}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
      /> */}
      <OrderLog
        query={query}
        store={store}
        hidden={hidden}
        lgAbove={lgAbove}
        dispatch={dispatch}
        setQuery={setQuery}
        direction={direction}
        updateOrder={updateOrder}
        routeParams={routeParams}
        labelColors={labelColors}
        paginateOrder={paginateOrder}
        getCurrentOrder={getCurrentOrder}
        updateOrderLabel={updateOrderLabel}
        orderDetailsOpen={orderDetailsOpen}
        handleSelectOrder={handleSelectOrder}
        setOrderDetailsOpen={setOrderDetailsOpen}
        handleSelectAllOrder={handleSelectAllOrder}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
      />
      {/* <ComposePopup
        mdAbove={mdAbove}
        composeOpen={composeOpen}
        composePopupWidth={composePopupWidth}
        toggleComposeOpen={toggleComposeOpen}
      /> */}
    </Box>
  )
}

export default EmailAppLayout
