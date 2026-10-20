// ** Next Import
import { useState } from 'react'
import Link from 'next/link'
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
