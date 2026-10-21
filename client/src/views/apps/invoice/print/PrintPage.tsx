// src/views/apps/invoice/print/PrintPage.tsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { format } from 'date-fns'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { styled } from '@mui/material/styles'
import { GlobalStyles } from '@mui/material'
import { firebaseAuth } from 'src/services/firebase.service'

const MUITableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: 0,
  padding: theme.spacing(1),
  fontSize: theme.typography.body1.fontSize
}))

const PrintPage: React.FC = () => {
  const router = useRouter()
  const { query } = router
  // Query parameters are unavailable during server rendering. Delay parsing
  // until after hydration so the server and first client render match.
  const [isClientReady, setIsClientReady] = useState(false)
  useEffect(() => setIsClientReady(true), [])

  const urlSearch = isClientReady ? window.location.search : ''
  const urlParams = useMemo(() => new URLSearchParams(urlSearch), [urlSearch])

  // Normalize into array of IDs
  const ids: string[] = useMemo(() => {
    if (!isClientReady) return []
    if (typeof query.customerids === 'string') {
      return query.customerids.split(',').filter(Boolean)
    }
    const customerids = urlParams?.get('customerids')
    if (customerids) {
      return customerids.split(',').filter(Boolean)
    }
    if (typeof query.customerid === 'string') {
      return [query.customerid]
    }
    const customerid = urlParams?.get('customerid')
    if (customerid) {
      return [customerid]
    }
    return []
  }, [isClientReady, query.customerids, query.customerid, urlParams])

  const startDate = isClientReady ? (query.startdate as string) || urlParams.get('startdate') || '' : ''
  const endDate = isClientReady ? (query.enddate as string) || urlParams.get('enddate') || '' : ''

  const [data, setData] = useState<Record<string, any[]>>({})
  const [dataLoaded, setDataLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const hasTriggeredOutput = useRef(false)

  // The certification marks load before print/download begins.
  const invoiceCount = Object.values(data).filter(rows => Array.isArray(rows) && rows.length > 0).length
  const totalLogos = invoiceCount * 3
  const [logosLoaded, setLogosLoaded] = useState(0)
  const onLogoLoad = useCallback(() => setLogosLoaded(n => n + 1), [])

  // Fetch invoice data
  useEffect(() => {
    if (!ids.length || !startDate || !endDate) return
    setDataLoaded(false)
    setLoadError(null)
    setLogosLoaded(0)
    hasTriggeredOutput.current = false
    const fetchInvoiceData = async () => {
      const idToken = await firebaseAuth.currentUser?.getIdToken()

      return axios.get('/api/invoice', {
        params: { customerids: ids.join(','), startDate, endDate },
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined
      })
    }

    fetchInvoiceData()
      .then(res => setData(res.data))
      .catch(() => {
        setLoadError('Unable to load the invoice data. Please return to the invoice list and try again.')
      })
      .finally(() => setDataLoaded(true))
  }, [ids, startDate, endDate])

  const action = (query.action as string) || urlParams?.get('action') || ''

  const generateAndDownloadPdf = useCallback(async () => {
    setIsExporting(true)
    setExportError(null)

    // Capture each invoice block and add to a single PDF
    const blocks = Array.from(document.querySelectorAll('.invoice-block')) as HTMLElement[]
    if (!blocks.length) {
      setIsExporting(false)
      setExportError('There are no invoices available to export.')

      return
    }

    try {
      // Wait for local images to finish loading, with a bounded wait so an
      // unavailable image can never leave the download screen hanging.
      await Promise.all(
        Array.from(document.images).map(image => {
          if (image.complete) return Promise.resolve()

          return new Promise<void>(resolve => {
            const timeout = window.setTimeout(resolve, 5000)
            image.addEventListener(
              'load',
              () => {
                window.clearTimeout(timeout)
                resolve()
              },
              { once: true }
            )
            image.addEventListener(
              'error',
              () => {
                window.clearTimeout(timeout)
                resolve()
              },
              { once: true }
            )
          })
        })
      )

      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })

      for (let i = 0; i < blocks.length; i++) {
        const el = blocks[i]
        const canvas = await html2canvas(el, {
          // 3x keeps logos and text crisp in the downloaded PDF (2x looked soft).
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
          imageTimeout: 5000,
          logging: false
        })
        const imgData = canvas.toDataURL('image/png')

        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()

        const imgWidth = pageWidth - 20
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        const marginLeft = 10
        const marginTop = 10

        let remainingHeight = imgHeight
        let position = marginTop
        if (i > 0) pdf.addPage()
        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'PNG', marginLeft, position, imgWidth, imgHeight, undefined, 'FAST')
          remainingHeight -= pageHeight - 20
          if (remainingHeight > 0) {
            pdf.addPage()
            position = marginTop - (imgHeight - remainingHeight)
          }
        }
      }

      const fileBase = blocks.length === 1 ? blocks[0].getAttribute('data-account') || 'Invoice' : 'Invoices'
      const fileName = `${fileBase}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`
      const blob = pdf.output('blob')
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = fileName
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
    } catch (error) {
      console.error('PDF export failed', error)
      setExportError(
        'The PDF could not be generated. Please retry. If the problem continues, use Print and save as PDF.'
      )
      hasTriggeredOutput.current = false
    } finally {
      setIsExporting(false)
    }
  }, [])

  // Once data and logos are all loaded, either print or download
  useEffect(() => {
    if (!hasTriggeredOutput.current && dataLoaded && invoiceCount > 0 && logosLoaded >= totalLogos) {
      hasTriggeredOutput.current = true
      if (action === 'download') {
        generateAndDownloadPdf()
      } else {
        window.print()
      }
    }
  }, [action, dataLoaded, invoiceCount, logosLoaded, totalLogos, generateAndDownloadPdf])

  const fmt = (d: string) => {
    try {
      return format(new Date(d), 'dd/MM/yyyy')
    } catch {
      return '—'
    }
  }
  // Amounts print like the desktop invoice: 1,320.00
  const money = (value: number) =>
    value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const getLineTotal = (row: any) => {
    if (row.orderamount !== null && row.orderamount !== undefined) return Number(row.orderamount)

    return Number(row.orderqty || 0) * Number(row.rate_per_bottle || 0)
  }

  if (!isClientReady || !ids.length || !startDate || !endDate) {
    return <Box sx={{ p: 6 }}>A customer and an invoice date range are required.</Box>
  }

  if (loadError) {
    return <Box sx={{ p: 6 }}>{loadError}</Box>
  }

  if (!dataLoaded) {
    return <Box sx={{ p: 6 }}>Preparing invoice…</Box>
  }

  if (dataLoaded && invoiceCount === 0) {
    return <Box sx={{ p: 6 }}>No invoiceable orders were found for the selected customers and invoice date range.</Box>
  }

  return (
    <>
      <GlobalStyles
        styles={{
          '@page': { margin: 0 },
          '@media print': {
            body: { margin: 0, backgroundColor: '#fff' }
          }
        }}
      />

      <Box sx={{ backgroundColor: '#fff', color: '#000', p: 4 }}>
        {action === 'download' && isExporting ? <Box sx={{ mb: 3 }}>Generating your PDF…</Box> : null}
        {action === 'download' && exportError ? (
          <Box sx={{ mb: 3 }}>
            <Typography color='error' sx={{ mb: 2 }}>
              {exportError}
            </Typography>
            <button type='button' onClick={generateAndDownloadPdf}>
              Retry download
            </button>
          </Box>
        ) : null}
        {ids.map(cid => {
          const rows = Array.isArray(data[cid]) ? data[cid] : []
          if (!rows.length) return null

          // Compute totals
          const totDel = rows.reduce((s, r) => s + (r.orderqty || 0), 0)
          const totRet = rows.reduce((s, r) => s + (r.returnqty || 0), 0)
          const totAmt = rows.reduce((s, r) => s + getLineTotal(r), 0)

          const first = rows[0]
          const invoiceNumbers = (data.__invoiceNumbers as unknown as Record<string, string>) || {}
          const invoiceNumber = invoiceNumbers[cid] || '—'

          return (
            <Box
              key={cid}
              sx={{
                position: 'relative', // for screen-only absolute footer
                mb: 6,
                pb: '2rem', // space for footer on screen
                pageBreakAfter: 'always'
              }}
              className='invoice-block'
              data-account={invoiceNumber}
            >
              {/* HEADER WITH LOGOS */}
              <Grid
                container
                alignItems='center'
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
                <Grid item xs={4} textAlign='left'>
                  <img
                    src='/images/avatars/5.-Manfaat-ISO-22000-Bagi-Bisnis.webp'
                    alt='ISO 22000'
                    width={180}
                    height={80}
                    onLoad={onLogoLoad}
                    onError={onLogoLoad}
                  />
                </Grid>
                <Grid item xs={4} textAlign='center'>
                  <img
                    src='/images/avatars/output-onlinepngtools.png'
                    alt='Rivielle - The Premium Drinking Water'
                    width={240}
                    height={105}
                    onLoad={onLogoLoad}
                    onError={onLogoLoad}
                  />
                  <Typography variant='body2' sx={{ color: '#000' }}>
                    Rivielle.org
                  </Typography>
                </Grid>
                <Grid item xs={4} textAlign='right'>
                  <img
                    src='/images/avatars/pngwing.com.png'
                    alt='Pakistan Standards'
                    width={180}
                    height={80}
                    onLoad={onLogoLoad}
                    onError={onLogoLoad}
                  />
                </Grid>
              </Grid>

              {/* CUSTOMER INFO */}
              <Typography variant='h6' fontWeight={700}>
                {[first.firstname, first.lastname].filter(Boolean).join(' ') || '—'}
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-line' }}>{first.addressres || '—'}</Typography>

              {/* Same order as the desktop RMS invoice: date, account, then our invoice number. */}
              <Typography sx={{ mt: 2 }}>
                <b>Date: {format(new Date(), 'EEEE, dd MMMM, yyyy')}</b>
              </Typography>
              <Typography variant='body2'>Account #: {first.accountno}</Typography>
              <Typography variant='body2' sx={{ mb: 2 }}>
                Invoice #: {invoiceNumber}
              </Typography>

              <Box sx={{ textAlign: 'center', border: '1px solid rgba(0,0,0,0.7)', py: 1, mb: 1 }}>
                <Typography letterSpacing={4} fontWeight={700}>
                  INVOICE DETAILS
                </Typography>
              </Box>

              {/* DETAILS TABLE */}
              {/* Compact black rows with plain bold headings, like the desktop invoice. */}
              <Table
                size='small'
                sx={{
                  '& th, & td': { color: '#000', borderBottom: 'none', py: 0.5 },
                  '& th': { textTransform: 'none', letterSpacing: 0, fontSize: '0.875rem', borderBottom: '2px solid #000' }
                }}
              >
                <TableHead>
                  <TableRow>
                    <MUITableCell>
                      <b>Invoice Date</b>
                    </MUITableCell>
                    <MUITableCell align='right'>
                      <b>Bottles Delivered</b>
                    </MUITableCell>
                    <MUITableCell align='right'>
                      <b>Bottles Returned</b>
                    </MUITableCell>
                    <MUITableCell align='right'>
                      <b>Rate</b>
                    </MUITableCell>
                    <MUITableCell align='right'>
                      <b>Total</b>
                    </MUITableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r, i) => {
                    const amt = getLineTotal(r)
                    return (
                      <TableRow key={i}>
                        <MUITableCell>{fmt(r.InvoiceDate)}</MUITableCell>
                        <MUITableCell align='right'>{r.orderqty}</MUITableCell>
                        <MUITableCell align='right'>{r.returnqty || 0}</MUITableCell>
                        <MUITableCell align='right'>{money(Number(r.rate_per_bottle || 0))}</MUITableCell>
                        <MUITableCell align='right'>{money(amt)}</MUITableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow sx={{ '& td': { borderTop: '2px solid #000', borderBottom: '2px solid #000' } }}>
                    <MUITableCell>
                      <b>TOTAL</b>
                    </MUITableCell>
                    <MUITableCell align='right'>
                      <b>{totDel}</b>
                    </MUITableCell>
                    <MUITableCell align='right'>
                      <b>{totRet}</b>
                    </MUITableCell>
                    <MUITableCell />
                    <MUITableCell align='right'>
                      <b>{money(totAmt)}</b>
                    </MUITableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* NOTE & THANK YOU */}
              <Box mt={2}>
                <Typography>
                  Total amount due is Rs.<b>{money(totAmt)}</b> only.
                </Typography>
                <Typography sx={{ mt: 3 }}>Thank you.</Typography>
              </Box>

              {/* INLINE FOOTER */}
              <Box
                className='page-footer'
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  px: 2,
                  py: 1,
                  backgroundColor: '#DCF0FB',
                  borderTop: '1px solid rgba(0,0,0,0.2)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#000',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                  textAlign: 'center',
                  '@media print': {
                    position: 'fixed'
                  }
                }}
              >
                Plot # C-3-28 Block-B Korangi Industrial Area, Karachi. Cell: 0300-2734089 - 0332-4422385 Ph:
                021-3515-1000
              </Box>
            </Box>
          )
        })}
      </Box>
    </>
  )
}

export default PrintPage
