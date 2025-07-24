// app/components/Admin/Newsletter/TemplateSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiFileText,
  FiCode,
  FiStar,
  FiEye,
  FiCheck,
  FiX,
  FiSearch,
  FiFilter,
} from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import { getAllEmailTemplates } from '@/app/libs/newsletter/emailTemplates';

interface Template {
  id: string;
  name: string;
  type: string;
  subject: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  variables: string[];
  timesUsed: number;
  creator: {
    firstName?: string;
    lastName?: string;
  };
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplateId?: string;
  templateType?: string;
  onSelect: (template: Template | null) => void;
  onPreview?: (template: Template) => void;
  allowBuiltIn?: boolean;
  allowCustom?: boolean;
  compact?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export default function TemplateSelector({
  templates,
  selectedTemplateId,
  templateType,
  onSelect,
  onPreview,
  allowBuiltIn = true,
  allowCustom = true,
  compact = false,
  disabled = false,
  placeholder = 'Selecione um template...',
}: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [builtInTemplates, setBuiltInTemplates] = useState<any[]>([]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  useEffect(() => {
    if (allowBuiltIn) {
      const builtIns = getAllEmailTemplates();
      setBuiltInTemplates(builtIns);
    }
  }, [allowBuiltIn]);

  useEffect(() => {
    let filtered = templates;

    // Filtrar por tipo se especificado
    if (templateType) {
      filtered = filtered.filter((t) => t.type === templateType);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar apenas ativos se não estiver em modo disabled
    if (!disabled) {
      filtered = filtered.filter((t) => t.isActive);
    }

    // Ordenar: padrão primeiro, depois por nome
    filtered.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return a.name.localeCompare(b.name);
    });

    setFilteredTemplates(filtered);
  }, [templates, templateType, searchTerm, disabled]);

  const handleTemplateSelect = (template: Template | null) => {
    onSelect(template);
    setShowDropdown(false);
  };

  const getTemplateTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      WELCOME: 'Boas-vindas',
      ACCOUNT_CONFIRMATION: 'Confirmação de Conta',
      PASSWORD_RESET: 'Reset de Senha',
      WEEKLY_DIGEST: 'Digest Semanal',
      NEW_COMPOSER: 'Novo Compositor',
      CAMPAIGN_CUSTOM: 'Campanha Customizada',
    };
    return typeNames[type] || type;
  };

  const renderTemplateCard = (template: Template, isBuiltIn = false) => (
    <div
      key={isBuiltIn ? `builtin-${template.type}` : template.id}
      className="p-4 border border-theme-secondary rounded-lg hover:border-brand-primary transition-colors cursor-pointer"
      onClick={() => handleTemplateSelect(isBuiltIn ? null : template)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-theme-primary text-sm">
              {isBuiltIn ? template.description : template.name}
            </h4>
            {!isBuiltIn && template.isDefault && (
              <span className="px-2 py-1 bg-accent-amber/20 text-accent-amber rounded-full text-xs flex items-center">
                <FiStar className="w-3 h-3 mr-1" />
                Padrão
              </span>
            )}
            {isBuiltIn && (
              <span className="px-2 py-1 bg-accent-purple/20 text-accent-purple rounded-full text-xs flex items-center">
                <FiCode className="w-3 h-3 mr-1" />
                Built-in
              </span>
            )}
          </div>

          <p className="text-xs text-theme-tertiary mb-2">
            {isBuiltIn ? template.subject : template.subject}
          </p>

          {!isBuiltIn && template.description && (
            <p className="text-xs text-theme-secondary mb-2">
              {template.description}
            </p>
          )}

          <div className="flex items-center space-x-3 text-xs text-theme-tertiary">
            <span className="flex items-center">
              <FiFileText className="w-3 h-3 mr-1" />
              {getTemplateTypeName(isBuiltIn ? template.type : template.type)}
            </span>
            <span className="flex items-center">
              🔧{' '}
              {isBuiltIn
                ? template.variables?.length || 0
                : template.variables?.length || 0}{' '}
              vars
            </span>
            {!isBuiltIn && (
              <span className="flex items-center">
                📊 {template.timesUsed || 0} usos
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 ml-2">
          {onPreview && !isBuiltIn && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<FiEye />}
              onClick={(e) => {
                e.stopPropagation();
                onPreview(template);
              }}
              title="Preview"
            />
          )}
          <div className="w-5 h-5 rounded-full border-2 border-theme-secondary flex items-center justify-center">
            {(isBuiltIn ? false : selectedTemplateId === template.id) && (
              <FiCheck className="w-3 h-3 text-brand-primary" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="relative">
        <div
          className="input-classical-2 w-full cursor-pointer flex items-center justify-between"
          onClick={() => !disabled && setShowDropdown(!showDropdown)}
        >
          <span
            className={
              selectedTemplate ? 'text-theme-primary' : 'text-theme-tertiary'
            }
          >
            {selectedTemplate ? selectedTemplate.name : placeholder}
          </span>
          <FiFileText className="w-4 h-4 text-theme-tertiary" />
        </div>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-theme-primary border border-theme-secondary rounded-lg shadow-lg max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-theme-secondary">
              <Input
                type="text"
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<FiSearch className="w-4 h-4" />}
              />
            </div>

            <div className="p-2">
              {/* Opção "Nenhum template" */}
              <div
                className="p-2 rounded hover:bg-theme-secondary cursor-pointer flex items-center justify-between"
                onClick={() => handleTemplateSelect(null)}
              >
                <span className="text-theme-secondary">Nenhum template</span>
                {!selectedTemplateId && (
                  <FiCheck className="w-4 h-4 text-brand-primary" />
                )}
              </div>

              {/* Templates customizados */}
              {allowCustom &&
                filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-2 rounded hover:bg-theme-secondary cursor-pointer flex items-center justify-between"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-theme-primary font-medium text-sm">
                          {template.name}
                        </span>
                        {template.isDefault && (
                          <FiStar className="w-3 h-3 text-accent-amber" />
                        )}
                      </div>
                      <p className="text-xs text-theme-tertiary">
                        {template.subject}
                      </p>
                    </div>
                    {selectedTemplateId === template.id && (
                      <FiCheck className="w-4 h-4 text-brand-primary" />
                    )}
                  </div>
                ))}

              {/* Templates built-in */}
              {allowBuiltIn &&
                builtInTemplates
                  .filter(({ type }) => !templateType || type === templateType)
                  .map(({ type, template }) => (
                    <div
                      key={`builtin-${type}`}
                      className="p-2 rounded hover:bg-theme-secondary cursor-pointer flex items-center justify-between"
                      onClick={() => handleTemplateSelect(null)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-theme-primary font-medium text-sm">
                            {template.description}
                          </span>
                          <span className="px-1 py-0.5 bg-accent-purple/20 text-accent-purple rounded text-xs">
                            Built-in
                          </span>
                        </div>
                        <p className="text-xs text-theme-tertiary">
                          {template.subject}
                        </p>
                      </div>
                    </div>
                  ))}

              {filteredTemplates.length === 0 && (
                <div className="p-4 text-center text-theme-tertiary">
                  <FiFileText className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Nenhum template encontrado</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<FiSearch className="w-4 h-4" />}
            disabled={disabled}
          />
        </div>

        {templateType && (
          <div className="px-3 py-2 bg-theme-secondary rounded-lg text-sm text-theme-primary">
            <FiFilter className="w-4 h-4 inline mr-2" />
            {getTemplateTypeName(templateType)}
          </div>
        )}
      </div>

      {/* Templates Grid */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {/* Opção "Usar template built-in" */}
        {allowBuiltIn && (
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              !selectedTemplateId
                ? 'border-brand-primary bg-brand-primary/10'
                : 'border-theme-secondary hover:border-brand-primary'
            }`}
            onClick={() => handleTemplateSelect(null)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-theme-primary flex items-center">
                  <FiCode className="w-4 h-4 mr-2" />
                  Usar Template Built-in
                </h4>
                <p className="text-sm text-theme-secondary">
                  Template padrão do sistema para{' '}
                  {getTemplateTypeName(templateType || '')}
                </p>
              </div>
              {!selectedTemplateId && (
                <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center">
                  <FiCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates customizados */}
        {allowCustom &&
          filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedTemplateId === template.id
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-theme-secondary hover:border-brand-primary'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-theme-primary">
                      {template.name}
                    </h4>
                    {template.isDefault && (
                      <span className="px-2 py-1 bg-accent-amber/20 text-accent-amber rounded-full text-xs flex items-center">
                        <FiStar className="w-3 h-3 mr-1" />
                        Padrão
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-theme-secondary mb-2">
                    📧 {template.subject}
                  </p>

                  {template.description && (
                    <p className="text-sm text-theme-tertiary mb-2">
                      {template.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-theme-tertiary">
                    <span>🔧 {template.variables?.length || 0} variáveis</span>
                    <span>📊 {template.timesUsed || 0} usos</span>
                    <span>👤 {template.creator?.firstName || 'Admin'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {onPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiEye />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(template);
                      }}
                      title="Preview"
                    />
                  )}
                  {selectedTemplateId === template.id && (
                    <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center">
                      <FiCheck className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

        {filteredTemplates.length === 0 && allowCustom && (
          <div className="text-center py-8 text-theme-tertiary">
            <FiFileText className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">
              {searchTerm
                ? 'Nenhum template encontrado com esse termo'
                : `Nenhum template customizado do tipo "${getTemplateTypeName(
                    templateType || ''
                  )}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
