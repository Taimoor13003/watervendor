// src/views/apps/invoice/print/PrintPage.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { format } from 'date-fns'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { styled } from '@mui/material/styles'
import { GlobalStyles } from '@mui/material'

const MUITableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: 0,
  padding: theme.spacing(1),
  fontSize: theme.typography.body1.fontSize
}))

const PrintPage: React.FC = () => {
  const router = useRouter()
  const { query } = router

  // Normalize into array of IDs
  const ids: string[] = useMemo(() => {
    if (typeof query.customerids === 'string') {
      return query.customerids.split(',').filter(Boolean)
    }
    if (typeof query.customerid === 'string') {
      return [query.customerid]
    }
    return []
  }, [query.customerids, query.customerid])

  const startDate = query.startdate as string
  const endDate   = query.enddate   as string

  const [data, setData] = useState<Record<string, any[]>>({})
  const [dataLoaded, setDataLoaded] = useState(false)

  // We have 3 logos per invoice block
  const totalLogos = ids.length * 3
  const [logosLoaded, setLogosLoaded] = useState(0)
  const onLogoLoad = useCallback(() => setLogosLoaded(n => n + 1), [])

  // Fetch invoice data
  useEffect(() => {
    if (!ids.length || !startDate || !endDate) return
    axios
      .get('/api/invoice', { params: { customerids: ids.join(','), startDate, endDate } })
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setDataLoaded(true))
  }, [ids, startDate, endDate])

  // Once data _and_ logos are all loaded, trigger print
  useEffect(() => {
    if (dataLoaded && logosLoaded >= totalLogos) {
      window.print()
    }
  }, [dataLoaded, logosLoaded, totalLogos])

  const fmt = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy') }
    catch { return '—' }
  }

  return (
    <>
      <GlobalStyles styles={{
        '@page': { margin: 0 },
        '@media print': {
          body: { margin: 0, backgroundColor: '#fff' }
        }
      }} />

      <Box sx={{ backgroundColor: '#fff', color: '#000', p: 4 }}>
        {ids.map(cid => {
          const rows = Array.isArray(data[cid]) ? data[cid] : []
          if (!rows.length) return null

          // Compute totals
          const totDel = rows.reduce((s,r) => s + (r.orderqty||0), 0)
          const totRet = rows.reduce((s,r) => s + (r.reqbottles||0), 0)
          const totAmt = rows.reduce((s,r) => s + (r.orderqty||0)*(r.rate_per_bottle||0), 0)

          const first = rows[0]

          return (
            <Box
              key={cid}
              sx={{
                position:       'relative',     // for screen-only absolute footer
                mb:             6,
                pb:             '2rem',         // space for footer on screen
                pageBreakAfter: 'always'
              }}
            >
              {/* HEADER WITH LOGOS */}
              <Grid
                container
                alignItems="center"
                sx={{
                  mb: 2,
                  '& img': {
                    display: 'inline-block',
                    objectFit: 'contain',
                    maxHeight: 100,
                    WebkitPrintColorAdjust: 'exact'
                  }
                }}
              >
                <Grid item xs={4} textAlign="left">
                  <img
                    src="/images/avatars/5.-Manfaat-ISO-22000-Bagi-Bisnis.webp"
                    alt="ISO 22000"
                    width={180}
                    height={80}
                    onLoad={onLogoLoad}
                  />
                </Grid>
                <Grid item xs={4} textAlign="center">
                  <img
                    src="/images/avatars/output-onlinepngtools.png"
                    alt="Rivielle"
                    width={300}
                    height={100}
                    onLoad={onLogoLoad}
                  />
                </Grid>
                <Grid item xs={4} textAlign="right">
                  <img
                    src="/images/avatars/pngwing.com.png"
                    alt="Pakistan Standards"
                    width={180}
                    height={80}
                    onLoad={onLogoLoad}
                  />
                </Grid>
              </Grid>

              {/* CUSTOMER INFO */}
              <Typography variant="h6" fontWeight={700}>
                {first.firstname} {first.lastname}
              </Typography>
              <Typography><b>Address:</b> {first.addressres}</Typography>
              <Typography><b>Date:</b> {format(new Date(), 'EEEE, dd MMMM, yyyy')}</Typography>
              <Typography><b>Account no.:</b> {first.accountno}</Typography>

              {/* DIVIDER + LABEL */}
              <Divider sx={{ borderBottomWidth: 2, my: 2 }} />
              <Box sx={{ textAlign: 'center', border: '1px solid rgba(0,0,0,0.7)', py: 1, mb: 1 }}>
                <Typography letterSpacing={4} fontWeight={700}>INVOICE DETAILS</Typography>
              </Box>

              {/* DETAILS TABLE */}
              <Table>
                <TableHead>
                  <TableRow>
                    <MUITableCell><b>Invoice Date</b></MUITableCell>
                    <MUITableCell align="right"><b>Bottles Delivered</b></MUITableCell>
                    <MUITableCell align="right"><b>Bottles Returned</b></MUITableCell>
                    <MUITableCell align="right"><b>Rate</b></MUITableCell>
                    <MUITableCell align="right"><b>Total</b></MUITableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r,i) => {
                    const amt = (r.orderqty||0)*(r.rate_per_bottle||0)
                    return (
                      <TableRow key={i}>
                        <MUITableCell>{fmt(r.InvoiceDate)}</MUITableCell>
                        <MUITableCell align="right">{r.orderqty}</MUITableCell>
                        <MUITableCell align="right">{r.reqbottles}</MUITableCell>
                        <MUITableCell align="right">{r.rate_per_bottle.toFixed(2)}</MUITableCell>
                        <MUITableCell align="right">{amt.toFixed(2)}</MUITableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow>
                    <MUITableCell><b>TOTAL</b></MUITableCell>
                    <MUITableCell align="right"><b>{totDel}</b></MUITableCell>
                    <MUITableCell align="right"><b>{totRet}</b></MUITableCell>
                    <MUITableCell/>
                    <MUITableCell align="right"><b>{totAmt.toFixed(2)}</b></MUITableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* NOTE & THANK YOU */}
              <Box mt={2}>
                <Typography><b>Note:</b> Total amount due is Rs:{totAmt.toFixed(2)} only.</Typography>
                <Typography>Thank you.</Typography>
              </Box>

              {/* INLINE FOOTER */}
              <Box
                className="page-footer"
                sx={{
                  position: 'absolute',
                  bottom:   0,
                  left:     0,
                  right:    0,
                  px:       2,
                  py:       1,
                  backgroundColor:     '#DCF0FB',
                  borderTop:           '1px solid rgba(0,0,0,0.2)',
                  fontSize:            '0.75rem',
                  color:               '#000',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust:       'exact',
                  textAlign:           'center',
                  '@media print': {
                    position: 'fixed'
                  }
                }}
              >
                Plot C-3-28, Block-B, Korangi Industrial Area, Karachi │ Cell: 0300-2734089, 0332-4422385 │ Ph: 021-35151000
              </Box>
            </Box>
          )
        })}
      </Box>
    </>
  )
}

export default PrintPage
