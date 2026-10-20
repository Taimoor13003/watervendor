import { useEffect, useState } from 'react'
import axios from 'axios'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import CustomTextField from 'src/@core/components/mui/text-field'
import { firebaseAuth } from 'src/services/firebase.service'
import { buildWhatsAppLink, buildWhatsAppWebLink, normalizeWhatsAppNumber } from 'src/lib/whatsapp'

interface Props {
  open: boolean
  onClose: () => void
  customerId: string | null
  startDate: any
  endDate: any
}

const SendWhatsAppDialog = ({ open, onClose, customerId, startDate, endDate }: Props) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState<string | null>(null)
  const [storedNumber, setStoredNumber] = useState<string | null>(null)
  const [number, setNumber] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!open || !customerId || !startDate || !endDate) return

    let active = true
    setLoading(true)
    setError(null)

    const load = async () => {
      try {
        const idToken = await firebaseAuth.currentUser?.getIdToken()
        const resp = await axios.get('/api/invoice/whatsapp', {
          params: { customerid: customerId, startdate: startDate, enddate: endDate },
          headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined
        })
        if (!active) return
        setCustomerName(resp.data?.customerName || null)
        setStoredNumber(resp.data?.storedNumber || null)
        setNumber(resp.data?.whatsappNumber || '')
        setMessage(resp.data?.message || '')
      } catch (err: any) {
        if (!active) return
        setError(err?.response?.data?.error || 'The WhatsApp message could not be prepared.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [open, customerId, startDate, endDate])

  const normalized = normalizeWhatsAppNumber(number) || number.replace(/\D/g, '')
  const canSend = Boolean(normalized) && Boolean(message)

  const openWhatsApp = () => {
    if (!canSend) return
    // Phones open the WhatsApp app; computers reuse one WhatsApp Web tab.
    const isPhone = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    if (isPhone) {
      window.open(buildWhatsAppLink(normalized, message), '_blank', 'noopener,noreferrer')
    } else {
      window.open(buildWhatsAppWebLink(normalized, message), 'rivielle-whatsapp')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Send bill on WhatsApp</DialogTitle>
      <DialogContent>
        {loading ? <Typography>Preparing the message…</Typography> : null}

        {error ? <Alert severity='error'>{error}</Alert> : null}

        {!loading && !error ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 2 }}>
            {customerName ? <Typography variant='body2'>Bill for {customerName}</Typography> : null}

            <CustomTextField
              fullWidth
              label='WhatsApp number'
              value={number}
              onChange={event => setNumber(event.target.value)}
              placeholder='923001234567'
              helperText='Country code first, no plus sign or spaces. Pakistani mobiles are filled in automatically.'
            />

            {!normalizeWhatsAppNumber(number) ? (
              <Alert severity='warning'>
                {storedNumber
                  ? `The number saved for this customer (${storedNumber}) is not a WhatsApp mobile number. Enter the correct number above.`
                  : 'This customer has no WhatsApp mobile number saved. Enter one above.'}
              </Alert>
            ) : null}

            <CustomTextField
              fullWidth
              multiline
              minRows={8}
              label='Message'
              value={message}
              onChange={event => setMessage(event.target.value)}
            />

            <Alert severity='info'>
              WhatsApp opens on this customer&apos;s chat with the message ready, including a private link to the invoice
              PDF (valid for 90 days). Press send there to deliver it from your WhatsApp.
            </Alert>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button color='secondary' onClick={onClose}>
          Cancel
        </Button>
        <Button variant='contained' onClick={openWhatsApp} disabled={!canSend || loading}>
          Open WhatsApp
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SendWhatsAppDialog
