// src/pages/app/customerinvoice/add2.tsx
import { useEffect, useMemo, useState } from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import axios from 'axios'
import { useRouter } from 'next/router'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import PreviewCard from 'src/views/apps/invoice/preview/PreviewCard'
import PreviewActions from 'src/views/apps/invoice/preview/PreviewActions'
import toast from 'react-hot-toast'
import { firebaseAuth } from 'src/services/firebase.service'

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
  const customerNames = (invoiceData.__customerNames as unknown as Record<string, string>) || {}
  const invoiceCustomerIds = useMemo(
    () => bulkIds.filter(id => Array.isArray(invoiceData[id]) && invoiceData[id].length > 0),
    [bulkIds, invoiceData]
  )
  const customersWithoutInvoices = useMemo(
    () => bulkIds.filter(id => !Array.isArray(invoiceData[id]) || invoiceData[id].length === 0),
    [bulkIds, invoiceData]
  )

  useEffect(() => {
    if (!bulkIdsParam || !startDate || !endDate) return

    let active = true
    const fetchData = async () => {
      setLoading(true)
      try {
        const idToken = await firebaseAuth.currentUser?.getIdToken()
        const resp = await axios.get('/api/invoice', {
          params: {
            customerids: bulkIdsParam,
            startDate,
            endDate
          },
          headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined
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
    if (!invoiceCustomerIds.length) return
    router.push(
      `/apps/invoice/print?customerids=${invoiceCustomerIds.join(',')}` +
        `&startdate=${encodeURIComponent(startDate as string)}` +
        `&enddate=${encodeURIComponent(endDate as string)}`
    )
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <DatePickerWrapper sx={{ '& .react-datepicker-wrapper': { width: 'auto' } }}>
      <Button variant='contained' onClick={handleBulkPrint} disabled={!invoiceCustomerIds.length} sx={{ mb: 4, ml: 2 }}>
        Print {invoiceCustomerIds.length} Invoice{invoiceCustomerIds.length === 1 ? '' : 's'}
      </Button>

      {customersWithoutInvoices.length > 0 ? (
        <Alert severity='info' sx={{ mb: 4, ml: 2 }}>
          No invoiceable orders were found for customer ID{customersWithoutInvoices.length === 1 ? '' : 's'}{' '}
          {customersWithoutInvoices.map(id => `${customerNames[id] || 'Unknown customer'} (${id})`).join(', ')} between{' '}
          {startDate} and {endDate}. They will not be included in printing.
        </Alert>
      ) : null}

      <Grid container spacing={6}>
        {bulkIds.map(id => (
          <Grid container item xs={12} key={id} spacing={2}>
            {Array.isArray(invoiceData[id]) && invoiceData[id].length > 0 ? (
              <>
                <Grid item xl={9} md={8} xs={12}>
                  <PreviewCard
                    data={invoiceData[id]}
                    startDate={startDate as string}
                    endDate={endDate as string}
                  />
                </Grid>
                <Grid item xl={3} md={4} xs={12}>
                  <PreviewActions
                    id={id}
                    startDate={startDate}
                    endDate={endDate}
                    toggleAddPaymentDrawer={() => {
                      /*…*/
                    }}
                    toggleSendInvoiceDrawer={() => {
                      /*…*/
                    }}
                  />
                </Grid>
              </>
            ) : null}
          </Grid>
        ))}
      </Grid>
    </DatePickerWrapper>
  )
}

export default InvoiceAdd
