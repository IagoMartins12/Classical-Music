// ============================================
// ScoreModal - COM BUSCA INTEGRADA
// ============================================
'use client';

import { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import Checkbox from '@/app/components/Common/Checkbox';
import Input from '@/app/components/Common/Inputs';
import SimpleWorkSearchInput from '@/app/components/SimpleWorkSearchInput';
import ComposerSearchInputSimple from '@/app/components/ComposerSearchInputSimple';
import Image from 'next/image';

interface ScoreModalProps {
  editor: Editor;
  onClose: () => void;
}

export function ScoreModal({ editor, onClose }: ScoreModalProps) {
  const [composerFilter, setComposerFilter] = useState('');
  const [selectedWork, setSelectedWork] = useState('');
  const [workData, setWorkData] = useState<any>(null);
  const [scores, setScores] = useState([]);
  const [selectedScore, setSelectedScore] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [allowDownload, setAllowDownload] = useState(true);

  useEffect(() => {
    if (selectedWork) {
      loadScores();
    }
  }, [selectedWork]);

  const loadScores = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/work-scores?workId=${selectedWork}`);
      const data = await response.json();

      console.log('teste', data);
      setScores(data.workScores || []);
    } catch (error) {
      console.error('Erro ao buscar partituras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedScore && workData) {
      editor.commands.insertContent({
        type: 'scoreViewer',
        attrs: {
          workId: workData.id,
          scoreId: selectedScore.id,
          scoreUrl: selectedScore.downloadUrl,
          scoreTitle: selectedScore.title,
          workTitle: workData.title,
          composerName: workData.composer?.name,
          pageNumber,
          allowDownload,
        },
      });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Inserir Visualizador de Partitura"
      maxWidth="3xl"
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
            2. Selecionar Obra
          </label>
          <SimpleWorkSearchInput
            selectedWork={selectedWork}
            onWorkSelect={(id, data) => {
              setSelectedWork(id);
              console.log({ id, data });
              if (data) setWorkData(data);
            }}
            filterByComposer={composerFilter}
          />
        </div>

        {selectedWork && (
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              3. Selecionar Partitura
            </label>

            {loading ? (
              <p className="text-sm text-theme-tertiary">
                Carregando partituras...
              </p>
            ) : scores.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {scores.map((score: any) => (
                  <button
                    key={score.id}
                    type="button"
                    onClick={() => setSelectedScore(score)}
                    className={`w-full p-3 rounded-lg border-2 transition-colors flex justify-between px-8 mx-auto text-left ${
                      selectedScore?.id === score.id
                        ? 'border-accent-green bg-interactive-active'
                        : 'border-theme-secondary hover:border-accent-green'
                    }`}
                  >
                    <div className="flex flex-col justify-center ">
                      <div className="font-medium text-theme-primary">
                        {score.title}
                      </div>
                      <div className="text-sm text-theme-secondary">
                        {score.type} • {score.pageCount} páginas
                      </div>
                    </div>
                    <div>
                      <Image
                        src={score.thumbnailUrl}
                        alt="Capa da partitura"
                        width={80}
                        height={80}
                      />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-theme-secondary">
                Nenhuma partitura encontrada
              </p>
            )}
          </div>
        )}

        {selectedScore && (
          <div className="space-y-3 pt-4 border-t border-theme-secondary">
            <Input
              label="Página inicial"
              type="number"
              value={pageNumber}
              onChange={(e) => setPageNumber(parseInt(e.target.value))}
              min={1}
              widhtFull
            />

            <Checkbox
              label="Permitir download da partitura"
              checked={allowDownload}
              onChange={(e) => setAllowDownload(e.target.checked)}
            />
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!selectedScore}>
            Inserir Visualizador
          </Button>
        </div>
      </form>
    </Modal>
  );
}
