import { CSSProperties } from 'react'
import type { DeliveryTicketRow } from 'src/pages/api/delivery-tickets'

// The desktop RMS delivery ticket, made shorter at the client's request
// (10 Nov 2026) to save paper: the "Pay. Recd. Against" boxes (CP/Book,
// Dep/Bot, Dep/Dis, Prv.O/S, Recovery) are gone and Customer's Signature sits
// on the left beside Remarks. Sizes are in print units so the ticket comes out
// the same on the dot-matrix printer as on screen.
export const TICKET_WIDTH = '7.6in'

const ink = '#222'
const brandBlue = '#1d4f91'

const styles: Record<string, CSSProperties> = {
  ticket: {
    width: TICKET_WIDTH,
    boxSizing: 'border-box',
    padding: '0.08in 0.2in 0.1in',
    borderBottom: '1px dashed #888',
    fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
    fontSize: '9.5pt',
    lineHeight: 1.2,
    color: ink,
    background: '#fff',
    breakInside: 'avoid',
    pageBreakInside: 'avoid'
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sideLogo: { height: '0.36in', width: 'auto' },
  centre: { textAlign: 'center' },
  mainLogo: { height: '0.42in', width: 'auto', display: 'block', margin: '0 auto' },
  address: { fontSize: '6.5pt', fontWeight: 700, color: brandBlue, lineHeight: 1.25 },
  title: { textDecoration: 'underline', margin: '0.03in 0 0.02in', letterSpacing: '0.02em' },
  body: { display: 'flex', gap: '0.5in' },
  table: { borderCollapse: 'collapse' },
  label: { width: '1%', padding: '0 0.12in 0 0', whiteSpace: 'nowrap', verticalAlign: 'top' },
  value: { padding: 0, verticalAlign: 'top', whiteSpace: 'pre-line' },
  box: {
    display: 'inline-block',
    width: '0.6in',
    height: '0.15in',
    border: `1px solid ${ink}`,
    verticalAlign: 'middle'
  },
  footer: { display: 'flex', gap: '0.4in', marginTop: '0.08in' },
  line: { display: 'inline-block', width: '2.2in', borderBottom: `1px solid ${ink}`, marginLeft: '0.05in' }
}

const Row = ({ label, children }: { label: string; children?: React.ReactNode }) => (
  <tr>
    <td style={styles.label}>{label}</td>
    <td style={styles.value}>{children}</td>
  </tr>
)

const phoneFax = (customer: DeliveryTicketRow) => [customer.telephone, customer.fax].filter(Boolean).join(' / ')

interface DeliveryTicketProps {
  customer: DeliveryTicketRow

  // Already formatted for display, e.g. "11-11-2026".
  deliveryDate: string
}

const DeliveryTicket = ({ customer, deliveryDate }: DeliveryTicketProps) => (
  <div style={styles.ticket}>
    <div style={styles.header}>
      <img src='/images/invoice/iso-22000.jpg' alt='ISO 22000' style={styles.sideLogo} />
      <div style={styles.centre}>
        <img src='/images/invoice/rivielle.jpg' alt='Rivielle' style={styles.mainLogo} />
        <div style={styles.address}>
          Plot # C-3-28, Block-B, GEM Korangi Industrial Area, Karachi.
          <br />
          Ph: 0300 2734089, 0332 4422385, E-mail: riviellewater@hotmail.com, Website: Rivielle.com
        </div>
      </div>
      <img src='/images/invoice/pakistan-standards.jpg' alt='Pakistan Standards' style={styles.sideLogo} />
    </div>

    <div style={styles.title}>DELIVERY TICKET</div>

    <div style={styles.body}>
      <table style={{ ...styles.table, width: '4.4in' }}>
        <tbody>
          <Row label='A/C. No. :'>{customer.accountno}</Row>
          <Row label='A/C. Name :'>{customer.name}</Row>
          <Row label='Address :'>{customer.address}</Row>
          <Row label='Phone/Fax :'>{phoneFax(customer)}</Row>
          <Row label='Pay. Mode :'>{customer.paymentmode}</Row>
        </tbody>
      </table>
      <table style={styles.table}>
        <tbody>
          <Row label='Dlv. Date :'>{deliveryDate}</Row>
          <Row label='Rate/Unit :' />
          <Row label='Recvd. Qty. :'>
            <span style={styles.box} />
          </Row>
          <Row label='Emp. Bot. Rt. :'>
            <span style={styles.box} />
          </Row>
          <Row label='Rc. Amt. cop :'>
            <span style={styles.box} />
          </Row>
        </tbody>
      </table>
    </div>

    <div style={styles.footer}>
      <span>
        Remarks:
        <span style={styles.line} />
      </span>
      <span>
        Customer&apos;s Signature:
        <span style={styles.line} />
      </span>
    </div>
  </div>
)

export default DeliveryTicket
