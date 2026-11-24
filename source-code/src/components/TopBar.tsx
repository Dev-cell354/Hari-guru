import type { MouseEvent } from 'react';
import { ACCENT_THEMES, type AccentKey } from '../data/letters';
import { spawnBotanicalBurst } from '../utils/microInteractions';

interface TopBarProps {
  activeAccent: AccentKey;
  onBrandClick: () => void;
  onPalettePick: (accent: AccentKey) => void;
}

const PALETTE_ORDER: AccentKey[] = ['pink', 'lavender', 'sage', 'gold'];

export function TopBar({
  activeAccent,
  onBrandClick,
  onPalettePick,
}: TopBarProps) {
  const handlePaletteClick = (
    event: MouseEvent<HTMLButtonElement>,
    accent: AccentKey
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    spawnBotanicalBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      ACCENT_THEMES[accent].primary,
      10
    );
    onPalettePick(accent);
  };

  const handleBrandClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    spawnBotanicalBurst(
      rect.left + 16,
      rect.top + rect.height / 2,
      ACCENT_THEMES[activeAccent].primary,
      10
    );
    onBrandClick();
  };

  return (
    <header className="fixed left-0 top-[5px] z-30 flex min-h-[68px] w-full items-center justify-between gap-4 px-4 py-3 sm:min-h-[74px] sm:px-8 lg:px-16">
      {/* Brand Title: SELAMAT HARI GURU + 25 NOVEMBER 2026 */}
      <button
        type="button"
        onClick={handleBrandClick}
        aria-label="Selamat Hari Guru 25 November 2026 — kembali ke halaman pertama"
        className="group inline-flex shrink-0 cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-xl py-1 pr-2 text-left transition-transform duration-200 hover:scale-[1.02] active:scale-[0.97]"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[11px] border border-[#d98fa7]/35 bg-white/80 text-[15px] text-[#bd6f8c] shadow-[0_6px_16px_rgba(120,69,83,0.08)] transition-transform duration-300 -rotate-6 group-hover:rotate-12 group-hover:scale-110 sm:h-9 sm:w-9">
          <span className="animate-flower-spin inline-block">✿</span>
        </span>
        <span className="flex flex-col leading-none">
          <span className="font-serif-display text-[13px] font-bold tracking-[0.04em] text-[#784553] sm:text-[16px]">
            SELAMAT HARI GURU
          </span>
          <span className="mt-1 text-[9px] font-bold tracking-[0.18em] text-[#8b7279] sm:text-[10px]">
            25 NOVEMBER 2026
          </span>
        </span>
      </button>

      {/* Interactive animated palette mood swatches */}
      <div
        className="flex shrink-0 items-center gap-1.5"
        role="group"
        aria-label="Pilih nuansa warna latar"
      >
        {PALETTE_ORDER.map((key, idx) => {
          const theme = ACCENT_THEMES[key];
          const isSelected = activeAccent === key;
          return (
            <button
              key={key}
              type="button"
              onClick={(e) => handlePaletteClick(e, key)}
              aria-label={`Ubah nuansa ke ${theme.label}`}
              aria-pressed={isSelected}
              title={theme.label}
              style={{
                animation: `swatchBob 2.6s ease-in-out ${idx * 0.28}s infinite`,
              }}
              className={`relative grid h-7 w-7 cursor-pointer place-items-center rounded-full transition-transform duration-200 hover:scale-125 active:scale-95 ${
                isSelected
                  ? 'ring-2 ring-[#784553]/35 ring-offset-2 ring-offset-[#fff8f5]'
                  : ''
              }`}
            >
              <span
                className="block h-3 w-3 rounded-full shadow-xs"
                style={{ backgroundColor: theme.primary }}
              />
            </button>
          );
        })}
      </div>
    </header>
  );
}
