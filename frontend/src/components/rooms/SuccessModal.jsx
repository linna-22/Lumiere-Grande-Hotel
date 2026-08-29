import { CheckCircle2 } from 'lucide-react'

export default function SuccessModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-base-900 border border-base-border rounded-2xl w-full max-w-sm p-6 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 size={48} className="text-emerald-400" />
        </div>
        <h2 className="text-white font-serif text-lg font-bold mb-1">Success</h2>
        <p className="text-sm text-slate-400 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  )
}