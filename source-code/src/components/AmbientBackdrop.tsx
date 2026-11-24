import { useEffect, useMemo, useRef, useState } from 'react';
import { ACCENT_THEMES, type AccentKey } from '../data/letters';
import {
  prefersReducedMotion,
  spawnCursorStardust,
} from '../utils/microInteractions';

interface AmbientBackdropProps {
  activeAccent: AccentKey;
  breezeBoost: number;
}

interface PetalConfig {
  id: number;
  glyph: string;
  left: string;
  duration: string;
  delay: string;
  size: string;
  color: string;
}

interface MoteConfig {
  id: number;
  glyph: string;
  left: string;
  duration: string;
  delay: string;
  size: string;
  drift: string;
  color: string;
}

const PETAL_GLYPHS = ['✿', '❀', '❁', '♡', '✧', '✦'];
const PETAL_COLORS = ['#d98fa7', '#a99acb', '#91aa91', '#d5b16e'];

export function AmbientBackdrop({ activeAccent, breezeBoost }: AmbientBackdropProps) {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const lastDustTimeRef = useRef(0);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  const petals = useMemo<PetalConfig[]>(() => {
    if (reducedMotion) return [];
    return Array.from({ length: 32 }, (_, i) => ({
      id: i,
      glyph: PETAL_GLYPHS[i % PETAL_GLYPHS.length],
      left: `${((i * 3.1 + (i % 4) * 1.9) % 96) + 2}%`,
      duration: `${10 + (i % 8) * 1.8}s`,
      delay: `${-((i * 1.6) % 20)}s`,
      size: `${10 + (i % 6) * 3}px`,
      color: PETAL_COLORS[i % PETAL_COLORS.length],
    }));
  }, [reducedMotion]);

  const motes = useMemo<MoteConfig[]>(() => {
    if (reducedMotion) return [];
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      glyph: i % 2 === 0 ? '✦' : '·',
      left: `${((i * 6.2 + 3) % 94) + 3}%`,
      duration: `${11 + (i % 5) * 2.4}s`,
      delay: `${-((i * 2.1) % 16)}s`,
      size: `${10 + (i % 4) * 4}px`,
      drift: `${(i % 2 === 0 ? 1 : -1) * (18 + (i % 4) * 10)}px`,
      color: PETAL_COLORS[(i + 1) % PETAL_COLORS.length],
    }));
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover) return;

    const handleMove = (event: PointerEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      setParallax({ x: nx * 22, y: ny * 16 });

      const now = performance.now();
      if (now - lastDustTimeRef.current > 52) {
        lastDustTimeRef.current = now;
        spawnCursorStardust(event.clientX, event.clientY);
      }
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, [reducedMotion]);

  const theme = ACCENT_THEMES[activeAccent];

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Subtle paper grid & grain */}
      <div className="paper-grid-overlay pointer-events-none absolute inset-0" />
      <div className="paper-grain-overlay pointer-events-none absolute inset-0" />

      {/* Active accent ambient wash */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 42%, ${theme.glow}, transparent 64%)`,
          opacity: 0.58 + Math.min(0.26, breezeBoost * 0.03),
        }}
      />

      {/* Parallax soft pastel orbs */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
        }}
      >
        <div
          className="animate-orb absolute left-[-10%] top-[10%] aspect-square w-[clamp(200px,30vw,410px)] rounded-full opacity-45 blur-[2px]"
          style={{
            background: 'radial-gradient(circle, rgba(217,143,167,0.36), transparent 68%)',
          }}
        />
        <div
          className="animate-orb absolute right-[-10%] top-[4%] aspect-square w-[clamp(200px,30vw,410px)] rounded-full opacity-45 blur-[2px]"
          style={{
            background: 'radial-gradient(circle, rgba(169,154,203,0.36), transparent 68%)',
            animationDelay: '-4s',
          }}
        />
        <div
          className="animate-orb absolute bottom-[-16%] left-[32%] aspect-square w-[clamp(200px,30vw,410px)] rounded-full opacity-40 blur-[2px]"
          style={{
            background: 'radial-gradient(circle, rgba(145,170,145,0.3), transparent 68%)',
            animationDelay: '-7s',
          }}
        />
        <div
          className="animate-orb absolute bottom-[12%] right-[14%] aspect-square w-[clamp(160px,22vw,300px)] rounded-full opacity-35 blur-[2px]"
          style={{
            background: 'radial-gradient(circle, rgba(213,177,110,0.28), transparent 68%)',
            animationDelay: '-9s',
          }}
        />
      </div>

      {/* Corner botanical ornaments */}
      <div
        className="animate-deco fixed left-[3%] top-[13%] select-none font-serif text-[clamp(52px,8vw,108px)] leading-none text-[#d98fa7] opacity-22 max-sm:opacity-15"
        style={{ transform: `translate3d(${-parallax.x * 0.45}px, ${parallax.y * 0.45}px, 0)` }}
      >
        ✿
      </div>
      <div
        className="animate-deco fixed bottom-[10%] right-[4%] select-none font-serif text-[clamp(64px,10vw,130px)] leading-none text-[#a99acb] opacity-22 max-sm:opacity-15"
        style={{ animationDelay: '-2s' }}
      >
        ❀
      </div>
      <div
        className="animate-deco fixed right-[12%] top-[23%] select-none font-serif text-[36px] leading-none text-[#d5b16e] opacity-28 max-sm:opacity-15"
        style={{ animationDelay: '-4s' }}
      >
        ✧
      </div>
      <div
        className="animate-deco fixed bottom-[18%] left-[9%] select-none font-serif text-[30px] leading-none text-[#91aa91] opacity-28 max-sm:opacity-15"
        style={{ animationDelay: '-1s' }}
      >
        ♡
      </div>

      {/* Rising sparkling dust motes */}
      {motes.map((mote) => (
        <span
          key={`mote-${mote.id}`}
          className="absolute bottom-0 select-none opacity-0"
          style={{
            left: mote.left,
            fontSize: mote.size,
            color: mote.color,
            '--drift': mote.drift,
            animation: `moteRise ${mote.duration} linear ${mote.delay} infinite`,
          } as React.CSSProperties}
        >
          {mote.glyph}
        </span>
      ))}

      {/* Drifting botanical petals */}
      {petals.map((petal) => (
        <span
          key={`petal-${petal.id}`}
          className="absolute -top-9 select-none opacity-0"
          style={{
            left: petal.left,
            fontSize: petal.size,
            color: petal.color,
            filter: 'drop-shadow(0 3px 4px rgba(120,69,83,0.08))',
            animation: `petalFall ${petal.duration} linear ${petal.delay} infinite`,
          }}
        >
          {petal.glyph}
        </span>
      ))}
    </div>
  );
}
