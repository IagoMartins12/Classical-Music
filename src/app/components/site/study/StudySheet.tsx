'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { PiCheckCircle, PiFilePdf, PiTrash } from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import ScoreSelectionModal from '@/app/components/LearningModal/ScoreSelectionModal';
import type { WorkScore } from '@/app/hooks/useWorkScores';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Selecao } from '@/app/components/ui/Selecao';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { STUDY } from '@/app/conteudo/site/study';
import { useAuth } from '@/app/hooks/useAuth';
import { useLearnedVideo } from '@/app/hooks/useLearnedVideo';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { useTranslation } from '@/app/hooks/useTranslation';
import {
  getLearnedRequest,
  toggleLearnedRequest,
  updateLearnedRequest,
  updateWantToLearnRequest,
  uploadPerformanceVideo,
} from '@/app/requests/library';
import {
  useLearningModalStore,
  type DifficultyLevel,
  type SelectedWorkScore,
} from '@/app/stores/useLearningModalStore';
import { useLearningStore } from '@/app/stores/useLearningStore';
import {
  calculateProgress,
  createDefaultMilestones,
  getMilestonesByInstrument,
  type ProgressMilestone,
  type ProgressMilestones,
} from '@/app/utils/progressMilestones';
import { chip } from '../choice';

const area =
  'input-classical w-full resize-y rounded-controle px-4 py-3 text-base';

function Scale({
  label,
  labels,
  value,
  onPick,
}: {
  label: string;
  labels: string[];
  value: number;
  onPick: (n: number) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="t-rotulo mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {labels.map((text, i) => (
          <button
            key={text}
            type="button"
            aria-pressed={value === i + 1}
            onClick={() => onPick(i + 1)}
            className={chip(value === i + 1)}
          >
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Area({
  label,
  help,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  help?: string;
  value?: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field.Area
      label={label}
      ajuda={help}
      rows={3}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      classeCampo={area}
    />
  );
}

/** A score from the learning item, shaped for the modal store. */
function asSelected(
  score: SelectedWorkScore | undefined | null
): SelectedWorkScore | null {
  return score ? { ...score } : null;
}

/**
 * "Quero estudar" / "Já aprendi" in a sheet, with the same fields, store and
 * requests as before. Closing asks for confirmation only when the person
 * changed something.
 */
export function StudySheet() {
  const { language } = useRouteLanguage();
  const copy = STUDY[language];
  const { t: tMilestone } = useTranslation({ sections: ['pages/learning'] });
  const { user } = useAuth();
  const pathname = usePathname();
  const store = useLearningModalStore();
  const {
    isOpen,
    workId,
    workTitle,
    composerName,
    instrumentName,
    type,
    isCurrentlyActive,
    wantToLearnForm: want,
    learnedForm: learned,
    selectedWorkScore,
    closeModal,
    updateWantToLearnForm,
    updateLearnedForm,
    setSelectedWorkScore,
    startScoreSelection,
  } = store;
  const library = useLearningStore();
  const video = useLearnedVideo();
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [pickingScore, setPickingScore] = useState(false);
  const [milestoneList, setMilestoneList] = useState<ProgressMilestone[]>([]);
  const [milestones, setMilestones] = useState<ProgressMilestones>({});

  const onWorkPage = /\/works?\//.test(pathname ?? '');
  const isWant = type === 'want-to-learn';
  const current = workId
    ? isWant
      ? library.getWantToLearnItem(workId)
      : library.getLearnedItem(workId)
    : null;
  const opposite =
    workId && !isCurrentlyActive
      ? isWant
        ? library.getLearnedItem(workId)
        : library.getWantToLearnItem(workId)
      : null;

  // Every person-made change goes through here: it is what "unsaved" means.
  const want_ = (data: Parameters<typeof updateWantToLearnForm>[0]) => {
    setTouched(true);
    updateWantToLearnForm(data);
  };
  const learned_ = (data: Parameters<typeof updateLearnedForm>[0]) => {
    setTouched(true);
    updateLearnedForm(data);
  };

  // A fresh opening starts untouched, with the item's milestones, score and video setting.
  useEffect(() => {
    if (!isOpen) return;
    setTouched(false);
    if (isWant && instrumentName) {
      const list = getMilestonesByInstrument(instrumentName);
      setMilestoneList(list);
      setMilestones(
        (isCurrentlyActive &&
          library.getWantToLearnItem(workId ?? '')?.progressMilestones) ||
          createDefaultMilestones(list)
      );
    }
    if (!isWant) {
      const item = isCurrentlyActive
        ? library.getLearnedItem(workId ?? '')
        : null;
      video.setIsVideoPublic(item?.isVideoPublic ?? false);
    }
    if (!selectedWorkScore) {
      const fromItem = isCurrentlyActive
        ? current?.selectedWorkScore
        : opposite?.selectedWorkScore;
      if (fromItem)
        setSelectedWorkScore(asSelected(fromItem as SelectedWorkScore));
    }
  }, [isOpen, workId, type]);

  const close = useCallback(() => {
    setConfirmLeave(false);
    video.removeVideo();
    closeModal();
  }, [closeModal, video]);
  const requestClose = () =>
    touched && !saving ? setConfirmLeave(true) : close();

  if (!workId || !workTitle || !composerName || !type) return null;

  const done = (message: string) => {
    toast.success(message);
    close();
  };

  const submit = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const scoreId = selectedWorkScore?.id;
      if (isWant) {
        const data = {
          ...want,
          progressMilestones: milestones,
          selectedWorkScoreId: scoreId,
        };
        if (isCurrentlyActive) {
          const response = await updateWantToLearnRequest(workId, data);
          if (!response.ok) throw new Error();
          if (response.data.success && response.data.item)
            library.addWantToLearn(response.data.item);
          done(copy.toasts.wantUpdated);
        } else {
          await library.toggleWantToLearn(workId, user.id, want.priority, data);
          done(copy.toasts.wantAdded);
        }
        return;
      }
      const data = { ...learned, selectedWorkScoreId: scoreId };
      if (isCurrentlyActive) {
        if (video.selectedVideo) {
          if (!(await video.updateVideo(workId, data))) throw new Error();
          const response = await getLearnedRequest(workId);
          if (response.ok && response.data?.item)
            library.addLearned(response.data.item);
        } else {
          const response = await updateLearnedRequest(workId, {
            ...data,
            isVideoPublic: video.isVideoPublic,
          });
          if (!response.ok) throw new Error();
          if (response.data?.success && response.data.item)
            library.addLearned(response.data.item);
        }
        done(copy.toasts.learnedUpdated);
      } else {
        if (video.selectedVideo) {
          const videoAssetId = await uploadPerformanceVideo(
            workId,
            video.selectedVideo
          );
          const response = await toggleLearnedRequest(workId, 'add', {
            ...data,
            isVideoPublic: video.isVideoPublic,
            videoAssetId,
            videoFileName: video.selectedVideo.name,
          });
          if (!response.ok || !response.data?.success) throw new Error();
        }
        await library.toggleLearned(workId, user.id, learned.mastery, {
          ...data,
          isVideoPublic: video.isVideoPublic,
        });
        done(copy.toasts.learnedAdded);
      }
    } catch {
      toast.error(copy.toasts.failed);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await (isWant
        ? library.removeWantToLearn(workId)
        : library.removeLearned(workId));
      done(copy.toasts.removed);
    } catch {
      toast.error(copy.toasts.failed);
    } finally {
      setSaving(false);
    }
  };

  const transfer = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await library.removeWantToLearn(workId);
      await library.toggleLearned(
        workId,
        user.id,
        Math.max(1, want.priority || 1),
        {
          mastery: Math.max(1, want.priority || 1),
          difficulty: want.difficulty,
          notes: want.notes,
          selectedWorkScoreId: selectedWorkScore?.id,
          wouldRecommend: true,
          publicPerformance: false,
        }
      );
      setConfirmTransfer(false);
      done(copy.toasts.transferred);
    } catch {
      toast.error(copy.toasts.failed);
    } finally {
      setSaving(false);
    }
  };

  const removeVideo = async () => {
    if (!(await video.deleteVideo(workId)))
      return toast.error(copy.toasts.failed);
    const item = library.getLearnedItem(workId);
    if (item)
      library.addLearned({
        ...item,
        videoUrl: undefined,
        videoFileName: undefined,
        videoFilePath: undefined,
        videoFileSize: undefined,
        isVideoPublic: undefined,
        videoUploadedAt: undefined,
      });
    toast.success(copy.toasts.videoRemoved);
  };

  const difficultyOptions = (
    Object.keys(copy.difficulties) as (keyof typeof copy.difficulties)[]
  ).map((value) => ({ value, label: copy.difficulties[value] }));
  const progress = calculateProgress(milestones, milestoneList);
  const learnedItem =
    !isWant && isCurrentlyActive ? library.getLearnedItem(workId) : null;
  const title = isWant
    ? isCurrentlyActive
      ? copy.titles.wantEdit
      : copy.titles.want
    : isCurrentlyActive
      ? copy.titles.learnedEdit
      : copy.titles.learned;

  const scoreBlock = (
    <section className="flex flex-col gap-3 rounded-card bg-sup-2 p-4">
      <h3 className="t-rotulo">{copy.score.title}</h3>
      {selectedWorkScore ? (
        <div className="flex items-center gap-3">
          <Icon
            de={PiFilePdf}
            tamanho="m"
            className="shrink-0 text-texto-fraco"
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-medium">
              {selectedWorkScore.title}
            </span>
            <span className="t-legenda">
              {copy.score.from(selectedWorkScore.source)}
            </span>
          </span>
          <Button
            tamanho="p"
            variante="fantasma"
            onClick={() =>
              onWorkPage ? startScoreSelection() : setPickingScore(true)
            }
          >
            {copy.score.change}
          </Button>
          <Button
            tamanho="p"
            variante="fantasma"
            onClick={() => {
              setTouched(true);
              setSelectedWorkScore(null);
            }}
          >
            {copy.score.remove}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="t-rotulo text-texto-suave">{copy.score.none}</span>
          <Button
            tamanho="p"
            icone={PiFilePdf}
            onClick={() =>
              onWorkPage ? startScoreSelection() : setPickingScore(true)
            }
          >
            {copy.score.choose}
          </Button>
        </div>
      )}
    </section>
  );

  const pair = (a: ReactNode, b: ReactNode) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {a}
      {b}
    </div>
  );

  const wantFields = (
    <>
      <Scale
        label={copy.priority}
        labels={copy.priorities}
        value={want.priority}
        onPick={(priority) => want_({ priority })}
      />
      <Area
        label={copy.motivation}
        help={copy.motivationHelp}
        value={want.motivation}
        placeholder={copy.motivationPlaceholder}
        onChange={(motivation) => want_({ motivation })}
      />
      {pair(
        <Field
          label={copy.targetDate}
          ajuda={copy.targetDateHelp}
          type="date"
          value={want.targetDate ?? ''}
          onChange={(e) => want_({ targetDate: e.target.value })}
        />,
        <Field
          label={copy.estimatedTime}
          type="number"
          min={0}
          value={want.estimatedStudyTime ?? ''}
          placeholder={copy.estimatedPlaceholder}
          onChange={(e) =>
            want_({
              estimatedStudyTime: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
        />
      )}
      {pair(
        <label className="flex flex-col gap-2">
          <span className="t-rotulo">{copy.difficulty}</span>
          <Selecao
            aria-label={copy.difficulty}
            opcoes={difficultyOptions}
            valor={want.difficulty ?? ''}
            aoMudar={(v) =>
              want_({
                difficulty: (v || undefined) as DifficultyLevel | undefined,
              })
            }
          />
        </label>,
        <Field
          label={copy.context}
          ajuda={copy.contextHelp}
          value={want.context ?? ''}
          placeholder={copy.contextPlaceholder}
          onChange={(e) => want_({ context: e.target.value })}
        />
      )}
      <Area
        label={copy.notes}
        value={want.notes}
        placeholder={copy.notesPlaceholder}
        onChange={(notes) => want_({ notes })}
      />
      {milestoneList.length > 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 flex w-full items-baseline justify-between gap-3">
            <span className="t-rotulo">{copy.progress}</span>
            <span className="t-dado text-[0.8125rem] text-texto-suave">
              {copy.progressDone(Math.round(progress))}
            </span>
          </legend>
          <span className="block h-1.5 overflow-hidden rounded-full bg-[var(--linha)]">
            <span
              className="block h-full rounded-full fill-ouro"
              style={{ width: `${progress}%` }}
            />
          </span>
          <div className="flex flex-wrap gap-2">
            {milestoneList.map((m) => (
              <button
                key={m.key}
                type="button"
                aria-pressed={!!milestones[m.key]}
                onClick={() => {
                  setTouched(true);
                  setMilestones((prev) => ({ ...prev, [m.key]: !prev[m.key] }));
                }}
                className={chip(!!milestones[m.key])}
              >
                {milestones[m.key] && <Icon de={PiCheckCircle} tamanho="pp" />}{' '}
                {tMilestone(m.labelKey)}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </>
  );

  const learnedFields = (
    <>
      <Scale
        label={copy.mastery}
        labels={copy.masteries}
        value={learned.mastery}
        onPick={(mastery) => learned_({ mastery })}
      />
      {pair(
        <Field
          label={copy.studyStart}
          type="date"
          value={learned.studyStartDate ?? ''}
          onChange={(e) => learned_({ studyStartDate: e.target.value })}
        />,
        <Field
          label={copy.studyDuration}
          type="number"
          min={0}
          value={learned.studyDuration ?? ''}
          placeholder={copy.studyDurationPlaceholder}
          onChange={(e) =>
            learned_({
              studyDuration: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
        />
      )}
      <label className="flex flex-col gap-2 sm:max-w-[50%]">
        <span className="t-rotulo">{copy.realDifficulty}</span>
        <Selecao
          aria-label={copy.realDifficulty}
          opcoes={difficultyOptions}
          valor={learned.difficulty ?? ''}
          aoMudar={(v) =>
            learned_({
              difficulty: (v || undefined) as DifficultyLevel | undefined,
            })
          }
        />
      </label>
      <Scale
        label={copy.enjoyment}
        labels={copy.enjoyments}
        value={learned.enjoyment ?? 0}
        onPick={(enjoyment) => learned_({ enjoyment })}
      />
      <Area
        label={copy.challenges}
        value={learned.technicalChallenges}
        placeholder={copy.challengesPlaceholder}
        onChange={(technicalChallenges) => learned_({ technicalChallenges })}
      />
      <Area
        label={copy.insights}
        value={learned.musicalInsights}
        placeholder={copy.insightsPlaceholder}
        onChange={(musicalInsights) => learned_({ musicalInsights })}
      />
      <div className="flex flex-col gap-2">
        {(
          [
            ['wouldRecommend', copy.recommend],
            ['publicPerformance', copy.publicPerformance],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 t-rotulo">
            <input
              type="checkbox"
              checked={learned[key]}
              onChange={(e) => learned_({ [key]: e.target.checked })}
              className="h-4 w-4 accent-[var(--ouro)]"
            />
            {label}
          </label>
        ))}
      </div>
      <Area
        label={copy.generalNotes}
        value={learned.notes}
        placeholder={copy.generalNotesPlaceholder}
        onChange={(notes) => learned_({ notes })}
      />
      <section className="flex flex-col gap-3">
        <Field
          label={copy.video}
          ajuda={copy.videoHelp}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={(e) => {
            setTouched(true);
            video.selectVideo(e.target.files?.[0] ?? null);
          }}
          erro={video.uploadError ?? undefined}
        />
        {(video.videoPreviewUrl || learnedItem?.videoUrl) && (
          <video
            src={video.videoPreviewUrl || learnedItem?.videoUrl}
            controls
            className="aspect-video w-full rounded-card bg-sup-2"
          />
        )}
        <label className="flex items-center gap-3 t-rotulo">
          <input
            type="checkbox"
            checked={video.isVideoPublic}
            onChange={(e) => {
              setTouched(true);
              video.setIsVideoPublic(e.target.checked);
            }}
            className="h-4 w-4 accent-[var(--ouro)]"
          />
          {copy.videoPublic}
        </label>
        {learnedItem?.videoUrl && !video.selectedVideo && (
          <Button
            tamanho="p"
            variante="fantasma"
            icone={PiTrash}
            className="self-start"
            onClick={() => void removeVideo()}
          >
            {copy.videoRemove}
          </Button>
        )}
      </section>
    </>
  );

  return (
    <>
      <Sheet
        aberto={isOpen && !pickingScore}
        aoFechar={requestClose}
        titulo={title}
        descricao={`${workTitle} · ${composerName}`}
        largura="m"
        rodape={
          <div className="flex w-full flex-wrap items-center gap-2">
            {isCurrentlyActive && (
              <Button
                variante="fantasma"
                icone={PiTrash}
                onClick={() => void remove()}
                disabled={saving}
              >
                {copy.remove}
              </Button>
            )}
            {isWant && isCurrentlyActive && (
              <Button
                variante="fantasma"
                icone={PiCheckCircle}
                onClick={() => setConfirmTransfer(true)}
                disabled={saving}
              >
                {copy.toLearned}
              </Button>
            )}
            <span className="flex-1" />
            <Button
              variante="fantasma"
              onClick={requestClose}
              disabled={saving}
            >
              {copy.cancel}
            </Button>
            <Button
              variante="primario"
              carregando={saving || video.isUploading}
              onClick={() => void submit()}
            >
              {isCurrentlyActive ? copy.update : copy.save}
            </Button>
          </div>
        }
      >
        <div className={cx('flex flex-col gap-6')}>
          {scoreBlock}
          {isWant ? wantFields : learnedFields}
        </div>
      </Sheet>

      {pickingScore && (
        <ScoreSelectionModal
          isOpen
          onClose={() => setPickingScore(false)}
          workId={workId}
          workTitle={workTitle}
          composerName={composerName}
          currentSelectedScore={selectedWorkScore}
          isEditing={isCurrentlyActive}
          onScoreSelected={(score: WorkScore) => {
            setTouched(true);
            setSelectedWorkScore(
              score
                ? {
                    id: score.id,
                    sourceId: score.sourceId,
                    source: score.source,
                    title: score.title,
                    downloadUrl: score.downloadUrl,
                    thumbnailUrl: score.thumbnailUrl,
                    fileSize: score.fileSize,
                    pageCount: score.pageCount,
                    fileFormat: score.fileFormat,
                    type: score.type,
                    editor: score.editor,
                    publisher: score.publisher,
                    copyright: score.copyright,
                    uploadDate: score.uploadDate,
                    uploader: score.uploader,
                    notes: score.notes,
                  }
                : null
            );
            setPickingScore(false);
          }}
        />
      )}

      <ConfirmModal
        isOpen={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        onConfirm={close}
        type="warning"
        title={copy.leaveTitle}
        message={copy.leaveText}
        confirmText={copy.leaveConfirm}
        cancelText={copy.keepEditing}
        acaoPerigosa
      />
      <ConfirmModal
        isOpen={confirmTransfer}
        onClose={() => setConfirmTransfer(false)}
        onConfirm={transfer}
        type="question"
        title={copy.transferTitle}
        message={copy.transferText}
        confirmText={copy.transferConfirm}
        isLoading={saving}
      />
    </>
  );
}
