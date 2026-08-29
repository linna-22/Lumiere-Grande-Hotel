import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Reusable pagination bar. Pass Laravel's raw paginator meta object
 * directly (current_page, last_page, per_page, total) — no normalization
 * needed, whatever page/list you're paginating.
 *
 * <Pagination currentPage={page} meta={meta} onPageChange={setPage} itemLabel="guests" />
 */
export default function Pagination({ currentPage, meta, onPageChange, itemLabel = 'results' }) {
  if (!meta || meta.last_page <= 1) return null

  const lastPage = meta.last_page

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(lastPage, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  return (
    <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
      <p className="text-sm text-slate-400">
        Page {currentPage} of {lastPage} · {meta.total} {itemLabel}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg text-slate-400 hover:bg-base-800 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {getPageNumbers()[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="text-sm font-medium px-3 py-1.5 rounded-lg text-slate-400 hover:bg-base-800 hover:text-slate-200 transition-colors"
            >
              1
            </button>
            <span className="text-slate-600 px-1">...</span>
          </>
        )}

        {getPageNumbers().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              p === currentPage
                ? 'bg-amber-400 text-base-950 font-semibold'
                : 'text-slate-400 hover:bg-base-800 hover:text-slate-200'
            }`}
          >
            {p}
          </button>
        ))}

        {getPageNumbers().at(-1) < lastPage && (
          <>
            <span className="text-slate-600 px-1">...</span>
            <button
              onClick={() => onPageChange(lastPage)}
              className="text-sm font-medium px-3 py-1.5 rounded-lg text-slate-400 hover:bg-base-800 hover:text-slate-200 transition-colors"
            >
              {lastPage}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg text-slate-400 hover:bg-base-800 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}