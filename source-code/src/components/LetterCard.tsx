import { useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { ACCENT_THEMES, type LetterPageData } from '../data/letters';
import {
  resolveSwipeDirection,
  type TransitionPhase,
} from '../utils/letterNavigation';
import {
  prefersReducedMotion,
  spawnBotanicalBurst,
  spawnButtonRipple,
  spawnFloatingHearts,
} from '../utils/microInteractions';

interface LetterCardProps {
  page: LetterPageData;
  pageIndex: number;
  totalPages: number;
  transitionPhase: TransitionPhase;
  appreciationCount: number;
  onNext: () => void;
  onBack: () => void;
  onRestart: () => void;
  onStampClick: (message: string) => void;
  onSendAppreciation: () => void;
}

export function LetterCard({
  page,
  pageIndex,
  totalPages,
  transitionPhase,
  appreciationCount,
  onNext,
  onBack,
  onRestart,
  onStampClick,
  onSendAppreciation,
}: LetterCardProps) {
  const theme = ACCENT_THEMES[page.accent];
  const cardRef = useRef<HTMLElement | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const [tilt, setTilt] = useState({ rx: 0, ry: 0, ty: 0 });
  const [sheen, setSheen] = useState({ x: 50, y: 30, active: false });
  const [hoveredPara, setHoveredPara] = useState<number | null>(null);
  const [signatureHovered, setSignatureHovered] = useState(false);
  const [stampPressed, setStampPressed] = useState(false);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [nextMagnet, setNextMagnet] = useState({ x: 0, y: 0 });
  const [backMagnet, setBackMagnet] = useState({ x: 0, y: 0 });

  const isFirst = pageIndex === 0;
  const isFadingOut = transitionPhase === 'fading-out';
  const isBlackout = transitionPhase === 'blackout';
  const isFadingIn = transitionPhase === 'fading-in';
  const isLocked = isFadingOut || isBlackout;

  const handleCardPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (prefersReducedMotion()) return;
    if (event.pointerType === 'mouse' && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      setTilt({
        rx: -(ny - 0.5) * 2.6,
        ry: (nx - 0.5) * 2.6,
        ty: -2,
      });
      setSheen({
        x: Math.round(nx * 100),
        y: Math.round(ny * 100),
        active: true,
      });
    }

    if (swipeStartRef.current && event.pointerType !== 'mouse') {
      const dx = event.clientX - swipeStartRef.current.x;
      const dy = event.clientY - swipeStartRef.current.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        setDragOffsetX(Math.max(-36, Math.min(36, dx * 0.28)));
      }
    }
  };

  const handleCardPointerLeave = () => {
    setTilt({ rx: 0, ry: 0, ty: 0 });
    setSheen((prev) => ({ ...prev, active: false }));
    setHoveredPara(null);
  };

  const handleSwipeDown = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button, a')) return;
    swipeStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleSwipeUp = (event: PointerEvent<HTMLElement>) => {
    setDragOffsetX(0);
    if (!swipeStartRef.current) return;
    const dx = event.clientX - swipeStartRef.current.x;
    const dy = event.clientY - swipeStartRef.current.y;
    swipeStartRef.current = null;

    const dir = resolveSwipeDirection(dx, dy);
    if (dir === 'next' && pageIndex < totalPages - 1) onNext();
    if (dir === 'prev' && pageIndex > 0) onBack();
  };

  const handleStampPress = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    spawnBotanicalBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      theme.primary,
      14
    );
    setStampPressed(true);
    window.setTimeout(() => setStampPressed(false), 380);
    onStampClick(page.stampToast);
  };

  const handleNextClick = (event: MouseEvent<HTMLButtonElement>) => {
    spawnButtonRipple(event.currentTarget, event.clientX, event.clientY);
    if (page.isFinal) {
      onRestart();
    } else {
      onNext();
    }
  };

  const handleBackClick = (event: MouseEvent<HTMLButtonElement>) => {
    spawnButtonRipple(event.currentTarget, event.clientX, event.clientY);
    onBack();
  };

  const handleAppreciationClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    spawnButtonRipple(event.currentTarget, event.clientX, event.clientY);
    spawnFloatingHearts(rect.left + rect.width / 2, rect.top, 9);
    onSendAppreciation();
  };

  const handleMagnetMove = (
    event: MouseEvent<HTMLButtonElement>,
    setter: (pos: { x: number; y: number }) => void
  ) => {
    if (prefersReducedMotion()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ox = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    const oy = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
    setter({ x: ox, y: oy });
  };

  // Cinematic fade-out -> blackout -> slow gradual reveal from black
  const fadeStyle: React.CSSProperties =
    isFadingOut
      ? {
          opacity: 0.35,
          transform: 'translate3d(0, 0, 0) scale(0.985)',
          transition:
            'opacity 560ms ease-in-out, transform 560ms ease-in-out',
          pointerEvents: 'none',
        }
      : isBlackout
        ? {
            opacity: 1,
            transform: 'translate3d(0, 0, 0) scale(0.978)',
            pointerEvents: 'none',
          }
        : isFadingIn
          ? {
              opacity: 1,
              transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translate3d(${dragOffsetX}px, ${tilt.ty}px, 0) scale(1)`,
              transition:
                'transform 1900ms cubic-bezier(0.25, 0.1, 0.25, 1)',
            }
          : {
              opacity: 1,
              transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translate3d(${dragOffsetX}px, ${tilt.ty}px, 0) scale(1)`,
              transition:
                'opacity 320ms ease, transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 300ms ease',
            };

  return (
    <section
      data-testid="letter-stage"
      data-page-index={pageIndex}
      data-transition-phase={transitionPhase}
      aria-label={page.isFinal ? 'Penutup surat' : `Surat halaman ${pageIndex + 1}`}
      className="relative mx-auto grid w-full max-w-[790px] gap-4 sm:gap-5"
      style={fadeStyle}
    >
      {/* Floating corner orbit accents around the card */}
      <span
        aria-hidden="true"
        className="animate-orbit pointer-events-none absolute -left-3 -top-3 z-20 hidden select-none text-[18px] sm:block"
        style={{ color: theme.primary }}
      >
        ✧
      </span>
      <span
        aria-hidden="true"
        className="animate-orbit pointer-events-none absolute -right-3 bottom-16 z-20 hidden select-none text-[17px] sm:block"
        style={{ color: theme.deep, animationDelay: '-1.6s' }}
      >
        ✿
      </span>

      {/* Main Paper Letter Card */}
      <article
        ref={cardRef}
        onPointerMove={handleCardPointerMove}
        onPointerLeave={handleCardPointerLeave}
        onPointerDown={handleSwipeDown}
        onPointerUp={handleSwipeUp}
        onPointerCancel={() => {
          swipeStartRef.current = null;
          setDragOffsetX(0);
        }}
        className={`relative overflow-hidden rounded-[8px_24px_24px_24px] border border-white/95 bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(255,253,251,0.9))] shadow-[0_28px_90px_rgba(104,65,78,0.14),0_2px_7px_rgba(120,69,83,0.04)] ${
          page.isFinal
            ? 'px-6 py-9 text-center sm:px-14 sm:py-12'
            : 'px-6 py-7 sm:px-14 sm:py-12'
        }`}
      >
        {/* Subtle inner archival frame border */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2.5 rounded-[4px_17px_17px_17px] border border-[#784553]/[0.075]"
        />

        {/* Breathing botanical corner glow */}
        <div
          aria-hidden="true"
          className="animate-aura pointer-events-none absolute -right-20 -top-20 aspect-square w-56 rounded-full"
          style={{
            background: `radial-gradient(circle, ${theme.soft}, transparent 70%)`,
          }}
        />

        {/* Cursor-tracking warm paper light sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: sheen.active ? 0.68 : 0,
            background: `radial-gradient(360px circle at ${sheen.x}% ${sheen.y}%, rgba(255,255,255,0.88), ${theme.soft}24 45%, transparent 72%)`,
          }}
        />

        {!page.isFinal ? (
          <div className="relative z-10">
            {/* Top editorial line + interactive botanical stamp */}
            <div className="flex items-center justify-between gap-3 text-[10px] font-extrabold tracking-[0.18em] text-[#8b7279]">
              <span>{page.topline}</span>
              <button
                type="button"
                onClick={handleStampPress}
                aria-label={page.stampLabel}
                title="Ketuk untuk memberi sentuhan bunga"
                className={`grid h-9 w-9 cursor-pointer place-items-center rounded-full text-[23px] leading-none transition-transform duration-300 hover:scale-125 active:scale-90 ${
                  stampPressed ? 'scale-125' : ''
                }`}
                style={{ color: theme.primary }}
              >
                <span className="animate-flower-spin inline-block">
                  {page.flowerSymbol}
                </span>
              </button>
            </div>

            {/* Serif Heading */}
            <h1 className="font-serif-display animate-heading-in mt-5 max-w-[650px] text-[clamp(29px,5vw,48px)] font-semibold leading-[1.16] tracking-[-0.025em] text-[#784553]">
              {page.headingLine1}
              <br />
              <em className="font-medium italic" style={{ color: theme.primary }}>
                {page.headingEmphasis}
              </em>
            </h1>

            {/* Interactive Paragraphs */}
            <div className="mt-6 max-w-[660px] space-y-2.5 text-left text-[14px] leading-[1.85] text-[#6d575f] sm:text-[15.5px]">
              {page.paragraphs.map((text, idx) => {
                const isFocused = hoveredPara === idx;
                const isDimmed = hoveredPara !== null && hoveredPara !== idx;
                return (
                  <p
                    key={`${page.id}-${idx}`}
                    onMouseEnter={() => setHoveredPara(idx)}
                    onMouseLeave={() => setHoveredPara(null)}
                    className={`animate-paragraph-in -mx-2.5 rounded-xl px-2.5 py-1.5 transition-all duration-300 ${
                      isFocused
                        ? 'translate-x-1.5 bg-[#784553]/[0.035] text-[#523c44]'
                        : isDimmed
                          ? 'opacity-70'
                          : 'opacity-100'
                    }`}
                    style={{ animationDelay: `${140 + idx * 100}ms` }}
                  >
                    {text}
                  </p>
                );
              })}
            </div>

            {/* Handwritten Signature with self-drawing ink underline */}
            <div className="mt-5 flex items-end justify-between gap-4">
              <button
                type="button"
                onMouseEnter={() => setSignatureHovered(true)}
                onMouseLeave={() => setSignatureHovered(false)}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  spawnBotanicalBurst(
                    rect.right - 12,
                    rect.top + rect.height / 2,
                    theme.primary,
                    8
                  );
                }}
                aria-label={`Tanda tangan: ${page.signature}`}
                className="font-handwriting group relative cursor-pointer text-left text-[clamp(23px,3vw,30px)] leading-[1.2] transition-transform duration-200 hover:scale-[1.03]"
                style={{ color: theme.deep }}
              >
                <span>{page.signature}</span>
                <span
                  aria-hidden="true"
                  className="mt-0.5 block h-[1.5px] rounded-full transition-all duration-300"
                  style={{
                    width: signatureHovered ? '100%' : '44%',
                    backgroundColor: theme.primary,
                    opacity: signatureHovered ? 0.9 : 0.45,
                    animation: signatureHovered ? undefined : 'signatureDraw 1.1s ease-out both',
                  }}
                />
              </button>

              <span
                className="font-serif-display tabular-nums text-[13px] opacity-75"
                style={{ color: theme.primary }}
              >
                {String(pageIndex + 1).padStart(2, '0')}
              </span>
            </div>
          </div>
        ) : (
          /* Page 5: Final Penutup Card */
          <div className="relative z-10 flex flex-col items-center">
            <button
              type="button"
              onClick={handleStampPress}
              aria-label={page.stampLabel}
              className="animate-final-flower grid h-16 w-16 cursor-pointer place-items-center rounded-[20px] border border-[#d98fa7]/35 bg-gradient-to-br from-white to-[#f9e9ee] text-[34px] text-[#d98fa7] shadow-[0_12px_28px_rgba(217,143,167,0.18)] transition-transform duration-200 hover:scale-110 active:scale-95"
            >
              {page.flowerSymbol}
            </button>

            <p className="mt-5 text-[10px] font-extrabold tracking-[0.24em] text-[#8b7279]">
              {page.finalEyebrow}
            </p>

            <h1 className="font-serif-display animate-heading-in mt-4 text-[clamp(38px,7vw,64px)] font-semibold leading-[1.08] tracking-[-0.03em] text-[#784553]">
              {page.headingLine1}
              <br />
              <em className="font-medium italic text-[#d98fa7]">
                {page.headingEmphasis}
              </em>
            </h1>

            <div className="mt-5 max-w-[490px] space-y-3 text-[13.5px] leading-[1.85] text-[#6d575f] sm:text-[14.5px]">
              {page.paragraphs.map((text, idx) => (
                <p
                  key={`final-${idx}`}
                  className="animate-paragraph-in"
                  style={{ animationDelay: `${140 + idx * 110}ms` }}
                >
                  {text}
                </p>
              ))}
            </div>

            <div
              aria-hidden="true"
              className="animate-rainbow-flow my-6 h-[3px] w-24 rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, #d98fa7, #a99acb, #91aa91, #d5b16e, #d98fa7)',
                backgroundSize: '200% 100%',
              }}
            />

            <div className="font-handwriting text-[26px] text-[#bd6f8c]">
              {page.signature}
              <strong className="mt-1.5 block font-sans text-[11px] font-bold tracking-[0.2em] text-[#784553]">
                {page.finalAuthor}
              </strong>
            </div>

            <p className="font-serif-display mt-3 text-[13px] italic text-[#8b7279]">
              {page.finalDate}
            </p>

            {/* Interactive Gratitude Button */}
            <button
              type="button"
              onClick={handleAppreciationClick}
              className="group relative mt-6 inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 overflow-hidden rounded-full border border-[#d98fa7]/40 bg-[#fff5f8] px-5 py-2 text-[12px] font-bold text-[#784553] shadow-[0_6px_18px_rgba(217,143,167,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#bd6f8c]/55 hover:bg-white active:scale-95"
            >
              <span className="text-[15px] text-[#bd6f8c] transition-transform duration-200 group-hover:scale-125">
                ♡
              </span>
              <span>Kirim Apresiasi</span>
              {appreciationCount > 0 && (
                <span className="tabular-nums text-[#bd6f8c]">
                  · {appreciationCount}
                </span>
              )}
            </button>
          </div>
        )}
      </article>

      {/* Bottom Controls */}
      <nav
        className="flex min-h-[50px] items-center justify-between gap-3"
        aria-label="Navigasi surat"
      >
        <button
          type="button"
          onClick={handleBackClick}
          onMouseMove={(e) => handleMagnetMove(e, setBackMagnet)}
          onMouseLeave={() => setBackMagnet({ x: 0, y: 0 })}
          disabled={isFirst || isLocked}
          style={{
            transform: `translate3d(${backMagnet.x}px, ${backMagnet.y}px, 0)`,
          }}
          className="group relative isolate inline-flex min-h-[46px] shrink-0 cursor-pointer items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full border border-[#784553]/15 bg-white/85 px-5 text-[12px] font-bold text-[#784553] shadow-[0_7px_18px_rgba(120,69,83,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-[#bd6f8c] active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
        >
          <span className="text-[15px] transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          <span>Kembali</span>
        </button>

        <span className="hidden text-center text-[11px] font-medium text-[#8b7279] sm:inline">
          {page.hint}
        </span>

        <button
          type="button"
          onClick={handleNextClick}
          onMouseMove={(e) => handleMagnetMove(e, setNextMagnet)}
          onMouseLeave={() => setNextMagnet({ x: 0, y: 0 })}
          disabled={isLocked}
          style={{
            backgroundColor: theme.primary,
            transform: `translate3d(${nextMagnet.x}px, ${nextMagnet.y}px, 0)`,
          }}
          className="group relative isolate ml-auto inline-flex min-h-[46px] shrink-0 cursor-pointer items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full px-6 text-[12px] font-bold text-white shadow-[0_10px_24px_rgba(120,69,83,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(120,69,83,0.26)] active:scale-95 disabled:opacity-65"
        >
          {/* Continuous soft shimmer sweep */}
          <span
            aria-hidden="true"
            className="animate-btn-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent"
          />
          <span>{page.nextLabel}</span>
          <span className="animate-arrow-nudge inline-block text-[15px] transition-transform duration-200 group-hover:translate-x-1">
            {page.isFinal ? '↻' : '→'}
          </span>
        </button>
      </nav>
    </section>
  );
}
