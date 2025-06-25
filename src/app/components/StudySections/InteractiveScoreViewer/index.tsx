import Image from 'next/image';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaHighlighter } from 'react-icons/fa';
import {
  FiZoomIn,
  FiZoomOut,
  FiRotateCcw,
  FiDownload,
  FiTrash2,
  FiLayers,
  FiMaximize2,
  FiMinimize2,
  FiSkipBack,
  FiSkipForward,
  FiMic,
  FiCamera,
  FiSquare,
  FiCircle,
  FiType,
  FiPenTool,
} from 'react-icons/fi';
import { GiPianoKeys, GiViolin, GiTrumpet } from 'react-icons/gi';

interface ScoreAnnotation {
  id: string;
  type:
    | 'text'
    | 'highlight'
    | 'arrow'
    | 'circle'
    | 'rectangle'
    | 'freehand'
    | 'fingering'
    | 'bowing'
    | 'breathing'
    | 'pedal';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content: string;
  color: string;
  fontSize?: number;
  strokeWidth?: number;
  instrument: string;
  layer: 'general' | 'technical' | 'expression' | 'performance' | 'analysis';
  timestamp: number;
  page: number;
  isPrivate: boolean;
  tags: string[];
  linkedToTime?: number; // Para sincronizar com gravações
}

interface ScorePage {
  id: string;
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
  measures?: {
    id: string;
    number: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

interface PlaybackCursor {
  isActive: boolean;
  measureNumber: number;
  x: number;
  y: number;
  color: string;
}

const InteractiveScoreViewer: React.FC<{
  score: { id: string; title: string; pages: ScorePage[] };
  instrument: string;
  isStudyMode?: boolean;
  onAnnotationChange?: (annotations: ScoreAnnotation[]) => void;
}> = ({ score, instrument, isStudyMode = false, onAnnotationChange }) => {
  // Estados principais
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [annotations, setAnnotations] = useState<ScoreAnnotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(
    null
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>(
    []
  );
  const [activeLayer, setActiveLayer] =
    useState<ScoreAnnotation['layer']>('general');
  const [showLayers, setShowLayers] = useState({
    general: true,
    technical: true,
    expression: true,
    performance: true,
    analysis: true,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackCursor, setPlaybackCursor] = useState<PlaybackCursor>({
    isActive: false,
    measureNumber: 0,
    x: 0,
    y: 0,
    color: '#3B82F6',
  });
  console.log('setPlaybackCursor', setPlaybackCursor);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scoreImageRef = useRef<HTMLImageElement>(null);

  // Ferramentas por instrumento
  const instrumentTools = {
    piano: [
      { id: 'fingering', name: 'Dedilhado', icon: '1', color: '#3B82F6' },
      { id: 'pedal', name: 'Pedal', icon: '𝄇', color: '#8B5CF6' },
      { id: 'articulation', name: 'Articulação', icon: '>', color: '#10B981' },
      { id: 'dynamics', name: 'Dinâmica', icon: 'f', color: '#F59E0B' },
      { id: 'phrasing', name: 'Fraseado', icon: '⌒', color: '#EF4444' },
    ],
    violin: [
      { id: 'bowing', name: 'Arcada', icon: '↓', color: '#F97316' },
      { id: 'fingering', name: 'Digitação', icon: '1', color: '#3B82F6' },
      { id: 'position', name: 'Posição', icon: 'III', color: '#EF4444' },
      { id: 'string', name: 'Corda', icon: 'G', color: '#F59E0B' },
      { id: 'vibrato', name: 'Vibrato', icon: '〰', color: '#8B5CF6' },
    ],
    trumpet: [
      { id: 'breathing', name: 'Respiração', icon: '∨', color: '#06B6D4' },
      { id: 'fingering', name: 'Pistões', icon: '1-2', color: '#3B82F6' },
      { id: 'articulation', name: 'Articulação', icon: 'Tu', color: '#10B981' },
      { id: 'mute', name: 'Surdina', icon: '+', color: '#EC4899' },
      { id: 'lip_trill', name: 'Lip Trill', icon: 'tr', color: '#8B5CF6' },
    ],
  };

  const currentTools =
    instrumentTools[instrument as keyof typeof instrumentTools] ||
    instrumentTools.piano;

  // Ferramentas gerais
  const generalTools = [
    { id: 'text', name: 'Texto', icon: FiType, color: '#374151' },
    {
      id: 'highlight',
      name: 'Marca-texto',
      icon: FaHighlighter,
      color: '#FBBF24',
    },
    { id: 'arrow', name: 'Seta', icon: '→', color: '#EF4444' },
    { id: 'circle', name: 'Círculo', icon: FiCircle, color: '#3B82F6' },
    { id: 'rectangle', name: 'Retângulo', icon: FiSquare, color: '#10B981' },
    {
      id: 'freehand',
      name: 'Desenho Livre',
      icon: FiPenTool,
      color: '#8B5CF6',
    },
  ];

  // Inicializar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas para alta definição
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    redrawAnnotations();
  }, [zoom, currentPage, annotations, showLayers]);

  // Redesenhar anotações
  const redrawAnnotations = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filtrar anotações por página e layers visíveis
    const visibleAnnotations = annotations.filter(
      (annotation) =>
        annotation.page === currentPage && showLayers[annotation.layer]
    );

    visibleAnnotations.forEach((annotation) => {
      drawAnnotation(ctx, annotation);
    });

    // Desenhar cursor de playback se ativo
    if (playbackCursor.isActive) {
      drawPlaybackCursor(ctx);
    }

    // Desenhar path atual se estiver desenhando
    if (isDrawing && currentPath.length > 0) {
      drawCurrentPath(ctx);
    }
  }, [
    annotations,
    currentPage,
    showLayers,
    playbackCursor,
    isDrawing,
    currentPath,
  ]);

  // Desenhar anotação individual
  const drawAnnotation = (
    ctx: CanvasRenderingContext2D,
    annotation: ScoreAnnotation
  ) => {
    ctx.save();

    const isSelected = selectedAnnotation === annotation.id;
    const zoomFactor = zoom / 100;

    ctx.globalAlpha = annotation.layer === 'analysis' ? 0.7 : 1;

    switch (annotation.type) {
      case 'text':
      case 'fingering':
      case 'bowing':
      case 'breathing':
      case 'pedal':
        ctx.fillStyle = annotation.color;
        ctx.font = `${(annotation.fontSize || 14) * zoomFactor}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(
          annotation.content,
          annotation.x * zoomFactor,
          annotation.y * zoomFactor
        );
        break;

      case 'highlight':
        ctx.fillStyle = annotation.color + '40'; // 25% opacity
        ctx.fillRect(
          annotation.x * zoomFactor,
          annotation.y * zoomFactor,
          (annotation.width || 50) * zoomFactor,
          (annotation.height || 20) * zoomFactor
        );
        break;

      case 'circle':
        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = (annotation.strokeWidth || 2) * zoomFactor;
        ctx.beginPath();
        ctx.arc(
          annotation.x * zoomFactor,
          annotation.y * zoomFactor,
          ((annotation.width || 20) * zoomFactor) / 2,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        break;

      case 'rectangle':
        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = (annotation.strokeWidth || 2) * zoomFactor;
        ctx.strokeRect(
          annotation.x * zoomFactor,
          annotation.y * zoomFactor,
          (annotation.width || 50) * zoomFactor,
          (annotation.height || 30) * zoomFactor
        );
        break;

      case 'arrow':
        drawArrow(ctx, annotation, zoomFactor);
        break;

      case 'freehand':
        if (annotation.content) {
          const path = JSON.parse(annotation.content);
          ctx.strokeStyle = annotation.color;
          ctx.lineWidth = (annotation.strokeWidth || 2) * zoomFactor;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          path.forEach((point: { x: number; y: number }, index: number) => {
            if (index === 0) {
              ctx.moveTo(point.x * zoomFactor, point.y * zoomFactor);
            } else {
              ctx.lineTo(point.x * zoomFactor, point.y * zoomFactor);
            }
          });
          ctx.stroke();
        }
        break;
    }

    // Destacar se selecionado
    if (isSelected) {
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        (annotation.x - 10) * zoomFactor,
        (annotation.y - 10) * zoomFactor,
        ((annotation.width || 20) + 20) * zoomFactor,
        ((annotation.height || 20) + 20) * zoomFactor
      );
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  // Desenhar seta
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    annotation: ScoreAnnotation,
    zoomFactor: number
  ) => {
    const startX = annotation.x * zoomFactor;
    const startY = annotation.y * zoomFactor;
    const endX = (annotation.x + (annotation.width || 50)) * zoomFactor;
    const endY = (annotation.y + (annotation.height || 0)) * zoomFactor;

    const headlen = 10 * zoomFactor;
    const angle = Math.atan2(endY - startY, endX - startX);

    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = (annotation.strokeWidth || 2) * zoomFactor;

    // Linha principal
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Ponta da seta
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headlen * Math.cos(angle - Math.PI / 6),
      endY - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headlen * Math.cos(angle + Math.PI / 6),
      endY - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  // Desenhar cursor de playback
  const drawPlaybackCursor = (ctx: CanvasRenderingContext2D) => {
    const zoomFactor = zoom / 100;

    ctx.save();
    ctx.strokeStyle = playbackCursor.color;
    ctx.lineWidth = 3 * zoomFactor;
    ctx.setLineDash([]);

    // Linha vertical
    ctx.beginPath();
    ctx.moveTo(playbackCursor.x * zoomFactor, 0);
    ctx.lineTo(playbackCursor.x * zoomFactor, ctx.canvas.height);
    ctx.stroke();

    // Indicador de compasso
    ctx.fillStyle = playbackCursor.color;
    ctx.fillRect(
      (playbackCursor.x - 10) * zoomFactor,
      playbackCursor.y * zoomFactor,
      20 * zoomFactor,
      30 * zoomFactor
    );

    ctx.fillStyle = 'white';
    ctx.font = `${12 * zoomFactor}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(
      playbackCursor.measureNumber.toString(),
      playbackCursor.x * zoomFactor,
      (playbackCursor.y + 20) * zoomFactor
    );

    ctx.restore();
  };

  // Desenhar path atual
  const drawCurrentPath = (ctx: CanvasRenderingContext2D) => {
    const zoomFactor = zoom / 100;

    ctx.save();
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2 * zoomFactor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    currentPath.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x * zoomFactor, point.y * zoomFactor);
      } else {
        ctx.lineTo(point.x * zoomFactor, point.y * zoomFactor);
      }
    });
    ctx.stroke();

    ctx.restore();
  };

  // Manipuladores de eventos do mouse/touch
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);

    if (selectedTool === 'freehand') {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
    } else {
      // Criar anotação imediatamente para outros tipos
      createAnnotation(x, y);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedTool !== 'freehand') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);

    setCurrentPath((prev) => [...prev, { x, y }]);
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && selectedTool === 'freehand' && currentPath.length > 0) {
      createFreehandAnnotation();
    }

    setIsDrawing(false);
    setCurrentPath([]);
  };

  // Criar anotação
  const createAnnotation = (x: number, y: number, type?: string) => {
    const annotationType = type || selectedTool;
    if (!annotationType) return;

    let content = '';
    if (
      annotationType === 'text' ||
      currentTools.some((t) => t.id === annotationType)
    ) {
      content = prompt('Digite o texto da anotação:') || '';
      if (!content) return;
    }

    const newAnnotation: ScoreAnnotation = {
      id: Date.now().toString(),
      type: annotationType as ScoreAnnotation['type'],
      x,
      y,
      width:
        annotationType === 'highlight'
          ? 50
          : annotationType === 'rectangle'
          ? 50
          : 20,
      height:
        annotationType === 'highlight'
          ? 20
          : annotationType === 'rectangle'
          ? 30
          : 20,
      content,
      color:
        currentTools.find((t) => t.id === annotationType)?.color || '#3B82F6',
      fontSize: 14,
      strokeWidth: 2,
      instrument,
      layer: activeLayer,
      timestamp: Date.now(),
      page: currentPage,
      isPrivate: false,
      tags: [],
    };

    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    onAnnotationChange?.(updatedAnnotations);
  };

  // Criar anotação de desenho livre
  const createFreehandAnnotation = () => {
    const newAnnotation: ScoreAnnotation = {
      id: Date.now().toString(),
      type: 'freehand',
      x: Math.min(...currentPath.map((p) => p.x)),
      y: Math.min(...currentPath.map((p) => p.y)),
      width:
        Math.max(...currentPath.map((p) => p.x)) -
        Math.min(...currentPath.map((p) => p.x)),
      height:
        Math.max(...currentPath.map((p) => p.y)) -
        Math.min(...currentPath.map((p) => p.y)),
      content: JSON.stringify(currentPath),
      color: '#3B82F6',
      strokeWidth: 2,
      instrument,
      layer: activeLayer,
      timestamp: Date.now(),
      page: currentPage,
      isPrivate: false,
      tags: [],
    };

    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    onAnnotationChange?.(updatedAnnotations);
  };

  // Controles de zoom
  const zoomIn = () => setZoom((prev) => Math.min(prev + 25, 300));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 25, 25));
  const resetZoom = () => setZoom(100);

  // Navegação de páginas
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, score.pages.length - 1));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

  // Deletar anotação
  const deleteAnnotation = (id: string) => {
    const updatedAnnotations = annotations.filter((a) => a.id !== id);
    setAnnotations(updatedAnnotations);
    onAnnotationChange?.(updatedAnnotations);
    setSelectedAnnotation(null);
  };

  // Exportar anotações
  const exportAnnotations = () => {
    const data = {
      scoreId: score.id,
      annotations: annotations.filter((a) => a.page === currentPage),
      metadata: {
        instrument,
        page: currentPage,
        zoom,
        timestamp: Date.now(),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${score.title}-page${currentPage + 1}-annotations.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`relative ${
        isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : ''
      }`}
    >
      {/* Toolbar superior */}
      <div className="bg-white/5 border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          {/* Controles de navegação */}
          <div className="flex items-center space-x-3">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white"
            >
              <FiSkipBack className="w-5 h-5" />
            </button>

            <span className="text-white font-medium px-3 py-1 bg-white/10 rounded-lg">
              {currentPage + 1} / {score.pages.length}
            </span>

            <button
              onClick={nextPage}
              disabled={currentPage === score.pages.length - 1}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white"
            >
              <FiSkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Controles de zoom */}
          <div className="flex items-center space-x-3">
            <button
              onClick={zoomOut}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            >
              <FiZoomOut className="w-5 h-5" />
            </button>

            <span className="text-white font-medium px-3 py-1 bg-white/10 rounded-lg min-w-[80px] text-center">
              {zoom}%
            </span>

            <button
              onClick={zoomIn}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            >
              <FiZoomIn className="w-5 h-5" />
            </button>

            <button
              onClick={resetZoom}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            >
              <FiRotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Ações */}
          <div className="flex items-center space-x-3">
            {isStudyMode && (
              <>
                <button className="w-10 h-10 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors flex items-center justify-center text-green-400">
                  <FiMic className="w-5 h-5" />
                </button>

                <button className="w-10 h-10 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors flex items-center justify-center text-blue-400">
                  <FiCamera className="w-5 h-5" />
                </button>
              </>
            )}

            <button
              onClick={exportAnnotations}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            >
              <FiDownload className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            >
              {isFullscreen ? (
                <FiMinimize2 className="w-5 h-5" />
              ) : (
                <FiMaximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Painel de ferramentas lateral */}
        <div className="w-80 bg-white/5 border-r border-white/10 p-4 overflow-y-auto">
          {/* Seletor de layer */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
              <FiLayers className="w-4 h-4" />
              <span>Camadas</span>
            </h3>

            <select
              value={activeLayer}
              onChange={(e) =>
                setActiveLayer(e.target.value as ScoreAnnotation['layer'])
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white mb-3"
            >
              <option value="general">Geral</option>
              <option value="technical">Técnica</option>
              <option value="expression">Expressão</option>
              <option value="performance">Performance</option>
              <option value="analysis">Análise</option>
            </select>

            <div className="space-y-2">
              {Object.entries(showLayers).map(([layer, visible]) => (
                <label
                  key={layer}
                  className="flex items-center space-x-2 text-white text-sm"
                >
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) =>
                      setShowLayers((prev) => ({
                        ...prev,
                        [layer]: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span className="capitalize">{layer}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ferramentas gerais */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">Ferramentas Gerais</h3>
            <div className="grid grid-cols-3 gap-2">
              {generalTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() =>
                    setSelectedTool(selectedTool === tool.id ? null : tool.id)
                  }
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    selectedTool === tool.id
                      ? 'bg-blue-500/30 border-blue-500 text-white'
                      : 'bg-white/5 border-white/20 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    {typeof tool.icon === 'string' ? (
                      <span className="text-lg">{tool.icon}</span>
                    ) : (
                      <tool.icon className="w-5 h-5" />
                    )}
                    <span className="text-xs text-center">{tool.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ferramentas específicas do instrumento */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
              {instrument === 'piano' && <GiPianoKeys className="w-4 h-4" />}
              {instrument === 'violin' && <GiViolin className="w-4 h-4" />}
              {instrument === 'trumpet' && <GiTrumpet className="w-4 h-4" />}
              <span>Ferramentas {instrument}</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {currentTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() =>
                    setSelectedTool(selectedTool === tool.id ? null : tool.id)
                  }
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    selectedTool === tool.id
                      ? 'bg-blue-500/30 border-blue-500 text-white'
                      : 'bg-white/5 border-white/20 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg" style={{ color: tool.color }}>
                      {tool.icon}
                    </span>
                    <span className="text-xs text-center">{tool.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Lista de anotações */}
          <div>
            <h3 className="text-white font-medium mb-3">
              Anotações desta página
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {annotations
                .filter((a) => a.page === currentPage && showLayers[a.layer])
                .map((annotation) => (
                  <div
                    key={annotation.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                      selectedAnnotation === annotation.id
                        ? 'bg-blue-500/30 border-blue-500'
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedAnnotation(annotation.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span style={{ color: annotation.color }}>
                            {annotation.type}
                          </span>
                          <span className="text-xs bg-white/20 text-white px-1 rounded">
                            {annotation.layer}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 truncate">
                          {annotation.content ||
                            `${annotation.type} annotation`}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnnotation(annotation.id);
                        }}
                        className="w-6 h-6 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors flex items-center justify-center text-red-400"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Área principal da partitura */}
        <div className="flex-1 relative overflow-auto" ref={containerRef}>
          <div className="relative inline-block">
            {/* Imagem da partitura */}
            <Image
              width={100}
              height={100}
              ref={scoreImageRef}
              src={score.pages[currentPage]?.imageUrl}
              alt={`Página ${currentPage + 1} de ${score.title}`}
              className="block max-w-none"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: '0 0',
                filter: 'contrast(1.1) brightness(1.05)',
              }}
              draggable={false}
            />

            {/* Canvas para anotações */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 cursor-crosshair"
              style={{
                width: '100%',
                height: '100%',
                pointerEvents: selectedTool ? 'auto' : 'none',
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            />

            {/* Overlay para medidas/compassos (se disponível) */}
            {score.pages[currentPage]?.measures && (
              <div className="absolute inset-0 pointer-events-none">
                {score.pages[currentPage].measures?.map((measure) => (
                  <div
                    key={measure.id}
                    className="absolute border border-blue-400/30 bg-blue-400/10"
                    style={{
                      left: measure.x * (zoom / 100),
                      top: measure.y * (zoom / 100),
                      width: measure.width * (zoom / 100),
                      height: measure.height * (zoom / 100),
                    }}
                  >
                    <span className="absolute -top-6 left-0 text-xs bg-blue-500 text-white px-1 rounded">
                      {measure.number}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de status */}
      <div className="bg-white/5 border-t border-white/10 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-400">
            <span>Ferramenta: {selectedTool || 'Nenhuma'}</span>
            <span>Camada: {activeLayer}</span>
            <span>
              Anotações:{' '}
              {annotations.filter((a) => a.page === currentPage).length}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-gray-400">
            {playbackCursor.isActive && (
              <span className="text-blue-400">
                ▶ Compasso {playbackCursor.measureNumber}
              </span>
            )}
            <span>{score.title}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveScoreViewer;
