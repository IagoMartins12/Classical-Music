'use client';

import { ESTUDOS } from '@/app/conteudo/textos/estudos';
import { useTextos } from '@/app/hooks/useTextos';
import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { CaixaDeMarcar } from '@/app/components/ui/CaixaDeMarcar';
import {
  useCallback,
  useRef,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from 'react';
import toast from 'react-hot-toast';
import {
  PiBookmarkSimple,
  PiCheckCircle,
  PiDownloadSimple,
  PiFileText,
  PiLockSimple,
  PiPencilLine,
  PiPlus,
  PiSparkle,
  PiTarget,
  PiTrash,
  PiVideoCamera,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import ConfirmModal from '@/app/components/ConfirmModal';
import { RecursoDoPlano } from '@/app/components/site/RecursoDoPlano';
import ScoreSelectionModal from '@/app/components/LearningModal/ScoreSelectionModal';
import { ScorePage } from '@/app/components/site/work/ScorePreview';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Selecao } from '@/app/components/ui/Selecao';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { STUDY } from '@/app/conteudo/site/study';
import { useAuth } from '@/app/hooks/useAuth';
import { useLearnedVideo } from '@/app/hooks/useLearnedVideo';
import { apiFetch } from '@/app/libs/api/client';
import type { ApiSchema } from '@/app/libs/api/types';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
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
import { studyEditParams } from '../personal/studyEdit';
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

/**
 * A dashed panel with its own heading, as in the earlier study modal.
 * `relative`: the hidden file input inside (the video) is placed against the
 * panel. Without it, it was placed against the sheet itself, and focusing it
 * when the panel was tapped scrolled the whole sheet out of place.
 */
function Panel({
  icon,
  title,
  status,
  action,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  status: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="relative flex flex-col gap-4 rounded-card border border-dashed border-[var(--linha-forte)] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-controle bg-sup-2 text-ouro-texto">
            <Icon de={icon} />
          </span>
          <span className="flex flex-col">
            <span className="font-medium">{title}</span>
            <span className="t-rotulo text-texto-suave">{status}</span>
          </span>
        </span>
        {action}
      </div>
      {children}
    </section>
  );
}

/** The large dashed "+" target for adding a score or a video. */
function AddZone({
  title,
  text,
  onClick,
  htmlFor,
}: {
  title: string;
  text: string;
  onClick?: () => void;
  htmlFor?: string;
}) {
  const body = (
    <>
      <span className="grid h-12 w-12 place-items-center rounded-controle bg-sup-2 text-ouro-texto transition-transform duration-[var(--t-resposta)] group-hover:scale-105 motion-reduce:transition-none">
        <Icon de={PiPlus} tamanho="m" />
      </span>
      <span className="font-medium">{title}</span>
      <span className="t-rotulo text-texto-suave">{text}</span>
    </>
  );
  const cls =
    'group flex w-full cursor-pointer flex-col items-center gap-2 rounded-card border border-dashed border-[var(--linha-forte)] p-5 text-center transition-colors duration-[var(--t-toque)] hover:border-[var(--ouro)]';
  return htmlFor ? (
    <label htmlFor={htmlFor} className={cls}>
      {body}
    </label>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

/** From how many videos the Free plan's limit is announced as near. */
const AVISO_DE_VIDEOS = 3;

const fileSize = (bytes?: number | null) =>
  !bytes
    ? ''
    : bytes > 1e6
      ? `${(bytes / 1e6).toFixed(1)} MB`
      : `${Math.round(bytes / 1e3)} KB`;

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
  const { t: tMilestone } = useTextos(ESTUDOS);
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
  // O teto de vídeos do plano (Free: 5), da mesma conta que a API usa:
  // avisado antes de escolher o arquivo, não depois de enviar.
  const quota = useQuery({
    queryKey: ['uploads', 'stats'],
    queryFn: () =>
      apiFetch<ApiSchema<'ContributionTotalsDto'>>('/uploads/stats'),
    staleTime: 30_000,
    enabled: isOpen && !!user?.id,
  }).data?.performanceVideos;
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [pickingScore, setPickingScore] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [confirmVideo, setConfirmVideo] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [marking, setMarking] = useState(false);
  const [milestoneList, setMilestoneList] = useState<ProgressMilestone[]>([]);
  const [milestones, setMilestones] = useState<ProgressMilestones>({});
  const returningFromScore = useRef(false);

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
    if (!isOpen) {
      // Closed for good (not just to pick a score): forget the pending return.
      if (!store.isInSelectionMode) returningFromScore.current = false;
      return;
    }
    // Coming back from picking a score: keep what the person already filled in.
    if (returningFromScore.current) {
      returningFromScore.current = false;
      return;
    }
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

  // "Quero aprender" → "Já aprendi": the work moves to "learned" at once,
  // keeping its notes, difficulty and score, and the sheet stays open on
  // "learned" to fill in the rest. Runs once per opening, whatever opened it
  // (the work page, the studies list or the button inside this sheet).
  const moving = useRef<string | null>(null);
  useEffect(() => {
    if (!isOpen) {
      moving.current = null;
      return;
    }
    if (type !== 'learned' || isCurrentlyActive || !workId || !user?.id) return;
    const item = library.getWantToLearnItem(workId);
    if (!item || moving.current === workId) return;
    moving.current = workId;
    const userId = user.id;
    const level = Math.max(1, item.priority || 1);
    const scoreId = selectedWorkScore?.id ?? item.selectedWorkScoreId;
    setSaving(true);
    void (async () => {
      try {
        await library.removeWantToLearn(workId);
        await library.toggleLearned(workId, userId, level, {
          mastery: level,
          difficulty: item.difficulty,
          notes: item.notes,
          selectedWorkScoreId: scoreId,
          wouldRecommend: true,
          publicPerformance: false,
        });
        toast.success(copy.toasts.transferred);
        // Closed while it moved: it stays closed.
        if (!useLearningModalStore.getState().isOpen) return;
        // Reopened as an edit of the item now saved in "learned".
        const saved = useLearningStore.getState().getLearnedItem(workId);
        const params = saved ? studyEditParams(saved, 'learned') : null;
        store.openModal({
          ...(params ?? {}),
          workId,
          workTitle: workTitle ?? params?.workTitle ?? '',
          composerName: composerName ?? params?.composerName ?? '',
          epochName: store.epochName ?? params?.epochName,
          instrumentName: instrumentName ?? params?.instrumentName,
          type: 'learned',
          isCurrentlyActive: true,
          initialWorkScore: selectedWorkScore ?? params?.initialWorkScore,
        });
      } catch {
        toast.error(copy.toasts.failed);
      } finally {
        setSaving(false);
      }
    })();
  }, [isOpen, type, isCurrentlyActive, workId, user?.id]);

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
      // Editing: null clears the score; the API ignores an absent field.
      const scoreId = isCurrentlyActive
        ? (selectedWorkScore?.id ?? null)
        : selectedWorkScore?.id;
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
          // The API keeps the lists exclusive; the local copy follows.
          library.removeLearnedLocal(workId);
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
        library.removeWantToLearnLocal(workId);
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

  // Same work, the other list: the sheet turns into it, keeping the score.
  const switchTo = (next: 'want-to-learn' | 'learned') =>
    store.openModal({
      workId,
      workTitle,
      composerName,
      epochName: store.epochName ?? undefined,
      instrumentName: instrumentName ?? undefined,
      type: next,
      isCurrentlyActive:
        next === 'learned'
          ? library.isLearned(workId)
          : library.isWantToLearn(workId),
      initialWorkScore: selectedWorkScore,
    });

  const removeVideo = async () => {
    const ok = await video.deleteVideo(workId);
    setConfirmVideo(false);
    if (!ok) return toast.error(copy.toasts.failed);
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
  const videoUrl = video.videoPreviewUrl || learnedItem?.videoUrl || null;
  const videoFull =
    !learnedItem?.videoUrl && quota?.limit != null && quota.used >= quota.limit;
  const videoName =
    video.selectedVideo?.name || learnedItem?.videoFileName || '';
  const videoSize = video.selectedVideo?.size || learnedItem?.videoFileSize;
  const title = isWant
    ? isCurrentlyActive
      ? copy.titles.wantEdit
      : copy.titles.want
    : isCurrentlyActive
      ? copy.titles.learnedEdit
      : copy.titles.learned;

  const chooseScore = () => {
    if (!onWorkPage) return setPickingScore(true);
    returningFromScore.current = true;
    startScoreSelection();
  };
  const suggested =
    !isCurrentlyActive &&
    !!selectedWorkScore &&
    opposite?.selectedWorkScore?.id === selectedWorkScore.id;
  const scoreBlock = (
    <Panel
      icon={PiFileText}
      title={copy.score.title}
      status={selectedWorkScore ? copy.score.linked : copy.score.none}
    >
      {selectedWorkScore ? (
        <div className="flex flex-col gap-2 rounded-card bg-sup-2 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="relative block aspect-[1/1.3] w-10 shrink-0 overflow-hidden rounded-[4px] bg-sobre-foto shadow-[var(--sombra-1)]">
                <ScorePage file={selectedWorkScore} sizes="40px" small />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">
                  {selectedWorkScore.title}
                </span>
                <span className="t-legenda truncate">
                  {[
                    copy.score.from(selectedWorkScore.source),
                    selectedWorkScore.fileSize,
                    selectedWorkScore.pageCount &&
                      copy.score.pages(selectedWorkScore.pageCount),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1 sm:shrink-0">
              {selectedWorkScore.downloadUrl && (
                <a
                  href={selectedWorkScore.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={copy.score.open}
                  title={copy.score.open}
                  className={classesDeBotao('secundario', 'p', true)}
                >
                  <Icon de={PiDownloadSimple} tamanho="pp" />
                </a>
              )}
              <Button
                tamanho="p"
                icone={PiPencilLine}
                rotulo={copy.score.change}
                onClick={chooseScore}
              />
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiX}
                rotulo={copy.score.remove}
                onClick={() => {
                  setTouched(true);
                  setSelectedWorkScore(null);
                }}
              />
            </div>
          </div>
          {suggested && (
            <span className="t-legenda text-ouro-texto">
              {copy.score.suggested(
                isWant ? copy.titles.learned : copy.titles.want
              )}
            </span>
          )}
        </div>
      ) : (
        <AddZone
          title={isCurrentlyActive ? copy.score.chooseEdit : copy.score.choose}
          text={onWorkPage ? copy.score.chooseHereText : copy.score.chooseText}
          onClick={chooseScore}
        />
      )}
    </Panel>
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
        <Panel
          icon={PiTarget}
          title={copy.progress}
          status={copy.progressDone(Math.round(progress))}
          action={
            <Button
              tamanho="p"
              icone={PiPencilLine}
              onClick={() => setMarking(true)}
            >
              {copy.markProgress}
            </Button>
          }
        >
          <span className="block h-2 overflow-hidden rounded-full bg-[var(--linha)]">
            <span
              className="block h-full rounded-full fill-ouro transition-[width] duration-[var(--t-resposta)]"
              style={{ width: `${progress}%` }}
            />
          </span>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {milestoneList
              .filter((m) => milestones[m.key])
              .map((m) => (
                <li
                  key={m.key}
                  className="t-legenda inline-flex items-center gap-1.5 text-texto-suave"
                >
                  <Icon
                    de={PiCheckCircle}
                    tamanho="pp"
                    className="text-ouro-texto"
                  />
                  {tMilestone(m.labelKey)}
                </li>
              ))}
          </ul>
        </Panel>
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
          <CaixaDeMarcar
            key={key}
            rotulo={label}
            marcado={learned[key]}
            aoMudar={(on) => learned_({ [key]: on })}
          />
        ))}
      </div>
      <Area
        label={copy.generalNotes}
        value={learned.notes}
        placeholder={copy.generalNotesPlaceholder}
        onChange={(notes) => learned_({ notes })}
      />
      {scoreBlock}
      <Panel
        icon={PiVideoCamera}
        title={copy.video}
        status={videoUrl ? copy.videoAdded : copy.videoNone}
      >
        <input
          id="study-video"
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="sr-only"
          onChange={(e) => {
            setTouched(true);
            video.selectVideo(e.target.files?.[0] ?? null);
            e.target.value = '';
          }}
        />
        {videoUrl ? (
          <div className="flex flex-col gap-3 rounded-card bg-sup-2 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{videoName}</span>
                <span className="t-legenda">
                  {[
                    fileSize(videoSize),
                    video.isVideoPublic
                      ? copy.videoIsPublic
                      : copy.videoIsPrivate,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
              {learnedItem?.videoUrl && !video.selectedVideo && (
                <Button
                  tamanho="p"
                  variante="fantasma"
                  icone={PiTrash}
                  rotulo={copy.videoRemove}
                  onClick={() => setConfirmVideo(true)}
                />
              )}
            </div>
            <video
              src={videoUrl}
              controls
              className="max-h-64 w-full rounded-controle bg-[var(--fundo)]"
            />
            <label
              htmlFor="study-video"
              className="t-rotulo cursor-pointer self-center text-texto-suave underline underline-offset-4 hover:text-texto"
            >
              {copy.videoReplace}
            </label>
          </div>
        ) : videoFull && quota?.limit != null ? (
          // The Free plan's last video is used: the upload is locked like the
          // piece recommendations, a blurred target and the Plus invite.
          <div className="grid">
            {/* `inert`: the blurred target is a picture, out of reach of the
                keyboard too. */}
            <div
              inert
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 select-none blur-[5px]"
            >
              <AddZone title={copy.videoAdd} text={copy.videoHelp} />
            </div>
            <div className="relative col-start-1 row-start-1 grid place-items-center p-3">
              <div className="sup-alta flex max-w-sm flex-col items-center gap-2 rounded-card p-5 text-center shadow-[var(--sombra-2)]">
                <Icon
                  de={PiLockSimple}
                  className="text-ouro-texto"
                  tamanho="m"
                />
                <p className="font-display text-[1.125rem]">
                  {copy.videoLockedTitle}
                </p>
                <p className="t-rotulo text-texto-suave">
                  {copy.videoFull(quota.limit)}
                </p>
                <Button
                  variante="primario"
                  tamanho="p"
                  icone={PiSparkle}
                  onClick={() => setPlanOpen(true)}
                >
                  {copy.videoPlus}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <AddZone
              title={copy.videoAdd}
              text={
                quota?.limit != null
                  ? `${copy.videoHelp} ${copy.videoQuota(quota.used, quota.limit)}`
                  : copy.videoHelp
              }
              htmlFor="study-video"
            />
            {/* Close to the Free plan's limit: said before it is reached. */}
            {quota?.limit != null && quota.used >= AVISO_DE_VIDEOS && (
              <p className="t-legenda flex flex-wrap items-center gap-x-1.5">
                <Icon
                  de={PiWarningCircle}
                  tamanho="pp"
                  className="text-ouro-texto"
                />
                {copy.videoNear(quota.used, quota.limit)}
                <button
                  type="button"
                  onClick={() => setPlanOpen(true)}
                  className="text-ouro-texto underline underline-offset-4"
                >
                  {copy.videoUpgrade}
                </button>
              </p>
            )}
          </div>
        )}
        {quota?.limit != null && (
          <RecursoDoPlano
            recurso="videos"
            limite={quota.limit}
            aberto={planOpen}
            aoFechar={() => setPlanOpen(false)}
          />
        )}
        {!videoFull && (
          <CaixaDeMarcar
            rotulo={copy.videoPublic}
            marcado={video.isVideoPublic}
            aoMudar={(on) => {
              setTouched(true);
              video.setIsVideoPublic(on);
            }}
          />
        )}
        {video.uploadError && (
          <p role="alert" className="t-rotulo text-erro">
            {video.uploadError}
          </p>
        )}
      </Panel>
    </>
  );

  return (
    <>
      <Sheet
        aberto={isOpen}
        aoFechar={requestClose}
        titulo={title}
        descricao={`${workTitle} · ${composerName}`}
        largura="g"
        rodape={
          // No celular, um botão por linha onde o texto é longo: salvar em cima,
          // trocar de lista embaixo, e cancelar com remover lado a lado. No
          // computador, a linha de sempre (remover e trocar à esquerda,
          // cancelar e salvar à direita).
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variante="primario"
              className="w-full whitespace-nowrap sm:order-5 sm:w-auto"
              carregando={saving || video.isUploading}
              onClick={() => void submit()}
            >
              {isCurrentlyActive ? copy.update : copy.save}
            </Button>
            {isWant ? (
              <Button
                variante="secundario"
                icone={PiCheckCircle}
                className="w-full whitespace-nowrap sm:order-2 sm:w-auto"
                onClick={() => switchTo('learned')}
                disabled={saving}
              >
                {copy.toLearned}
              </Button>
            ) : (
              <Button
                variante="secundario"
                icone={PiBookmarkSimple}
                className="w-full whitespace-nowrap sm:order-2 sm:w-auto"
                onClick={() => switchTo('want-to-learn')}
                disabled={saving}
              >
                {isCurrentlyActive ? copy.studyAgain : copy.toWant}
              </Button>
            )}
            <span className="hidden sm:order-3 sm:block sm:flex-1" />
            <div
              className={cx(
                'grid gap-2 sm:contents',
                isCurrentlyActive ? 'grid-cols-2' : 'grid-cols-1'
              )}
            >
              {isCurrentlyActive && (
                <Button
                  variante="fantasma"
                  icone={PiTrash}
                  className="whitespace-nowrap sm:order-1"
                  onClick={() => setConfirmRemove(true)}
                  disabled={saving}
                >
                  {copy.remove}
                </Button>
              )}
              <Button
                variante="fantasma"
                className="whitespace-nowrap sm:order-4"
                onClick={requestClose}
                disabled={saving}
              >
                {copy.cancel}
              </Button>
            </div>
          </div>
        }
      >
        <div className={cx('flex flex-col gap-6')}>
          {isWant ? (
            <>
              {wantFields}
              {scoreBlock}
            </>
          ) : (
            learnedFields
          )}
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
          onScoreSelected={(score) => {
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

      <Sheet
        aberto={marking}
        aoFechar={() => setMarking(false)}
        titulo={copy.markProgressTitle}
        descricao={copy.markProgressText}
        largura="p"
        rodape={
          <div className="flex w-full items-center justify-between gap-3">
            <span className="t-dado text-[0.8125rem] text-texto-suave">
              {copy.progressDone(Math.round(progress))}
            </span>
            <Button variante="primario" onClick={() => setMarking(false)}>
              {copy.markProgressDone}
            </Button>
          </div>
        }
      >
        <ul className="flex flex-col gap-1">
          {milestoneList.map((m) => (
            <li key={m.key} className="flex items-center justify-between gap-3">
              <CaixaDeMarcar
                rotulo={tMilestone(m.labelKey)}
                marcado={!!milestones[m.key]}
                aoMudar={(on) => {
                  setTouched(true);
                  setMilestones((prev) => ({ ...prev, [m.key]: on }));
                }}
              />
              <span className="t-dado shrink-0 text-[0.75rem] text-texto-fraco">
                +{m.weight}%
              </span>
            </li>
          ))}
        </ul>
      </Sheet>

      <ConfirmModal
        isOpen={confirmVideo}
        onClose={() => setConfirmVideo(false)}
        onConfirm={() => void removeVideo()}
        type="danger"
        title={copy.videoRemoveTitle}
        message={copy.videoRemoveText}
        confirmText={copy.videoRemoveConfirm}
        cancelText={copy.cancel}
        isLoading={video.isUploading}
      />
      <ConfirmModal
        isOpen={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={async () => {
          await remove();
          setConfirmRemove(false);
        }}
        type="danger"
        title={copy.removeTitle}
        message={copy.removeText}
        confirmText={copy.remove}
        cancelText={copy.cancel}
        isLoading={saving}
      />
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
    </>
  );
}
