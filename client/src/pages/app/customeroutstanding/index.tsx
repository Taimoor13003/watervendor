import React, { useState, useEffect } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CustomerOutstandingReport, { OutstandingRow } from 'src/views/orders/table/CustomerOutstandingReport'
import { firebaseAuth } from 'src/services/firebase.service'
import { authFetch } from 'src/lib/api-client'

type CustomerOption = {
  customerid: number
  accountno: string | null
  firstname: string | null
  lastname: string | null
}

const authHeaders = async () => {
  const idToken = await firebaseAuth.currentUser?.getIdToken()

  return idToken ? { Authorization: `Bearer ${idToken}` } : undefined
}

const CustomerOutstandingPage = () => {
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [rows, setRows] = useState<OutstandingRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [truncated, setTruncated] = useState(false)

  // The customer the shown report belongs to; it stays put if the dropdown changes.
  const [reportCustomer, setReportCustomer] = useState('')

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await authFetch('/api/customerOutstandingNames', { headers: await authHeaders() })
        const body = await response.json()
        if (!response.ok) throw new Error(body?.error || 'Unable to load customers')

        setCustomers(Array.isArray(body.customers) ? body.customers : [])
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load customers')
      }
    }

    fetchCustomers()
  }, [])

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      setError('Select a customer first.')

      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch(
        `/api/customerOutstandingNames/customeroutstanding?customerId=${encodeURIComponent(selectedCustomer)}`,
        { headers: await authHeaders() }
      )
      const body = await response.json()
      if (!response.ok) throw new Error(body?.error || 'Unable to load the outstanding report')

      const customer = customers.find(option => String(option.customerid) === selectedCustomer)

      setRows(Array.isArray(body.result) ? body.result : [])
      setTruncated(Boolean(body.truncated))
      setReportCustomer([customer?.firstname, customer?.lastname].filter(Boolean).join(' '))
    } catch (requestError) {
      setRows([])
      setTruncated(false)
      setReportCustomer('')
      setError(requestError instanceof Error ? requestError.message : 'Unable to load the outstanding report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <FormControl fullWidth margin='normal'>
        <InputLabel id='customerName-label'>Customer Name</InputLabel>
        <Select
          labelId='customerName-label'
          value={selectedCustomer}
          onChange={event => setSelectedCustomer(String(event.target.value))}
          label='Customer Name'
          required
        >
          {customers.map(customer => (
            <MenuItem key={customer.customerid} value={customer.customerid}>
              {[customer.accountno, [customer.firstname, customer.lastname].filter(Boolean).join(' ')]
                .filter(Boolean)
                .join(' – ')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant='contained' color='primary' onClick={handleSubmit} disabled={loading || !selectedCustomer}>
        {loading ? 'Loading...' : 'Submit'}
      </Button>

      {error ? (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : null}

      {truncated ? (
        <Alert severity='warning' sx={{ mt: 2 }}>
          Only the oldest order lines are shown; the totals leave out the rest.
        </Alert>
      ) : null}

      <Box mt={3}>
        <CustomerOutstandingReport data={rows} name={reportCustomer} />
      </Box>
    </Box>
  )
}

export default CustomerOutstandingPage
