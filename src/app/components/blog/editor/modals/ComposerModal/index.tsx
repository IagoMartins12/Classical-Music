// components/blog/modals/ComposerModal.tsx - CORRIGIDO COM NATIONALITY
'use client';
import { Button as Botao } from '@/app/components/ui/Button';

import { useState, useId } from 'react';
import { Editor } from '@tiptap/react';
import Image from '@/app/components/SmartImage';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import Checkbox from '@/app/components/Common/Checkbox';
import ComposerSearchInputSimple from '@/app/components/ComposerSearchInputSimple';
import { findComposerById } from '@/app/requests/catalog-search';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

interface ComposerModalProps {
  editor: Editor;
  onClose: () => void;
}

export function ComposerModal({ editor, onClose }: ComposerModalProps) {
  const idCampo = useId();
  const [selectedComposer, setSelectedComposer] = useState('');
  const [composerData, setComposerData] = useState<any>(null);

  // Layout
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical');

  // Campos visíveis
  const [showImage, setShowImage] = useState(true);
  const [showBio, setShowBio] = useState(true);
  const [bioTruncated, setBioTruncated] = useState(false);
  const [showDates, setShowDates] = useState(true);
  const [showNationality, setShowNationality] = useState(true);
  const [showInstrumentation, setShowInstrumentation] = useState(false);
  const [showEpoch, setShowEpoch] = useState(true);
  const [showWorksButton, setShowWorksButton] = useState(true);
  const [showWikipediaLink, setShowWikipediaLink] = useState(false);

  const handleComposerSelect = async (composerId: string) => {
    setSelectedComposer(composerId);

    if (composerId) {
      try {
        const composer = await findComposerById(composerId);
        if (composer) setComposerData(composer);
      } catch (error) {
        console.error('Erro ao buscar compositor:', error);
      }
    }
  };

  const getTruncatedBio = (bio: string, maxLength: number = 200) => {
    if (!bio) return '';
    if (bio.length <= maxLength) return bio;
    return bio.substring(0, maxLength) + '...';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (composerData) {
      editor.commands.insertContent({
        type: 'composerCard',
        attrs: {
          composerId: composerData.id,
          composerName: composerData.name,
          composerImage: showImage ? composerData.portraitUrl : null,
          composerBio: showBio
            ? bioTruncated
              ? getTruncatedBio(composerData.bio)
              : composerData.bio
            : null,
          composerBirthDate: showDates ? composerData.birthDate : null,
          composerDeathDate: showDates ? composerData.deathDate : null,
          composerNationality: showNationality
            ? composerData.nationality
            : null, // ✅ CORRIGIDO - usa nationality
          composerInstrumentation: showInstrumentation
            ? composerData.instruments
            : null,
          composerEpoch: showEpoch ? composerData.epochName : null,
          composerWikipediaLink: showWikipediaLink
            ? composerData.wikipediaLink
            : null, // ✅ ADICIONADO
          layout,
          showWorksButton,
        },
      });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Inserir Card de Compositor"
      maxWidth="4xl"
      minHeight
    >
      <Stack gap={6} as="form" onSubmit={handleSubmit}>
        {/* Busca do Compositor */}
        <Stack gap={2}>
          <label
            htmlFor={`${idCampo}-1`}
            className="block text-sm font-medium text-theme-primary"
          >
            Buscar Compositor
          </label>
          <ComposerSearchInputSimple
            id={`${idCampo}-1`}
            selectedComposer={selectedComposer}
            onComposerSelect={handleComposerSelect}
            fullData={true} // ✅ Passa fullData=true para buscar todos os campos
          />
        </Stack>

        {/* Configurações */}
        {composerData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUNA ESQUERDA - Configurações */}
            <Stack className="classical-card">
              <div className="p-4 rounded-lg">
                <h4 className="font-semibold text-theme-primary mb-3">
                  Configurações
                </h4>

                {/* Layout */}
                <Stack gap={2} className="mb-4">
                  <span
                    id={`${idCampo}-2`}
                    className="block text-sm font-medium text-theme-primary"
                  >
                    Layout
                  </span>
                  <div
                    role="group"
                    aria-labelledby={`${idCampo}-2`}
                    className="flex space-x-2"
                  >
                    <Button
                      type="button"
                      variant={layout === 'vertical' ? 'primary' : 'outline'}
                      onClick={() => setLayout('vertical')}
                      className="flex-1"
                    >
                      Vertical
                    </Button>
                    <Button
                      type="button"
                      variant={layout === 'horizontal' ? 'primary' : 'outline'}
                      onClick={() => setLayout('horizontal')}
                      className="flex-1"
                    >
                      ↔️ Horizontal
                    </Button>
                  </div>
                </Stack>

                {/* Campos Visíveis */}
                <div className="space-y-2">
                  <Text
                    papel="rotulo"
                    tom="forte"
                    as="p"
                    className="font-medium mb-2"
                  >
                    Campos Visíveis
                  </Text>

                  <Checkbox
                    label="Mostrar imagem"
                    checked={showImage}
                    onChange={(e) => setShowImage(e.target.checked)}
                  />

                  <Checkbox
                    label="Mostrar biografia"
                    checked={showBio}
                    onChange={(e) => setShowBio(e.target.checked)}
                  />

                  {showBio && (
                    <div className="ml-6">
                      <Checkbox
                        label="Biografia resumida (200 caracteres)"
                        checked={bioTruncated}
                        onChange={(e) => setBioTruncated(e.target.checked)}
                      />
                    </div>
                  )}

                  <Checkbox
                    label="Mostrar datas (nascimento/morte)"
                    checked={showDates}
                    onChange={(e) => setShowDates(e.target.checked)}
                  />

                  <Checkbox
                    label="Mostrar nacionalidade"
                    checked={showNationality}
                    onChange={(e) => setShowNationality(e.target.checked)}
                  />

                  <Checkbox
                    label="Mostrar instrumentação"
                    checked={showInstrumentation}
                    onChange={(e) => setShowInstrumentation(e.target.checked)}
                  />

                  <Checkbox
                    label="Mostrar época"
                    checked={showEpoch}
                    onChange={(e) => setShowEpoch(e.target.checked)}
                  />

                  <Checkbox
                    label="Link para Wikipedia"
                    checked={showWikipediaLink}
                    onChange={(e) => setShowWikipediaLink(e.target.checked)}
                  />

                  <Checkbox
                    label="Botão 'Ver Obras'"
                    checked={showWorksButton}
                    onChange={(e) => setShowWorksButton(e.target.checked)}
                  />
                </div>
              </div>
            </Stack>

            {/* COLUNA DIREITA - Preview */}
            <Stack>
              <Card densidade="compacta" className="rounded-lg">
                <h4 className="font-semibold mb-3">Preview</h4>

                {/* Preview do Card */}
                <div
                  className={`rounded-lg shadow-md p-4 bg-sup-2 ${
                    layout === 'horizontal' ? 'flex items-start space-x-4' : ''
                  }`}
                >
                  {/* Imagem */}
                  {showImage && composerData.portraitUrl && (
                    <div
                      className={
                        layout === 'horizontal' ? 'flex-shrink-0' : 'mb-4'
                      }
                    >
                      <Image
                        src={composerData.portraitUrl}
                        alt={composerData.name}
                        width={layout === 'horizontal' ? 100 : 150}
                        height={layout === 'horizontal' ? 100 : 150}
                        className={`${
                          layout === 'horizontal'
                            ? 'w-24 h-24'
                            : 'w-32 h-32 mx-auto'
                        } rounded-full object-cover shadow-md`}
                      />
                    </div>
                  )}

                  {/* Conteúdo */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-theme-primary mb-2">
                      {composerData.name}
                    </h3>

                    {/* Datas */}
                    {showDates &&
                      (composerData.birthDate || composerData.deathDate) && (
                        <Text
                          papel="rotulo"
                          tom="suave"
                          as="p"
                          className="mb-2"
                        >
                          {composerData.birthDate || '?'} -{' '}
                          {composerData.deathDate || 'Presente'}
                        </Text>
                      )}

                    {/* Época */}
                    {showEpoch && composerData.epochName && (
                      <p className="text-sm font-medium mb-2">
                        {composerData.epochName}
                      </p>
                    )}

                    {/* ✅ NACIONALIDADE ADICIONADA NO PREVIEW */}
                    {showNationality && composerData.nationality && (
                      <Text papel="rotulo" tom="fraco" as="p" className="mb-2">
                        {composerData.nationality}
                      </Text>
                    )}

                    {/* Instrumentação */}
                    {showInstrumentation && composerData.instruments && (
                      <Text papel="rotulo" tom="fraco" as="p" className="mb-3">
                        {composerData.instruments}
                      </Text>
                    )}

                    {/* Biografia */}
                    {showBio && composerData.bio && (
                      <Text papel="rotulo" tom="suave" as="p" className="mb-3">
                        {bioTruncated
                          ? getTruncatedBio(composerData.bio)
                          : composerData.bio}
                      </Text>
                    )}

                    {/* Botões */}
                    <Inline gap={2} className="mt-3">
                      <Botao variante="fantasma" tamanho="p" type="button">
                        Ver no Opus →
                      </Botao>

                      {showWorksButton && (
                        <Botao variante="fantasma" tamanho="p" type="button">
                          Ver Obras
                        </Botao>
                      )}

                      {/* ✅ BOTÃO WIKIPEDIA ADICIONADO NO PREVIEW */}
                      {showWikipediaLink && composerData.wikipediaLink && (
                        <a
                          href={composerData.wikipediaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                        >
                          Wikipedia
                        </a>
                      )}
                    </Inline>
                  </div>
                </div>
              </Card>
            </Stack>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!composerData}>
            Inserir Card
          </Button>
        </div>
      </Stack>
    </Modal>
  );
}
