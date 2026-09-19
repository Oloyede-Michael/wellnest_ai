import { useEffect, useState } from "react";
import { FileText, Pill, Calendar, Stethoscope } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { timelineApi, usersApi } from "../lib/api";

const kindStyle = {
  document: { icon: FileText, bg: "bg-indigo-soft", text: "text-indigo" },
  medication: { icon: Pill, bg: "bg-meadow-soft", text: "text-meadow-deep" },
  appointment: { icon: Calendar, bg: "bg-amber-soft", text: "text-amber" },
  diagnosis: { icon: Stethoscope, bg: "bg-coral-soft", text: "text-coral" },
};

export default function Timeline() {
  const [events, setEvents] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    Promise.all([timelineApi.getTimeline(), usersApi.getMe()]).then(([e, p]) => {
      setEvents(e);
      setProfile(p);
    });
  }, []);

  if (!profile) return null;

  const documentCount = events.filter((e) => e.kind === "document").length;

  return (
    <div>
      <PageHeader
        eyebrow="Health journey"
        title="Your complete healthcare timeline"
        subtitle={`Tracking milestones since ${profile.memberSince} · ${events.length} events recorded`}
      />

      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Events", value: events.length },
          { label: "Documents", value: documentCount },
          { label: "Days active", value: profile.daysActive },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-mist bg-white px-4 py-4 text-center shadow-panel sm:text-left">
            <p className="font-display text-[24px] font-bold text-indigo tabular">{s.value}</p>
            <p className="text-[12.5px] text-slate">{s.label}</p>
          </div>
        ))}
      </div>

      {events.length === 0 ? (
        <p className="rounded-xl border border-dashed border-mist bg-white/60 px-5 py-8 text-center text-[13.5px] text-slate">
          Your health journey will appear here as you upload documents and track medications.
        </p>
      ) : (
        <div className="relative pl-8 sm:pl-10">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-mist sm:left-[19px]" />
          <ul className="space-y-5">
            {events.map((event) => {
              const style = kindStyle[event.kind] ?? kindStyle.document;
              const Icon = style.icon;
              return (
                <li key={event.id} className="relative">
                  <span
                    className={[
                      "absolute -left-8 top-3 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-canvas sm:-left-10",
                      style.bg,
                      style.text,
                    ].join(" ")}
                  >
                    <Icon size={15} />
                  </span>
                  <div className="rounded-xl border border-mist bg-white px-5 py-4 shadow-panel">
                    <p className="text-[12px] font-medium text-slate-light">{event.date}</p>
                    <p className="mt-0.5 text-[14.5px] font-semibold text-ink">{event.title}</p>
                    <p className="mt-0.5 text-[13.5px] text-slate">{event.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
