import { FileDown, FileSpreadsheet, Printer, Plus } from "lucide-react";

export default function PageHeader({onAddRoomType }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
          RoomTypes
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage all hotel roomtypes
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button className="flex items-center gap-1.5 bg-base-800 border border-base-border hover:bg-base-700 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
          <FileDown size={15} />
          Export PDF
        </button>
        <button className="flex items-center gap-1.5 bg-base-800 border border-base-border hover:bg-base-700 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
          <FileSpreadsheet size={15} />
          Export Excel
        </button>
        <button className="flex items-center gap-1.5 bg-base-800 border border-base-border hover:bg-base-700 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
          <Printer size={15} />
          Print
        </button>
        <button
          onClick={() => onAddRoomType?.()}
          className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold text-sm px-3.5 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          New RoomType
        </button>
      </div>
    </div>
  );
}
