export function SectionHead({
  index,
  kicker,
  title,
  sub,
}: {
  index: string;
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-5">
      <span className="mt-1 font-mono text-sm text-muted/60">{index}</span>
      <div className="max-w-2xl">
        <span className="font-mono text-xs tracking-[0.25em] text-accent uppercase">{kicker}</span>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
