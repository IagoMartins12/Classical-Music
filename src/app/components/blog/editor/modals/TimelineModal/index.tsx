// components/blog/editor/modals/TimelineModal.tsx - COM UPLOAD TEMPORÁRIO
'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { FiTrash2 } from 'react-icons/fi';
import Image from 'next/image';
import { BiPlus, BiUpload } from 'react-icons/bi';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Button from '@/app/components/Common/Button';
import ComposerSearchInputSimple from '@/app/components/ComposerSearchInputSimple';

interface TimelineModalProps {
  editor: Editor;
  onClose: () => void;
  articleId?: string;
  sessionId?: string; // ✅ NOVO
}

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  image?: string;
}

export function TimelineModal({
  editor,
  onClose,
  articleId,
  sessionId, // ✅ NOVO
}: TimelineModalProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([
    { date: '', title: '', description: '', image: '' },
  ]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const [composerId, setComposerId] = useState('');
  const [composerName, setComposerName] = useState('');

  const addEvent = () => {
    setEvents([...events, { date: '', title: '', description: '', image: '' }]);
  };

  const removeEvent = (index: number) => {
    if (events.length > 1) {
      setEvents(events.filter((_, i) => i !== index));
    }
  };

  const updateEvent = (
    index: number,
    field: keyof TimelineEvent,
    value: string
  ) => {
    const newEvents = [...events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setEvents(newEvents);
  };

  // ✅ CORRIGIDO: Upload com ou sem articleId
  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'timeline');

      // Se tem articleId, usa. Se não, usa sessionId
      if (articleId) {
        formData.append('articleId', articleId);
      } else if (sessionId) {
        formData.append('sessionId', sessionId);
      }

      const response = await fetch('/api/blog/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        updateEvent(index, 'image', data.url);
      } else {
        alert('Erro ao fazer upload: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleComposerSelect = async (id: string) => {
    setComposerId(id);

    if (id) {
      try {
        const response = await fetch('/api/composers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          const composer = await response.json();
          setComposerName(composer.fullName || composer.name);
        }
      } catch (error) {
        console.error('Erro ao buscar compositor:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const validEvents = events.filter((event) => event.date && event.title);

    if (validEvents.length === 0) {
      alert('Adicione pelo menos um evento com data e título');
      return;
    }

    editor.commands.insertContent({
      type: 'timeline',
      attrs: {
        events: validEvents,
        composerId,
        composerName,
      },
    });
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Inserir Timeline"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Compositor vinculado */}
        <div className="classical-card-simple p-4 bg-blue-50 dark:bg-blue-900/20">
          <h4 className="text-sm font-semibold text-theme-primary mb-3">
            Vincular Compositor (opcional)
          </h4>
          <ComposerSearchInputSimple
            selectedComposer={composerId}
            onComposerSelect={handleComposerSelect}
          />
          {composerName && (
            <p className="text-xs text-theme-tertiary mt-2">
              ✅ Timeline vinculada a: <strong>{composerName}</strong>
            </p>
          )}
        </div>

        {/* Eventos */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-theme-primary">
            Eventos da Timeline
          </h4>

          {events.map((event, index) => (
            <div key={index} className="classical-card-simple p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-theme-primary">
                  Evento {index + 1}
                </h4>
                {events.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEvent(index)}
                    leftIcon={<FiTrash2 />}
                  >
                    Remover
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <Input
                  label="Data *"
                  type="text"
                  value={event.date}
                  onChange={(e) => updateEvent(index, 'date', e.target.value)}
                  placeholder="Ex: 1770, Dezembro 1770, 16/12/1770"
                  required
                  widhtFull
                />

                <Input
                  label="Título *"
                  type="text"
                  value={event.title}
                  onChange={(e) => updateEvent(index, 'title', e.target.value)}
                  placeholder="Ex: Nascimento"
                  required
                  widhtFull
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-theme-primary mb-1">
                  Descrição
                </label>
                <textarea
                  value={event.description}
                  onChange={(e) =>
                    updateEvent(index, 'description', e.target.value)
                  }
                  rows={2}
                  placeholder="Descreva o evento..."
                  className="input-classical-2 w-full resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-1">
                  Imagem (opcional)
                </label>
                {event.image ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <Image
                      src={event.image}
                      alt={event.title}
                      width={800}
                      height={160}
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => updateEvent(index, 'image', '')}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-theme-medium"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-theme-secondary rounded-lg p-6 text-center hover:border-brand-primary transition-colors">
                    <input
                      type="file"
                      id={`event-image-${index}`}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(index, file);
                      }}
                      className="hidden"
                      disabled={uploadingIndex === index}
                    />
                    <label
                      htmlFor={`event-image-${index}`}
                      className="cursor-pointer"
                    >
                      <BiUpload className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                      <span className="text-sm text-theme-secondary">
                        {uploadingIndex === index
                          ? 'Enviando...'
                          : 'Clique para fazer upload'}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addEvent}
          leftIcon={<BiPlus className="w-5 h-5" />}
          className="w-full"
        >
          Adicionar Evento
        </Button>

        <div className="flex justify-end space-x-2 pt-4 border-t border-theme-secondary">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Inserir Timeline
          </Button>
        </div>
      </form>
    </Modal>
  );
}
