/** The list's cover: a large title and one line on what is inside. */
export function ListHero({ title, text }: { title: string; text: string }) {
  return (
    <header className="flex flex-col gap-4">
      <h1 className="rise font-display text-[clamp(3rem,8vw,6rem)] leading-[0.95] tracking-[-0.02em]">
        {title}
      </h1>
      <p
        className="rise t-corpo max-w-[56ch] text-texto-suave"
        style={{ ['--delay' as string]: '90ms' }}
      >
        {text}
      </p>
    </header>
  );
}

export function EmptyList({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-card bg-sup-2 p-8">
      <p className="font-display text-[1.5rem]">{title}</p>
      <p className="t-rotulo text-texto-suave">{text}</p>
    </div>
  );
}
