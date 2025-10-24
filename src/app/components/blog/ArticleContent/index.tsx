'use client';

import { useEffect, useRef } from 'react';

interface ArticleContentProps {
  content: any; // TipTap JSON
}

export function ArticleContent({ content }: ArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current || !content) return;
    renderTipTapContent(content, contentRef.current);
  }, [content]);

  const renderTipTapContent = (json: any, container: HTMLElement) => {
    container.innerHTML = '';
    if (!json || !json.content) return;

    json.content.forEach((node: any) => {
      const element = renderNode(node);
      if (element) {
        container.appendChild(element);
      }
    });
  };

  const renderNode = (node: any): HTMLElement | null => {
    switch (node.type) {
      case 'paragraph':
        return renderParagraph(node);
      case 'heading':
        return renderHeading(node);
      case 'bulletList':
        return renderBulletList(node);
      case 'orderedList':
        return renderOrderedList(node);
      case 'blockquote':
        return renderBlockquote(node);
      case 'codeBlock':
        return renderCodeBlock(node);
      case 'image':
        return renderImage(node);
      case 'youtube':
        return renderYoutube(node);
      case 'horizontalRule':
        return renderHorizontalRule();
      case 'composerCard':
        return renderComposerCard(node);
      case 'workCard':
        return renderWorkCard(node);
      case 'scoreViewer':
        return renderScoreViewer(node);
      case 'audioPlayer':
        return renderAudioPlayer(node);
      case 'timeline':
        return renderTimeline(node);
      case 'videoComparison':
        return renderVideoComparison(node);
      case 'quoteMusical':
        return renderQuoteMusical(node);
      default:
        return null;
    }
  };

  // ============================================
  // BASIC NODES (mantidos como estavam)
  // ============================================

  const renderParagraph = (node: any): HTMLElement => {
    const p = document.createElement('p');
    p.className = 'mb-4 text-theme-secondary leading-relaxed';
    if (node.content) {
      node.content.forEach((child: any) => {
        const text = renderText(child);
        if (text) p.appendChild(text);
      });
    }
    return p;
  };

  const renderHeading = (node: any): HTMLElement => {
    const level = node.attrs?.level || 2;
    const h = document.createElement(`h${level}`);
    h.className = `font-bold text-theme-primary mt-8 mb-4 ${
      level === 1
        ? 'text-4xl'
        : level === 2
          ? 'text-3xl'
          : level === 3
            ? 'text-2xl'
            : 'text-xl'
    }`;
    if (node.content) {
      node.content.forEach((child: any) => {
        const text = renderText(child);
        if (text) h.appendChild(text);
      });
    }
    return h;
  };

  const renderBulletList = (node: any): HTMLElement => {
    const ul = document.createElement('ul');
    ul.className = 'list-disc list-inside mb-4 space-y-2 text-theme-secondary';
    if (node.content) {
      node.content.forEach((item: any) => {
        const li = document.createElement('li');
        if (item.content) {
          item.content.forEach((child: any) => {
            if (child.content) {
              child.content.forEach((textNode: any) => {
                const text = renderText(textNode);
                if (text) li.appendChild(text);
              });
            }
          });
        }
        ul.appendChild(li);
      });
    }
    return ul;
  };

  const renderOrderedList = (node: any): HTMLElement => {
    const ol = document.createElement('ol');
    ol.className =
      'list-decimal list-inside mb-4 space-y-2 text-theme-secondary';
    if (node.content) {
      node.content.forEach((item: any) => {
        const li = document.createElement('li');
        if (item.content) {
          item.content.forEach((child: any) => {
            if (child.content) {
              child.content.forEach((textNode: any) => {
                const text = renderText(textNode);
                if (text) li.appendChild(text);
              });
            }
          });
        }
        ol.appendChild(li);
      });
    }
    return ol;
  };

  const renderBlockquote = (node: any): HTMLElement => {
    const blockquote = document.createElement('blockquote');
    blockquote.className =
      'border-l-4 border-brand-primary pl-6 py-4 mb-4 italic text-theme-secondary bg-theme-elevated rounded-r-lg';
    if (node.content) {
      node.content.forEach((child: any) => {
        const element = renderNode(child);
        if (element) blockquote.appendChild(element);
      });
    }
    return blockquote;
  };

  const renderCodeBlock = (node: any): HTMLElement => {
    const pre = document.createElement('pre');
    pre.className =
      'bg-theme-elevated border border-theme-secondary rounded-lg p-4 mb-4 overflow-x-auto';
    const code = document.createElement('code');
    code.className = 'text-sm text-theme-secondary font-mono';
    if (node.content) {
      node.content.forEach((child: any) => {
        if (child.text) {
          code.textContent += child.text;
        }
      });
    }
    pre.appendChild(code);
    return pre;
  };

  const renderImage = (node: any): HTMLElement => {
    const figure = document.createElement('figure');
    figure.className = 'my-8';
    const img = document.createElement('img');
    img.src = node.attrs?.src || '';
    img.alt = node.attrs?.alt || '';
    img.className = 'rounded-lg w-full shadow-theme-medium';
    figure.appendChild(img);
    if (node.attrs?.title) {
      const figcaption = document.createElement('figcaption');
      figcaption.className = 'text-center text-sm text-theme-tertiary mt-2';
      figcaption.textContent = node.attrs.title;
      figure.appendChild(figcaption);
    }
    return figure;
  };

  const renderYoutube = (node: any): HTMLElement => {
    const container = document.createElement('div');
    container.className = 'my-8 aspect-video rounded-lg overflow-hidden';
    const iframe = document.createElement('iframe');
    iframe.src = node.attrs?.src?.replace('watch?v=', 'embed/') || '';
    iframe.className = 'w-full h-full';
    iframe.setAttribute('allowfullscreen', 'true');
    container.appendChild(iframe);
    return container;
  };

  const renderHorizontalRule = (): HTMLElement => {
    const hr = document.createElement('hr');
    hr.className = 'my-8 border-theme-secondary';
    return hr;
  };

  // ============================================
  // CUSTOM EXTENSIONS (replicando layout exato)
  // ============================================

  const renderComposerCard = (node: any): HTMLElement => {
    const {
      composerId,
      composerName,
      composerImage,
      composerBio,
      composerBirthDate,
      composerDeathDate,
      composerInstrumentation,
      composerEpoch,
      composerNationality,
      layout = 'vertical',
      showWorksButton = true,
    } = node.attrs;

    const wrapper = document.createElement('div');
    wrapper.className = 'composer-card my-6';

    const card = document.createElement('div');
    card.className = `classical-card rounded-lg border-l-4 border-brand-primary shadow-md p-6 ${
      layout === 'horizontal' ? 'flex items-start space-x-6' : ''
    }`;

    if (composerImage) {
      const imageDiv = document.createElement('div');
      imageDiv.className =
        layout === 'horizontal' ? 'flex-shrink-0' : 'mb-4 text-center';

      const img = document.createElement('img');
      img.src = composerImage;
      img.alt = composerName;
      img.className = `${
        layout === 'horizontal' ? 'w-28 h-28' : 'w-40 h-40 mx-auto'
      } rounded-full object-cover shadow-md`;

      imageDiv.appendChild(img);
      card.appendChild(imageDiv);
    }

    const content = document.createElement('div');
    content.className = 'flex-1';

    const title = document.createElement('h3');
    title.className = `text-2xl font-bold text-theme-primary mb-2 ${layout === 'vertical' ? 'text-center' : ''}`;
    title.textContent = composerName;
    content.appendChild(title);

    if (composerBirthDate || composerDeathDate) {
      const dates = document.createElement('p');
      dates.className = `text-sm text-theme-secondary mb-2 ${layout === 'vertical' ? 'text-center' : ''}`;
      dates.textContent = `📅 ${composerBirthDate || '?'} - ${composerDeathDate || 'Presente'}`;
      content.appendChild(dates);
    }

    if (composerEpoch) {
      const epoch = document.createElement('p');
      epoch.className = `text-sm text-accent-purple font-medium mb-2 ${layout === 'vertical' ? 'text-center' : ''}`;
      epoch.textContent = `📜 Época: ${composerEpoch}`;
      content.appendChild(epoch);
    }

    if (composerNationality) {
      const nationality = document.createElement('p');
      nationality.className = `text-sm text-theme-tertiary mb-2 ${layout === 'vertical' ? 'text-center' : ''}`;
      nationality.textContent = `🌍 ${composerNationality}`;
      content.appendChild(nationality);
    }

    if (composerInstrumentation) {
      const instrumentation = document.createElement('p');
      instrumentation.className = `text-sm text-theme-tertiary mb-3 ${layout === 'vertical' ? 'text-center' : ''}`;
      instrumentation.textContent = `🎼 ${composerInstrumentation}`;
      content.appendChild(instrumentation);
    }

    if (composerBio) {
      const bio = document.createElement('p');
      bio.className = 'text-sm text-theme-secondary mb-4 leading-relaxed';
      bio.textContent = composerBio;
      content.appendChild(bio);
    }

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = `flex items-center space-x-2 mt-4 ${layout === 'vertical' ? 'justify-center' : ''}`;

    const mainBtn = document.createElement('a');
    mainBtn.href = `/composer/${composerId}`;
    mainBtn.target = '_blank';
    mainBtn.rel = 'noopener noreferrer';
    mainBtn.className =
      'px-4 py-2 bg-brand-primary text-white text-sm rounded-lg hover:opacity-90 transition-opacity shadow-sm inline-flex items-center';
    mainBtn.textContent = 'Ver no Opus Atlas →';
    buttonsDiv.appendChild(mainBtn);

    if (showWorksButton) {
      const worksBtn = document.createElement('a');
      worksBtn.href = `/composer/${composerId}#works`;
      worksBtn.target = '_blank';
      worksBtn.rel = 'noopener noreferrer';
      worksBtn.className =
        'px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors inline-flex items-center';
      worksBtn.textContent = 'Ver Obras';
      buttonsDiv.appendChild(worksBtn);
    }

    content.appendChild(buttonsDiv);
    card.appendChild(content);
    wrapper.appendChild(card);

    return wrapper;
  };

  const renderWorkCard = (node: any): HTMLElement => {
    const { workId, workTitle, composerName, instrumentName } = node.attrs;

    const wrapper = document.createElement('div');
    wrapper.className = 'work-card my-6';

    const card = document.createElement('div');
    card.className = 'classical-card p-6 border-l-4 border-accent-purple';

    const flexDiv = document.createElement('div');
    flexDiv.className = 'flex items-start space-x-4';

    const iconDiv = document.createElement('div');
    iconDiv.className = 'p-3 bg-accent-purple rounded-lg shadow-theme-medium';
    iconDiv.innerHTML =
      '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
    flexDiv.appendChild(iconDiv);

    const content = document.createElement('div');
    content.className = 'flex-1';

    const title = document.createElement('h3');
    title.className = 'text-xl font-bold text-theme-primary mb-1';
    title.textContent = workTitle;
    content.appendChild(title);

    const meta = document.createElement('p');
    meta.className = 'text-theme-secondary mb-3';
    meta.textContent = `${composerName} • ${instrumentName}`;
    content.appendChild(meta);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'flex items-center space-x-2';

    const viewBtn = document.createElement('a');
    viewBtn.href = `/works/${workId}`;
    viewBtn.target = '_blank';
    viewBtn.rel = 'noopener noreferrer';
    viewBtn.className =
      'inline-flex items-center px-4 py-2 bg-accent-purple text-white rounded-lg hover:opacity-90 transition-opacity shadow-theme-small';
    viewBtn.textContent = 'Ver Obra →';
    buttonsDiv.appendChild(viewBtn);

    const scoresBtn = document.createElement('a');
    scoresBtn.href = `/works/${workId}#scores`;
    scoresBtn.target = '_blank';
    scoresBtn.rel = 'noopener noreferrer';
    scoresBtn.className =
      'inline-flex items-center px-4 py-2 bg-theme-elevated border border-accent-purple text-accent-purple rounded-lg hover:bg-interactive-hover transition-colors';
    scoresBtn.textContent = 'Ver Partituras';
    buttonsDiv.appendChild(scoresBtn);

    content.appendChild(buttonsDiv);
    flexDiv.appendChild(content);
    card.appendChild(flexDiv);
    wrapper.appendChild(card);

    return wrapper;
  };

  const renderScoreViewer = (node: any): HTMLElement => {
    const {
      workId,
      scoreUrl,
      scoreTitle,
      workTitle,
      composerName,
      pageNumber = 1,
      allowDownload = true,
    } = node.attrs;

    const wrapper = document.createElement('div');
    wrapper.className = 'score-viewer my-6';

    const card = document.createElement('div');
    card.className =
      'classical-card overflow-hidden border-l-4 border-accent-green';

    const header = document.createElement('div');
    header.className = 'bg-accent-green text-white px-6 py-4';
    header.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <div>
            <h4 class="font-bold">${scoreTitle || 'Partitura'}</h4>
            <p class="text-sm opacity-90">${workTitle} - ${composerName}</p>
          </div>
        </div>
        ${
          allowDownload
            ? `
          <a href="${scoreUrl}" target="_blank" rel="noopener noreferrer" class="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors" title="Download">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
          </a>
        `
            : ''
        }
      </div>
    `;
    card.appendChild(header);

    const viewerDiv = document.createElement('div');
    viewerDiv.className = 'bg-theme-elevated relative';
    const iframe = document.createElement('iframe');
    iframe.src = `${scoreUrl}#page=${pageNumber}`;
    iframe.className = 'w-full h-[600px] border-0';
    iframe.title = scoreTitle;
    viewerDiv.appendChild(iframe);
    card.appendChild(viewerDiv);

    const footer = document.createElement('div');
    footer.className =
      'bg-theme-secondary px-6 py-4 border-t border-theme-secondary';
    footer.innerHTML = `
      <div class="flex items-center justify-between text-sm">
        <span class="text-theme-secondary">Página ${pageNumber}</span>
        <a href="/works/${workId}#scores" target="_blank" rel="noopener noreferrer" class="text-accent-green hover:text-brand-primary font-medium transition-colors">
          Ver partitura completa no Opus Atlas →
        </a>
      </div>
    `;
    card.appendChild(footer);

    wrapper.appendChild(card);
    return wrapper;
  };

  const renderAudioPlayer = (node: any): HTMLElement => {
    const {
      audioUrl,
      audioType = 'upload',
      title,
      composerId,
      composerName,
      workId,
      workTitle,
    } = node.attrs;

    console.log('🎵 AudioPlayer Debug:', { audioUrl, audioType, title });

    const wrapper = document.createElement('div');
    wrapper.className = 'audio-player my-6';

    const card = document.createElement('div');
    card.className =
      'rounded-lg classical-card-simple border-l-4 border-accent-purple shadow-md overflow-hidden';

    const content = document.createElement('div');
    content.className = 'p-6';

    // Header
    const header = document.createElement('div');
    header.className = 'flex items-center space-x-3 mb-4';
    header.innerHTML = `
      <div class="w-14 h-14 bg-gradient-to-br from-accent-purple to-brand-primary rounded-lg flex items-center justify-center shadow-md">
        <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>
      <div class="flex-1">
        <h4 class="text-lg font-bold text-theme-primary">${title}</h4>
        <div class="flex items-center space-x-2 text-sm text-theme-secondary mt-1">
          ${
            composerName
              ? `
            ${composerId ? `<a href="/composer/${composerId}" target="_blank" class="text-accent-purple hover:underline">${composerName}</a>` : `<span>${composerName}</span>`}
          `
              : ''
          }
          ${
            workTitle
              ? `
            <span class="text-theme-tertiary">•</span>
            ${workId ? `<a href="/works/${workId}" target="_blank" class="text-accent-purple hover:underline">${workTitle}</a>` : `<span>${workTitle}</span>`}
          `
              : ''
          }
        </div>
      </div>
    `;
    content.appendChild(header);

    // Player Controls
    const playerDiv = document.createElement('div');
    playerDiv.className = 'space-y-3';

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'flex items-center space-x-4';

    // Play/Pause Button
    const playBtn = document.createElement('button');
    playBtn.className =
      'audio-play-btn p-3 bg-accent-purple text-white rounded-full hover:opacity-90 transition-opacity shadow-md';
    playBtn.innerHTML =
      '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    controlsDiv.appendChild(playBtn);

    // Progress container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'flex-1';

    const progressBar = document.createElement('input');
    progressBar.type = 'range';
    progressBar.min = '0';
    progressBar.max = '100';
    progressBar.value = '0';
    progressBar.className =
      'audio-progress w-full h-2 rounded-lg appearance-none cursor-pointer';
    progressBar.style.background =
      'linear-gradient(to right, var(--accent-purple) 0%, var(--accent-purple) 0%, #e5e7eb 0%, #e5e7eb 100%)';
    progressContainer.appendChild(progressBar);

    const timeDiv = document.createElement('div');
    timeDiv.className =
      'audio-time flex justify-between text-xs text-theme-tertiary mt-1';
    timeDiv.innerHTML =
      '<span class="current-time">0:00</span><span class="duration-time">0:00</span>';
    progressContainer.appendChild(timeDiv);

    controlsDiv.appendChild(progressContainer);

    // Volume controls
    const volumeDiv = document.createElement('div');
    volumeDiv.className = 'flex items-center space-x-2 w-24';
    volumeDiv.innerHTML = `
      <svg class="w-5 h-5 text-theme-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
      </svg>
      <input type="range" min="0" max="100" value="70" class="audio-volume w-full h-1 rounded-lg appearance-none cursor-pointer" style="background: linear-gradient(to right, var(--accent-purple) 0%, var(--accent-purple) 70%, #e5e7eb 70%, #e5e7eb 100%);">
    `;
    controlsDiv.appendChild(volumeDiv);

    playerDiv.appendChild(controlsDiv);

    // ✅ TRATAMENTO CORRETO POR TIPO
    if (audioType === 'upload' && audioUrl) {
      // UPLOAD: usar tag <audio>
      const audio = document.createElement('audio');
      audio.src = audioUrl;
      audio.className = 'hidden';
      audio.preload = 'metadata';
      playerDiv.appendChild(audio);

      // Setup UPLOAD listeners
      setTimeout(() => {
        setupUploadPlayer(audio, playBtn, progressBar, timeDiv, volumeDiv);
      }, 100);
    } else if (audioType === 'youtube' && audioUrl) {
      // YOUTUBE: usar YouTube IFrame API
      const youtubeId = extractYoutubeId(audioUrl);
      if (youtubeId) {
        const playerContainer = document.createElement('div');
        playerContainer.className = 'hidden youtube-player-container';
        playerDiv.appendChild(playerContainer);

        // Carregar YouTube API e setup
        setTimeout(() => {
          loadYouTubeAPI(() => {
            setupYouTubePlayer(
              youtubeId,
              playerContainer,
              playBtn,
              progressBar,
              timeDiv,
              volumeDiv
            );
          });
        }, 100);
      }
    }

    content.appendChild(playerDiv);
    card.appendChild(content);
    wrapper.appendChild(card);

    return wrapper;
  };

  // ✅ HELPER: Extrair ID do YouTube
  const extractYoutubeId = (url: string): string | null => {
    const match = url.match(/embed\/([^?]+)/);
    return match ? match[1] : null;
  };

  // ✅ HELPER: Setup para UPLOAD
  const setupUploadPlayer = (
    audio: HTMLAudioElement,
    playBtn: HTMLElement,
    progressBar: HTMLInputElement,
    timeDiv: HTMLElement,
    volumeDiv: HTMLElement
  ) => {
    let isPlaying = false;

    // Play/Pause
    playBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isPlaying) {
        audio.pause();
        playBtn.innerHTML =
          '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
      } else {
        audio.play().catch((err) => console.error('Erro ao tocar:', err));
        playBtn.innerHTML =
          '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';
      }
      isPlaying = !isPlaying;
    });

    // Metadata loaded
    audio.addEventListener('loadedmetadata', () => {
      progressBar.max = String(audio.duration || 100);
      const durationMin = Math.floor(audio.duration / 60);
      const durationSec = Math.floor(audio.duration % 60);
      const durationSpan = timeDiv.querySelector('.duration-time');
      if (durationSpan) {
        durationSpan.textContent = `${durationMin}:${durationSec.toString().padStart(2, '0')}`;
      }
    });

    // Time update
    audio.addEventListener('timeupdate', () => {
      const progress = (audio.currentTime / audio.duration) * 100;
      progressBar.value = String(audio.currentTime);
      progressBar.style.background = `linear-gradient(to right, var(--accent-purple) 0%, var(--accent-purple) ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`;

      const currentMin = Math.floor(audio.currentTime / 60);
      const currentSec = Math.floor(audio.currentTime % 60);
      const currentSpan = timeDiv.querySelector('.current-time');
      if (currentSpan) {
        currentSpan.textContent = `${currentMin}:${currentSec.toString().padStart(2, '0')}`;
      }
    });

    // Ended
    audio.addEventListener('ended', () => {
      isPlaying = false;
      playBtn.innerHTML =
        '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    });

    // Seek
    progressBar.addEventListener('input', () => {
      audio.currentTime = Number(progressBar.value);
    });

    // Volume
    const volumeSlider = volumeDiv.querySelector(
      '.audio-volume'
    ) as HTMLInputElement;
    if (volumeSlider) {
      audio.volume = 0.7;
      volumeSlider.addEventListener('input', () => {
        const vol = Number(volumeSlider.value);
        audio.volume = vol / 100;
        volumeSlider.style.background = `linear-gradient(to right, var(--accent-purple) 0%, var(--accent-purple) ${vol}%, #e5e7eb ${vol}%, #e5e7eb 100%)`;
      });
    }
  };

  // ✅ HELPER: Carregar YouTube API
  const loadYouTubeAPI = (callback: () => void) => {
    if ((window as any).YT && (window as any).YT.Player) {
      callback();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = callback;
  };

  // ✅ HELPER: Setup para YOUTUBE
  const setupYouTubePlayer = (
    videoId: string,
    container: HTMLElement,
    playBtn: HTMLElement,
    progressBar: HTMLInputElement,
    timeDiv: HTMLElement,
    volumeDiv: HTMLElement
  ) => {
    let player: any = null;
    let isPlaying = false;
    let progressInterval: any = null;

    player = new (window as any).YT.Player(container, {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
      },
      events: {
        onReady: (event: any) => {
          const duration = event.target.getDuration();
          progressBar.max = String(duration);

          const durationMin = Math.floor(duration / 60);
          const durationSec = Math.floor(duration % 60);
          const durationSpan = timeDiv.querySelector('.duration-time');
          if (durationSpan) {
            durationSpan.textContent = `${durationMin}:${durationSec.toString().padStart(2, '0')}`;
          }

          event.target.setVolume(70);
        },
        onStateChange: (event: any) => {
          if (event.data === (window as any).YT.PlayerState.PLAYING) {
            isPlaying = true;
            playBtn.innerHTML =
              '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';
            startProgressTracking();
          } else {
            isPlaying = false;
            playBtn.innerHTML =
              '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
            stopProgressTracking();
          }
        },
      },
    });

    const startProgressTracking = () => {
      if (progressInterval) return;
      progressInterval = setInterval(() => {
        if (player && player.getCurrentTime) {
          const currentTime = player.getCurrentTime();
          const duration = player.getDuration();
          const progress = (currentTime / duration) * 100;

          progressBar.value = String(currentTime);
          progressBar.style.background = `linear-gradient(to right, var(--accent-purple) 0%, var(--accent-purple) ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`;

          const currentMin = Math.floor(currentTime / 60);
          const currentSec = Math.floor(currentTime % 60);
          const currentSpan = timeDiv.querySelector('.current-time');
          if (currentSpan) {
            currentSpan.textContent = `${currentMin}:${currentSec.toString().padStart(2, '0')}`;
          }
        }
      }, 100);
    };

    const stopProgressTracking = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    };

    // Play/Pause
    playBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    });

    // Seek
    progressBar.addEventListener('input', () => {
      player.seekTo(Number(progressBar.value), true);
    });

    // Volume
    const volumeSlider = volumeDiv.querySelector(
      '.audio-volume'
    ) as HTMLInputElement;
    if (volumeSlider) {
      volumeSlider.addEventListener('input', () => {
        const vol = Number(volumeSlider.value);
        player.setVolume(vol);
        volumeSlider.style.background = `linear-gradient(to right, var(--accent-purple) 0%, var(--accent-purple) ${vol}%, #e5e7eb ${vol}%, #e5e7eb 100%)`;
      });
    }
  };

  const renderTimeline = (node: any): HTMLElement => {
    const { events, composerName } = node.attrs;

    const wrapper = document.createElement('div');
    wrapper.className = 'timeline my-8 relative';

    if (composerName) {
      const header = document.createElement('div');
      header.className =
        'mb-6 flex items-center space-x-3 p-4 bg-brand-primary/10 rounded-lg border-l-4 border-brand-primary';
      header.innerHTML = `
        <svg class="w-5 h-5 text-brand-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <div>
          <p class="text-sm text-theme-tertiary">Timeline de</p>
          <p class="font-semibold text-theme-primary">${composerName}</p>
        </div>
      `;
      wrapper.appendChild(header);
    }

    const timelineDiv = document.createElement('div');
    timelineDiv.className = 'relative';

    const line = document.createElement('div');
    line.className = 'absolute left-8 top-0 bottom-0 w-0.5 bg-theme-tertiary';
    timelineDiv.appendChild(line);

    const eventsDiv = document.createElement('div');
    eventsDiv.className = 'space-y-8';

    events.forEach((event: any) => {
      const item = document.createElement('div');
      item.className = 'relative flex items-start space-x-6';

      const icon = document.createElement('div');
      icon.className =
        'relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary border-4 border-theme-elevated shadow-theme-medium';
      icon.innerHTML =
        '<svg class="w-6 h-6 text-theme-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>';
      item.appendChild(icon);

      const eventContent = document.createElement('div');
      eventContent.className = 'flex-1 pb-8';

      const eventCard = document.createElement('div');
      eventCard.className = 'classical-card p-6';
      eventCard.innerHTML = `
        <div class="text-sm font-semibold text-brand-primary mb-1">${event.date}</div>
        <h4 class="text-lg font-bold text-theme-primary mb-2">${event.title}</h4>
        ${event.description ? `<p class="text-theme-secondary">${event.description}</p>` : ''}
        ${event.image ? `<img src="${event.image}" alt="${event.title}" class="mt-4 rounded-lg w-full shadow-theme-small" />` : ''}
      `;

      eventContent.appendChild(eventCard);
      item.appendChild(eventContent);
      eventsDiv.appendChild(item);
    });

    timelineDiv.appendChild(eventsDiv);
    wrapper.appendChild(timelineDiv);

    return wrapper;
  };

  const renderVideoComparison = (node: any): HTMLElement => {
    const {
      title,
      video1,
      video2,
      layout = 'side-by-side',
      syncPlayback,
    } = node.attrs;

    const extractVideoId = (url: string): string | null => {
      const regExp =
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[7].length === 11 ? match[7] : null;
    };

    const videoId1 = extractVideoId(video1.url);
    const videoId2 = extractVideoId(video2.url);

    const wrapper = document.createElement('div');
    wrapper.className = 'video-comparison my-8';

    const card = document.createElement('div');
    card.className =
      'classical-card overflow-hidden border-l-4 border-accent-red';

    const header = document.createElement('div');
    header.className = 'bg-accent-red text-white px-6 py-4';
    header.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
        </svg>
        <div>
          <h4 class="font-bold">${title || 'Comparação de Performances'}</h4>
          ${syncPlayback ? '<p class="text-sm opacity-90">Reprodução sincronizada</p>' : ''}
        </div>
      </div>
    `;
    card.appendChild(header);

    const videosDiv = document.createElement('div');
    videosDiv.className = `bg-theme-elevated p-4 ${
      layout === 'side-by-side' ? 'grid grid-cols-2 gap-4' : 'space-y-4'
    }`;

    const video1Div = document.createElement('div');
    video1Div.className = 'space-y-2';
    video1Div.innerHTML = `
      <div class="flex items-center justify-between bg-theme-secondary px-4 py-2 rounded-lg">
        <div>
          <h5 class="font-semibold text-theme-primary">${video1.title}</h5>
          <p class="text-sm text-theme-secondary">${video1.description}</p>
        </div>
        <svg class="w-5 h-5 text-accent-red" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      <div class="aspect-video rounded-lg overflow-hidden shadow-theme-medium">
        <iframe src="https://www.youtube.com/embed/${videoId1}${syncPlayback ? '?enablejsapi=1' : ''}" 
                class="w-full h-full" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
      </div>
    `;
    videosDiv.appendChild(video1Div);

    const video2Div = document.createElement('div');
    video2Div.className = 'space-y-2';
    video2Div.innerHTML = `
      <div class="flex items-center justify-between bg-theme-secondary px-4 py-2 rounded-lg">
        <div>
          <h5 class="font-semibold text-theme-primary">${video2.title}</h5>
          <p class="text-sm text-theme-secondary">${video2.description}</p>
        </div>
        <svg class="w-5 h-5 text-accent-red" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      <div class="aspect-video rounded-lg overflow-hidden shadow-theme-medium">
        <iframe src="https://www.youtube.com/embed/${videoId2}${syncPlayback ? '?enablejsapi=1' : ''}" 
                class="w-full h-full" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
      </div>
    `;
    videosDiv.appendChild(video2Div);

    card.appendChild(videosDiv);
    wrapper.appendChild(card);

    return wrapper;
  };

  const renderQuoteMusical = (node: any): HTMLElement => {
    const { quote, author, backgroundAudioUrl } = node.attrs;

    const wrapper = document.createElement('div');
    wrapper.className = 'quote-musical my-8';

    const card = document.createElement('div');
    card.className =
      'relative classical-card p-8 border-l-4 border-accent-purple';

    card.innerHTML = `
      <svg class="absolute top-4 right-4 w-12 h-12 text-theme-tertiary opacity-20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
      </svg>
      <blockquote class="relative z-10">
        <p class="text-2xl font-serif italic text-theme-primary mb-4">"${quote}"</p>
        <footer class="flex items-center justify-between flex-wrap gap-4">
          <cite class="text-lg font-semibold text-brand-primary not-italic">— ${author}</cite>
          ${
            backgroundAudioUrl
              ? `
            <div class="flex items-center space-x-2 text-sm text-accent-purple">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              <span>🎵 Com música de fundo</span>
            </div>
          `
              : ''
          }
        </footer>
      </blockquote>
    `;

    wrapper.appendChild(card);
    return wrapper;
  };

  const renderText = (node: any): Node => {
    if (node.type !== 'text') return document.createTextNode('');

    let text: HTMLElement | Text = document.createTextNode(node.text);

    if (node.marks) {
      node.marks.forEach((mark: any) => {
        const span = document.createElement('span');

        switch (mark.type) {
          case 'bold':
            span.className = 'font-bold';
            break;
          case 'italic':
            span.className = 'italic';
            break;
          case 'underline':
            span.className = 'underline';
            break;
          case 'strike':
            span.className = 'line-through';
            break;
          case 'code':
            span.className =
              'px-1 py-0.5 bg-theme-elevated rounded text-sm font-mono';
            break;
          case 'link':
            const a = document.createElement('a');
            a.href = mark.attrs?.href || '#';
            a.className = 'text-blue-600 underline hover:text-blue-800';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.appendChild(text);
            return a;
          default:
            break;
        }

        span.appendChild(text);
        text = span;
      });
    }

    return text;
  };

  return (
    <div ref={contentRef} className="article-content text-theme-secondary" />
  );
}
