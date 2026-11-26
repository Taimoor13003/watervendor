import React, { useState, useEffect } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import ProductReport, { ProductRow } from 'src/views/orders/table/ProductReport'
import { firebaseAuth } from 'src/services/firebase.service'
import { authFetch } from 'src/lib/api-client'

const ProductReportPage = () => {
  const [productData, setProductData] = useState<ProductRow[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const idToken = await firebaseAuth.currentUser?.getIdToken()
        const response = await authFetch('/api/productsreports', {
          headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined
        })
        const body = await response.json()
        if (!response.ok) throw new Error(body?.error || 'Unable to load the product report')

        setProductData(Array.isArray(body.result) ? body.result : [])
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load the product report')
      }
    }

    fetchProductData()
  }, [])

  return (
    <Box>
      {error ? (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      <ProductReport data={productData} />
    </Box>
  )
}

export default ProductReportPage
