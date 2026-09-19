import { useEffect, useState } from "react";
import { Droplet, AlertTriangle, Stethoscope, Pill, Phone, Share2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { emergencyApi, usersApi } from "../lib/api";

export default function Emergency() {
  const [wallet, setWallet] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    Promise.all([emergencyApi.getWallet(), usersApi.getMe()]).then(([w, p]) => {
      setWallet(w);
      setProfile(p);
    });
  }, []);

  if (!wallet || !profile) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Emergency health wallet"
        title="In case of emergency"
        subtitle="Show this to first responders or hospital staff — no login required in emergency mode."
        action={
          <button className="flex items-center gap-2 rounded-full border border-mist bg-white px-4 py-2.5 text-[13.5px] font-semibold text-ink hover:bg-canvas">
            <Share2 size={16} /> Share wallet
          </button>
        }
      />

      <div className="rounded-xl border border-coral/25 bg-gradient-to-br from-coral to-[#B93A31] p-6 text-white sm:p-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-white/75">Patient</p>
            <p className="font-display text-[22px] font-bold">{profile.name}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <Droplet size={20} />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-8">
          <div>
            <p className="text-[12px] text-white/70">Blood group</p>
            <p className="font-display text-[26px] font-bold">{wallet.bloodGroup || "—"}</p>
          </div>
          <div>
            <p className="text-[12px] text-white/70">Primary diagnosis</p>
            <p className="text-[15px] font-semibold">
              {profile.diagnosis || "None on file"} {profile.stage && `· ${profile.stage}`}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-mist bg-white p-5 shadow-panel">
          <div className="mb-3 flex items-center gap-2 text-coral">
            <AlertTriangle size={17} />
            <h3 className="font-display text-[15.5px] font-semibold text-ink">Allergies</h3>
          </div>
          {wallet.allergies.length === 0 ? (
            <p className="text-[13px] text-slate">None on file</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {wallet.allergies.map((a) => (
                <li key={a} className="rounded-full bg-coral-soft px-3 py-1 text-[12.5px] font-medium text-coral">
                  {a}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-mist bg-white p-5 shadow-panel">
          <div className="mb-3 flex items-center gap-2 text-indigo">
            <Stethoscope size={17} />
            <h3 className="font-display text-[15.5px] font-semibold text-ink">Existing conditions</h3>
          </div>
          {wallet.conditions.length === 0 ? (
            <p className="text-[13px] text-slate">None on file</p>
          ) : (
            <ul className="space-y-1.5 text-[13.5px] text-ink">
              {wallet.conditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-mist bg-white p-5 shadow-panel">
          <div className="mb-3 flex items-center gap-2 text-meadow-deep">
            <Pill size={17} />
            <h3 className="font-display text-[15.5px] font-semibold text-ink">Current medications</h3>
          </div>
          {wallet.medications.length === 0 ? (
            <p className="text-[13px] text-slate">None on file</p>
          ) : (
            <ul className="space-y-1.5 text-[13.5px] text-ink">
              {wallet.medications.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-mist bg-white p-5 shadow-panel">
          <div className="mb-3 flex items-center gap-2 text-slate">
            <Phone size={17} />
            <h3 className="font-display text-[15.5px] font-semibold text-ink">Emergency contacts</h3>
          </div>
          {wallet.contacts.length === 0 ? (
            <p className="text-[13px] text-slate">None on file</p>
          ) : (
            <ul className="space-y-3">
              {wallet.contacts.map((c) => (
                <li key={c.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-[13.5px] font-medium text-ink">{c.name}</p>
                    <p className="text-[12px] text-slate">{c.relation}</p>
                  </div>
                  <a href={`tel:${c.phone}`} className="text-[13px] font-medium text-indigo">
                    {c.phone}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
