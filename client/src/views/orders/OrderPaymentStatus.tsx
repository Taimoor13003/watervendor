import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import { firebaseAuth } from 'src/services/firebase.service'

const authHeaders = async () => {
  const idToken = await firebaseAuth.currentUser?.getIdToken()

  return idToken ? { Authorization: `Bearer ${idToken}` } : undefined
}

// "Payment Received" for one order, as in the desktop RMS Edit Order screen.
// Paying an order removes it from every invoice; Undo puts it back.
const OrderPaymentStatus = ({ orderId }: { orderId?: number | null }) => {
  const [received, setReceived] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!orderId) return
    let active = true
    const load = async () => {
      try {
        const resp = await axios.get('/api/order-payment', { params: { orderid: orderId }, headers: await authHeaders() })
        if (active) setReceived(Boolean(resp.data?.received))
      } catch {
        if (active) setReceived(null)
      }
    }
    load()

    return () => {
      active = false
    }
  }, [orderId])

  if (!orderId || received === null) return null

  const save = async (next: boolean) => {
    const question = next
      ? 'Mark this order as PAID? It will no longer appear on any invoice.'
      : 'Mark this order as NOT PAID? It will appear on invoices again.'
    if (!window.confirm(question)) return

    setSaving(true)
    try {
      await axios.post('/api/order-payment', { orderid: orderId, received: next }, { headers: await authHeaders() })
      setReceived(next)
      toast.success(next ? 'Payment received for this order.' : 'Order marked as not paid.')
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Could not update the payment. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return received ? (
    <Alert
      severity='success'
      sx={{ mb: 4 }}
      action={
        <Button color='inherit' size='small' disabled={saving} onClick={() => save(false)}>
          Undo
        </Button>
      }
    >
      Payment received for this order.
    </Alert>
  ) : (
    <Alert
      severity='warning'
      sx={{ mb: 4 }}
      action={
        <Button variant='contained' color='success' size='small' disabled={saving} onClick={() => save(true)}>
          Payment Received
        </Button>
      }
    >
      Payment not received yet.
    </Alert>
  )
}

export default OrderPaymentStatus
