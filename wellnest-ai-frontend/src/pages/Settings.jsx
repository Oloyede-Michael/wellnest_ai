import { useEffect, useState } from "react";
import { Bell, Lock, Globe, LogOut } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { usersApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const toggleDefs = [
  { key: "medicationReminders", label: "Medication reminders", sub: "Get notified before each scheduled dose", icon: Bell },
  { key: "caregiverNotifications", label: "Caregiver notifications", sub: "Let family caregivers see activity updates", icon: Globe },
  { key: "biometricLock", label: "Biometric lock", sub: "Require Face ID or fingerprint to open WellNest", icon: Lock },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    usersApi.getPreferences().then(setPreferences);
  }, []);

  async function toggle(key) {
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);
    try {
      await usersApi.updatePreferences({ [key]: next[key] });
    } catch {
      setPreferences(preferences);
    }
  }

  if (!user || !preferences) return null;

  return (
    <div>
      <PageHeader eyebrow="Settings" title="Account & preferences" subtitle="Manage how WellNest keeps your care on track." />

      <div className="rounded-xl border border-mist bg-white p-5 shadow-panel sm:p-6">
        <div className="flex items-center gap-4 border-b border-mist pb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo text-[16px] font-semibold text-white">
            {user.initials}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-ink">{user.name}</p>
            <p className="text-[13px] text-slate">
              {user.role} · {user.plan} · Member since {user.memberSince}
            </p>
          </div>
        </div>

        <ul className="divide-y divide-mist">
          {toggleDefs.map((t) => (
            <li key={t.key} className="flex items-center gap-3 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-canvas text-slate">
                <t.icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-ink">{t.label}</p>
                <p className="text-[12.5px] text-slate">{t.sub}</p>
              </div>
              <button
                onClick={() => toggle(t.key)}
                className={[
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  preferences[t.key] ? "bg-indigo" : "bg-mist",
                ].join(" ")}
                aria-label={`Toggle ${t.label}`}
              >
                <span
                  className={[
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                    preferences[t.key] ? "translate-x-[22px]" : "translate-x-0.5",
                  ].join(" ")}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={logout}
        className="mt-6 flex items-center gap-2 text-[13.5px] font-medium text-coral hover:text-coral/80"
      >
        <LogOut size={16} /> Sign out
      </button>
    </div>
  );
}
