import { InvoiceType } from 'src/types/apps/invoiceTypes';
import { getDateRange } from 'src/@core/utils/get-daterange';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

const mock = new MockAdapter(axios);

const now = new Date();
const currentMonth = now.toLocaleString('default', { month: 'short' });

const data: { invoices: InvoiceType[] } = {
  invoices: [
    {
      id: 4987,
      issuedDate: `13 ${currentMonth} ${now.getFullYear()}`,
      address: '7777 Mendez Plains',
      company: 'Hall-Robbins PLC',
      companyEmail: 'don85@johnson.com',
      country: 'USA',
      contact: '(616) 865-4180',
      name: 'Jordan Stevenson',
      service: 'Software Development',
      total: 3428,
      avatar: 'yes', // Optional, can be an empty string if not used
      avatarColor: 'primary', // Optional
      invoiceStatus: 'Paid',
      balance: '$724',
      dueDate: `23 ${currentMonth} ${now.getFullYear()}`,
      firstname: 'Jordan',
      lastname: 'Stevenson',
      middlename: 'haris', // Provide a default value if necessary
      customertype: 'Regular',
      paymentmode: 'Credit',
      telephoneres: '(616) 865-4180'
    },
    {
      id: 4988,
      issuedDate: `17 ${currentMonth} ${now.getFullYear()}`,
      address: '04033 Wesley Wall Apt. 961',
      company: 'Mccann LLC and Sons',
      companyEmail: 'brenda49@taylor.info',
      country: 'Haiti',
      contact: '(226) 204-8287',
      name: 'Stephanie Burns',
      service: 'UI/UX Design & Development',
      total: 5219,
      avatar: '/images/avatars/1.png',
      invoiceStatus: 'Downloaded',
      balance: 0,
      dueDate: `15 ${currentMonth} ${now.getFullYear()}`,
      firstname: 'Stephanie',
      lastname: 'Burns',
      middlename: '', // Provide a default value if necessary
      customertype: 'VIP',
      paymentmode: 'Cash',
      telephoneres: '(226) 204-8287'
    },
    {
      id: 4989,
      issuedDate: `19 ${currentMonth} ${now.getFullYear()}`,
      address: '5345 Robert Squares',
      company: 'Leonard-Garcia and Sons',
      companyEmail: 'smithtiffany@powers.com',
      country: 'Denmark',
      contact: '(955) 676-1076',
      name: 'Tony Herrera',
      service: 'Unlimited Extended License',
      total: 3719,
      avatar: '/images/avatars/2.png',
      invoiceStatus: 'Paid',
      balance: 0,
      dueDate: `03 ${currentMonth} ${now.getFullYear()}`,
      firstname: 'Tony',
      lastname: 'Herrera',
      middlename: '', // Provide a default value if necessary
      customertype: 'Regular',
      paymentmode: 'Coupon',
      telephoneres: '(955) 676-1076'
    },
    {
      id: 5032,
      issuedDate: `31 ${currentMonth} ${now.getFullYear()}`,
      address: '01871 Kristy Square',
      company: 'Yang, Hansen and Hart PLC',
      companyEmail: 'ywagner@jones.com',
      country: 'Germany',
      contact: '(203) 601-8603',
      name: 'Richard Payne',
      service: 'Template Customization',
      total: 5181,
      avatar: '', // Optional
      avatarColor: 'error', // Optional
      invoiceStatus: 'Past Due',
      balance: 0,
      dueDate: `22 ${currentMonth} ${now.getFullYear()}`,
      firstname: 'Richard',
      lastname: 'Payne',
      middlename: '', // Provide a default value if necessary
      customertype: 'VIP',
      paymentmode: 'Cash',
      telephoneres: '(203) 601-8603'
    },
    {
      id: 5033,
      issuedDate: `12 ${currentMonth} ${now.getFullYear()}`,
      address: '075 Smith Views',
      company: 'Jenkins-Rosales Inc',
      companyEmail: 'calvin07@joseph-edwards.org',
      country: 'Colombia',
      contact: '(895) 401-4255',
      name: 'Lori Wells',
      service: 'Template Customization',
      total: 2869,
      avatar: '/images/avatars/7.png',
      invoiceStatus: 'Partial Payment',
      balance: 0,
      dueDate: `22 ${currentMonth} ${now.getFullYear()}`,
      firstname: 'Lori',
      lastname: 'Wells',
      middlename: '', // Provide a default value if necessary
      customertype: 'Regular',
      paymentmode: 'Coupon',
      telephoneres: '(895) 401-4255'
    },
    {
      id: 5034,
      issuedDate: `10 ${currentMonth} ${now.getFullYear()}`,
      address: '2577 Pearson Overpass Apt. 314',
      company: 'Mason-Reed PLC',
      companyEmail: 'eric47@george-castillo.com',
      country: 'Paraguay',
      contact: '(602) 336-9806',
      name: 'Tammy Sanchez',
      service: 'Unlimited Extended License',
      total: 4836,
      avatar: '', // Optional
      avatarColor: 'warning', // Optional
      invoiceStatus: 'Paid',
      balance: 0,
      dueDate: `22 ${currentMonth} ${now.getFullYear()}`,
      firstname: 'Tammy',
      lastname: 'Sanchez',
      middlename: '', // Provide a default value if necessary
      customertype: 'VIP',
      paymentmode: 'Credit',
      telephoneres: '(602) 336-9806'
    }
  ]
};

mock.onGet('/apps/invoice/invoices').reply(config => {
  const { q = '', status = '', dates = [] } = config.params ?? {};
  const queryLowered = q.toLowerCase();
  const filteredData = data.invoices.filter(invoice => {
    if (dates.length) {
      const [start, end] = dates;
      const filtered: number[] = [];
      const range = getDateRange(start, end);
      const invoiceDate = new Date(invoice.issuedDate);

      range.filter(date => {
        const rangeDate = new Date(date);
        if (
          invoiceDate.getFullYear() === rangeDate.getFullYear() &&
          invoiceDate.getDate() === rangeDate.getDate() &&
          invoiceDate.getMonth() === rangeDate.getMonth()
        ) {
          filtered.push(invoice.id);
        }
      });

      if (filtered.length && filtered.includes(invoice.id)) {
        return (
          (invoice.companyEmail.toLowerCase().includes(queryLowered) ||
            invoice.name.toLowerCase().includes(queryLowered) ||
            String(invoice.id).toLowerCase().includes(queryLowered) ||
            String(invoice.total).toLowerCase().includes(queryLowered) ||
            String(invoice.balance).toLowerCase().includes(queryLowered) ||
            invoice.dueDate.toLowerCase().includes(queryLowered)) &&
          invoice.invoiceStatus.toLowerCase() === (status.toLowerCase() || invoice.invoiceStatus.toLowerCase())
        );
      }
    } else {
      return (
        (invoice.companyEmail.toLowerCase().includes(queryLowered) ||
          invoice.name.toLowerCase().includes(queryLowered) ||
          String(invoice.id).toLowerCase().includes(queryLowered) ||
          String(invoice.total).toLowerCase().includes(queryLowered) ||
          String(invoice.balance).toLowerCase().includes(queryLowered) ||
          invoice.dueDate.toLowerCase().includes(queryLowered)) &&
        invoice.invoiceStatus.toLowerCase() === (status.toLowerCase() || invoice.invoiceStatus.toLowerCase())
      );
    }
  });

  return [
    200,
    {
      params: config.params,
      allData: data.invoices,
      invoices: filteredData,
      total: filteredData.length
    }
  ];
});

mock.onGet('/apps/invoice/single-invoice').reply(config => {
  const { id } = config.params;

  const invoiceData = data.invoices.filter(invoice => invoice.id === parseInt(id, 10));
  if (invoiceData.length) {
    return [200, { invoice: invoiceData[0] }];
  } else {
    return [404, { message: 'Invoice not found' }];
  }
});
