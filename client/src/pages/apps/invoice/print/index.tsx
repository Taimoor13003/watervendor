import { ReactNode } from 'react'

import BlankLayout from 'src/@core/layouts/BlankLayout'

import PrintPage from 'src/views/apps/invoice/print/PrintPage'

const InvoicePrint = () => {
  
  return <PrintPage />
}

InvoicePrint.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

InvoicePrint.setConfig = () => {

  return {
    mode: 'light'
  }
}

export default InvoicePrint
