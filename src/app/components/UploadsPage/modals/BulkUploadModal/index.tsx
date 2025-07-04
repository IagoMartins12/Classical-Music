'use client';
// app/components/uploads/BulkUploadModal.tsx

import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import { useState } from 'react';
import { FiUpload, FiX, FiFile, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'composer' | 'work' | 'score';
}

const BulkUploadModal = ({ isOpen, onClose, type }: BulkUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setShowResults(false);
  };

  const processBulkUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setShowResults(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', type);

      const response = await fetch('/api/uploads/bulk', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
        setShowResults(true);
      } else {
        throw new Error('Erro no upload em lote');
      }
    } catch (error) {
      console.error('Erro no upload em lote:', error);
      alert('Erro ao processar upload em lote');
    } finally {
      setUploading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'composer':
        return 'Compositores';
      case 'work':
        return 'Obras';
      case 'score':
        return 'Partituras';
      default:
        return 'Itens';
    }
  };

  const downloadTemplate = () => {
    const templates = {
      composer: '/templates/composer-template.csv',
      work: '/templates/work-template.csv',
      score: '/templates/score-template.csv',
    };

    const link = document.createElement('a');
    link.href = templates[type];
    link.download = `${type}-template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-overlay backdrop-blur-sm">
      <AnimatedItem
        direction="scale"
        springType="bouncy"
        className="w-full max-w-2xl"
      >
        <div className="classical-card p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-theme-primary">
                Upload em Lote - {getTypeLabel(type)}
              </h2>
              <p className="text-sm text-theme-secondary">
                Importe múltiplos itens de uma vez usando um arquivo CSV
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-theme-secondary hover:bg-theme-tertiary text-theme-tertiary hover:text-theme-primary transition-colors flex items-center justify-center"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {!showResults ? (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-4">
                <h3 className="text-sm font-medium text-accent-blue mb-2">
                  Instruções
                </h3>
                <ol className="text-sm text-theme-secondary space-y-1">
                  <li>1. Baixe o template CSV clicando no botão abaixo</li>
                  <li>2. Preencha o arquivo com os dados desejados</li>
                  <li>3. Faça o upload do arquivo preenchido</li>
                  <li>4. Revise os resultados e confirme a importação</li>
                </ol>
              </div>

              {/* Download Template */}
              <div className="text-center">
                <Button
                  variant="secondary"
                  onClick={downloadTemplate}
                  leftIcon={<FiFile />}
                >
                  Baixar Template CSV
                </Button>
              </div>

              {/* File Upload */}
              <div
                className="border-2 border-dashed border-theme-secondary rounded-lg p-8 text-center hover:border-brand-primary transition-colors cursor-pointer"
                onClick={() =>
                  document.getElementById('bulk-file-upload')?.click()
                }
              >
                <input
                  id="bulk-file-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <FiCheck className="w-8 h-8 text-accent-green mx-auto" />
                    <p className="text-theme-primary font-medium">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-theme-tertiary">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FiUpload className="w-8 h-8 text-theme-tertiary mx-auto" />
                    <p className="text-theme-secondary">
                      Clique aqui para selecionar o arquivo CSV
                    </p>
                    <p className="text-sm text-theme-tertiary">
                      Somente arquivos .csv são aceitos
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={uploading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={processBulkUpload}
                  disabled={!selectedFile || uploading}
                  leftIcon={
                    uploading ? (
                      <FiUpload className="animate-spin" />
                    ) : (
                      <FiUpload />
                    )
                  }
                >
                  {uploading ? 'Processando...' : 'Processar Upload'}
                </Button>
              </div>
            </div>
          ) : (
            /* Results */
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-theme-primary mb-2">
                  Resultados do Upload
                </h3>
                <p className="text-theme-secondary">
                  {results.filter((r) => r.success).length} de {results.length}{' '}
                  itens processados com sucesso
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.success
                        ? 'bg-accent-green/10 border-accent-green/20'
                        : 'bg-accent-red/10 border-accent-red/20'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <FiCheck className="w-4 h-4 text-accent-green" />
                      ) : (
                        <FiAlertCircle className="w-4 h-4 text-accent-red" />
                      )}
                      <span className="text-sm font-medium text-theme-primary">
                        Linha {index + 1}:{' '}
                        {result.title || result.name || 'Item'}
                      </span>
                    </div>
                    {result.error && (
                      <p className="text-sm text-accent-red mt-1">
                        {result.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowResults(false);
                    setResults([]);
                    setSelectedFile(null);
                  }}
                >
                  Novo Upload
                </Button>
                <Button variant="primary" onClick={onClose}>
                  Concluir
                </Button>
              </div>
            </div>
          )}
        </div>
      </AnimatedItem>
    </div>
  );
};

export default BulkUploadModal;
