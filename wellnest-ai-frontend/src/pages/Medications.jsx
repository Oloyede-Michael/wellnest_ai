import { Sun, Sunset, Moon, Check, Info } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useHealth } from "../context/HealthContext";

const timeIcon = { Morning: Sun, Afternoon: Sunset, Night: Moon };

export default function Medications() {
  const {
    schedule,
    weekAdherence,
    adherence,
    toggleItemTaken,
    toggleBlockActive,
  } = useHealth();

  const totalItems = schedule.flatMap((b) => b.items || []).length;
  const takenItems = schedule.flatMap((b) => b.items || []).filter((i) => i.taken).length;

  return (
    <div>
      <PageHeader
        eyebrow="Medication planner"
        title="Today's schedule"
        subtitle={`AI-generated from your prescriptions · ${totalItems} medications · ${takenItems} taken so far`}
      />

      <section className="rounded-xl border border-mist bg-white p-5 shadow-panel sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[16px] font-semibold text-ink">Weekly adherence</h3>
          <span className="font-display text-[22px] font-bold text-indigo tabular">{adherence}%</span>
        </div>
        <div className="flex items-end gap-2.5 sm:gap-4">
          {weekAdherence.map((d, i) => (
            <div key={`${d.day}-${i}`} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-20 w-full items-end rounded-md bg-canvas">
                <div
                  className={["w-full rounded-md", d.value > 0 ? "bg-meadow" : "bg-mist"].join(" ")}
                  style={{ height: `${Math.max(d.value, 6)}%` }}
                />
              </div>
              <span className="text-[12px] font-medium text-slate">{d.day}</span>
            </div>
          ))}
        </div>
      </section>

      {totalItems === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-mist bg-white/60 px-5 py-12 text-center">
          <p className="text-[14px] font-medium text-ink">No medication schedule yet.</p>
          <p className="mt-1 text-[13px] text-slate">
            Upload a prescription in the Documents tab and WellNest AI will automatically extract and add your medication plan here.
          </p>
        </div>
      ) : (
        <section className="mt-6 space-y-4">
          {schedule.map((block) => {
            const Icon = timeIcon[block.time] || Sun;
            const items = block.items || [];
            if (items.length === 0) return null;

            return (
              <div key={block.id} className="overflow-hidden rounded-xl border border-mist bg-white shadow-panel">
                <div className="flex items-center gap-3 border-b border-mist px-5 py-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-soft text-indigo">
                    <Icon size={17} />
                  </span>
                  <div className="flex-1">
                    <p className="text-[14.5px] font-semibold text-ink">{block.time}</p>
                    <p className="text-[12.5px] text-slate">{block.clock}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleBlockActive(block.id)}
                    className={[
                      "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                      block.active ? "bg-indigo" : "bg-mist",
                    ].join(" ")}
                    aria-label="Toggle reminders"
                  >
                    <span
                      className={[
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                        block.active ? "translate-x-[22px]" : "translate-x-0.5",
                      ].join(" ")}
                    />
                  </button>
                </div>
                <ul className="divide-y divide-mist">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3 px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleItemTaken(block.id, it.id)}
                        className={[
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          it.taken ? "border-meadow bg-meadow text-white" : "border-mist text-transparent",
                        ].join(" ")}
                        aria-label={it.taken ? "Mark as not taken" : "Mark as taken"}
                      >
                        <Check size={14} strokeWidth={3} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-medium text-ink">
                            {it.name} <span className="font-normal text-slate">({it.dose})</span>
                          </p>
                          {it.sourceDocName && (
                            <span className="rounded bg-canvas px-2 py-0.5 text-[11px] text-slate-light border border-mist">
                              {it.sourceDocName}
                            </span>
                          )}
                        </div>
                        <p className="text-[12.5px] text-slate">
                          {it.purpose} · {it.instruction}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      <p className="mt-5 flex items-start gap-2 rounded-lg bg-indigo-soft px-4 py-3 text-[13px] text-indigo-deep">
        <Info size={16} className="mt-0.5 shrink-0" />
        This schedule is generated from your uploaded prescriptions. Always confirm changes with your care provider before adjusting a dose.
      </p>
    </div>
  );
}
