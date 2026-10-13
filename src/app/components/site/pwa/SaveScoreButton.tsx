'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiCheckCircle, PiDeviceMobile } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { PWA } from '@/app/conteudo/site/pwa';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import {
  aoMudarPartituras,
  estaGuardada,
  guardarPartitura,
  removerPartitura,
  type PartituraGuardada,
} from '@/app/libs/pwa/partituras';

/**
 * "Guardar no aparelho" beside a score's download: keeps the file for use
 * without internet; once kept, the same button takes it off. Hidden where
 * the browser has no Cache API.
 */
export function SaveScoreButton({
  dados,
}: {
  dados: Omit<PartituraGuardada, 'bytes' | 'guardadaEm'>;
}) {
  const { language } = useRouteLanguage();
  const copy = PWA[language].guardar;
  const [suportado, setSuportado] = useState(false);
  const [guardada, setGuardada] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    setSuportado(typeof caches !== 'undefined');
    const atualizar = () => setGuardada(estaGuardada(dados.url));
    atualizar();
    return aoMudarPartituras(atualizar);
  }, [dados.url]);

  if (!suportado) return null;

  const alternar = async () => {
    setOcupado(true);
    try {
      if (guardada) {
        await removerPartitura(dados.url);
        toast.success(copy.removida);
      } else {
        await guardarPartitura(dados);
        toast.success(copy.ok);
      }
    } catch {
      toast.error(copy.erro);
    } finally {
      setOcupado(false);
    }
  };

  return (
    <Button
      tamanho="p"
      variante={guardada ? 'fantasma' : 'secundario'}
      icone={guardada ? PiCheckCircle : PiDeviceMobile}
      carregando={ocupado}
      aria-pressed={guardada}
      title={guardada ? copy.remover : undefined}
      onClick={() => void alternar()}
    >
      {ocupado ? copy.guardando : guardada ? copy.guardada : copy.guardar}
    </Button>
  );
}
