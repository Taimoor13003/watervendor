import { ReactNode } from 'react'
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext, InferGetStaticPropsType } from 'next/types'
import axios from 'axios'
import { InvoiceType } from 'src/types/apps/invoiceTypes'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import PrintPage from 'src/views/apps/invoice/print/PrintPage'


const InvoicePrint = ({ id }: InferGetStaticPropsType<typeof getStaticProps>) => {
 
        //@ts-ignore


  return <PrintPage id={id} />

}

export const getStaticPaths: GetStaticPaths = async () => {
  const res = await axios.get('/apps/invoice/invoices')
  const data: InvoiceType[] = await res.data.allData

  const paths = data.map((item: InvoiceType) => ({
    params: { id: `${item.id}` }
  }))

  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = ({ params }: GetStaticPropsContext) => {
  return {
    props: {
      id: params?.id
    }
  }
}

InvoicePrint.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

InvoicePrint.setConfig = () => {
  return {
    mode: 'light'
  }
}

export default InvoicePrint
