import { Loader2 } from 'lucide-react'
export default function Loading({ label = 'Loading…', size = 'md', fullPage = false }) {
  const iconSize = size === 'sm' ? 14 : 16
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  const content = (
    <div className={`flex items-center justify-center gap-2 text-slate-500 ${textSize}`}>
      <Loader2 size={iconSize} className="animate-spin" />
      {label}
    </div>
  )

  if (fullPage) {
    return <div className="flex items-center justify-center min-h-[50vh]">{content}</div>
  }

  return <div className="py-14">{content}</div>
}