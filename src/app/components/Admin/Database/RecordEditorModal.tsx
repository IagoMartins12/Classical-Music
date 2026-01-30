// app/components/Admin/Database/RecordEditorModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiX,
  FiSave,
  FiAlertCircle,
  FiLock,
  FiAlertTriangle,
} from 'react-icons/fi';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import Checkbox from '@/app/components/Common/Checkbox';
import ConfirmationModal from './ConfirmationModal';
import { ModelSchema, ModelField } from '@/app/hooks/admin/useDatabaseStudio';
import { CONFIRMATION_KEYWORD } from '@/app/libs/database/databaseConfig';

interface RecordEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  record: any | null;
  schema: ModelSchema;
  modelName: string;
}

export default function RecordEditorModal({
  isOpen,
  onClose,
  onSave,
  record,
  schema,
  modelName,
}: RecordEditorModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [criticalFields, setCriticalFields] = useState<string[]>([]);

  // Inicializar form data
  useEffect(() => {
    if (record) {
      // Modo edição - preencher com dados existentes
      setFormData(record);
    } else {
      // Modo criação - valores padrão
      const defaults: any = {};
      schema.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          defaults[field.name] = field.defaultValue;
        } else if (field.type === 'Boolean') {
          defaults[field.name] = false;
        } else if (field.type === 'Int') {
          defaults[field.name] = 0;
        } else if (field.isList) {
          defaults[field.name] = [];
        }
      });
      setFormData(defaults);
    }
  }, [record, schema]);

  // Validar campo
  const validateField = (field: ModelField, value: any): string | null => {
    if (field.isRequired && !value && value !== 0 && value !== false) {
      return `${field.name} é obrigatório`;
    }

    if (field.type === 'Int' && value && isNaN(parseInt(value))) {
      return `${field.name} deve ser um número`;
    }

    if (field.type === 'Float' && value && isNaN(parseFloat(value))) {
      return `${field.name} deve ser um número decimal`;
    }

    return null;
  };

  // Validar formulário completo
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    schema.fields
      .filter((f) => !f.isId && !f.relationTo) // Não validar ID nem relações por enquanto
      .forEach((field) => {
        const error = validateField(field, formData[field.name]);
        if (error) {
          newErrors[field.name] = error;
        }
      });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Detectar campos críticos alterados
  const detectCriticalChanges = (): string[] => {
    const changed: string[] = [];

    schema.fields.forEach((field) => {
      const fieldInfo = field as any;
      if (fieldInfo.requiresConfirmation && record) {
        // Verificar se mudou
        if (formData[field.name] !== record[field.name]) {
          changed.push(field.name);
        }
      }
    });

    return changed;
  };

  // Salvar
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // Verificar se tem campos críticos
    const critical = detectCriticalChanges();
    if (critical.length > 0) {
      setCriticalFields(critical);
      setShowConfirmation(true);
      return;
    }

    // Salvar direto se não houver campos críticos
    await performSave();
  };

  const performSave = async () => {
    setIsSaving(true);

    try {
      // Preparar dados para envio (remover ID se for criação)
      const dataToSave = { ...formData };
      if (!record) {
        delete dataToSave.id;
      }

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
      setShowConfirmation(false);
    }
  };

  // Renderizar campo de input baseado no tipo
  const renderField = (field: ModelField) => {
    const fieldInfo = field as any;

    // Não renderizar ID, timestamps automáticos, ou listas complexas
    if (
      field.isId ||
      field.name === 'createdAt' ||
      field.name === 'updatedAt' ||
      (field.isList && field.type !== 'String')
    ) {
      return null;
    }

    // Não renderizar campos não editáveis
    if (!fieldInfo.isEditable) {
      return null;
    }

    const value = formData[field.name];
    const error = errors[field.name];

    const handleChange = (newValue: any) => {
      setFormData((prev: any) => ({
        ...prev,
        [field.name]: newValue,
      }));

      // Limpar erro ao editar
      if (errors[field.name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field.name];
          return newErrors;
        });
      }
    };

    // Badges de campo
    const renderBadges = () => (
      <div className="flex items-center space-x-2 mb-2">
        {fieldInfo.isSensitive && (
          <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs rounded-full flex items-center space-x-1">
            <FiLock className="w-3 h-3" />
            <span>Sensível</span>
          </span>
        )}
        {fieldInfo.requiresConfirmation && (
          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 text-xs rounded-full flex items-center space-x-1">
            <FiAlertTriangle className="w-3 h-3" />
            <span>Exige confirmação</span>
          </span>
        )}
        {field.isUnique && (
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 text-xs rounded-full">
            Único
          </span>
        )}
      </div>
    );

    return (
      <div key={field.name} className="space-y-2">
        <label className="block text-sm font-medium text-theme-primary">
          {field.name}
          {field.isRequired && <span className="text-accent-red ml-1">*</span>}
        </label>

        {renderBadges()}

        {/* Boolean */}
        {field.type === 'Boolean' && (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value || false}
              onChange={(e) => handleChange(e.target.checked)}
            />
            <span className="text-sm text-theme-secondary">
              {value ? 'Sim' : 'Não'}
            </span>
          </div>
        )}

        {/* Enum */}
        {field.kind === 'enum' && fieldInfo.enumValues && (
          <Select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            options={[
              { value: '', label: 'Selecione...' },
              ...fieldInfo.enumValues.map((v: string) => ({
                value: v,
                label: v,
              })),
            ]}
            className={error ? 'border-accent-red' : ''}
          />
        )}

        {/* Int / Float */}
        {(field.type === 'Int' || field.type === 'Float') && (
          <Input
            type="number"
            step={field.type === 'Float' ? '0.01' : '1'}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={error ? 'border-accent-red' : ''}
          />
        )}

        {/* DateTime */}
        {field.type === 'DateTime' && (
          <Input
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ''}
            onChange={(e) =>
              handleChange(
                e.target.value ? new Date(e.target.value).toISOString() : null
              )
            }
            className={error ? 'border-accent-red' : ''}
          />
        )}

        {/* String Array */}
        {field.isList && field.type === 'String' && (
          <Input
            type="text"
            value={Array.isArray(value) ? value.join(', ') : value || ''}
            onChange={(e) =>
              handleChange(
                e.target.value
                  ? e.target.value.split(',').map((s) => s.trim())
                  : []
              )
            }
            placeholder="Separar por vírgulas"
            className={error ? 'border-accent-red' : ''}
          />
        )}

        {/* String padrão */}
        {!field.isList && field.type === 'String' && field.kind !== 'enum' && (
          <Input
            type={fieldInfo.isSensitive ? 'password' : 'text'}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={error ? 'border-accent-red' : ''}
          />
        )}

        {/* Relação (mostrar apenas ID por enquanto) */}
        {field.relationTo && (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`ID de ${field.relationTo}`}
            className={error ? 'border-accent-red' : ''}
          />
        )}

        {error && (
          <div className="flex items-center space-x-2 text-accent-red text-sm">
            <FiAlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-xs text-theme-tertiary">
          Tipo: {field.type}
          {field.relationTo && ` → ${field.relationTo}`}
          {field.isList && '[]'}
        </p>
      </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="4xl"
        confirmOnClose={Object.keys(formData).length > 0}
      >
        <div className="bg-theme-elevated">
          {/* Header */}
          <div className="p-6 border-b border-theme-primary">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-theme-primary">
                  {record ? 'Editar Registro' : 'Novo Registro'}
                </h2>
                <p className="text-sm text-theme-secondary mt-1">
                  {modelName} {record && `• ID: ${record.id}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-theme-secondary rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-theme-tertiary" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto classical-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {schema.fields
                .filter(
                  (f) =>
                    !f.isId && f.name !== 'createdAt' && f.name !== 'updatedAt'
                )
                .map(renderField)}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-theme-primary flex items-center justify-between">
            <div className="text-sm text-theme-tertiary">
              {Object.keys(errors).length > 0 && (
                <span className="text-accent-red flex items-center space-x-2">
                  <FiAlertCircle />
                  <span>
                    {Object.keys(errors).length} erro(s) encontrado(s)
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                leftIcon={<FiSave />}
                onClick={handleSave}
                disabled={isSaving}
                isLoading={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmação para campos críticos */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={performSave}
        title="Confirmar Alteração Crítica"
        message={`Você está alterando campo(s) crítico(s): ${criticalFields.join(', ')}. Esta ação pode ter impactos importantes.`}
        keyword={CONFIRMATION_KEYWORD}
        isLoading={isSaving}
        type="warning"
      />
    </>
  );
}
