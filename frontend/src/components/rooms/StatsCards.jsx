import { useMemo } from "react";

const STATUS_CONFIG = [
  { key: "Available", label: "Available", color: "text-emerald-400" },
  { key: "Occupied", label: "Occupied", color: "text-sky-400" },
  { key: "Reserved", label: "Reserved", color: "text-violet-400" },
  { key: "Cleaning", label: "Cleaning", color: "text-amber-400" },
  { key: "Maintenance", label: "Maintenance", color: "text-rose-400" },
];

export default function StatsCards({ rooms = [] }) {
  const stats = useMemo(() => {
    const counts = STATUS_CONFIG.map(({ key, label, color }) => ({
      value: rooms.filter((r) => r.status === key).length,
      label,
      color,
    }));

    return [
      { value: rooms.length, label: "Total", color: "text-amber-400" },
      ...counts,
    ];
  }, [rooms]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
      {stats.map(({ value, label, color }) => (
        <div
          key={label}
          className="bg-base-700 border border-base-border rounded-2xl py-2 flex flex-col items-center justify-center text-center transition-all duration-200 hover:scale-100 hover:-translate-y-1 hover:border-slate-500 hover:shadow-lg hover:shadow-black/30 cursor-pointer"
        >
          <p className={`text-2xl font-bold font-serif ${color}`}>{value}</p>
          <p className="text-sm text-slate-400 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
