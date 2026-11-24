import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { LetterCard } from './components/LetterCard';
import { ProgressBar } from './components/ProgressBar';
import { TopBar } from './components/TopBar';
import { ACCENT_THEMES, LETTER_PAGES, type AccentKey } from './data/letters';
import { useMp3Player } from './hooks/useMp3Player';
import {
  BLACKOUT_HOLD_MS,
  FADE_IN_DURATION_MS,
  FADE_OUT_DURATION_MS,
  INITIAL_FADE_IN_MS,
  canNavigateToPage,
  computeFadeInBlackOpacity,
  computeFadeOutOpacity,
  getProgressInfo,
  type TransitionPhase,
} from './utils/letterNavigation';
import { launchCelebrationConfetti } from './utils/microInteractions';

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [transitionPhase, setTransitionPhase] =
    useState<TransitionPhase>('initial-black');
  const [customAccent, setCustomAccent] = useState<AccentKey | null>(null);
  const [breezeBoost, setBreezeBoost] = useState(0);
  const [appreciationCount, setAppreciationCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const curtainRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const mp3 = useMp3Player();

  const stopFadeEngine = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const setCurtainOpacity = useCallback((value: number) => {
    if (curtainRef.current) {
      curtainRef.current.style.opacity = String(value);
    }
  }, []);

  const runFadeInFromBlack = useCallback(
    (durationMs: number) => {
      stopFadeEngine();
      setTransitionPhase('fading-in');
      setCurtainOpacity(1);

      let startTime: number | null = null;
      const step = (now: number) => {
        if (startTime === null) {
          startTime = now;
        }
        const progress = Math.min(1, (now - startTime) / Math.max(1, durationMs));
        const opacity = computeFadeInBlackOpacity(progress);
        setCurtainOpacity(opacity);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
          setCurtainOpacity(0);
          setTransitionPhase('idle');
        }
      };

      rafRef.current = requestAnimationFrame(step);
    },
    [setCurtainOpacity, stopFadeEngine]
  );

  // Ensure curtain starts opaque on initial paint without React overwriting style.opacity later
  useLayoutEffect(() => {
    setCurtainOpacity(1);
  }, [setCurtainOpacity]);

  // Initial slow fade-in from pure black when the app opens
  useEffect(() => {
    setCurtainOpacity(1);
    holdTimerRef.current = window.setTimeout(() => {
      runFadeInFromBlack(INITIAL_FADE_IN_MS);
    }, 100);

    return () => {
      stopFadeEngine();
    };
  }, [runFadeInFromBlack, setCurtainOpacity, stopFadeEngine]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  const navigateToPage = useCallback(
    (targetIndex: number) => {
      // Only lock during active fade-out or blackout; allow interrupting initial/fading-in
      const isHardLocked =
        transitionPhase === 'fading-out' || transitionPhase === 'blackout';
      if (!canNavigateToPage(targetIndex, currentPage, LETTER_PAGES.length, isHardLocked)) {
        return;
      }

      mp3.unlockFromGesture();
      stopFadeEngine();

      const startOpacity = curtainRef.current
        ? Number(curtainRef.current.style.opacity || 0)
        : 0;

      setTransitionPhase('fading-out');
      let fadeOutStart: number | null = null;

      const stepFadeOut = (now: number) => {
        if (fadeOutStart === null) {
          fadeOutStart = now;
        }
        const progress = Math.min(
          1,
          (now - fadeOutStart) / Math.max(1, FADE_OUT_DURATION_MS)
        );
        const eased = computeFadeOutOpacity(progress);
        const opacity = startOpacity + (1 - startOpacity) * eased;
        setCurtainOpacity(opacity);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(stepFadeOut);
        } else {
          rafRef.current = null;
          setCurtainOpacity(1);
          setTransitionPhase('blackout');
          setCurrentPage(targetIndex);
          setCustomAccent(null);

          holdTimerRef.current = window.setTimeout(() => {
            if (targetIndex === LETTER_PAGES.length - 1) {
              launchCelebrationConfetti();
            }
            runFadeInFromBlack(FADE_IN_DURATION_MS);
          }, BLACKOUT_HOLD_MS);
        }
      };

      rafRef.current = requestAnimationFrame(stepFadeOut);
    },
    [currentPage, mp3, runFadeInFromBlack, setCurtainOpacity, stopFadeEngine, transitionPhase]
  );

  const handleNext = useCallback(() => {
    navigateToPage(currentPage + 1);
  }, [currentPage, navigateToPage]);

  const handleBack = useCallback(() => {
    if (currentPage === 0) {
      showToast('Kamu sudah berada di halaman pertama.');
      return;
    }
    navigateToPage(currentPage - 1);
  }, [currentPage, navigateToPage, showToast]);

  const handleRestart = useCallback(() => {
    navigateToPage(0);
    showToast('Surat dibuka kembali.');
  }, [navigateToPage, showToast]);

  const handleBrandClick = useCallback(() => {
    if (currentPage === 0) {
      setBreezeBoost((b) => Math.min(8, b + 1));
      showToast('Selamat Hari Guru Nasional 2026.');
    } else {
      navigateToPage(0);
    }
  }, [currentPage, navigateToPage, showToast]);

  const handlePalettePick = useCallback(
    (accent: AccentKey) => {
      setCustomAccent(accent);
      setBreezeBoost((b) => Math.min(8, b + 1));
      showToast(ACCENT_THEMES[accent].toastNote);
    },
    [showToast]
  );

  const handleSendAppreciation = useCallback(() => {
    setAppreciationCount((c) => {
      const next = c + 1;
      showToast(`Terima kasih! Apresiasi hangat terkirim (${next}).`);
      return next;
    });
  }, [showToast]);

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (event.key === 'ArrowRight' && currentPage < LETTER_PAGES.length - 1) {
        navigateToPage(currentPage + 1);
      } else if (event.key === 'ArrowLeft' && currentPage > 0) {
        navigateToPage(currentPage - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, navigateToPage]);

  useEffect(() => {
    return () => {
      stopFadeEngine();
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, [stopFadeEngine]);

  const activePage = LETTER_PAGES[currentPage];
  const activeAccent = customAccent ?? activePage.accent;
  const progress = getProgressInfo(currentPage, LETTER_PAGES.length, activeAccent);

  return (
    <div className="paper-canvas relative isolate flex min-h-[100svh] w-full flex-col overflow-x-hidden">
      {/* Top animated rainbow accent hairline */}
      <div
        aria-hidden="true"
        className="animate-rainbow-flow fixed left-0 top-0 z-40 h-[5px] w-full"
        style={{
          background:
            'linear-gradient(90deg, #d98fa7, #a99acb 25%, #91aa91 50%, #d5b16e 75%, #d98fa7)',
          backgroundSize: '200% 100%',
        }}
      />

      {/* Rock-solid rAF-driven pure-black fade-out -> gradual fade-in curtain */}
      <div
        ref={curtainRef}
        data-testid="black-fade-curtain"
        data-phase={transitionPhase}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 bg-black"
      />

      <AmbientBackdrop activeAccent={activeAccent} breezeBoost={breezeBoost} />

      <TopBar
        activeAccent={activeAccent}
        onBrandClick={handleBrandClick}
        onPalettePick={handlePalettePick}
      />

      <ProgressBar
        progress={progress}
        pages={LETTER_PAGES}
        currentPage={currentPage}
        onJumpToPage={navigateToPage}
      />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-6 pt-36 sm:px-6 sm:pb-8 sm:pt-40">
        <LetterCard
          key={activePage.id}
          page={activePage}
          pageIndex={currentPage}
          totalPages={LETTER_PAGES.length}
          transitionPhase={transitionPhase}
          appreciationCount={appreciationCount}
          onNext={handleNext}
          onBack={handleBack}
          onRestart={handleRestart}
          onStampClick={(msg) => {
            setBreezeBoost((b) => Math.min(8, b + 1));
            showToast(msg);
          }}
          onSendAppreciation={handleSendAppreciation}
        />
      </main>

      <footer className="relative z-10 mt-auto px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-2 text-center text-[9px] font-bold tracking-[0.16em] text-[#784553]/55">
        DIBUAT DENGAN RASA HORMAT · 25 NOVEMBER 2026
      </footer>

      {/* Non-intrusive toast feedback */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-9 left-1/2 z-40 max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-full border border-white/15 bg-[#583540]/95 px-4 py-2.5 text-center text-[12px] font-medium text-white shadow-[0_12px_32px_rgba(88,53,64,0.22)] backdrop-blur-md transition-all duration-300 ${
          toastMessage
            ? 'translate-y-0 opacity-100'
            : 'translate-y-3 opacity-0'
        }`}
      >
        {toastMessage ?? ''}
      </div>
    </div>
  );
}
