export type InvoiceStatus = 'Paid' | string

export type InvoiceLayoutProps = {
  id: string | undefined
}

export type InvoiceClientType = {
  name: string
  address: string
  company: string
  country: string
  contact: string
  companyEmail: string
}

export type InvoiceType = {
  firstname?: string;
  lastname?: string;
  middlename?: string;
  customertype?: string;
  paymentmode?: string;
  telephoneres?: string;
  id: number;
  name: string;
  total: number;
  avatar?: string;
  service: string;
  dueDate: string;
  address: string;
  company: string;
  country: string;
  contact: string;
  avatarColor?: string;
  issuedDate: string;
  companyEmail: string;
  balance: string | number;
  invoiceStatus: string;
};



export type InvoicePaymentType = {
  iban: string
  totalDue: string
  bankName: string
  country: string
  swiftCode: string
}

export type SingleInvoiceType = {
  invoice: InvoiceType
  paymentDetails: InvoicePaymentType
}
