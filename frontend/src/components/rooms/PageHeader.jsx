import { useState } from 'react'
import {
  FileDown,
  FileSpreadsheet,
  Printer,
  Plus,
  LayoutGrid,
  List,
} from 'lucide-react'

import { apiDownload } from '../../api/client'

export default function PageHeader({ view, onViewChange, onAddRoom }) {
  const [exporting, setExporting] = useState(false)

  const handleExportExcel = async () => {
    try {
      setExporting(true)

      const blob = await apiDownload(
        '/admin/rooms/export/excel'
      )

      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'rooms.xlsx'

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export Rooms Excel error:', error)

      alert(
        error.message || 'Failed to export rooms.'
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
          Rooms
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Manage all hotel rooms
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">

        {/* Export PDF */}
        <button
          className="flex items-center gap-1.5 bg-base-800 border border-base-border hover:bg-base-700 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
        >
          <FileDown size={15} />
          Export PDF
        </button>

        {/* Export Excel */}
        <button
          onClick={handleExportExcel}
          disabled={exporting}
          className="flex items-center gap-1.5 bg-base-800 border border-base-border hover:bg-base-700 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet size={15} />

          {exporting ? 'Exporting...' : 'Export Excel'}
        </button>

        {/* Print */}
        <button
          className="flex items-center gap-1.5 bg-base-800 border border-base-border hover:bg-base-700 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
        >
          <Printer size={15} />
          Print
        </button>

        {/* Grid / List View */}
        <div className="flex items-center gap-1 bg-base-800 border border-base-border rounded-lg p-1">
          <button
            onClick={() => onViewChange?.('grid')}
            aria-label="Grid view"
            className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
              view === 'grid'
                ? 'bg-amber-400 text-base-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid size={16} />
          </button>

          <button
            onClick={() => onViewChange?.('list')}
            aria-label="List view"
            className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
              view === 'list'
                ? 'bg-amber-400 text-base-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List size={16} />
          </button>
        </div>

        {/* Add Room */}
        <button
          onClick={() => onAddRoom?.()}
          className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold text-sm px-3.5 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Room
        </button>

      </div>
    </div>
  )
}