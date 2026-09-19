import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BellRing,
  ChevronRight,
  ChevronDown,
  FileHeart,
  HeartPulse,
  Lock,
  MessageCircle,
  Pill,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Users,
  Waypoints,
} from "lucide-react";
import useReveal from "../lib/useReveal";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
];

const stats = [
  { value: "12k+", label: "records understood" },
  { value: "99.2%", label: "reading accuracy" },
  { value: "4.9/5", label: "user rating" },
];

const marqueeItems = [
  { icon: ScanLine, label: "Lab results explained" },
  { icon: Pill, label: "Smart refill reminders" },
  { icon: Waypoints, label: "Full health timeline" },
  { icon: Users, label: "Shared family care" },
  { icon: MessageCircle, label: "Plain-language AI answers" },
  { icon: FileHeart, label: "Every document decoded" },
  { icon: BellRing, label: "Medication alerts" },
];

const features = [
  {
    icon: ScanLine,
    tint: "bg-indigo-soft text-indigo",
    title: "Instant document understanding",
    body: "Upload prescriptions, lab reports, or discharge summaries — WellNest reads them and explains what matters in seconds.",
  },
  {
    icon: MessageCircle,
    tint: "bg-meadow-soft text-meadow-deep",
    title: "Ask WellNest AI anything",
    body: "\"What does my latest blood test mean?\" Get clear, plain-language answers grounded in your own records.",
  },
  {
    icon: Pill,
    tint: "bg-amber-soft text-amber",
    title: "Medications that stay on track",
    body: "Smart schedules, gentle reminders, and refill alerts — so no dose is ever missed or doubled.",
  },
  {
    icon: Waypoints,
    tint: "bg-coral-soft text-coral",
    title: "Your health, as one story",
    body: "Every visit, test, and treatment woven into a timeline you can actually follow — and share with your doctor.",
  },
  {
    icon: Users,
    tint: "bg-indigo-soft text-indigo",
    title: "Care that includes family",
    body: "Invite caregivers into a shared space with the right level of access — everyone stays in the loop, safely.",
  },
  {
    icon: ShieldCheck,
    tint: "bg-meadow-soft text-meadow-deep",
    title: "Private by design",
    body: "Your records are encrypted, access is controlled, and biometric lock keeps your data yours — always.",
  },
];

const steps = [
  {
    icon: FileHeart,
    title: "Add your records",
    body: "Snap a photo or upload documents. WellNest organizes everything automatically — no folders, no filing.",
  },
  {
    icon: Sparkles,
    title: "AI explains everything",
    body: "Medical language becomes human language. Understand diagnoses, results, and next steps with confidence.",
  },
  {
    icon: TrendingUp,
    title: "Stay ahead of your health",
    body: "Timelines, reminders, and insights help you and your care circle act early — not after something goes wrong.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Diabetes patient",
    quote: "WellNest turned my chaotic pile of lab results into something I could actually understand. I finally feel in control of my health.",
    initials: "SM",
    tint: "bg-indigo-soft text-indigo",
  },
  {
    name: "James K.",
    role: "Caregiver for his mother",
    quote: "I live across the country from my mom. WellNest lets me stay on top of her medications and appointments without guessing.",
    initials: "JK",
    tint: "bg-meadow-soft text-meadow-deep",
  },
  {
    name: "Dr. Priya L.",
    role: "Family physician",
    quote: "My patients who use WellNest come to appointments more prepared. It bridges the gap between medical jargon and real understanding.",
    initials: "PL",
    tint: "bg-amber-soft text-amber",
  },
];

const securityFeatures = [
  {
    icon: Lock,
    title: "End-to-end encryption",
    body: "Your health data is encrypted in transit and at rest. No one — not even our team — can read your records without your key.",
  },
  {
    icon: ShieldCheck,
    title: "HIPAA compliant",
    body: "Built to meet the highest healthcare data standards. Regular audits and strict access controls keep your information safe.",
  },
  {
    icon: Users,
    title: "Biometric lock",
    body: "Require Face ID, fingerprint, or device passcode to open the app — so your data stays yours, even if your phone is shared.",
  },
  {
    icon: ScanLine,
    title: "Audit logs",
    body: "Every access to your records is logged. You can see who viewed what, when, and revoke access at any time.",
  },
];

const faqs = [
  {
    q: "Is WellNest a replacement for my doctor?",
    a: "No. WellNest is a tool to help you understand and organize your health information. It does not provide medical advice, diagnosis, or treatment. Always consult your healthcare provider for medical decisions.",
  },
  {
    q: "What types of documents can I upload?",
    a: "WellNest supports prescriptions, lab reports, discharge summaries, imaging reports, vaccination records, and most standard medical documents in PDF, image, or text format.",
  },
  {
    q: "Is my health data secure?",
    a: "Absolutely. All data is end-to-end encrypted, stored on HIPAA-compliant infrastructure, and you can enable biometric lock for app access. You own your data — we never sell or share it.",
  },
  {
    q: "Can I share my records with my doctor or family?",
    a: "Yes. You can invite family members or caregivers with role-based access, and share specific records or summaries with your healthcare providers.",
  },
  {
    q: "How does the AI chat work?",
    a: "The AI chat answers questions about your uploaded records in plain language. It reads your documents and gives you clear explanations — like having a medical translator on call.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. WellNest is free to start with core features. You can upgrade for advanced AI insights, family sharing, and priority support.",
  },
];

function Logo({ className = "h-16 w-auto" }) {
  return <img src="/favicon.svg" alt="WellNest AI" className={className} />;
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-mist bg-white/90 shadow-panel backdrop-blur-md"
          : "border-transparent bg-white/60 backdrop-blur-sm",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-content items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="WellNest AI home">
          <Logo className="h-24 w-auto" />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-[14px] font-medium text-slate transition-colors hover:bg-canvas hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <Link
            to="/login"
            className="hidden rounded-lg px-3.5 py-2 text-[14px] font-semibold text-slate transition-colors hover:text-ink sm:block"
          >
            Sign in
          </Link>
          <Link
            to="/login"
            className="group flex items-center gap-1.5 rounded-lg bg-indigo px-4 py-2 text-[14px] font-semibold text-white shadow-float transition-all hover:bg-indigo-deep"
          >
            Get started
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto mt-14 max-w-3xl sm:mt-16">
      {/* glow behind the card */}
      <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-indigo/25 via-meadow/20 to-amber/25 blur-2xl" />
      <div className="spin-slower absolute -right-4 -top-4 -z-10 hidden h-16 w-16 rounded-full border-2 border-dashed border-indigo/30 sm:block" />

      <div className="bob rounded-xl border border-mist bg-white shadow-float" style={{ "--d": "0.4s" }}>
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-mist px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-coral/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-meadow/70" />
          <span className="mx-auto hidden rounded-full bg-canvas px-4 py-1 text-[11.5px] text-slate sm:block">
            wellnest.ai — Dashboard
          </span>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-[17px] font-bold text-ink">Good morning, Sarah</p>
            <span className="rounded-full bg-indigo-soft px-3 py-1 text-[11.5px] font-semibold text-indigo">
              All vitals stable
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: HeartPulse, tint: "bg-coral-soft text-coral", label: "Heart rate", value: "72 bpm" },
              { icon: Timer, tint: "bg-indigo-soft text-indigo", label: "Sleep", value: "7h 40m" },
              { icon: Activity, tint: "bg-meadow-soft text-meadow-deep", label: "Steps", value: "8,432" },
            ].map(({ icon: Icon, tint, label, value }) => (
              <div key={label} className="rounded-lg border border-mist bg-canvas p-3">
                <span className={`flex h-7 w-7 items-center justify-center rounded-md ${tint}`}>
                  <Icon size={14} />
                </span>
                <p className="mt-2 text-[11.5px] text-slate">{label}</p>
                <p className="tabular font-display text-[15px] font-bold text-ink">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-mist bg-white p-3">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[12px] font-semibold text-ink">Live heart rhythm</p>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-meadow-deep">
                <span className="relative flex h-2 w-2">
                  <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-meadow" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-meadow" />
                </span>
                Recording
              </span>
            </div>
            <svg viewBox="0 0 600 120" className="h-14 w-full" fill="none" aria-hidden="true">
              <path
                d="M0,60 L80,60 L100,60 L110,20 L120,95 L130,60 L180,60 L200,40 L220,60 L300,60 L320,15 L330,100 L340,60 L420,60 L440,45 L460,60 L600,60"
                stroke="#2E9B4F"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ecg-line"
              />
            </svg>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-mist bg-canvas px-3 py-1.5 text-[11.5px] font-medium text-slate">
              <Pill size={12} className="text-indigo" /> Metformin 500mg · 2:00 PM
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-mist bg-canvas px-3 py-1.5 text-[11.5px] font-medium text-slate">
              <Sparkles size={12} className="text-amber" /> 3 new AI insights
            </span>
          </div>
        </div>
      </div>

      {/* floating cards */}
      <div
        className="bob absolute -right-4 -top-8 hidden items-center gap-2.5 rounded-lg border border-mist bg-white px-3.5 py-2.5 shadow-float md:flex"
        style={{ "--d": "1.1s" }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-soft text-indigo">
          <Pill size={15} />
        </span>
        <div>
          <p className="text-[12px] font-semibold text-ink">Medication reminder</p>
          <p className="text-[11px] text-slate">Metformin · in 20 minutes</p>
        </div>
      </div>
      <div
        className="bob absolute -left-6 bottom-10 hidden items-center gap-2.5 rounded-lg border border-mist bg-white px-3.5 py-2.5 shadow-float md:flex"
        style={{ "--d": "1.8s" }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-soft text-amber">
          <Sparkles size={15} />
        </span>
        <div>
          <p className="text-[12px] font-semibold text-ink">AI summary ready</p>
          <p className="text-[11px] text-slate">Lab results explained simply</p>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  useReveal();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden pb-20 pt-32 sm:pt-36">
        {/* drifting gradient orbs */}
        <div className="orb left-[-8%] top-[-10%] h-[420px] w-[420px] bg-indigo/30" />
        <div className="orb right-[-6%] top-[6%] h-[360px] w-[360px] bg-meadow/25" style={{ "--d": "-5s" }} />
        <div className="orb bottom-[-14%] left-[30%] h-[300px] w-[300px] bg-amber/20" style={{ "--d": "-9s" }} />

        <div className="relative mx-auto max-w-content px-4 text-center sm:px-6">
          <span
            className="hero-in inline-flex items-center gap-2 rounded-full border border-indigo/20 bg-indigo-soft px-4 py-1.5 text-[12.5px] font-semibold text-indigo"
            style={{ "--d": "0ms" }}
          >
            <Sparkles size={14} />
            Your health records, finally understandable
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl font-display text-[42px] font-extrabold leading-[1.06] tracking-tight text-center sm:text-[60px] lg:text-[68px]">
            <span className="word-in block" style={{ "--d": "250ms" }}>Understand. Track.</span>
            <span className="word-in block" style={{ "--d": "470ms" }}>Heal</span>
            <span className="word-in block text-shine bg-gradient-to-r from-indigo via-meadow to-indigo bg-clip-text text-transparent" style={{ "--d": "580ms" }}>Together.</span>
          </h1>

          <p
            className="hero-in mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-slate sm:text-[17.5px]"
            style={{ "--d": "750ms" }}
          >
            WellNest AI reads your documents, explains your results, tracks your medications,
            and keeps everyone who cares for you on the same page.
          </p>

          <div className="hero-in mt-8 flex flex-wrap items-center justify-center gap-3" style={{ "--d": "900ms" }}>
            <Link
              to="/login"
              className="group flex items-center gap-2 rounded-lg bg-indigo px-6 py-3 text-[15px] font-semibold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-indigo-deep"
            >
              Start free today
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="group flex items-center gap-1.5 rounded-lg border border-mist bg-white px-6 py-3 text-[15px] font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-indigo/40 hover:text-indigo"
            >
              Explore features
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="hero-in mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4" style={{ "--d": "1050ms" }}>
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="tabular font-display text-[26px] font-extrabold text-ink">{stat.value}</p>
                <p className="text-[12.5px] text-slate">{stat.label}</p>
              </div>
            ))}
          </div>

          <DashboardPreview />

          {/* scroll cue */}
          <a
            href="#marquee"
            className="hero-in mx-auto mt-14 flex h-10 w-6 items-start justify-center rounded-full border-2 border-slate-light/60 p-1.5"
            style={{ "--d": "1300ms" }}
            aria-label="Scroll down"
          >
            <span className="scroll-wheel block h-2 w-1 rounded-full bg-slate" />
          </a>
        </div>
      </section>

      {/* ================= MARQUEE ================= */}
      <section id="marquee" className="overflow-hidden border-y border-mist bg-white py-5">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-light">
          Trusted by patients everywhere
        </p>
        <div className="marquee-track flex w-max items-center gap-12">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={`${item.label}-${i}`} className="flex items-center gap-2.5 text-[13.5px] font-medium text-slate">
              <item.icon size={16} className="text-indigo" />
              {item.label}
            </span>
          ))}
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="relative overflow-hidden py-20 sm:py-24">
        <div className="mx-auto max-w-content px-4 sm:px-6">
           <div data-reveal className="reveal mx-auto max-w-2xl text-center">
            <p className="text-[13px] font-semibold text-indigo">Features</p>
            <h2 className="mt-2 font-display text-[30px] font-extrabold tracking-tight sm:text-[38px]">
              Everything your care needs,{" "}
              <span className="bg-gradient-to-r from-indigo to-meadow bg-clip-text text-transparent">
                in one place
              </span>
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-slate">
              Built for patients and the people who care about them — powerful for you,
              effortless for your family.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                data-reveal
                style={{ "--reveal-delay": `${(i % 3) * 90}ms` }}
                className="group rounded-xl border border-mist bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${feature.tint} transition-transform duration-300 group-hover:scale-110`}
                >
                  <feature.icon size={20} />
                </span>
                <h3 className="mt-4 font-display text-[17px] font-bold text-ink">{feature.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-slate">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="relative overflow-hidden bg-white py-20 sm:py-24">
        <div className="orb right-[-10%] top-[20%] h-[320px] w-[320px] bg-indigo/15" />
        <div className="relative mx-auto max-w-content px-4 sm:px-6">
          <div data-reveal className="reveal mx-auto max-w-2xl text-center">
            <p className="text-[13px] font-semibold text-indigo">How it works</p>
            <h2 className="mt-2 font-display text-[30px] font-extrabold tracking-tight sm:text-[38px]">
              From paper pile to peace of mind
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-slate">
              Three simple steps — and your whole health journey becomes clear.
            </p>
          </div>

          <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
            {/* connector line */}
            <div className="absolute left-[16%] right-[16%] top-9 hidden border-t-2 border-dashed border-indigo/25 md:block" />

            {steps.map((step, i) => (
              <div
                key={step.title}
                data-reveal
                style={{ "--reveal-delay": `${i * 140}ms` }}
                className="relative text-center"
              >
                <div className="relative mx-auto flex h-[72px] w-[72px] items-center justify-center">
                  <span className="pulse-ring absolute inset-0 rounded-full bg-indigo/20" style={{ animationDelay: `${i * 0.6}s` }} />
                  <span className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-indigo to-indigo-deep text-white shadow-float">
                    <step.icon size={26} />
                  </span>
                </div>
                <p className="tabular mt-4 font-mono text-[12px] font-medium text-indigo">0{i + 1}</p>
                <h3 className="mt-1 font-display text-[18px] font-bold text-ink">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-[13.5px] leading-relaxed text-slate">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section id="testimonials" className="relative overflow-hidden py-20 sm:py-24">
        <div className="mx-auto max-w-content px-4 sm:px-6">
          <div data-reveal className="reveal mx-auto max-w-2xl text-center">
            <p className="text-[13px] font-semibold text-indigo">Testimonials</p>
            <h2 className="mt-2 font-display text-[30px] font-extrabold tracking-tight sm:text-[38px]">
              Trusted by patients and families
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-slate">
              Hear from people who turned confusing medical records into clear, actionable knowledge.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                data-reveal
                style={{ "--reveal-delay": `${i * 100}ms` }}
                className="group rounded-xl border border-mist bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="fill-amber text-amber" />
                  ))}
                </div>
                <p className="text-[14px] leading-relaxed text-slate">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold ${t.tint}`}>
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{t.name}</p>
                    <p className="text-[12px] text-slate">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section id="security" className="relative overflow-hidden bg-white py-20 sm:py-24">
        <div className="orb right-[-10%] top-[20%] h-[320px] w-[320px] bg-meadow/15" />
        <div className="relative mx-auto max-w-content px-4 sm:px-6">
          <div data-reveal className="reveal mx-auto max-w-2xl text-center">
            <p className="text-[13px] font-semibold text-indigo">Security & Privacy</p>
            <h2 className="mt-2 font-display text-[30px] font-extrabold tracking-tight sm:text-[38px]">
              Your data, protected at every layer
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-slate">
              Built with healthcare-grade security from day one. Your records stay yours — always.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {securityFeatures.map((f, i) => (
              <div
                key={f.title}
                data-reveal
                style={{ "--reveal-delay": `${i * 90}ms` }}
                className="group flex gap-4 rounded-xl border border-mist bg-canvas p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-float"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-meadow-soft text-meadow-deep transition-transform duration-300 group-hover:scale-110">
                  <f.icon size={20} />
                </span>
                <div>
                  <h3 className="font-display text-[16px] font-bold text-ink">{f.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="relative overflow-hidden py-20 sm:py-24">
        <div className="mx-auto max-w-content px-4 sm:px-6">
          <div data-reveal className="reveal mx-auto max-w-2xl text-center">
            <p className="text-[13px] font-semibold text-indigo">FAQ</p>
            <h2 className="mt-2 font-display text-[30px] font-extrabold tracking-tight sm:text-[38px]">
              Questions? We've got answers
            </h2>
          </div>

          <div data-reveal className="reveal mx-auto mt-12 max-w-2xl space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                data-reveal
                style={{ "--reveal-delay": `${i * 60}ms` }}
                className="rounded-xl border border-mist bg-white transition-all duration-300 hover:border-indigo/30"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-display text-[15px] font-semibold text-ink">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-slate transition-transform duration-300"
                    style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: openFaq === i ? "200px" : "0px",
                    opacity: openFaq === i ? 1 : 0,
                  }}
                >
                  <p className="px-5 pb-4 text-[14px] leading-relaxed text-slate">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section id="cta" className="py-20 sm:py-24">
        <div className="mx-auto max-w-content px-4 sm:px-6">
          <div
            data-reveal
            className="reveal-zoom relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-deep via-indigo to-indigo-deep px-6 py-16 text-center sm:px-12"
          >
            <div className="orb left-[8%] top-[-30%] h-[280px] w-[280px] bg-white/15" />
            <div className="orb bottom-[-40%] right-[6%] h-[300px] w-[300px] bg-meadow/30" style={{ "--d": "-7s" }} />
            <div className="spin-slow absolute -right-14 -top-14 h-44 w-44 rounded-full border-2 border-dashed border-white/20" />

            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-[30px] font-extrabold tracking-tight text-white sm:text-[40px]">
                Take control of your health story today
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-white/80">
                Join thousands of patients and families who understand their care — not just
                collect it. Free to start, ready in minutes.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/login"
                  className="group flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-[15px] font-semibold text-indigo shadow-float transition-all hover:-translate-y-0.5"
                >
                  Create your free account
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <p className="mt-5 text-[12.5px] text-white/60">No credit card required · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-mist bg-white py-10">
        <div className="mx-auto flex max-w-content flex-col items-center gap-6 px-4 sm:px-6 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-2 md:items-start">
          <Logo className="h-24 w-auto" />
            <p className="text-[12.5px] text-slate">Understand. Track. Heal Together.</p>
          </div>
          <nav className="flex items-center gap-6 text-[13px] font-medium text-slate">
            <a href="#features" className="transition-colors hover:text-indigo">Features</a>
            <a href="#how" className="transition-colors hover:text-indigo">How it works</a>
            <a href="#security" className="transition-colors hover:text-indigo">Security</a>
            <a href="#faq" className="transition-colors hover:text-indigo">FAQ</a>
            <Link to="/login" className="transition-colors hover:text-indigo">Sign in</Link>
          </nav>
          <p className="text-[12.5px] text-slate-light">© 2026 WellNest AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
