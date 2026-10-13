import Link from '@/app/components/LocalizedLink';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Revelar } from '@/app/components/ui/Revelar';
import { cx } from '@/app/components/ui/cx';
import type { HomeCopy } from '@/app/conteudo/site/home';

/** The closing call: free forever, and what the paid plans add. */
export function PlansCallout({ copy }: { copy: HomeCopy['plans'] }) {
  return (
    <Revelar as="section" className="section-wrap py-16">
      <div className="grid grid-cols-1 gap-10 rounded-card bg-sup-2 p-6 md:p-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
        <div className="flex flex-col gap-4">
          <h2 className="t-titulo max-w-[16ch]">{copy.title}</h2>
          <p className="t-corpo text-texto-suave">{copy.text}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/pricing" className={classesDeBotao('primario', 'm')}>
              {copy.cta}
            </Link>
            <Link
              href="/for-teachers"
              className={classesDeBotao('fantasma', 'm')}
            >
              {copy.teachers}
            </Link>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {copy.items.map((plan, i) => (
            <li
              key={plan.name}
              className={cx(
                'flex flex-col gap-2 rounded-card p-4',
                i === 1 ? 'tint-ouro' : 'bg-[var(--fundo)]'
              )}
            >
              <span
                className={cx(
                  'font-display text-[1.5rem]',
                  i === 1 && 'text-ouro-na-tinta'
                )}
              >
                {plan.name}
              </span>
              <span className="t-rotulo text-texto-suave">{plan.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </Revelar>
  );
}
