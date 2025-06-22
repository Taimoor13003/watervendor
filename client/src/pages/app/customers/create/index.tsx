import { GetServerSideProps } from 'next/types'
import { format } from 'date-fns'
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
  deliveryAreas: { id: number; deliveryarea: string }[]
}

const CustomerFormPage = ({
  customerData,
  customerTypes,
  pickrequirement,
  paymentmode,
  deliveryPersons,
  deliveryAreas
}: CustomerFormPageProps) => {

  return (
    <div>
      <CustomerForm
      // @ts-ignore
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

// @ts-ignore
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

    const [
      customerTypes,
      pickrequirement,
      deliveryPersons,
      paymentmode,
      deliveryAreas
    ] = await Promise.all([
      prisma.pick_customertype.findMany()
        .catch(err => {
          console.error('Error loading customer types:', err)
          return []
        }),
      prisma.pick_requirement.findMany()
        .catch(err => {
          console.error('Error loading requirements:', err)
          return []
        }),
      prisma.employee_personal.findMany()
        .catch(err => {
          console.error('Error loading delivery persons:', err)
          return []
        }),
      prisma.pick_paymentmode.findMany()
        .catch(err => {
          console.error('Error loading payment modes:', err)
          return []
        }),
      prisma.pick_deliveryarea.findMany()
        .catch(err => { console.error('Error loading delivery areas:', err); return [] })
    ])


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
        deliveryPersons: serializedDeliveryPersons,
        deliveryAreas
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
