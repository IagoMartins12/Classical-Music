'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Sheet } from '@/app/components/ui/Sheet';
import { CONTRIBUTE } from '@/app/conteudo/site/contribute';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { addCuriosity, type Curiosity } from '@/app/requests/contributions';

const MIN = 20;
const MAX = 400;

/** Sharing a curiosity about a composer, in the page's language. */
export function CuriositySheet({
  open,
  onClose,
  onAdded,
  composerId,
  name,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (curiosity: Curiosity) => void;
  composerId: string;
  name: string;
}) {
  const { language } = useRouteLanguage();
  const copy = CONTRIBUTE[language];
  const t = copy.curiosities;
  const [text, setText] = useState('');
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setText('');
    setTried(false);
  }, [open]);

  const error = text.trim().length < MIN ? t.min : undefined;

  const publish = async () => {
    setTried(true);
    if (error) return;
    setSaving(true);
    const result = await addCuriosity(composerId, {
      text: text.trim(),
      language,
    }).catch(() => null);
    setSaving(false);
    if (!result?.ok) return toast.error(result?.error || copy.failed);
    toast.success(copy.published(0));
    onAdded(result.data);
    onClose();
  };

  return (
    <Sheet
      aberto={open}
      aoFechar={onClose}
      titulo={t.sheetTitle(name)}
      descricao={t.sheetIntro}
      largura="p"
      rodape={
        <div className="flex justify-end gap-2">
          <Button variante="fantasma" onClick={onClose} disabled={saving}>
            {copy.cancel}
          </Button>
          <Button
            variante="primario"
            carregando={saving}
            onClick={() => void publish()}
          >
            {copy.publish}
          </Button>
        </div>
      }
    >
      <Field.Area
        label={t.label}
        rows={4}
        maxLength={MAX}
        placeholder={t.placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        erro={tried ? error : undefined}
      />
    </Sheet>
  );
}
