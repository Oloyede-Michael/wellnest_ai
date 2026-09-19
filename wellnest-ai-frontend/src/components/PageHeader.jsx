export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-1.5 text-[13px] font-medium text-indigo">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-[26px] font-bold leading-tight text-ink sm:text-[30px]">
          {title}
        </h1>
        {subtitle ? <p className="mt-1.5 text-[14.5px] text-slate">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
