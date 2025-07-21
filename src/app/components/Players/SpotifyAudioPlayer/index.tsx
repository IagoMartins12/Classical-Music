'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiExternalLink,
  FiUser,
  FiLogIn,
} from 'react-icons/fi';
import { SiSpotify } from 'react-icons/si';

interface SpotifyFullPlayerProps {
  track: {
    trackId: string;
    trackUrl: string;
    previewUrl: string | null;
    albumArt: string | null;
    artists: string[];
    albumName: string;
    duration: number;
    popularity: number;
  };
  workTitle: string;
  composer: string;
}

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

const SpotifyFullPlayer: React.FC<SpotifyFullPlayerProps> = ({
  track,
  workTitle,
  composer,
}) => {
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [isPremium, setIsPremium] = useState(false);

  // Estados do player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);

  // Fallback para preview
  const [useFallback, setUseFallback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);

  // Carregar Spotify Web Playback SDK
  useEffect(() => {
    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        setIsSDKReady(true);
      };
    } else {
      setIsSDKReady(true);
    }
  }, []);

  // Verificar se usuário está logado no Spotify
  const checkSpotifyAuth = useCallback(async () => {
    try {
      // Verificar se tem token salvo
      const savedToken = localStorage.getItem('spotify_access_token');
      const tokenExpiry = localStorage.getItem('spotify_token_expiry');

      if (savedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        setAccessToken(savedToken);
        await checkUserPremium(savedToken);
        setIsLoggedIn(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar autenticação Spotify:', error);
      return false;
    }
  }, []);

  // Verificar se usuário tem Spotify Premium
  const checkUserPremium = async (token: string) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        setIsPremium(userData.product === 'premium');
        return userData.product === 'premium';
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar Premium:', error);
      return false;
    }
  };

  // Fazer login no Spotify
  const loginToSpotify = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      window.location.origin + '/spotify-callback'
    );
    const scopes = encodeURIComponent(
      'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state'
    );

    const authUrl =
      `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}&` +
      `response_type=token&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scopes}&` +
      `show_dialog=true`;

    window.open(authUrl, 'spotify-auth', 'width=400,height=500');
  };

  // Inicializar Spotify Web Playback SDK
  useEffect(() => {
    if (isSDKReady && accessToken && isPremium) {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Classical Music Player',
        getOAuthToken: (cb: (token: string) => void) => cb(accessToken),
        volume: volume,
      });

      // Eventos do player
      spotifyPlayer.addListener(
        'ready',
        ({ device_id }: { device_id: string }) => {
          console.log('Player pronto com Device ID:', device_id);
          setDeviceId(device_id);
        }
      );

      spotifyPlayer.addListener(
        'not_ready',
        ({ device_id }: { device_id: string }) => {
          console.log('Device ID saiu offline:', device_id);
        }
      );

      spotifyPlayer.addListener('player_state_changed', (state: any) => {
        if (!state) return;

        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
        setCurrentTime(state.position);
        setDuration(state.track_window.current_track.duration_ms);
      });

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);

      return () => {
        if (spotifyPlayer) {
          spotifyPlayer.disconnect();
        }
      };
    }
  }, [isSDKReady, accessToken, isPremium, volume]);

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkSpotifyAuth().then((isAuthenticated) => {
      if (!isAuthenticated) {
        setUseFallback(true);
      }
    });
  }, [checkSpotifyAuth]);

  // Inicializar player de fallback (preview)
  useEffect(() => {
    console.log('track', track);
    if (useFallback && track.previewUrl) {
      const audio = new Audio(track.previewUrl);
      audio.volume = isMuted ? 0 : volume;
      audioRef.current = audio;

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime * 1000); // converter para ms
      };

      const handleLoadedMetadata = () => {
        setDuration(audio.duration * 1000); // converter para ms
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
      };
    }
  }, [useFallback, track.previewUrl, volume, isMuted]);

  // Tocar música no Spotify
  const playTrackOnSpotify = async () => {
    if (!player || !deviceId) return;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: [`spotify:track:${track.trackId}`],
          }),
        }
      );

      if (response.ok) {
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Erro ao tocar no Spotify:', error);
    }
  };

  // Controles do player
  const togglePlay = async () => {
    console.log('user', audioRef.current);
    if (useFallback) {
      // Usar preview
      if (!audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      // Usar Spotify SDK
      if (!player) return;

      if (isPlaying) {
        await player.pause();
      } else {
        if (currentTrack?.id === track.trackId) {
          await player.resume();
        } else {
          await playTrackOnSpotify();
        }
      }
    }
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);

    if (useFallback && audioRef.current) {
      audioRef.current.volume = newVolume;
    } else if (player) {
      await player.setVolume(newVolume);
    }
  };

  const toggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (useFallback && audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume;
    } else if (player) {
      await player.setVolume(newMuted ? 0 : volume);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Renderizar estado de login
  if (!isLoggedIn && !useFallback) {
    return (
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#1db954] rounded-full flex items-center justify-center mx-auto mb-4">
            <SiSpotify className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white font-semibold mb-2">
            Áudio Completo Disponível
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Faça login no Spotify para ouvir a música completa (requer Spotify
            Premium)
          </p>
          <div className="flex space-x-2 justify-center">
            <button
              onClick={loginToSpotify}
              className="bg-[#1db954] hover:bg-[#1ed760] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiLogIn className="w-4 h-4" />
              <span>Login com Spotify</span>
            </button>
            <button
              onClick={() => setUseFallback(true)}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Usar Preview (30s)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar player
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start space-x-4">
          <div className="relative">
            {track.albumArt ? (
              <img
                src={track.albumArt}
                alt={track.albumName}
                className="w-20 h-20 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                <SiSpotify className="w-8 h-8 text-gray-400" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 rounded-lg border-2 border-green-400 animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate text-lg">
              {workTitle}
            </h3>
            <p className="text-gray-400 text-sm">{composer}</p>
            <p className="text-gray-500 text-xs mt-1">
              {track.artists.join(', ')} • {track.albumName}
            </p>

            {/* Status do player */}
            <div className="flex items-center space-x-2 mt-2">
              {useFallback ? (
                <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                  Preview 30s
                </span>
              ) : isPremium ? (
                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                  Música Completa
                </span>
              ) : (
                <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">
                  Premium Necessário
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!useFallback && (
              <button
                onClick={() => setUseFallback(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Usar Preview"
              >
                <FiUser className="w-4 h-4" />
              </button>
            )}
            <a
              href={track.trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#1db954] hover:text-[#1ed760] transition-colors"
              title="Abrir no Spotify"
            >
              <FiExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Waveform Simplificada */}
      <div className="px-6 pb-4">
        <div
          ref={waveformRef}
          className="h-16 bg-gray-800/50 rounded-lg relative overflow-hidden cursor-pointer"
        >
          {/* Progress Bar */}
          <div className="absolute inset-0 flex items-center px-2">
            <div className="w-full h-2 bg-gray-600 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-[#1db954] to-[#1ed760] rounded-full transition-all duration-100"
                style={{
                  width:
                    duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="px-6 pb-6">
        <div className="flex items-center space-x-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-14 h-14 bg-[#1db954] hover:bg-[#1ed760] rounded-full flex items-center justify-center text-white transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isPlaying ? (
              <FiPause className="w-7 h-7" />
            ) : (
              <FiPlay className="w-7 h-7 ml-1" />
            )}
          </button>

          {/* Time info */}
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || track.duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? (
                <FiVolumeX className="w-4 h-4" />
              ) : (
                <FiVolume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #1db954;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #1db954;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default SpotifyFullPlayer;
