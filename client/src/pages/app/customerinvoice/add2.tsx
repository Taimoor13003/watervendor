// src/pages/app/customerinvoice/add2.tsx
import { useEffect, useMemo, useState } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import axios from 'axios'
import { useRouter } from 'next/router'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import PreviewCard from 'src/views/apps/invoice/preview/PreviewCard'
import PreviewActions from 'src/views/apps/invoice/preview/PreviewActions'
import toast from 'react-hot-toast'

const InvoiceAdd: React.FC = () => {
  const router = useRouter()
  const { customerid, startDate, endDate } = router.query
  const [loading, setLoading] = useState(false)

  // parse out all IDs from the `?customerid=` param (it may be "905,1723" etc)
  const bulkIds = useMemo(
    () => (typeof customerid === 'string' ? customerid.split(',').filter(Boolean) : []),
    [customerid]
  )
  const bulkIdsParam = useMemo(() => bulkIds.join(','), [bulkIds])

  // fetch grouped invoice data for each of those IDs
  const [invoiceData, setInvoiceData] = useState<Record<string, any[]>>({})

  useEffect(() => {
    if (!bulkIdsParam || !startDate || !endDate) return

    let active = true
    const fetchData = async () => {
      setLoading(true)
      try {
        const resp = await axios.get('/api/invoice', {
          params: {
            customerids: bulkIdsParam,
            startDate,
            endDate
          }
        })
        if (active) {
          setInvoiceData(resp.data)
        }
      } catch (err) {
        if (active) {
          toast.error('Error fetching grouped invoice data')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      active = false
    }
  }, [bulkIdsParam, startDate, endDate])

  const handleBulkPrint = () => {
    if (!bulkIds.length) return
    router.push(
      `/apps/invoice/print?customerids=${bulkIds.join(',')}` +
      `&startdate=${encodeURIComponent(startDate as string)}` +
      `&enddate=${encodeURIComponent(endDate as string)}`
    )
  }

  if (loading) {
    return <div>Loading...</div>
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
                toggleAddPaymentDrawer={() => {/*…*/ }}
                toggleSendInvoiceDrawer={() => {/*…*/ }}
              />
            </Grid>
          </Grid>
        ))}
      </Grid>
    </DatePickerWrapper>
  )
}

export default InvoiceAdd
