// ** Demo Components Imports
// import Order from 'src/views/app/order/Order'
import TableServerSide from 'src/views/orders/table/Orders.TableServerSide'

const OrderApp = () => <TableServerSide />

OrderApp.contentHeightFixed = true // This is a custom attribute for the layout to set the content height to be fixed

export default OrderApp
