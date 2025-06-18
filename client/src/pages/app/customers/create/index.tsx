import { GetServerSideProps } from 'next/types'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import CustomerForm from '../CustomerForm'
import prisma from 'src/lib/prisma'

type FormValues = {
  firstname: string
  lastname: string
  datefirstcontacted: string
  customertype: string
  dateofbirth: string
  accountno: string
  telephoneres: string
  telephoneoffice: string
  addressres: string
  email: string
  delieverydate: string
  deliveryarea: string
  paymentmode: string
  notes: string
  addressoffice: string
  depositamount: string
  requirement: string
  delivery_person: string
  reqbottles: string
  tax: string
}

type CustomerFormPageProps = {
  customerData: FormValues
  customerTypes: { id: number; customertype: string }[]
  pickrequirement: { id: number; requirement: string }[]
  paymentmode: { id: number; paymentmode: string }[]
  deliveryPersons: {
    id: number
    empid: number
    employeecode: string
    firstname: string
    middlename: string
    lastname: string
  }[]
}

const CustomerFormPage = ({
  customerData,
  customerTypes,
  pickrequirement,
  paymentmode,
  deliveryPersons
}: CustomerFormPageProps) => {
  const [deliveryAreas, setDeliveryAreas] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    const fetchDeliveryAreas = async () => {
      try {
        const res = await fetch('/api/getaddress')
        const data = await res.json()
        setDeliveryAreas(data)
        console.log("kaam chalgayaaaaa")
      } catch (error) {
        console.error('Failed to fetch delivery areas:', error)
      }
    }

    fetchDeliveryAreas()
  }, [])

  return (
    <div>
      <CustomerForm
        customerData={customerData}
        customerTypes={customerTypes}
        pickrequirement={pickrequirement}
        paymentmode={paymentmode}
        deliveryPersons={deliveryPersons}
        deliveryAreas={deliveryAreas}
      />
    </div>
  )
}

//@ts-ignore
export const getServerSideProps: GetServerSideProps<CustomerFormPageProps> = async () => {
  try {
    const customerData = {
      firstname: '',
      lastname: '',
      datefirstcontacted: '',
      customertype: '',
      dateofbirth: '',
      accountno: '',
      telephoneres: '',
      telephoneoffice: '',
      addressres: '',
      email: '',
      delieverydate: '',
      deliveryarea: '',
      paymentmode: '',
      notes: '',
      addressoffice: '',
      depositamount: '',
      requirement: '',
      delivery_person: '',
      reqbottles: '',
      tax: ''
    }

    const customerTypes = await prisma.pick_customertype.findMany()
    const pickrequirement = await prisma.pick_requirement.findMany()
    const paymentmode = await prisma.pick_paymentmode.findMany()
    const deliveryPersons = await prisma.employee_personal.findMany()

    const serializeDate = (date: Date | null) => (date ? format(new Date(date), 'yyyy-MM-dd') : null)

    const serializedDeliveryPersons = deliveryPersons.map(person => ({
      id: person.id,
      empid: person.empid,
      employeecode: person.employeecode,
      firstname: person.firstname,
      middlename: person.middlename,
      lastname: person.lastname,
      doj: serializeDate(person.doj),
      salarypaydate: serializeDate(person.salarypaydate),
      dob: serializeDate(person.dob)
    }))

    return {
      props: {
        customerData,
        customerTypes,
        pickrequirement,
        paymentmode,
        deliveryPersons: serializedDeliveryPersons
      }
    }
  } catch (error) {
    console.error(error)

    return {
      notFound: true
    }
  }
}

export default CustomerFormPage
