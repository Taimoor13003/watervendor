import { CSSProperties } from 'react'
import type { DeliveryTicketRow } from 'src/pages/api/delivery-tickets'

// The desktop RMS delivery ticket, printed on the client's continuous two-part
// forms. The Rivielle header, address and both logos are already printed on
// those forms by a print shop, so the computer prints only the ticket's text,
// below that header, one ticket per form.
//
// At the client's request (10-11 Nov 2026) the "Pay. Recd. Against" boxes
// (CP/Book, Dep/Bot, Dep/Dis, Prv.O/S, Recovery), the "DELIVERY TICKET" heading
// and the Rc. Amt. cop row are gone, and Customer's Signature sits on
// the left beside Remarks. The quantities get a short line, not a box: boxes
// made his dot-matrix printer slow.

// His paper, measured from his photos: 9.5in wide with tractor holes, in
// 11in (28cm) sheets, each perforated into three forms 3 2/3in long. The
// printed header takes about the top 1.2in of each form.
export const FORM_WIDTH_IN = 9.5
export const SHEET_LENGTH_IN = 11
export const FORMS_PER_SHEET = 3
export const FORM_LENGTH_IN = SHEET_LENGTH_IN / FORMS_PER_SHEET

// Left blank so the text starts below the printed header.
const TOP_SPACE_IN = 1.35

// Clear of the tractor strip; matches where the desktop printed its labels.
const LEFT_MARGIN_IN = 1.0

const ink = '#000'

const styles: Record<string, CSSProperties> = {
  form: {
    width: `${FORM_WIDTH_IN}in`,
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
    fontSize: '9.5pt',
    lineHeight: 1.2,
    color: ink,
    background: '#fff',
    breakInside: 'avoid',
    pageBreakInside: 'avoid'
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f3f6',
    color: '#8a94a6',
    fontSize: '8pt',
    borderBottom: '1px dashed #c4cad4'
  },
  body: { display: 'flex', gap: '0.5in' },
  table: { borderCollapse: 'collapse' },
  label: { width: '1%', padding: '0 0.12in 0 0', whiteSpace: 'nowrap', verticalAlign: 'top' },
  value: { padding: 0, verticalAlign: 'top', whiteSpace: 'pre-line' },
  // A short line with room above it for a two-digit handwritten number.
  blank: {
    display: 'inline-block',
    width: '0.45in',
    height: '0.28in',
    marginBottom: '0.04in',
    borderBottom: `1px solid ${ink}`,
    verticalAlign: 'bottom'
  },
  footer: { display: 'flex', gap: '0.4in', marginTop: '0.1in' },
  line: { display: 'inline-block', width: '2.2in', borderBottom: `1px solid ${ink}`, marginLeft: '0.05in' }
}

const Row = ({ label, children }: { label: string; children?: React.ReactNode }) => (
  <tr>
    <td style={styles.label}>{label}</td>
    <td style={styles.value}>{children}</td>
  </tr>
)

// A label with a short line to write a number on, the label sitting on the line.
const BlankRow = ({ label }: { label: string }) => (
  <tr>
    <td style={{ ...styles.label, verticalAlign: 'bottom', paddingBottom: '0.04in' }}>{label}</td>
    <td style={styles.value}>
      <span style={styles.blank} />
    </td>
  </tr>
)

const phoneFax = (customer: DeliveryTicketRow) => [customer.telephone, customer.fax].filter(Boolean).join(' / ')

interface DeliveryTicketProps {
  customer: DeliveryTicketRow

  // Already formatted for display, e.g. "11-11-2026".
  deliveryDate: string

  // On screen only: shade where the print shop's header sits on the form.
  showHeaderArea?: boolean
}

const DeliveryTicket = ({ customer, deliveryDate, showHeaderArea }: DeliveryTicketProps) => (
  <div
    style={{
      ...styles.form,
      height: `${FORM_LENGTH_IN}in`,
      padding: `${TOP_SPACE_IN}in 0.6in 0 ${LEFT_MARGIN_IN}in`
    }}
  >
    {showHeaderArea ? (
      <div style={{ ...styles.header, height: `${TOP_SPACE_IN - 0.1}in` }}>
        Pre-printed header (Rivielle logo, address, ISO and Pakistan Standards logos)
      </div>
    ) : null}

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
          <BlankRow label='Recvd. Qty. :' />
          <BlankRow label='Emp. Bot. Rt. :' />
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
