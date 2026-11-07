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

type EmployeeOption = {
  empid: number
  employeecode: string | null
  firstname: string | null
  lastname: string | null
}

const authHeaders = async () => {
  const idToken = await firebaseAuth.currentUser?.getIdToken()

  return idToken ? { Authorization: `Bearer ${idToken}` } : undefined
}

const employeeName = (employee?: EmployeeOption) =>
  [employee?.firstname, employee?.lastname].filter(Boolean).join(' ')

const EmployeeOutstandingPage = () => {
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [rows, setRows] = useState<OutstandingRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [truncated, setTruncated] = useState(false)

  // The employee the shown report belongs to; it stays put if the dropdown changes.
  const [reportEmployee, setReportEmployee] = useState('')

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await authFetch('/api/employeeOutstandingNames', { headers: await authHeaders() })
        const body = await response.json()
        if (!response.ok) throw new Error(body?.error || 'Unable to load employees')

        setEmployees(Array.isArray(body.employees) ? body.employees : [])
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load employees')
      }
    }

    fetchEmployees()
  }, [])

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      setError('Select an employee first.')

      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch(
        `/api/employeeOutstandingNames/employeeoutstanding?empId=${encodeURIComponent(selectedEmployee)}`,
        { headers: await authHeaders() }
      )
      const body = await response.json()
      if (!response.ok) throw new Error(body?.error || 'Unable to load the outstanding report')

      setRows(Array.isArray(body.result) ? body.result : [])
      setTruncated(Boolean(body.truncated))
      setReportEmployee(employeeName(employees.find(option => String(option.empid) === selectedEmployee)))
    } catch (requestError) {
      setRows([])
      setTruncated(false)
      setReportEmployee('')
      setError(requestError instanceof Error ? requestError.message : 'Unable to load the outstanding report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <FormControl fullWidth margin='normal'>
        <InputLabel id='employeeName-label'>Employee Name</InputLabel>
        <Select
          labelId='employeeName-label'
          value={selectedEmployee}
          onChange={event => setSelectedEmployee(String(event.target.value))}
          label='Employee Name'
          required
        >
          {employees.map(employee => (
            <MenuItem key={employee.empid} value={employee.empid}>
              {[employee.employeecode, employeeName(employee)].filter(Boolean).join(' – ')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant='contained' color='primary' onClick={handleSubmit} disabled={loading || !selectedEmployee}>
        {loading ? 'Loading...' : 'Submit'}
      </Button>

      {error ? (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : null}

      {truncated ? (
        <Alert severity='warning' sx={{ mt: 2 }}>
          Only the first order lines are shown; the totals leave out the rest.
        </Alert>
      ) : null}

      <Box mt={3}>
        <CustomerOutstandingReport kind='employee' data={rows} name={reportEmployee} />
      </Box>
    </Box>
  )
}

export default EmployeeOutstandingPage
