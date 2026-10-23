import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'

import CustomTextField from 'src/@core/components/mui/text-field'
import { firebaseAuth } from 'src/services/firebase.service'
import { normalizeWhatsAppNumber, openWhatsAppChat } from 'src/lib/whatsapp'

// Sends the bills of every selected customer one after another. A wa.me /
// WhatsApp Web link can only open a chat with the text filled in, so the
// client still presses Send in WhatsApp; this saves opening each invoice. Each
// "Open WhatsApp" click opens the current customer's chat and moves on to the
// next, whose message is already prepared (opening a tab after waiting on the
// network would be blocked by the browser).

export type BulkWhatsAppCustomer = { customerId: number; name: string }

type Prepared =
  | { state: 'loading' }
  | { state: 'error'; error: string }
  | { state: 'ready'; storedNumber: string | null; number: string; message: string }

type Outcome = 'opened' | 'skipped'

interface Props {
  open: boolean
  onClose: () => void
  customers: BulkWhatsAppCustomer[]
  startDate: string
  endDate: string
}

const BulkWhatsAppDialog = ({ open, onClose, customers, startDate, endDate }: Props) => {
  const [index, setIndex] = useState(0)
  const [prepared, setPrepared] = useState<Record<number, Prepared>>({})
  const [outcomes, setOutcomes] = useState<Record<number, Outcome>>({})
  const requested = useRef(new Set<number>())

  // A fresh run every time the dialog opens.
  useEffect(() => {
    if (!open) return
    setIndex(0)
    setPrepared({})
    setOutcomes({})
    requested.current = new Set()
  }, [open, startDate, endDate])

  const finished = index >= customers.length
  const current = finished ? null : customers[index]

  // Prepare the current customer and the next one, never the whole list at
  // once: each message also issues that customer's invoice number.
  useEffect(() => {
    if (!open) return

    const prepare = async (customerId: number) => {
      if (requested.current.has(customerId)) return
      requested.current.add(customerId)
      setPrepared(all => ({ ...all, [customerId]: { state: 'loading' } }))
      try {
        const idToken = await firebaseAuth.currentUser?.getIdToken()
        const resp = await axios.get('/api/invoice/whatsapp', {
          params: { customerid: customerId, startdate: startDate, enddate: endDate },
          headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined
        })
        setPrepared(all => ({
          ...all,
          [customerId]: {
            state: 'ready',
            storedNumber: resp.data?.storedNumber || null,
            number: resp.data?.whatsappNumber || '',
            message: resp.data?.message || ''
          }
        }))
      } catch (err: any) {
        // Allow "Try again" to request it afresh.
        requested.current.delete(customerId)
        setPrepared(all => ({
          ...all,
          [customerId]: { state: 'error', error: err?.response?.data?.error || 'The WhatsApp message could not be prepared.' }
        }))
      }
    }

    customers.slice(index, index + 2).forEach(customer => prepare(customer.customerId))
  }, [open, index, customers, startDate, endDate, prepared])

  const entry = current ? prepared[current.customerId] : undefined
  const ready = entry?.state === 'ready' ? entry : null
  const normalized = ready ? normalizeWhatsAppNumber(ready.number) || ready.number.replace(/\D/g, '') : ''
  const canSend = Boolean(ready && normalized && ready.message)

  const update = (changes: Partial<{ number: string; message: string }>) => {
    if (!current || !ready) return
    setPrepared(all => ({ ...all, [current.customerId]: { ...ready, ...changes } }))
  }

  const finish = (outcome: Outcome) => {
    if (!current) return
    setOutcomes(all => ({ ...all, [current.customerId]: outcome }))
    setIndex(value => value + 1)
  }

  const sendCurrent = () => {
    if (!ready || !canSend) return
    openWhatsAppChat(normalized, ready.message)
    finish('opened')
  }

  const retry = () => {
    if (!current) return
    setPrepared(all => {
      const next = { ...all }
      delete next[current.customerId]

      return next
    })
  }

  const openedCount = Object.values(outcomes).filter(value => value === 'opened').length
  const skipped = customers.filter(customer => outcomes[customer.customerId] === 'skipped')

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Send bills on WhatsApp</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <LinearProgress
            variant='determinate'
            value={customers.length ? (Math.min(index, customers.length) / customers.length) * 100 : 0}
            sx={{ flex: 1, height: 8, borderRadius: 4 }}
          />
          <Typography variant='body2' sx={{ whiteSpace: 'nowrap' }}>
            {finished ? `${customers.length} of ${customers.length}` : `Customer ${index + 1} of ${customers.length}`}
          </Typography>
        </Box>

        {current ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Typography variant='h6'>{current.name}</Typography>

            {!entry || entry.state === 'loading' ? <Typography>Preparing the message…</Typography> : null}

            {entry?.state === 'error' ? (
              <Alert
                severity='error'
                action={
                  <Button color='inherit' size='small' onClick={retry}>
                    Try again
                  </Button>
                }
              >
                {entry.error}
              </Alert>
            ) : null}

            {ready ? (
              <>
                <CustomTextField
                  fullWidth
                  label='WhatsApp number'
                  value={ready.number}
                  onChange={event => update({ number: event.target.value })}
                  placeholder='923001234567'
                  helperText='Country code first, no plus sign or spaces. Pakistani mobiles are filled in automatically.'
                />
                {!normalizeWhatsAppNumber(ready.number) ? (
                  <Alert severity='warning'>
                    {ready.storedNumber
                      ? `The number saved for this customer (${ready.storedNumber}) is not a WhatsApp mobile number. Enter the correct number above, or skip this customer.`
                      : 'This customer has no WhatsApp mobile number saved. Enter one above, or skip this customer.'}
                  </Alert>
                ) : null}
                <CustomTextField
                  fullWidth
                  multiline
                  minRows={6}
                  label='Message'
                  value={ready.message}
                  onChange={event => update({ message: event.target.value })}
                />
              </>
            ) : null}

            <Alert severity='info'>
              &quot;Open WhatsApp&quot; opens this customer&apos;s chat with the bill ready. Press send in WhatsApp, then come
              back to this tab: the next customer will be waiting.
            </Alert>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Alert severity='success'>
              Done. WhatsApp was opened for {openedCount} customer{openedCount === 1 ? '' : 's'}
              {skipped.length ? `, ${skipped.length} skipped` : ''}.
            </Alert>
            {skipped.length ? (
              <Box>
                <Typography variant='body2' sx={{ mb: 2 }}>
                  Skipped (not sent):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {skipped.map(customer => (
                    <Chip
                      key={customer.customerId}
                      label={customer.name}
                      onClick={() => setIndex(customers.indexOf(customer))}
                      variant='outlined'
                    />
                  ))}
                </Box>
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                  Click a name to go back to that customer.
                </Typography>
              </Box>
            ) : null}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button color='secondary' onClick={onClose}>
          {finished ? 'Close' : 'Stop'}
        </Button>
        {!finished ? (
          <>
            <Button variant='outlined' onClick={() => setIndex(value => value - 1)} disabled={index === 0}>
              Back
            </Button>
            <Button variant='outlined' onClick={() => finish('skipped')}>
              Skip
            </Button>
            <Button variant='contained' color='success' onClick={sendCurrent} disabled={!canSend}>
              {index === customers.length - 1 ? 'Open WhatsApp' : 'Open WhatsApp & next'}
            </Button>
          </>
        ) : null}
      </DialogActions>
    </Dialog>
  )
}

export default BulkWhatsAppDialog
