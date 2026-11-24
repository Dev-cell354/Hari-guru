const PETAL_COLORS = ['#d98fa7', '#a99acb', '#91aa91', '#d5b16e', '#f2cad7'];

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function spawnCursorStardust(clientX: number, clientY: number): void {
  if (prefersReducedMotion()) return;
  const glyphs = ['✧', '✿', '·', '♡'];
  const dot = document.createElement('span');
  dot.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
  dot.className = 'pointer-events-none fixed z-30 select-none leading-none';
  dot.style.left = `${clientX}px`;
  dot.style.top = `${clientY}px`;
  dot.style.fontSize = `${9 + Math.random() * 6}px`;
  dot.style.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
  dot.style.setProperty('--sx', `${(Math.random() - 0.5) * 24}px`);
  dot.style.animation = 'stardustFade 780ms cubic-bezier(0.16,1,0.3,1) forwards';
  document.body.appendChild(dot);
  window.setTimeout(() => dot.remove(), 800);
}

export function spawnButtonRipple(
  button: HTMLElement,
  clientX?: number,
  clientY?: number
): void {
  const rect = button.getBoundingClientRect();
  const x =
    typeof clientX === 'number' && clientX > 0 ? clientX - rect.left : rect.width / 2;
  const y =
    typeof clientY === 'number' && clientY > 0 ? clientY - rect.top : rect.height / 2;

  const ripple = document.createElement('span');
  ripple.className =
    'pointer-events-none absolute -z-10 h-4 w-4 rounded-full bg-white/60';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.transform = 'scale(0)';
  ripple.style.animation = 'rippleOut 640ms ease-out forwards';
  button.appendChild(ripple);
  window.setTimeout(() => ripple.remove(), 680);

  if (prefersReducedMotion()) return;

  const glyphs = ['✿', '✧', '·', '♡', '❀'];
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('span');
    particle.textContent = glyphs[i % glyphs.length];
    particle.className =
      'pointer-events-none fixed z-50 select-none text-[12px] leading-none';
    const baseClientX = rect.left + x;
    const baseClientY = rect.top + y;
    particle.style.left = `${baseClientX}px`;
    particle.style.top = `${baseClientY}px`;
    particle.style.color = PETAL_COLORS[i % PETAL_COLORS.length];
    particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 110}px`);
    particle.style.setProperty('--ty', `${(Math.random() - 0.7) * 90}px`);
    particle.style.setProperty('--rot', `${(Math.random() - 0.5) * 300}deg`);
    particle.style.animation = 'burstParticle 780ms cubic-bezier(0.16,1,0.3,1) forwards';
    document.body.appendChild(particle);
    window.setTimeout(() => particle.remove(), 820);
  }

  if ('vibrate' in navigator) {
    try {
      navigator.vibrate?.(10);
    } catch {
      // Ignore vibration errors on unsupported platforms
    }
  }
}

export function spawnBotanicalBurst(
  originX: number,
  originY: number,
  accentColor = '#d98fa7',
  count = 14
): void {
  if (prefersReducedMotion()) return;

  const glyphs = ['✿', '❀', '♡', '✧', '✦'];
  const palette = [accentColor, ...PETAL_COLORS];

  for (let i = 0; i < count; i++) {
    const bit = document.createElement('span');
    bit.textContent = glyphs[i % glyphs.length];
    bit.className = 'pointer-events-none fixed z-50 select-none leading-none';
    bit.style.left = `${originX}px`;
    bit.style.top = `${originY}px`;
    bit.style.fontSize = `${11 + Math.random() * 9}px`;
    bit.style.color = palette[i % palette.length];
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const radius = 38 + Math.random() * 68;
    bit.style.setProperty('--tx', `${Math.cos(angle) * radius}px`);
    bit.style.setProperty('--ty', `${Math.sin(angle) * radius - 16}px`);
    bit.style.setProperty('--rot', `${(Math.random() - 0.5) * 340}deg`);
    bit.style.animation = 'burstParticle 920ms cubic-bezier(0.16,1,0.3,1) forwards';
    document.body.appendChild(bit);
    window.setTimeout(() => bit.remove(), 960);
  }
}

export function spawnFloatingHearts(
  originX: number,
  originY: number,
  count = 8
): void {
  if (prefersReducedMotion()) return;
  const symbols = ['♡', '✿', '♥', '❀', '✧'];

  for (let i = 0; i < count; i++) {
    const heart = document.createElement('span');
    heart.textContent = symbols[i % symbols.length];
    heart.className = 'pointer-events-none fixed z-50 select-none leading-none';
    heart.style.left = `${originX + (Math.random() - 0.5) * 32}px`;
    heart.style.top = `${originY}px`;
    heart.style.fontSize = `${14 + Math.random() * 9}px`;
    heart.style.color = PETAL_COLORS[i % PETAL_COLORS.length];
    heart.style.setProperty('--hx', `${(Math.random() - 0.5) * 85}px`);
    heart.style.setProperty('--hrot', `${(Math.random() - 0.5) * 44}deg`);
    heart.style.animation = `floatingHeart ${1100 + i * 95}ms cubic-bezier(0.2,0.8,0.2,1) forwards`;
    document.body.appendChild(heart);
    window.setTimeout(() => heart.remove(), 1850);
  }
}

export function launchCelebrationConfetti(): void {
  if (prefersReducedMotion()) return;

  for (let i = 0; i < 48; i++) {
    const bit = document.createElement('span');
    bit.className = 'pointer-events-none fixed left-1/2 top-[45%] z-50 h-2.5 w-2.5 rounded-[2px]';
    bit.style.background = PETAL_COLORS[i % PETAL_COLORS.length];
    bit.style.setProperty(
      '--dx',
      `${(Math.random() - 0.5) * window.innerWidth * 0.9}px`
    );
    bit.style.setProperty(
      '--dy',
      `${(Math.random() - 0.5) * window.innerHeight * 0.78}px`
    );
    bit.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    bit.style.animation = 'confettiPop 1350ms cubic-bezier(0.2,0.8,0.2,1) forwards';
    document.body.appendChild(bit);
    window.setTimeout(() => bit.remove(), 1400);
  }
}
