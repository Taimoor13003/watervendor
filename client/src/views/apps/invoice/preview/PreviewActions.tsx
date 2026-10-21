// ** Next Import
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import axios from 'axios'
import { firebaseAuth } from 'src/services/firebase.service'

// ** MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import SendWhatsAppDialog from './SendWhatsAppDialog'

interface Props {
  id: string | null
  startDate: any
  endDate: any
  toggleAddPaymentDrawer: () => void
  toggleSendInvoiceDrawer: () => void
}

const PreviewActions = ({ id, startDate, endDate, toggleSendInvoiceDrawer, toggleAddPaymentDrawer }: Props) => {
  const [whatsAppOpen, setWhatsAppOpen] = useState(false)
  const [savingPayment, setSavingPayment] = useState(false)
  const router = useRouter()

  // The customer paid this whole invoice: every unpaid order on it is marked
  // paid, so the customer leaves the invoice list for this period.
  const recordPayment = async () => {
    if (!id || !startDate || !endDate) return
    if (!window.confirm('Mark every order on this invoice as PAID? It will no longer be printable.')) return

    setSavingPayment(true)
    try {
      const idToken = await firebaseAuth.currentUser?.getIdToken()
      const resp = await axios.post(
        '/api/payment-received',
        { customerIds: [Number(id)], startDate, endDate, received: true },
        { headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined }
      )
      const updated = Number(resp.data?.updated ?? 0)
      toast.success(`Payment received (${updated} order${updated === 1 ? '' : 's'} marked paid).`)
      router.push('/app/customerinvoice')
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Could not record the payment. Please try again.')
    } finally {
      setSavingPayment(false)
    }
  }

  const downloadInvoice = async () => {
    const idToken = await firebaseAuth.currentUser?.getIdToken()
    const response = await axios.get('/api/invoice/pdf', {
      params: { customerid: id, startdate: startDate, enddate: endDate },
      responseType: 'blob',
      headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined
    })
    const url = URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = url
    link.download = `Invoice_${id}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardContent>
        <Button
          fullWidth
          sx={{ mb: 2 }}
          // color='secondary'
          // variant='tonal'
          variant='contained'
          onClick={downloadInvoice}
          // target='_blank'
        >
          Download
        </Button>
        <Button
          fullWidth
          sx={{ mb: 2 }}
          // target='_blank'
          variant='contained'
          component={Link}
          // color='secondary'
          href={`/apps/invoice/print/?customerid=${id}&startdate=${startDate}&enddate=${endDate}`}
        >
          Print
        </Button>

        <Button
          fullWidth
          variant='contained'
          color='success'
          onClick={() => setWhatsAppOpen(true)}
          sx={{ mb: 2, '& svg': { mr: 2 } }}
          disabled={!id || !startDate || !endDate}
        >
          <Icon fontSize='1.125rem' icon='tabler:brand-whatsapp' />
          Send on WhatsApp
        </Button>

        <Button
          fullWidth
          variant='outlined'
          color='success'
          onClick={recordPayment}
          sx={{ mb: 2 }}
          disabled={!id || !startDate || !endDate || savingPayment}
        >
          Payment Received
        </Button>

        <Button
          fullWidth
          variant='contained'
          onClick={toggleSendInvoiceDrawer}
          sx={{ mb: 2, '& svg': { mr: 2 } }}
          disabled={true}
        >
          <Icon fontSize='1.125rem' icon='tabler:send' />
          Send Invoice {'>'} disabled
        </Button>

        <Button
          fullWidth
          sx={{ mb: 2 }}
          variant='tonal'
          component={Link}
          // color='secondary'
          href={`/apps/invoice/edit/${id}`}
          disabled={true}
        >
          Edit Invoice {'>'} disabled
        </Button>
      </CardContent>

      <SendWhatsAppDialog
        open={whatsAppOpen}
        onClose={() => setWhatsAppOpen(false)}
        customerId={id}
        startDate={startDate}
        endDate={endDate}
      />
    </Card>
  )
}

export default PreviewActions
