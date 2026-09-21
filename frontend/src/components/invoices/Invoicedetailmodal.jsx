import { useEffect, useState } from 'react'
import { X, Printer } from 'lucide-react'
import { apiFetch } from '../../api/client'
import { formatMoney, STATUS_STYLES } from './invoiceUtils'

export async function fetchInvoice(id) {
  const res = await apiFetch(`/invoices/${id}`)
  return res.data
}

export function printInvoice(inv) {
  const rows = (inv.payments ?? [])
    .map(
      (p) =>
        `<tr><td>${p.created_at ?? ''}</td><td>${p.payment_method ?? p.method ?? ''}</td><td>${p.status ?? ''}</td><td style="text-align:right">${formatMoney(p.amount)}</td></tr>`
    )
    .join('')

  const html = `<!doctype html><html><head><title>${inv.invoice_number}</title>
  <style>
    body{font-family:Arial,sans-serif;padding:32px;color:#111}
    h1{margin:0 0 4px} table{width:100%;border-collapse:collapse;margin-top:16px}
    td,th{padding:8px;border-bottom:1px solid #ddd;text-align:left;font-size:14px}
    .right{text-align:right}
  </style></head><body>
    <h1>Lumière Grand Hotel</h1>
    <p>Invoice <strong>${inv.invoice_number}</strong> · ${inv.created_at} · ${inv.status}</p>
    <p><strong>${inv.guest.name}</strong><br>${inv.guest.email}<br>${inv.guest.phone}</p>
    <p>Room ${inv.room.number} · ${inv.room.type}<br>
       ${inv.stay.check_in} → ${inv.stay.check_out} (${inv.stay.nights} night(s))</p>
    <table>
      <tr><td>Subtotal</td><td class="right">${formatMoney(inv.pricing.subtotal)}</td></tr>
      <tr><td>Tax</td><td class="right">${formatMoney(inv.pricing.tax)}</td></tr>
      <tr><td><strong>Total</strong></td><td class="right"><strong>${formatMoney(inv.pricing.total)}</strong></td></tr>
      <tr><td>Paid</td><td class="right">${formatMoney(inv.pricing.paid)}</td></tr>
      <tr><td><strong>Balance</strong></td><td class="right"><strong>${formatMoney(inv.pricing.balance)}</strong></td></tr>
    </table>
    ${rows ? `<h3>Payments</h3><table><tr><th>Date</th><th>Method</th><th>Status</th><th class="right">Amount</th></tr>${rows}</table>` : ''}
  </body></html>`

  const w = window.open('', '_blank', 'width=800,height=900')
  if (!w) return alert('Please allow pop-ups to print invoices.')
  w.document.write(html)
  w.document.close()
  w.focus()
  w.print()
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={strong ? 'text-white font-semibold' : 'text-slate-200'}>{value}</span>
    </div>
  )
}

export default function InvoiceDetailModal({ invoiceId, onClose }) {
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    fetchInvoice(invoiceId)
      .then((data) => !cancelled && setInvoice(data))
      .catch((err) => !cancelled && setError(err.message || 'Failed to load invoice.'))
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [invoiceId])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-base-850 border border-base-border rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white font-serif">
              {invoice?.invoice_number ?? 'Invoice'}
            </h2>
            {invoice && (
              <p className="text-xs text-slate-400 mt-1">Created {invoice.created_at}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {loading && <div className="h-32 mt-6 rounded-lg bg-base-800 animate-pulse" />}
        {error && <p className="mt-6 text-sm text-rose-400">{error}</p>}

        {invoice && (
          <div className="mt-5 space-y-5">
            <span
              className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                STATUS_STYLES[invoice.status] ?? 'bg-base-800 text-slate-300'
              }`}
            >
              {invoice.status}
            </span>

            <section>
              <p className="text-xs font-semibold text-slate-500 mb-1">Guest</p>
              <Row label="Name" value={invoice.guest.name} />
              <Row label="Email" value={invoice.guest.email} />
              <Row label="Phone" value={invoice.guest.phone} />
            </section>

            <section>
              <p className="text-xs font-semibold text-slate-500 mb-1">Stay</p>
              <Row label="Room" value={`${invoice.room.number} · ${invoice.room.type}`} />
              <Row label="Check-in" value={invoice.stay.check_in} />
              <Row label="Check-out" value={invoice.stay.check_out} />
              <Row label="Nights" value={invoice.stay.nights} />
            </section>

            <section className="border-t border-base-border pt-3">
              <Row label="Subtotal" value={formatMoney(invoice.pricing.subtotal)} />
              <Row label="Tax" value={formatMoney(invoice.pricing.tax)} />
              <Row label="Total" value={formatMoney(invoice.pricing.total)} strong />
              <Row label="Paid" value={formatMoney(invoice.pricing.paid)} />
              <Row label="Balance" value={formatMoney(invoice.pricing.balance)} strong />
            </section>

            <button
              onClick={() => printInvoice(invoice)}
              className="w-full flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold text-sm px-3.5 py-2.5 rounded-lg transition-colors"
            >
              <Printer size={15} />
              Print invoice
            </button>
          </div>
        )}
      </div>
    </div>
  )
}