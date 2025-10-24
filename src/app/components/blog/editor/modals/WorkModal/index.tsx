// ============================================
// WorkModal - COM BUSCA INTEGRADA E FILTRO
// ============================================
'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import ComposerSearchInputSimple from '@/app/components/ComposerSearchInputSimple';
import SimpleWorkSearchInput from '@/app/components/SimpleWorkSearchInput';

interface WorkModalProps {
  editor: Editor;
  onClose: () => void;
}

export function WorkModal({ editor, onClose }: WorkModalProps) {
  const [composerFilter, setComposerFilter] = useState('');
  const [selectedWork, setSelectedWork] = useState('');
  const [workData, setWorkData] = useState<any>(null);

  const handleWorkSelect = async (workId: string) => {
    setSelectedWork(workId);

    if (workId) {
      try {
        const response = await fetch(`/api/works/${workId}`);

        if (response.ok) {
          const work = await response.json();
          setWorkData(work);
        }
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            1. Filtrar por Compositor (opcional)
          </label>
          <ComposerSearchInputSimple
            selectedComposer={composerFilter}
            onComposerSelect={setComposerFilter}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            2. Buscar Obra
          </label>
          <SimpleWorkSearchInput
            selectedWork={selectedWork}
            onWorkSelect={handleWorkSelect}
            filterByComposer={composerFilter}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!workData}>
            Inserir Card
          </Button>
        </div>
      </form>
    </Modal>
  );
}
