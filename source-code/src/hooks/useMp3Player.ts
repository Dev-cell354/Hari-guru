import { useCallback, useEffect, useRef, useState } from 'react';
import { MP3_TRACK_URL } from '../data/letters';

export interface Mp3PlayerState {
  isPlaying: boolean;
  needsGesture: boolean;
  isReady: boolean;
  hasError: boolean;
  currentTime: number;
  duration: number;
  progressRatio: number;
  statusText: string;
  togglePlay: () => void;
  unlockFromGesture: () => void;
}

const TARGET_VOLUME = 0.62;

export function useMp3Player(): Mp3PlayerState {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const userPausedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const cancelFade = useCallback(() => {
    if (fadeFrameRef.current !== null) {
      cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = null;
    }
  }, []);

  const rampVolume = useCallback(
    (audio: HTMLAudioElement, target: number, durationMs: number, onDone?: () => void) => {
      cancelFade();
      const startVol = audio.volume;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / Math.max(1, durationMs));
        const eased = 1 - Math.pow(1 - t, 2);
        audio.volume = Math.max(0, Math.min(1, startVol + (target - startVol) * eased));

        if (t < 1) {
          fadeFrameRef.current = requestAnimationFrame(step);
        } else {
          fadeFrameRef.current = null;
          onDone?.();
        }
      };

      fadeFrameRef.current = requestAnimationFrame(step);
    },
    [cancelFade]
  );

  const attemptPlay = useCallback(
    async (smoothFade = true) => {
      const audio = audioRef.current;
      if (!audio) return false;

      try {
        if (smoothFade) {
          audio.volume = 0.02;
        } else {
          audio.volume = TARGET_VOLUME;
        }
        await audio.play();
        setIsPlaying(true);
        setNeedsGesture(false);
        setHasError(false);
        if (smoothFade) {
          rampVolume(audio, TARGET_VOLUME, 900);
        }
        return true;
      } catch {
        setIsPlaying(false);
        setNeedsGesture(true);
        return false;
      }
    },
    [rampVolume]
  );

  useEffect(() => {
    const audio = new Audio(MP3_TRACK_URL);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.02;
    audioRef.current = audio;

    const handleCanPlay = () => setIsReady(true);
    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const handlePlay = () => {
      setIsPlaying(true);
      setNeedsGesture(false);
    };
    const handlePause = () => {
      setIsPlaying(false);
    };
    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    // Attempt immediate autoplay when opened
    void attemptPlay(true);

    // Unlock audio on the user's very first pointer/keyboard interaction if browser blocked autoplay
    const handleFirstGesture = () => {
      if (userPausedRef.current) return;
      if (audio.paused) {
        void attemptPlay(true);
      }
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      cancelFade();
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [attemptPlay, cancelFade]);

  const unlockFromGesture = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || userPausedRef.current || !audio.paused) return;
    void attemptPlay(true);
  }, [attemptPlay]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      userPausedRef.current = false;
      void attemptPlay(true);
    } else {
      userPausedRef.current = true;
      rampVolume(audio, 0, 260, () => {
        audio.pause();
        setIsPlaying(false);
      });
    }
  }, [attemptPlay, rampVolume]);

  const progressRatio = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  let statusText = 'Menyiapkan musik…';
  if (hasError) {
    statusText = 'Audio tidak tersedia';
  } else if (isPlaying) {
    statusText = 'Sedang diputar';
  } else if (needsGesture) {
    statusText = 'Ketuk untuk memutar';
  } else if (isReady) {
    statusText = 'Musik dijeda';
  }

  return {
    isPlaying,
    needsGesture,
    isReady,
    hasError,
    currentTime,
    duration,
    progressRatio,
    statusText,
    togglePlay,
    unlockFromGesture,
  };
}
