import { AlertCircle, CheckCircle2, Clock3, Library } from "lucide-react";

interface DashboardStatsProps {
  total: number;
  processed: number;
  processing: number;
  failed: number;
}

export function DashboardStats({ total, processed, processing, failed }: DashboardStatsProps) {
  const items = [
    { label: "Total Bookmarks", value: total, icon: Library, color: "text-zinc-700" },
    { label: "Processed", value: processed, icon: CheckCircle2, color: "text-emerald-700" },
    { label: "Processing", value: processing, icon: Clock3, color: "text-blue-700" },
    { label: "Failed", value: failed, icon: AlertCircle, color: "text-rose-700" },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">{item.label}</p>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">{item.value}</p>
        </div>
      ))}
    </section>
  );
}
