import { useState } from "react";
import { Menu, Search, Bell, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-mist bg-canvas/90 px-4 py-3 backdrop-blur lg:px-8">
      <button
        onClick={onMenuClick}
        className="rounded p-1.5 text-slate hover:bg-white lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="relative flex-1 max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" />
        <input
          type="text"
          placeholder="Search records, medications, visits…"
          className="w-full rounded-full border border-mist bg-white py-2 pl-9 pr-4 text-[13.5px] text-ink placeholder:text-slate-light focus:border-indigo focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          className="relative rounded-full p-2 text-slate hover:bg-white hover:text-ink"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-coral" />
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-indigo-soft text-[13px] font-semibold text-indigo sm:flex"
          >
            {user?.initials}
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-mist bg-white p-1 shadow-float">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-coral hover:bg-coral-soft"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
