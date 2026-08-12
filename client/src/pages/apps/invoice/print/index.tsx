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

// This route is intentionally available as a standalone print view. Requiring
// the application shell's auth guard here leaves it permanently on its loader
// when opened from the invoice preview or a print/download link.
InvoicePrint.authGuard = false

export default InvoicePrint
