export function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <header lang="en" className="flex flex-col gap-1 border-b border-hairline pb-3">
        <h2 className="text-3xl text-alabaster">{title}</h2>
        {note && <p className="max-w-3xl text-sm text-alabaster-muted">{note}</p>}
      </header>
      {children}
    </section>
  );
}
