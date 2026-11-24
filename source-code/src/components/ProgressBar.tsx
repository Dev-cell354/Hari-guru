import type { LetterPageData } from '../data/letters';
import type { ProgressInfo } from '../utils/letterNavigation';

interface ProgressBarProps {
  progress: ProgressInfo;
  pages: LetterPageData[];
  currentPage: number;
  onJumpToPage: (index: number) => void;
}

export function ProgressBar({
  progress,
  pages,
  currentPage,
  onJumpToPage,
}: ProgressBarProps) {
  return (
    <div
      className="fixed left-1/2 top-[76px] z-20 w-[min(320px,calc(100vw-32px))] -translate-x-1/2 sm:top-[84px]"
      aria-label="Progres membaca surat"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2 text-[9px] font-extrabold tracking-[0.16em] text-[#8b7279]">
        <span>{progress.stepLabel}</span>
        <span className="tabular-nums">{progress.stepCount}</span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-[#784553]/12">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress.percent}%`,
            backgroundColor: progress.accentColor,
          }}
        />
      </div>

      {/* Interactive chapter jump dots */}
      <nav
        className="mt-2 flex items-center justify-center gap-2.5"
        aria-label="Pilih halaman surat"
      >
        {pages.map((page, idx) => {
          const isActive = idx === currentPage;
          const isVisited = idx < currentPage;
          return (
            <button
              key={page.id}
              type="button"
              onClick={() => onJumpToPage(idx)}
              aria-label={
                page.isFinal
                  ? 'Lompat ke halaman penutup'
                  : `Lompat ke surat halaman ${idx + 1}`
              }
              aria-current={isActive ? 'step' : undefined}
              title={page.isFinal ? 'Penutup' : `Halaman ${idx + 1}`}
              className="group relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 hover:scale-125 active:scale-95"
            >
              <span
                className="block rounded-full transition-all duration-300"
                style={{
                  width: isActive ? '16px' : '6px',
                  height: '6px',
                  backgroundColor: isActive
                    ? progress.accentColor
                    : isVisited
                      ? 'rgba(120,69,83,0.42)'
                      : 'rgba(120,69,83,0.18)',
                }}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
