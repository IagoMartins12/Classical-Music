import {
  EsqueletoCabecalho,
  EsqueletoFaixas,
  EsqueletoFichas,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando perguntas frequentes">
      <EsqueletoCabecalho centro />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <EsqueletoFichas quantos={10} />
        <EsqueletoFaixas quantos={7} />
      </div>
    </EsqueletoPagina>
  );
}
