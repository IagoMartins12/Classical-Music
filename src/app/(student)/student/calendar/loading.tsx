import {
  EsqueletoCabecalho,
  EsqueletoCalendario,
  EsqueletoNumeros,
  EsqueletoPagina,
} from '@/app/components/ui/Carregando';

export default function Carregando() {
  return (
    <EsqueletoPagina rotulo="Carregando calendário">
      <EsqueletoCabecalho />
      <EsqueletoNumeros quantos={4} />
      <EsqueletoCalendario />
    </EsqueletoPagina>
  );
}
