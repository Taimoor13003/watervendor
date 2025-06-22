// src/pages/app/customerinvoice/add2.tsx
import { useEffect, useState, useCallback } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import axios from 'axios'
import { useRouter } from 'next/router'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import PreviewCard from 'src/views/apps/invoice/preview/PreviewCard'
import PreviewActions from 'src/views/apps/invoice/preview/PreviewActions'

const InvoiceAdd: React.FC = () => {
  const router = useRouter()
  const { customerid, startDate, endDate } = router.query

  // parse out all IDs from the `?customerid=` param (it may be "905,1723" etc)
  const bulkIds = typeof customerid === 'string'
    ? customerid.split(',').filter(Boolean)
    : []

  // fetch grouped invoice data for each of those IDs
  const [invoiceData, setInvoiceData] = useState<Record<string, any[]>>({})

  const fetchData = useCallback(async () => {
    if (!bulkIds.length || !startDate || !endDate) return
    try {
      const resp = await axios.get('/api/invoice', {
        params: {
          customerids: bulkIds.join(','),
          startDate,
          endDate
        }
      })
      setInvoiceData(resp.data)
    } catch (err) {
      console.error('Error fetching grouped invoice data:', err)
    }
  }, [bulkIds.join(','), startDate, endDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleBulkPrint = () => {
    if (!bulkIds.length) return
    router.push(
      `/apps/invoice/print?customerids=${bulkIds.join(',')}` +
      `&startdate=${encodeURIComponent(startDate as string)}` +
      `&enddate=${encodeURIComponent(endDate as string)}`
    )
  }

  return (
    <DatePickerWrapper sx={{ '& .react-datepicker-wrapper': { width: 'auto' } }}>
      <Button
        variant="contained"
        onClick={handleBulkPrint}
        disabled={!bulkIds.length}
        sx={{ mb: 4, ml: 2 }}
      >
        Print All Invoices
      </Button>

      <Grid container spacing={6}>
        {bulkIds.map(id => (
          <Grid container item xs={12} key={id} spacing={2}>
            <Grid item xl={9} md={8} xs={12}>
              {/* render the one‐customer invoice summary */}
              <PreviewCard data={invoiceData[id] || []} />
            </Grid>
            <Grid item xl={3} md={4} xs={12}>
              <PreviewActions
                id={id}
                startDate={startDate}
                endDate={endDate}
                toggleAddPaymentDrawer={() => {/*…*/}}
                toggleSendInvoiceDrawer={() => {/*…*/}}
              />
            </Grid>
          </Grid>
        ))}
      </Grid>
    </DatePickerWrapper>
  )
}

export default InvoiceAdd
