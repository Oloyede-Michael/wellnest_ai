import { useEffect, useState } from "react";
import { UserPlus, Shield, MoreHorizontal, X } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { familyApi } from "../lib/api";

export default function FamilyCare() {
  const [members, setMembers] = useState([]);
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    familyApi.list().then(setMembers);
  }, []);

  async function sendInvite(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const member = await familyApi.invite(email.trim());
      setMembers((prev) => [member, ...prev]);
      setEmail("");
      setInviting(false);
    } catch (err) {
      setError(err.message || "Could not send invite");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Family care"
        title="People supporting your care"
        subtitle="Share your medication plan and appointments with people you trust."
        action={
          <button
            onClick={() => setInviting(true)}
            className="flex items-center gap-2 rounded-full bg-indigo px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-indigo-deep"
          >
            <UserPlus size={16} /> Invite caregiver
          </button>
        }
      />

      {inviting && (
        <form
          onSubmit={sendInvite}
          className="mb-6 flex flex-col gap-3 rounded-xl border border-indigo/30 bg-indigo-soft p-4 sm:flex-row sm:items-center"
        >
          <input
            autoFocus
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="caregiver@email.com"
            className="flex-1 rounded-lg border border-mist bg-white px-3.5 py-2.5 text-[14px] text-ink placeholder:text-slate-light focus:border-indigo focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-indigo-deep disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send invite"}
            </button>
            <button
              type="button"
              onClick={() => setInviting(false)}
              className="rounded-lg border border-mist bg-white px-3 py-2.5 text-slate hover:bg-canvas"
              aria-label="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="mb-4 rounded-lg bg-coral-soft px-3.5 py-2.5 text-[13px] font-medium text-coral">{error}</p>
      )}

      {members.length === 0 ? (
        <p className="rounded-xl border border-dashed border-mist bg-white/60 px-5 py-8 text-center text-[13.5px] text-slate">
          No caregivers yet — invite someone you trust to help manage your care.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {members.map((m) => (
            <div key={m.id} className="rounded-xl border border-mist bg-white p-5 shadow-panel">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-soft text-[13.5px] font-semibold text-indigo">
                  {m.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold text-ink">{m.name}</p>
                  <p className="text-[12.5px] text-slate">{m.relation}</p>
                </div>
                <button className="rounded p-1 text-slate-light hover:bg-canvas hover:text-ink">
                  <MoreHorizontal size={17} />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-canvas px-3 py-2 text-[12.5px] font-medium text-slate">
                <Shield size={13} className="text-indigo" /> {m.access}
              </div>
              <p className="mt-2.5 text-[12.5px] text-slate-light">{m.lastSeen}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-dashed border-mist bg-white/60 p-5 text-[13px] text-slate">
        Caregivers only see what you choose to share — medication schedules, appointments, or your full record. You
        can adjust or revoke access at any time.
      </div>
    </div>
  );
}
