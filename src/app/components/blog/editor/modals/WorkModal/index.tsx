// ============================================
// WorkModal - COM BUSCA INTEGRADA E FILTRO
// ============================================
'use client';

import { useState, useId } from 'react';
import { Editor } from '@tiptap/react';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import ComposerSearchInputSimple from '@/app/components/ComposerSearchInputSimple';
import SimpleWorkSearchInput from '@/app/components/SimpleWorkSearchInput';
import { getWorkById } from '@/app/requests/catalog-search';
import { Stack } from '@/app/components/ui/Layout';

interface WorkModalProps {
  editor: Editor;
  onClose: () => void;
}

export function WorkModal({ editor, onClose }: WorkModalProps) {
  const idCampo = useId();
  const [composerFilter, setComposerFilter] = useState('');
  const [selectedWork, setSelectedWork] = useState('');
  const [workData, setWorkData] = useState<any>(null);

  const handleWorkSelect = async (workId: string) => {
    setSelectedWork(workId);

    if (workId) {
      try {
        const work = await getWorkById(workId);
        if (work) setWorkData(work);
      } catch (error) {
        console.error('Erro ao buscar obra:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (workData) {
      editor.commands.insertContent({
        type: 'workCard',
        attrs: {
          workId: workData.id,
          workTitle: workData.title,
          composerName: workData.composer?.name,
          instrumentName: workData.instrument?.name,
        },
      });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Inserir Card de Obra"
      maxWidth="2xl"
      minHeight
    >
      <Stack as="form" onSubmit={handleSubmit}>
        <Stack gap={2}>
          <label
            htmlFor={`${idCampo}-1`}
            className="block text-sm font-medium text-theme-primary"
          >
            1. Filtrar por Compositor (opcional)
          </label>
          <ComposerSearchInputSimple
            id={`${idCampo}-1`}
            selectedComposer={composerFilter}
            onComposerSelect={setComposerFilter}
          />
        </Stack>

        <Stack gap={2}>
          <label
            htmlFor={`${idCampo}-2`}
            className="block text-sm font-medium text-theme-primary"
          >
            2. Buscar Obra
          </label>
          <SimpleWorkSearchInput
            id={`${idCampo}-2`}
            selectedWork={selectedWork}
            onWorkSelect={handleWorkSelect}
            filterByComposer={composerFilter}
          />
        </Stack>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!workData}>
            Inserir Card
          </Button>
        </div>
      </Stack>
    </Modal>
  );
}
