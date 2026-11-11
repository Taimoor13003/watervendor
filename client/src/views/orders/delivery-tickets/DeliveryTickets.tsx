import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import GlobalStyles from '@mui/material/GlobalStyles'
import MenuItem from '@mui/material/MenuItem'
import Portal from '@mui/material/Portal'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid'

import { authHeaders } from 'src/lib/api-client'
import type { DeliveryTicketRow } from 'src/pages/api/delivery-tickets'
import DeliveryTicket, { FORMS_PER_SHEET, FORM_WIDTH_IN, SHEET_LENGTH_IN } from './DeliveryTicket'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type Employee = { empid: number; firstname: string | null; lastname: string | null }

const pad = (n: number) => String(n).padStart(2, '0')
const toInputDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// Tickets are printed the day before the round, so a weekday means its next
// date from tomorrow on (picked on Tuesday, "Wednesday" is tomorrow).
const nextDateFor = (dayIndex: number) => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setDate(date.getDate() + ((dayIndex - date.getDay() + 7) % 7))

  return toInputDate(date)
}

// The desktop ticket prints the delivery date as dd-MM-yyyy.
const ticketDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  return match ? `${match[3]}-${match[2]}-${match[1]}` : ''
}

const PRINT_ROOT_ID = 'delivery-tickets-print'

const columns: GridColDef<DeliveryTicketRow>[] = [
  { field: 'accountno', headerName: 'A/C No.', minWidth: 100, flex: 0.12 },
  { field: 'name', headerName: 'A/C Name', minWidth: 200, flex: 0.28 },
  { field: 'address', headerName: 'Address', minWidth: 220, flex: 0.3, sortable: false },
  { field: 'area', headerName: 'Area', minWidth: 120, flex: 0.12 },
  { field: 'telephone', headerName: 'Phone', minWidth: 130, flex: 0.14, sortable: false },
  { field: 'deliverypersonname', headerName: 'Delivery Person', minWidth: 150, flex: 0.16 }
]

const DeliveryTickets = () => {
  const tomorrowIndex = useMemo(() => (new Date().getDay() + 1) % 7, [])
  const [day, setDay] = useState(DAYS[tomorrowIndex])
  const [deliveryDate, setDeliveryDate] = useState(() => nextDateFor(tomorrowIndex))
  const [empid, setEmpid] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])

  const [rows, setRows] = useState<DeliveryTicketRow[] | null>(null)
  const [selection, setSelection] = useState<GridRowId[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const resp = await axios.get('/api/employeeOutstandingNames', { headers: await authHeaders() })
        if (!cancelled) setEmployees(Array.isArray(resp.data?.employees) ? resp.data.employees : [])
      } catch {
        if (!cancelled) setEmployees([])
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const handleDayChange = (value: string) => {
    setDay(value)
    setDeliveryDate(nextDateFor(DAYS.indexOf(value)))
  }

  const runReport = async () => {
    if (!deliveryDate) {
      setError('Select the delivery date.')

      return
    }

    setLoading(true)
    setError('')
    try {
      const resp = await axios.get('/api/delivery-tickets', {
        params: { day: day.toLowerCase(), empid: empid || undefined },
        headers: await authHeaders()
      })
      const customers: DeliveryTicketRow[] = Array.isArray(resp.data?.customers) ? resp.data.customers : []
      setRows(customers)
      setSelection(customers.map(customer => customer.customerid))
    } catch (err: any) {
      setRows(null)
      setSelection([])
      setError(err?.response?.data?.error || 'Unable to load the delivery tickets')
    } finally {
      setLoading(false)
    }
  }

  const selected = useMemo(() => {
    const ids = new Set(selection)

    return (rows || []).filter(row => ids.has(row.customerid))
  }, [rows, selection])

  // Three tickets to a printed sheet, one on each perforated form.
  const sheets = useMemo(() => {
    const chunks: DeliveryTicketRow[][] = []
    for (let i = 0; i < selected.length; i += FORMS_PER_SHEET) chunks.push(selected.slice(i, i + FORMS_PER_SHEET))

    return chunks
  }, [selected])

  return (
    <Box>
      {/* Only the tickets go to the printer, three to a page: each page is one
          11in sheet of his paper, so every ticket lands on its own perforated
          form. The app itself is hidden. */}
      <GlobalStyles
        styles={{
          [`#${PRINT_ROOT_ID}`]: { display: 'none' },
          '@media print': {
            '@page': { size: `${FORM_WIDTH_IN}in ${SHEET_LENGTH_IN}in`, margin: 0 },
            'html, body': { margin: '0 !important', padding: '0 !important', background: '#fff !important' },
            'body > *': { display: 'none !important' },
            [`body > #${PRINT_ROOT_ID}`]: { display: 'block !important' },

            // A hair under one sheet, so rounding never spills onto a blank page.
            [`#${PRINT_ROOT_ID} > div`]: {
              height: `${SHEET_LENGTH_IN - 0.02}in`,
              overflow: 'hidden',
              breakAfter: 'page'
            },
            [`#${PRINT_ROOT_ID} > div:last-of-type`]: { breakAfter: 'auto' }
          }
        }}
      />

      <Card>
        <CardHeader
          title='Customer Schedule Orders'
          subheader='Select a day for viewing Schedule Orders, then print their delivery tickets'
        />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <TextField
              select
              label='Select Day'
              value={day}
              onChange={event => handleDayChange(event.target.value)}
              sx={{ flex: '1 1 180px' }}
            >
              {DAYS.map(name => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type='date'
              label='Delivery Date'
              value={deliveryDate}
              onChange={event => setDeliveryDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: '1 1 180px' }}
            />
            <TextField
              select
              label='Delivery Person'
              value={empid}
              onChange={event => setEmpid(event.target.value)}
              SelectProps={{ displayEmpty: true }}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: '1 1 200px' }}
            >
              <MenuItem value=''>All</MenuItem>
              {employees.map(employee => (
                <MenuItem key={employee.empid} value={String(employee.empid)}>
                  {[employee.firstname, employee.lastname].filter(Boolean).join(' ')}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', gap: 3, mt: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant='contained' onClick={runReport} disabled={loading}>
              {loading ? 'Running…' : 'Run Report'}
            </Button>
            <Button variant='tonal' color='secondary' disabled={selected.length === 0} onClick={() => window.print()}>
              Print Delivery Tickets{selected.length ? ` (${selected.length})` : ''}
            </Button>
            {rows ? (
              <Typography variant='body2' color='text.secondary'>
                {rows.length} customers on {day}; untick anyone who does not need a ticket.
              </Typography>
            ) : null}
          </Box>

          {error ? (
            <Alert severity='error' sx={{ mt: 4 }}>
              {error}
            </Alert>
          ) : null}
        </CardContent>

        {rows ? (
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            getRowId={row => row.customerid}
            getRowHeight={() => 'auto'}
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={selection}
            onRowSelectionModelChange={model => setSelection(model)}
            pageSizeOptions={[25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 100 } } }}
            sx={{ '& .MuiDataGrid-cell': { py: 1.5, whiteSpace: 'pre-line' } }}
          />
        ) : null}
      </Card>

      {selected.length ? (
        <Card sx={{ mt: 4 }}>
          <CardHeader
            title='Ticket Preview'
            subheader={`One form, a third of a ${FORM_WIDTH_IN} × ${SHEET_LENGTH_IN} in sheet. Only the text is printed; the shaded header is already on the paper.`}
          />
          <CardContent sx={{ overflowX: 'auto' }}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', width: 'fit-content' }}>
              <DeliveryTicket customer={selected[0]} deliveryDate={ticketDate(deliveryDate)} showHeaderArea />
            </Box>
          </CardContent>
        </Card>
      ) : null}

      <Portal>
        <div id={PRINT_ROOT_ID}>
          {sheets.map(sheet => (
            <div key={sheet[0].customerid}>
              {sheet.map(customer => (
                <DeliveryTicket key={customer.customerid} customer={customer} deliveryDate={ticketDate(deliveryDate)} />
              ))}
            </div>
          ))}
        </div>
      </Portal>
    </Box>
  )
}

export default DeliveryTickets
