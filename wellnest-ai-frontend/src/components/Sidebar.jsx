import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Pill,
  Sparkles,
  Waypoints,
  Users,
  ShieldPlus,
  Settings,
  HeartPulse,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navGroups = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Manage care",
    items: [
      { to: "/documents", label: "Documents", icon: FileText },
      { to: "/medications", label: "Medications", icon: Pill },
      { to: "/chat", label: "Ask WellNest AI", icon: Sparkles, badge: 3 },
    ],
  },
  {
    label: "Your journey",
    items: [
      { to: "/timeline", label: "Health timeline", icon: Waypoints },
      { to: "/family", label: "Family care", icon: Users },
    ],
  },
];

function NavItem({ to, label, icon: Icon, end, badge }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded px-3 py-2.5 text-[14.5px] font-medium transition-colors",
          isActive
            ? "bg-indigo-soft text-indigo"
            : "text-slate hover:bg-white hover:text-ink",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            strokeWidth={isActive ? 2.25 : 1.9}
            className={isActive ? "text-indigo" : "text-slate-light group-hover:text-ink"}
          />
          <span className="flex-1">{label}</span>
          {badge ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo px-1.5 text-[11px] font-semibold text-white">
              {badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ open, onNavigate }) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-40 flex w-[260px] shrink-0 flex-col border-r border-mist bg-canvas transition-transform lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 px-6 pb-5 pt-6">
        <img src="/favicon.svg" alt="WellNest AI" className="h-10 w-auto" />
        <span className="font-display text-[18px] font-extrabold text-ink">WellNest</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3.5 pb-4 scrollbar-thin" onClick={onNavigate}>
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-3 text-[11.5px] font-semibold text-slate-light">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-mist px-3.5 py-4">
        <NavLink
          to="/emergency"
          className={({ isActive }) =>
            [
              "flex items-center gap-3 rounded px-3 py-2.5 text-[14.5px] font-semibold transition-colors",
              isActive ? "bg-coral-soft text-coral" : "text-coral hover:bg-coral-soft",
            ].join(" ")
          }
        >
          <ShieldPlus size={18} strokeWidth={2} />
          Emergency wallet
        </NavLink>
        <NavItem to="/settings" label="Settings" icon={Settings} />
      </div>

      <div className="mx-3.5 mb-4 flex items-center gap-3 rounded-lg border border-mist bg-white px-3 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo text-[13px] font-semibold text-white">
          {user.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold text-ink">{user.name}</p>
          <p className="flex items-center gap-1 text-[12px] text-slate">
            <HeartPulse size={12} /> {user.role} · {user.plan}
          </p>
        </div>
      </div>
    </aside>
  );
}
