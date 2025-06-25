// app/components/StudyMode/components/StudyNotes.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FiEdit3,
  FiSave,
  FiClock,
  FiTag,
  FiSearch,
  FiPlus,
  FiX,
  FiFileText,
  FiBookmark,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import { StudySession } from '../StudyModeClient';
import { GiLightBulb } from 'react-icons/gi';

interface StudyNotesProps {
  session: StudySession;
  onUpdateSession: (updates: Partial<StudySession>) => void;
}

interface Note {
  id: string;
  content: string;
  timestamp: string;
  type: 'general' | 'technical' | 'musical' | 'reminder' | 'breakthrough';
  tags: string[];
  measure?: number;
  page?: number;
}

const NOTE_TYPES = [
  {
    value: 'general',
    label: 'Geral',
    icon: FiEdit3,
    color: 'text-theme-primary',
    bgColor: 'bg-theme-elevated',
  },
  {
    value: 'technical',
    label: 'Técnico',
    icon: FiFileText,
    color: 'text-accent-blue',
    bgColor: 'bg-accent-blue/10',
  },
  {
    value: 'musical',
    label: 'Musical',
    icon: FiBookmark,
    color: 'text-accent-purple',
    bgColor: 'bg-accent-purple/10',
  },
  {
    value: 'reminder',
    label: 'Lembrete',
    icon: FiAlertCircle,
    color: 'text-accent-orange',
    bgColor: 'bg-accent-orange/10',
  },
  {
    value: 'breakthrough',
    label: 'Descoberta',
    icon: GiLightBulb,
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/10',
  },
];

const StudyNotes: React.FC<StudyNotesProps> = ({
  session,
  onUpdateSession,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedNoteType, setSelectedNoteType] =
    useState<Note['type']>('general');
  const [newTag, setNewTag] = useState('');
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<Note['type'] | 'all'>('all');
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    'saved' | 'saving' | 'pending'
  >('saved');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar notas do session
  useEffect(() => {
    // Tentar parsear notas existentes do studyNotes
    try {
      if (session.studyNotes) {
        const parsedNotes = JSON.parse(session.studyNotes);
        if (Array.isArray(parsedNotes)) {
          setNotes(parsedNotes);
        }
      }
    } catch {
      // Se não for JSON válido, tratar como texto simples
      if (session.studyNotes) {
        setNotes([
          {
            id: '1',
            content: session.studyNotes,
            timestamp: new Date().toISOString(),
            type: 'general',
            tags: [],
          },
        ]);
      }
    }
  }, [session.studyNotes]);

  // Auto-save quando notas mudam
  useEffect(() => {
    if (notes.length > 0) {
      setAutoSaveStatus('pending');

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        saveNotes();
      }, 2000); // Auto-save após 2 segundos
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [notes]);

  // Salvar notas
  const saveNotes = async () => {
    setAutoSaveStatus('saving');

    try {
      const notesJson = JSON.stringify(notes);
      onUpdateSession({ studyNotes: notesJson });
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
      setAutoSaveStatus('pending');
    }
  };

  // Adicionar nova nota
  const addNote = () => {
    if (!currentNote.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      content: currentNote.trim(),
      timestamp: new Date().toISOString(),
      type: selectedNoteType,
      tags: [...currentTags],
    };

    setNotes((prev) => [newNote, ...prev]);
    setCurrentNote('');
    setCurrentTags([]);
  };

  // Remover nota
  const removeNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  // Adicionar tag
  const addTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setCurrentTags((prev) => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remover tag
  const removeTag = (tag: string) => {
    setCurrentTags((prev) => prev.filter((t) => t !== tag));
  };

  // Filtrar notas
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      !searchQuery ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesType = filterType === 'all' || note.type === filterType;

    return matchesSearch && matchesType;
  });

  // Formatação de tempo
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const sessionStart = new Date(session.startTime);
    const diffMs = date.getTime() - sessionStart.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffSeconds = Math.floor((diffMs % 60000) / 1000);

    return `+${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}`;
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setCurrentNote(textarea.value);

    // Auto-resize
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  // Estatísticas das notas
  const noteStats = {
    total: notes.length,
    byType: NOTE_TYPES.reduce((acc, type) => {
      acc[type.value] = notes.filter((note) => note.type === type.value).length;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Status de salvamento */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-theme-primary flex items-center space-x-2">
          <FiEdit3 className="w-5 h-5" />
          <span>Anotações da Sessão</span>
        </h3>

        <div className="flex items-center space-x-2 text-xs">
          {autoSaveStatus === 'saved' && (
            <div className="flex items-center space-x-1 text-accent-green">
              <FiCheckCircle className="w-3 h-3" />
              <span>Salvo</span>
            </div>
          )}
          {autoSaveStatus === 'saving' && (
            <div className="flex items-center space-x-1 text-accent-blue">
              <div className="w-3 h-3 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
              <span>Salvando...</span>
            </div>
          )}
          {autoSaveStatus === 'pending' && (
            <div className="flex items-center space-x-1 text-accent-orange">
              <FiClock className="w-3 h-3" />
              <span>Pendente</span>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-theme-elevated border border-theme-secondary rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-brand-primary">
            {noteStats.total}
          </div>
          <div className="text-xs text-theme-secondary">Total</div>
        </div>

        <div className="bg-theme-elevated border border-theme-secondary rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-accent-blue">
            {noteStats.byType.technical || 0}
          </div>
          <div className="text-xs text-theme-secondary">Técnicas</div>
        </div>

        <div className="bg-theme-elevated border border-theme-secondary rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-accent-green">
            {noteStats.byType.breakthrough || 0}
          </div>
          <div className="text-xs text-theme-secondary">Descobertas</div>
        </div>
      </div>

      {/* Nova anotação */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-xl p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <FiPlus className="w-4 h-4 text-brand-primary" />
            <span className="text-sm font-medium text-theme-primary">
              Nova Anotação
            </span>
          </div>

          {/* Tipo da nota */}
          <div className="grid grid-cols-5 gap-2">
            {NOTE_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() =>
                    setSelectedNoteType(type.value as Note['type'])
                  }
                  className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                    selectedNoteType === type.value
                      ? `${type.bgColor} ${type.color} shadow-theme-glow`
                      : 'bg-theme-elevated border border-theme-secondary hover:bg-interactive-hover'
                  }`}
                  title={type.label}
                >
                  <Icon className="w-4 h-4 mx-auto" />
                </button>
              );
            })}
          </div>

          {/* Conteúdo da nota */}
          <textarea
            ref={textareaRef}
            value={currentNote}
            onChange={handleTextareaChange}
            placeholder={`Adicione uma anotação ${NOTE_TYPES.find(
              (t) => t.value === selectedNoteType
            )?.label.toLowerCase()}...`}
            className="w-full bg-theme-primary border border-theme-secondary rounded-xl px-3 py-3 text-theme-primary placeholder-theme-tertiary resize-none focus:outline-none focus:border-brand-primary min-h-[80px]"
            style={{ maxHeight: '200px' }}
          />

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {currentTags.map((tag) => (
                <div
                  key={tag}
                  className="bg-brand-primary/10 border border-brand-primary/30 text-brand-primary px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:bg-accent-red/20 rounded-full p-0.5 transition-all duration-300"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Adicionar tag..."
                className="flex-1 bg-theme-primary border border-theme-secondary rounded-xl px-3 py-2 text-theme-primary placeholder-theme-tertiary text-sm focus:outline-none focus:border-brand-primary"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <button
                onClick={addTag}
                className="bg-brand-gradient text-theme-primary px-3 py-2 rounded-xl hover:scale-105 transition-all duration-300 text-sm"
              >
                <FiTag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Botão adicionar */}
          <button
            onClick={addNote}
            disabled={!currentNote.trim()}
            className="w-full bg-brand-gradient text-theme-primary py-3 rounded-xl font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>Adicionar Anotação</span>
          </button>
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="space-y-3">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar nas anotações..."
              className="w-full pl-10 pr-4 py-2 bg-theme-elevated border border-theme-secondary rounded-xl text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as Note['type'] | 'all')
            }
            className="bg-theme-elevated border border-theme-secondary rounded-xl px-3 py-2 text-theme-primary focus:outline-none focus:border-brand-primary"
          >
            <option value="all">Todos os tipos</option>
            {NOTE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de anotações */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => {
            const noteType = NOTE_TYPES.find((t) => t.value === note.type);
            const Icon = noteType?.icon || FiEdit3;

            return (
              <div
                key={note.id}
                className={`${
                  noteType?.bgColor || 'bg-theme-elevated'
                } border border-theme-secondary rounded-xl p-4 space-y-3 hover:shadow-theme-glow transition-all duration-300`}
              >
                {/* Header da nota */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      className={`w-4 h-4 ${
                        noteType?.color || 'text-theme-primary'
                      }`}
                    />
                    <span className="text-sm font-medium text-theme-secondary">
                      {noteType?.label}
                    </span>
                    <div className="text-xs text-theme-tertiary flex items-center space-x-1">
                      <FiClock className="w-3 h-3" />
                      <span>{formatTimestamp(note.timestamp)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeNote(note.id)}
                    className="text-accent-red hover:bg-accent-red/10 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>

                {/* Conteúdo */}
                <div className="text-theme-primary whitespace-pre-wrap text-sm leading-relaxed">
                  {note.content}
                </div>

                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-theme-primary/10 border border-theme-primary/20 text-theme-primary px-2 py-0.5 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-theme-tertiary">
            <FiEdit3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {searchQuery || filterType !== 'all'
                ? 'Nenhuma anotação encontrada'
                : 'Nenhuma anotação ainda'}
            </p>
            <p className="text-sm">
              {searchQuery || filterType !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando suas primeiras observações sobre o estudo'}
            </p>
          </div>
        )}
      </div>

      {/* Exportar notas */}
      {notes.length > 0 && (
        <div className="pt-4 border-t border-theme-secondary">
          <button
            onClick={() => {
              const notesText = notes
                .map(
                  (note) =>
                    `[${formatTimestamp(note.timestamp)}] ${
                      NOTE_TYPES.find((t) => t.value === note.type)?.label
                    }: ${note.content}${
                      note.tags.length > 0 ? ` #${note.tags.join(' #')}` : ''
                    }`
                )
                .join('\n\n');

              navigator.clipboard.writeText(notesText);
              // Poderia mostrar um toast aqui
            }}
            className="w-full bg-theme-elevated border border-theme-secondary text-theme-primary py-2 rounded-xl hover:bg-interactive-hover transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2"
          >
            <FiSave className="w-4 h-4" />
            <span>Copiar todas as anotações</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StudyNotes;
