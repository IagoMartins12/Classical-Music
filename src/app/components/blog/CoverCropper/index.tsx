// components/blog/CoverCropper.tsx - VERSÃO PRO COM FUNCIONALIDADES EXTRAS
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiMonitor,
  FiTablet,
  FiSmartphone,
  FiRotateCw,
  FiMove,
  FiX,
} from 'react-icons/fi';
import Button from '../../Common/Button';
import { BiCheck } from 'react-icons/bi';
import Modal from '../../Modal';

interface CoverCropperProps {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

export default function CoverCropper({
  imageUrl,
  onCropComplete,
  onCancel,
}: CoverCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [showGrid, setShowGrid] = useState(true);

  const CROP_WIDTH = 800;
  const CROP_HEIGHT = 450;

  // Carregar imagem
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      imageRef.current = img;

      const scaleX = CROP_WIDTH / img.width;
      const scaleY = CROP_HEIGHT / img.height;
      const initialScale = Math.max(scaleX, scaleY);
      setScale(initialScale);

      const x = (CROP_WIDTH - img.width * initialScale) / 2;
      const y = (CROP_HEIGHT - img.height * initialScale) / 2;
      setPosition({ x, y });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Desenhar no canvas com rotação e grid
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CROP_WIDTH, CROP_HEIGHT);

    // Salvar contexto
    ctx.save();

    // Aplicar transformações
    ctx.translate(CROP_WIDTH / 2, CROP_HEIGHT / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-CROP_WIDTH / 2, -CROP_HEIGHT / 2);

    // Desenhar imagem
    ctx.drawImage(
      image,
      position.x,
      position.y,
      image.width * scale,
      image.height * scale
    );

    ctx.restore();

    // Desenhar overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CROP_WIDTH, CROP_HEIGHT);

    // Área transparente
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(0, 0, CROP_WIDTH, CROP_HEIGHT);
    ctx.globalCompositeOperation = 'source-over';

    // Redesenhar imagem na área visível
    ctx.save();
    ctx.translate(CROP_WIDTH / 2, CROP_HEIGHT / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-CROP_WIDTH / 2, -CROP_HEIGHT / 2);
    ctx.drawImage(
      image,
      position.x,
      position.y,
      image.width * scale,
      image.height * scale
    );
    ctx.restore();

    // Grid de terços (regra dos terços)
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      // Linhas verticais
      ctx.beginPath();
      ctx.moveTo(CROP_WIDTH / 3, 0);
      ctx.lineTo(CROP_WIDTH / 3, CROP_HEIGHT);
      ctx.moveTo((CROP_WIDTH * 2) / 3, 0);
      ctx.lineTo((CROP_WIDTH * 2) / 3, CROP_HEIGHT);

      // Linhas horizontais
      ctx.moveTo(0, CROP_HEIGHT / 3);
      ctx.lineTo(CROP_WIDTH, CROP_HEIGHT / 3);
      ctx.moveTo(0, (CROP_HEIGHT * 2) / 3);
      ctx.lineTo(CROP_WIDTH, (CROP_HEIGHT * 2) / 3);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Borda da área de crop
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CROP_WIDTH, CROP_HEIGHT);
  }, [image, scale, position, rotation, showGrid]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev / 1.2, 0.1));

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResetZoom = () => {
    if (!image) return;
    const scaleX = CROP_WIDTH / image.width;
    const scaleY = CROP_HEIGHT / image.height;
    const initialScale = Math.max(scaleX, scaleY);
    setScale(initialScale);

    const x = (CROP_WIDTH - image.width * initialScale) / 2;
    const y = (CROP_HEIGHT - image.height * initialScale) / 2;
    setPosition({ x, y });
    setRotation(0);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleConfirm = async () => {
    if (!canvasRef.current || !image) return;

    const canvas = document.createElement('canvas');
    canvas.width = CROP_WIDTH;
    canvas.height = CROP_HEIGHT;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.save();
    ctx.translate(CROP_WIDTH / 2, CROP_HEIGHT / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-CROP_WIDTH / 2, -CROP_HEIGHT / 2);
    ctx.drawImage(
      image,
      position.x,
      position.y,
      image.width * scale,
      image.height * scale
    );
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) onCropComplete(blob);
      },
      'image/jpeg',
      0.95
    );
  };

  const getPreviewDimensions = () => {
    switch (previewMode) {
      case 'desktop':
        return { width: 800, height: 450, label: 'Desktop (800x450)' };
      case 'tablet':
        return { width: 600, height: 338, label: 'Tablet (600x338)' };
      case 'mobile':
        return { width: 400, height: 225, label: 'Mobile (400x225)' };
    }
  };

  const previewDims = getPreviewDimensions();

  return (
    <Modal isOpen maxWidth="6xl">
      <div className="w-full max-w-6xl my-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Principal */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-theme-elevated rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-theme-primary">
                  Ajuste a Imagem de Capa
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                    showGrid
                      ? 'bg-brand-primary text-white'
                      : 'bg-theme-classical text-theme-secondary'
                  }`}
                >
                  {showGrid ? '🔲 Grid Ativo' : '⬜ Grid Inativo'}
                </button>
              </div>

              {/* Canvas */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={CROP_WIDTH}
                  height={CROP_HEIGHT}
                  className="w-full h-auto cursor-move"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                />
                <div className="absolute top-4 left-4 text-white text-xs bg-black/60 px-3 py-1 rounded-full flex items-center space-x-2">
                  <FiMove className="w-3 h-3" />
                  <span>Arraste para mover</span>
                </div>
                <div className="absolute top-4 right-4 text-white text-xs bg-black/60 px-3 py-1 rounded-full">
                  16:9 • {rotation}°
                </div>
              </div>

              {/* Controles */}
              <div className="mt-4 space-y-4">
                {/* Zoom */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-theme-secondary">
                      🔍 Zoom: {Math.round(scale * 100)}%
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleZoomOut}
                        className="p-2 bg-theme-classical hover:bg-interactive-hover rounded-lg transition-colors"
                        title="Diminuir zoom"
                      >
                        <FiZoomOut className="w-4 h-4 text-theme-primary" />
                      </button>
                      <button
                        type="button"
                        onClick={handleResetZoom}
                        className="p-2 bg-theme-classical hover:bg-interactive-hover rounded-lg transition-colors"
                        title="Resetar"
                      >
                        <FiMaximize2 className="w-4 h-4 text-theme-primary" />
                      </button>
                      <button
                        type="button"
                        onClick={handleZoomIn}
                        className="p-2 bg-theme-classical hover:bg-interactive-hover rounded-lg transition-colors"
                        title="Aumentar zoom"
                      >
                        <FiZoomIn className="w-4 h-4 text-theme-primary" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-theme-secondary rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                </div>

                {/* Rotação */}
                <div className="flex items-center justify-between p-3 bg-theme-classical rounded-lg">
                  <span className="text-sm font-medium text-theme-secondary">
                    🔄 Rotação: {rotation}°
                  </span>
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors flex items-center space-x-2"
                  >
                    <FiRotateCw className="w-4 h-4" />
                    <span>Girar 90°</span>
                  </button>
                </div>

                <p className="text-xs text-theme-tertiary text-center">
                  💡 <strong>Dica:</strong> Use o grid (regra dos terços) para
                  posicionar elementos importantes
                </p>
              </div>
            </div>
          </div>

          {/* Preview e Ações */}
          <div className="space-y-4">
            {/* Preview */}
            <div className="bg-theme-elevated rounded-xl p-6">
              <h3 className="text-lg font-semibold text-theme-primary mb-4">
                Preview
              </h3>

              {/* Seletor de Dispositivo */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewMode === 'desktop'
                      ? 'bg-brand-primary text-white'
                      : 'bg-theme-classical text-theme-secondary hover:bg-interactive-hover'
                  }`}
                  title="Desktop"
                >
                  <FiMonitor className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewMode === 'tablet'
                      ? 'bg-brand-primary text-white'
                      : 'bg-theme-classical text-theme-secondary hover:bg-interactive-hover'
                  }`}
                  title="Tablet"
                >
                  <FiTablet className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewMode === 'mobile'
                      ? 'bg-brand-primary text-white'
                      : 'bg-theme-classical text-theme-secondary hover:bg-interactive-hover'
                  }`}
                  title="Mobile"
                >
                  <FiSmartphone className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-center text-theme-tertiary mb-3">
                {previewDims.label}
              </p>

              {/* Preview Canvas */}
              <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                <canvas
                  width={previewDims.width}
                  height={previewDims.height}
                  ref={(canvas) => {
                    if (!canvas || !image) return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;

                    const scaleRatio = previewDims.width / CROP_WIDTH;

                    ctx.clearRect(0, 0, previewDims.width, previewDims.height);
                    ctx.save();
                    ctx.translate(
                      previewDims.width / 2,
                      previewDims.height / 2
                    );
                    ctx.rotate((rotation * Math.PI) / 180);
                    ctx.translate(
                      -previewDims.width / 2,
                      -previewDims.height / 2
                    );
                    ctx.drawImage(
                      image,
                      position.x * scaleRatio,
                      position.y * scaleRatio,
                      image.width * scale * scaleRatio,
                      image.height * scale * scaleRatio
                    );
                    ctx.restore();
                  }}
                  className="w-full h-auto"
                />
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  ℹ️ A imagem será responsiva e se adaptará automaticamente a
                  diferentes tamanhos de tela.
                </p>
              </div>
            </div>

            {/* Ações */}
            <div className="space-y-2">
              <Button
                variant="primary"
                onClick={handleConfirm}
                leftIcon={<BiCheck className="w-4 h-4" />}
                className="w-full"
              >
                <span>Confirmar Recorte</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                leftIcon={<FiX className="w-4 h-4" />}
                className="w-full"
              >
                <span>Cancelar</span>
              </Button>
            </div>

            {/* Info adicional */}
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-green-900 dark:text-green-100 font-medium mb-1">
                ✨ Recursos Disponíveis:
              </p>
              <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                <li>• Zoom preciso (10% - 500%)</li>
                <li>• Rotação em 90°</li>
                <li>• Grid de composição</li>
                <li>• Preview responsivo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--brand-primary);
          cursor: pointer;
          transition: transform 0.2s;
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--brand-primary);
          cursor: pointer;
          border: none;
          transition: transform 0.2s;
        }

        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </Modal>
  );
}
