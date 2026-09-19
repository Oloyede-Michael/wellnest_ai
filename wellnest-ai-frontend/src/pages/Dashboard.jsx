import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  Sparkles,
  Pill,
  Users,
  ChevronRight,
  FileText,
  Calendar,
  Waypoints,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";
import VitalRing from "../components/VitalRing";
import { usersApi, timelineApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useHealth } from "../context/HealthContext";

const quickActions = [
  { to: "/documents", label: "Upload a document", icon: Upload },
  { to: "/chat", label: "Ask WellNest AI", icon: Sparkles },
  { to: "/medications", label: "Medication plan", icon: Pill },
  { to: "/family", label: "Family care", icon: Users },
];

const activityIcon = {
  document: FileText,
  medication: Pill,
  appointment: Calendar,
  insight: Lightbulb,
};

export default function Dashboard() {
  const { user } = useAuth();
  const { adherence: contextAdherence, weekAdherence: contextWeek, documents } = useHealth();

  const [profile, setProfile] = useState(user);
  const [vitals, setVitals] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      usersApi.getMe(),
      usersApi.getVitals(),
      timelineApi.getRecentActivity(4),
    ]).then(([profileRes, vitalsRes, activityRes]) => {
      if (!active) return;
      if (profileRes.status === "fulfilled" && profileRes.value) {
        setProfile(profileRes.value);
      }
      if (vitalsRes.status === "fulfilled" && vitalsRes.value?.length) {
        setVitals(vitalsRes.value);
      }
      if (activityRes.status === "fulfilled" && activityRes.value?.length) {
        setRecentActivity(activityRes.value);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const latestDoc = documents[0];
  const activeDiagnosis = latestDoc?.diagnosis || profile?.diagnosis || "No diagnosis recorded yet";
  const displayAdherence = contextAdherence ?? 0;
  const displayWeek = contextWeek || [];

  // Merge uploaded documents into recent activity feed
  const docActivities = documents.slice(0, 3).map((d) => ({
    id: d.id,
    kind: "document",
    title: `${d.name} uploaded`,
    detail: `${d.type} — ${d.laymanExplanation ? d.laymanExplanation.slice(0, 60) + "..." : "Analyzed"}`,
    time: d.date,
  }));

  const combinedActivity = [...docActivities, ...recentActivity].slice(0, 4);

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-slate">
        <span>Good to see you, {(profile?.name || "Patient").split(" ")[0]}</span>
        <span className="text-mist">·</span>
        <span>{profile?.daysActive || 1} days on WellNest</span>
      </div>
      <h1 className="mb-7 font-display text-[28px] font-bold text-ink sm:text-[32px]">
        Here's where your health stands today
      </h1>

      {/* Hero panel */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-deep via-indigo to-[#3457D4] p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-meadow/10" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <p className="text-[13px] font-medium text-white/70">Active treatment</p>
            <h2 className="mt-1 font-display text-[24px] font-bold sm:text-[26px]">
              {activeDiagnosis}{" "}
              {profile?.stage && <span className="text-white/60 font-medium">· {profile.stage}</span>}
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-white/15 bg-white/5 px-4 py-3">
                <p className="text-[12px] text-white/60">Next appointment</p>
                {profile?.nextAppointment ? (
                  <>
                    <p className="mt-0.5 text-[15px] font-semibold">
                      {profile.nextAppointment.date} · {profile.nextAppointment.time}
                    </p>
                    <p className="text-[12.5px] text-white/70">{profile.nextAppointment.withWhom}</p>
                  </>
                ) : (
                  <p className="mt-0.5 text-[13.5px] text-white/70">None scheduled</p>
                )}
              </div>
              <div className="rounded-lg border border-white/15 bg-white/5 px-4 py-3">
                <p className="text-[12px] text-white/60">This week</p>
                <div className="mt-1.5 flex items-end gap-1.5">
                  {displayWeek.map((d, i) => (
                    <div key={`${d.day}-${i}`} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex h-8 w-full items-end rounded-sm bg-white/10">
                        <div
                          className="w-full rounded-sm bg-meadow"
                          style={{ height: `${Math.max(d.value, 6)}%`, opacity: d.value === 0 ? 0.3 : 1 }}
                        />
                      </div>
                      <span className="text-[10px] text-white/50">{d.day[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 lg:pl-8">
            <VitalRing value={displayAdherence} label="Adherence" />
            <p className="flex items-center gap-1 text-[12.5px] text-meadow-soft/90">
              <ArrowUpRight size={14} className="text-[#B9F26B]" />
              <span className="text-white/80">
                {profile?.adherenceTrend >= 0 ? "+" : ""}
                {profile?.adherenceTrend || 4}% this week
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-6 rounded-xl border border-mist bg-white shadow-panel">
        <div className="grid grid-cols-2 divide-x divide-mist sm:grid-cols-4">
          {quickActions.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex flex-col items-start gap-3 px-5 py-5 transition-colors hover:bg-canvas sm:[&:not(:first-child)]:border-t-0 border-t border-mist sm:border-t-0"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-soft text-indigo transition-colors group-hover:bg-indigo group-hover:text-white">
                <Icon size={17} />
              </span>
              <span className="text-[13.5px] font-medium text-ink">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Two column */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Recent activity */}
        <div className="lg:col-span-3 rounded-xl border border-mist bg-white p-5 shadow-panel sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-[17px] font-semibold text-ink">Recent activity</h3>
            <Link to="/timeline" className="flex items-center gap-0.5 text-[13px] font-medium text-indigo">
              View timeline <ChevronRight size={15} />
            </Link>
          </div>
          {combinedActivity.length === 0 ? (
            <p className="py-4 text-[13.5px] text-slate">
              No activity yet — upload a document to get started.
            </p>
          ) : (
            <ul className="divide-y divide-mist">
              {combinedActivity.map((a) => {
                const Icon = activityIcon[a.kind] ?? Waypoints;
                return (
                  <li key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-slate">
                      <Icon size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-ink">{a.title}</p>
                      <p className="truncate text-[13px] text-slate">{a.detail}</p>
                    </div>
                    <span className="shrink-0 text-[12px] text-slate-light">{a.time}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Vitals */}
        <div className="lg:col-span-2 rounded-xl border border-mist bg-white p-5 shadow-panel sm:p-6">
          <h3 className="mb-4 font-display text-[17px] font-semibold text-ink">Latest vitals</h3>
          {vitals.length === 0 ? (
            <p className="text-[13.5px] text-slate">No vitals recorded yet.</p>
          ) : (
            <ul className="space-y-4">
              {vitals.map((v) => (
                <li key={v.label} className="flex items-center justify-between border-b border-mist pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="text-[13.5px] text-slate">{v.label}</p>
                    <p className="text-[12px] text-slate-light">{v.note}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-[17px] font-bold text-ink tabular">
                      {v.value} <span className="text-[12px] font-normal text-slate">{v.unit}</span>
                    </p>
                    <span
                      className={[
                        "text-[11px] font-medium",
                        v.status === "improving" ? "text-meadow" : "text-slate-light",
                      ].join(" ")}
                    >
                      {v.status === "improving" ? "Improving" : "Steady"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
