// app/components/StudyMode/components/StudyPDFViewer.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiZoomIn,
  FiZoomOut,
  FiRotateCw,
  FiMaximize2,
  FiMinimize2,
  FiChevronLeft,
  FiChevronRight,
  FiBookmark,
  FiEdit3,
  FiDownload,
  FiSun,
  FiMoon,
  FiGrid,
  FiTarget,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { WorkDetails } from '@/app/requests/work-details';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper';
import { StudySession } from '../StudyModeClient';

interface StudyPDFViewerProps {
  work: WorkDetails;
  selectedScore?: IMSLPScore;
  session: StudySession;
  onUpdateSession: (updates: Partial<StudySession>) => void;
  className?: string;
}

interface Bookmark {
  id: string;
  title: string;
  page: number;
  x: number;
  y: number;
  color: string;
}

interface Annotation {
  id: string;
  type: 'highlight' | 'note' | 'drawing';
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color: string;
  strokeWidth?: number;
  path?: string; // Para desenhos livres
}

type LayoutMode = 'single' | 'spread';
type Theme = 'light' | 'dark';

const StudyPDFViewer: React.FC<StudyPDFViewerProps> = ({
  work,
  selectedScore,
  session,
  onUpdateSession,
  className = '',
}) => {
  console.log('work', work);
  // Estados principais
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(session.pdfSettings.zoom);
  const [rotation, setRotation] = useState(0);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(
    session.pdfSettings.layout
  );
  const [theme, setTheme] = useState<Theme>(session.pdfSettings.theme);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Estados de anotação
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationTool, setAnnotationTool] = useState<
    'highlight' | 'note' | 'drawing'
  >('highlight');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(true);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [bookmarkPosition, setBookmarkPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);

  // Carregar PDF quando score muda
  useEffect(() => {
    if (selectedScore?.downloadUrl) {
      loadPDF(selectedScore.downloadUrl);
    } else {
      setError('Nenhuma partitura selecionada');
      setIsLoading(false);
    }
  }, [selectedScore]);

  // Atualizar configurações da sessão quando mudam
  useEffect(() => {
    onUpdateSession({
      pdfSettings: {
        zoom,
        theme,
        layout: layoutMode,
      },
    });
  }, [zoom, theme, layoutMode, onUpdateSession]);

  // Rastrear páginas visualizadas
  useEffect(() => {
    if (currentPage > 0) {
      const updatedPages = [...session.pagesViewed];
      if (!updatedPages.includes(currentPage)) {
        updatedPages.push(currentPage);
        onUpdateSession({
          pagesViewed: updatedPages,
        });
      }
    }
  }, [currentPage, session.pagesViewed, onUpdateSession]);

  // Carregar PDF
  const loadPDF = async (url: string) => {
    setIsLoading(true);
    setError(null);
    console.log(url);
    try {
      // Aqui integraria com uma biblioteca de PDF como PDF.js
      // Por enquanto, simular carregamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simular dados do PDF
      setTotalPages(parseInt(selectedScore?.pageCount || '1'));
      setCurrentPage(1);
      setIsLoading(false);

      // Carregar anotações e bookmarks existentes
      await loadAnnotationsAndBookmarks();
    } catch (err) {
      setError('Erro ao carregar PDF');
      setIsLoading(false);
      console.error('Erro ao carregar PDF:', err);
    }
  };

  // Carregar anotações e bookmarks do backend
  const loadAnnotationsAndBookmarks = async () => {
    if (!selectedScore?.id) return;

    try {
      // Carregar do backend - implementar APIs
      // const [annotationsRes, bookmarksRes] = await Promise.all([
      //   fetch(`/api/pdf-annotations?workId=${work.id}&scoreId=${selectedScore.id}`),
      //   fetch(`/api/score-bookmarks?workId=${work.id}&scoreId=${selectedScore.id}`)
      // ]);

      // Por enquanto, usar dados locais/mock
      setAnnotations([]);
      setBookmarks([]);
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
    }
  };

  // Controles de zoom
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  // Controles de página
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Rotação
  const rotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Toggle tema
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Criar bookmark
  const createBookmark = useCallback(
    (x: number, y: number) => {
      if (!newBookmarkTitle.trim()) return;

      const bookmark: Bookmark = {
        id: Date.now().toString(),
        title: newBookmarkTitle.trim(),
        page: currentPage,
        x,
        y,
        color: '#3B82F6',
      };

      setBookmarks((prev) => [...prev, bookmark]);
      setNewBookmarkTitle('');
      setShowBookmarkDialog(false);
      setBookmarkPosition(null);

      // Salvar no backend
      saveBookmark(bookmark);

      // Atualizar contadores da sessão
      onUpdateSession({
        bookmarksCreated: session.bookmarksCreated + 1,
      });
    },
    [newBookmarkTitle, currentPage, session.bookmarksCreated, onUpdateSession]
  );

  // Salvar bookmark no backend
  const saveBookmark = async (bookmark: Bookmark) => {
    console.log(bookmark);
    try {
      // Implementar API call
      // await fetch('/api/score-bookmarks', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     workId: work.id,
      //     scoreId: selectedScore?.id,
      //     ...bookmark
      //   })
      // });
    } catch (error) {
      console.error('Erro ao salvar bookmark:', error);
    }
  };

  // Handlers de mouse para anotações
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isAnnotating) return;

      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100; // Percentual
      const y = ((e.clientY - rect.top) / rect.height) * 100; // Percentual

      if (annotationTool === 'note') {
        // Criar anotação de texto
        const content = prompt('Digite sua anotação:');
        if (content) {
          const annotation: Annotation = {
            id: Date.now().toString(),
            type: 'note',
            page: currentPage,
            x,
            y,
            content,
            color: '#FF6B6B',
          };

          setAnnotations((prev) => [...prev, annotation]);
          saveAnnotation(annotation);

          onUpdateSession({
            annotationsCreated: session.annotationsCreated + 1,
          });
        }
      } else if (annotationTool === 'highlight') {
        // Para highlight, seria necessário implementar seleção de área
        // Por simplicidade, criar um ponto de highlight
        const annotation: Annotation = {
          id: Date.now().toString(),
          type: 'highlight',
          page: currentPage,
          x,
          y,
          width: 5,
          height: 2,
          color: '#FFEB3B',
        };

        setAnnotations((prev) => [...prev, annotation]);
        saveAnnotation(annotation);

        onUpdateSession({
          annotationsCreated: session.annotationsCreated + 1,
        });
      }
    },
    [
      isAnnotating,
      annotationTool,
      currentPage,
      session.annotationsCreated,
      onUpdateSession,
    ]
  );

  // Salvar anotação no backend
  const saveAnnotation = async (annotation: Annotation) => {
    console.log(annotation)
    try {
      // Implementar API call
      // await fetch('/api/pdf-annotations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     workId: work.id,
      //     scoreId: selectedScore?.id,
      //     ...annotation
      //   })
      // });
    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
    }
  };

  // Handler para contexto (criar bookmark)
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setBookmarkPosition({ x, y });
      setShowBookmarkDialog(true);
    },
    []
  );

  // Ir para bookmark
  const goToBookmark = useCallback((bookmark: Bookmark) => {
    setCurrentPage(bookmark.page);
    // Aqui poderia fazer scroll até a posição do bookmark
  }, []);

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-theme-primary ${className}`}
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="text-theme-primary font-medium">
              Carregando partitura...
            </p>
            <p className="text-theme-secondary text-sm">
              {selectedScore?.title}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-theme-primary ${className}`}
      >
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-accent-red/20 rounded-full flex items-center justify-center mx-auto">
            <FiTarget className="w-8 h-8 text-accent-red" />
          </div>
          <div className="space-y-2">
            <p className="text-theme-primary font-medium">
              Erro ao carregar PDF
            </p>
            <p className="text-theme-secondary text-sm">{error}</p>
          </div>
          <button
            onClick={() => selectedScore && loadPDF(selectedScore.downloadUrl)}
            className="bg-brand-gradient text-theme-primary px-6 py-2 rounded-xl hover:scale-105 transition-all duration-300"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-theme-primary ${className}`}
    >
      {/* Toolbar superior */}
      <div className="bg-theme-elevated border-b border-theme-secondary px-4 py-3 flex items-center justify-between flex-shrink-0">
        {/* Controles de página */}
        <div className="flex items-center space-x-3">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg hover:bg-interactive-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <FiChevronLeft className="w-4 h-4 text-theme-primary" />
          </button>

          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              className="w-16 text-center bg-theme-primary border border-theme-secondary rounded-lg px-2 py-1 text-theme-primary focus:outline-none focus:border-brand-primary"
            />
            <span className="text-theme-secondary text-sm">/ {totalPages}</span>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg hover:bg-interactive-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <FiChevronRight className="w-4 h-4 text-theme-primary" />
          </button>
        </div>

        {/* Controles de zoom */}
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg hover:bg-interactive-hover transition-all duration-300 flex items-center justify-center"
          >
            <FiZoomOut className="w-4 h-4 text-theme-primary" />
          </button>

          <span className="text-theme-primary text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={zoomIn}
            className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg hover:bg-interactive-hover transition-all duration-300 flex items-center justify-center"
          >
            <FiZoomIn className="w-4 h-4 text-theme-primary" />
          </button>

          <button
            onClick={resetZoom}
            className="px-3 py-1 bg-theme-elevated border border-theme-secondary rounded-lg hover:bg-interactive-hover transition-all duration-300 text-theme-primary text-sm"
          >
            Reset
          </button>
        </div>

        {/* Controles de visualização */}
        <div className="flex items-center space-x-2">
          {/* Layout mode */}
          <select
            value={layoutMode}
            onChange={(e) => setLayoutMode(e.target.value as LayoutMode)}
            className="bg-theme-elevated border border-theme-secondary rounded-lg px-2 py-1 text-theme-primary text-sm focus:outline-none focus:border-brand-primary"
          >
            <option value="single">Página Única</option>
            <option value="spread">Página Dupla</option>
            <option value="continuous">Contínuo</option>
          </select>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg hover:bg-interactive-hover transition-all duration-300 flex items-center justify-center"
          >
            {theme === 'light' ? (
              <FiMoon className="w-4 h-4 text-theme-primary" />
            ) : (
              <FiSun className="w-4 h-4 text-theme-primary" />
            )}
          </button>

          {/* Rotate */}
          <button
            onClick={rotate}
            className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg hover:bg-interactive-hover transition-all duration-300 flex items-center justify-center"
          >
            <FiRotateCw className="w-4 h-4 text-theme-primary" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg hover:bg-interactive-hover transition-all duration-300 flex items-center justify-center"
          >
            {isFullscreen ? (
              <FiMinimize2 className="w-4 h-4 text-theme-primary" />
            ) : (
              <FiMaximize2 className="w-4 h-4 text-theme-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Toolbar de anotações */}
      <div className="bg-theme-elevated border-b border-theme-secondary px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAnnotating(!isAnnotating)}
            className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
              isAnnotating
                ? 'bg-brand-gradient text-theme-primary shadow-theme-glow'
                : 'bg-theme-elevated border border-theme-secondary hover:bg-interactive-hover text-theme-primary'
            }`}
          >
            <FiEdit3 className="w-4 h-4" />
            <span className="text-sm">Anotar</span>
          </button>

          {isAnnotating && (
            <>
              <div className="w-px h-6 bg-theme-secondary"></div>

              <div className="flex items-center space-x-1">
                {[
                  { value: 'highlight', label: 'Destacar', icon: FiTarget },
                  { value: 'note', label: 'Nota', icon: FiEdit3 },
                  { value: 'drawing', label: 'Desenhar', icon: FiGrid },
                ].map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.value}
                      onClick={() => setAnnotationTool(tool.value as any)}
                      className={`w-8 h-8 rounded-lg transition-all duration-300 flex items-center justify-center ${
                        annotationTool === tool.value
                          ? 'bg-brand-primary text-theme-primary'
                          : 'hover:bg-interactive-hover text-theme-secondary'
                      }`}
                      title={tool.label}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Toggle bookmarks */}
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
              showBookmarks
                ? 'bg-accent-blue/20 text-accent-blue'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            {showBookmarks ? (
              <FiEye className="w-4 h-4" />
            ) : (
              <FiEyeOff className="w-4 h-4" />
            )}
            <span>Marcadores</span>
          </button>

          {/* Download PDF */}
          {selectedScore?.downloadUrl && (
            <a
              href={selectedScore.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg hover:bg-interactive-hover transition-all duration-300 flex items-center justify-center"
              title="Baixar PDF"
            >
              <FiDownload className="w-4 h-4 text-theme-primary" />
            </a>
          )}
        </div>
      </div>

      {/* Área principal do PDF */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar de bookmarks */}
        {showBookmarks && (
          <div className="w-64 bg-theme-elevated border-r border-theme-secondary flex-shrink-0 overflow-y-auto">
            <div className="p-4 space-y-4">
              <h3 className="text-sm font-semibold text-theme-primary flex items-center space-x-2">
                <FiBookmark className="w-4 h-4" />
                <span>Marcadores</span>
              </h3>

              {bookmarks.length > 0 ? (
                <div className="space-y-2">
                  {bookmarks.map((bookmark) => (
                    <button
                      key={bookmark.id}
                      onClick={() => goToBookmark(bookmark)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-300 hover:bg-interactive-hover ${
                        bookmark.page === currentPage
                          ? 'bg-brand-primary/20 border border-brand-primary/30'
                          : 'bg-theme-primary border border-theme-secondary'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: bookmark.color }}
                        ></div>
                        <span className="font-medium text-theme-primary text-sm">
                          {bookmark.title}
                        </span>
                      </div>
                      <div className="text-xs text-theme-secondary mt-1">
                        Página {bookmark.page}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-theme-tertiary">
                  <FiBookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum marcador</p>
                  <p className="text-xs">
                    Clique com botão direito no PDF para criar
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visualizador de PDF */}
        <div className="flex-1 overflow-auto relative">
          <div
            className={`flex items-center justify-center min-h-full p-4 ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
            }`}
          >
            {/* Canvas do PDF */}
            <div
              className="relative bg-white shadow-2xl"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
              }}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={1200}
                className="block"
                onClick={handleCanvasClick}
                onContextMenu={handleContextMenu}
                style={{ cursor: isAnnotating ? 'crosshair' : 'default' }}
              />

              {/* Canvas de anotações */}
              <canvas
                ref={annotationCanvasRef}
                width={800}
                height={1200}
                className="absolute inset-0 pointer-events-none"
              />

              {/* Renderizar anotações */}
              {annotations
                .filter((annotation) => annotation.page === currentPage)
                .map((annotation) => (
                  <div
                    key={annotation.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${annotation.x}%`,
                      top: `${annotation.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {annotation.type === 'note' && (
                      <div
                        className="bg-yellow-200 border-2 border-yellow-400 rounded-lg p-2 text-xs max-w-xs shadow-lg"
                        style={{ backgroundColor: annotation.color + '40' }}
                      >
                        {annotation.content}
                      </div>
                    )}
                    {annotation.type === 'highlight' && (
                      <div
                        className="border-2 opacity-50"
                        style={{
                          backgroundColor: annotation.color,
                          width: `${annotation.width}%`,
                          height: `${annotation.height}%`,
                          borderColor: annotation.color,
                        }}
                      />
                    )}
                  </div>
                ))}

              {/* Renderizar bookmarks */}
              {bookmarks
                .filter((bookmark) => bookmark.page === currentPage)
                .map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${bookmark.x}%`,
                      top: `${bookmark.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: bookmark.color }}
                    >
                      <FiBookmark className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog para criar bookmark */}
      {showBookmarkDialog && bookmarkPosition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-theme-elevated rounded-2xl border border-theme-primary p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-theme-primary mb-4">
              Criar Marcador
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                value={newBookmarkTitle}
                onChange={(e) => setNewBookmarkTitle(e.target.value)}
                placeholder="Nome do marcador..."
                className="w-full bg-theme-primary border border-theme-secondary rounded-xl px-3 py-2 text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-brand-primary"
                autoFocus
                onKeyPress={(e) =>
                  e.key === 'Enter' &&
                  createBookmark(bookmarkPosition.x, bookmarkPosition.y)
                }
              />

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBookmarkDialog(false);
                    setBookmarkPosition(null);
                    setNewBookmarkTitle('');
                  }}
                  className="px-4 py-2 bg-theme-elevated border border-theme-secondary rounded-xl hover:bg-interactive-hover transition-all duration-300 text-theme-primary"
                >
                  Cancelar
                </button>

                <button
                  onClick={() =>
                    createBookmark(bookmarkPosition.x, bookmarkPosition.y)
                  }
                  disabled={!newBookmarkTitle.trim()}
                  className="px-4 py-2 bg-brand-gradient text-theme-primary rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPDFViewer;
