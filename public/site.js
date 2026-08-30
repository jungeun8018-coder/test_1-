const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const backToTop = document.querySelector('.back-to-top');

function closeMenu() {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', '메뉴 열기');
  navigation?.classList.remove('open');
  header?.classList.remove('menu-active');
  document.body.classList.remove('menu-open');
}

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  navigation?.classList.toggle('open', open);
  header?.classList.toggle('menu-active', open);
  document.body.classList.toggle('menu-open', open);
});

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => event.key === 'Escape' && closeMenu());

document.querySelectorAll('.faq-item button').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    button.setAttribute('aria-expanded', String(item.classList.toggle('open')));
  });
});

const filterButtons = document.querySelectorAll('.filter-button');
const filterItems = document.querySelectorAll('[data-category]');
filterButtons.forEach((button) => button.addEventListener('click', () => {
  filterButtons.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  filterItems.forEach((item) => item.classList.toggle('is-hidden', button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter));
}));

function updateScrollUI() {
  header?.classList.toggle('scrolled', window.scrollY > 30);
  backToTop?.classList.toggle('visible', window.scrollY > 500);
}
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

document.querySelectorAll('[data-year]').forEach((item) => { item.textContent = new Date().getFullYear(); });

const lightboxTriggers = document.querySelectorAll('[data-lightbox]');
if (lightboxTriggers.length) {
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox-dialog';
  dialog.setAttribute('aria-label', '작품 확대 보기');
  dialog.innerHTML = '<button class="lightbox-close" type="button" aria-label="확대 이미지 닫기">×</button><img alt=""><p></p>';
  document.body.append(dialog);

  const lightboxImage = dialog.querySelector('img');
  const lightboxCaption = dialog.querySelector('p');
  const closeLightbox = () => dialog.close();

  lightboxTriggers.forEach((trigger) => trigger.addEventListener('click', () => {
    lightboxImage.src = trigger.dataset.lightbox;
    lightboxImage.alt = trigger.querySelector('img')?.alt || trigger.dataset.caption || '확대 작품 이미지';
    lightboxCaption.textContent = trigger.dataset.caption || '';
    dialog.showModal();
  }));

  dialog.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeLightbox();
  });
}

/* 히어로 창문 영역 계산
   배경 사진 속 실제 창문(유리) 범위를 이미지 원본 기준 비율(0~1)로 적어두고,
   화면 크기·object-fit:cover 크롭에 맞춰 매번 컨테이너 기준 %로 다시 계산합니다.
   이렇게 하면 벚꽃·낙엽·눈이 벽/창틀이 아니라 실제 창문 유리 위에서만 보입니다.

   봄·가을·겨울 배경은 서로 다른 이미지라 창틀 문살의 개수·위치가 실제로 다르고,
   카메라 원근감 때문에 문살이 완전한 수평/수직이 아니라 살짝 기울어져 있습니다
   (예: 가을 사진의 첫 번째 가로 문살은 왼쪽 끝과 오른쪽 끝의 높이 차이가 이미지에서
   약 100px에 달함). 그래서 문살 하나하나를 "창문 박스의 왼쪽 끝 위치 → 오른쪽 끝 위치"
   (가로 문살, rowLines) 또는 "위쪽 끝 위치 → 아래쪽 끝 위치"(세로 문살, colLines)의
   직선으로 측정해서 저장하고, 그 사이 지점은 선형 보간으로 계산합니다. margin은
   문살 선을 기준으로 위아래(또는 좌우)로 얼마나 여유를 두고 잘라낼지(%)입니다. */
const SEASON_WINDOW_CONFIG = {
  spring: {
    rect: { left: 0.013, top: 0.0098, right: 0.612, bottom: 0.586 },
    rowLines: [{ atLeft: 29.2, atRight: 33.1 }, { atLeft: 68.7, atRight: 73.4 }],
    colLines: [{ atTop: 32.6, atBottom: 31.7 }, { atTop: 57, atBottom: 56 }, { atTop: 79.3, atBottom: 78.3 }],
    margin: { row: 5, col: 4 }
  },
  autumn: {
    rect: { left: 0.0098, top: 0.0146, right: 0.628, bottom: 0.5127 },
    rowLines: [{ atLeft: 0, atRight: 19 }, { atLeft: 66.3, atRight: 74.7 }],
    colLines: [{ atTop: 25.6, atBottom: 24.2 }, { atTop: 53.7, atBottom: 51.6 }, { atTop: 77.4, atBottom: 74.7 }],
    margin: { row: 5, col: 4 }
  },
  winter: {
    rect: { left: 0.013, top: 0.0098, right: 0.586, bottom: 0.4785 },
    rowLines: [{ atLeft: 38.6, atRight: 42.1 }],
    colLines: [{ atTop: 32.3, atBottom: 30.1 }, { atTop: 61.1, atBottom: 58.3 }],
    margin: { row: 5, col: 4 }
  }
};

function parseObjectPosition(value) {
  const parts = String(value || '').split(' ').map(parseFloat);
  const x = Number.isFinite(parts[0]) ? parts[0] : 50;
  const y = Number.isFinite(parts[1]) ? parts[1] : 50;
  return { x, y };
}

/* object-fit:cover가 이미지를 컨테이너에 맞춰 확대/크롭하는 계산을 그대로 따라가서,
   이미지 원본 비율 좌표(rect)를 현재 컨테이너 기준 좌표로 변환합니다.
   rectPx*는 화면 밖으로 나가도 그대로 두는(클램프하지 않은) 값이고, left/top/width/height(%)는
   실제로 화면에 보이는 만큼만 잘라낸(0~100% 클램프) 값입니다 — 창문 박스 div의 CSS
   위치/크기에는 클램프된 값을 쓰지만, 그 안의 문살 격자(clip-path)는 클램프되지 않은
   rectPx를 기준으로 계산해야 창문이 화면 가장자리에서 잘려도 비율이 틀어지지 않습니다. */
function coverRectToContainerPercent(rect, containerWidth, containerHeight, naturalWidth, naturalHeight, posX, posY) {
  const scale = Math.max(containerWidth / naturalWidth, containerHeight / naturalHeight);
  const offsetX = (containerWidth - naturalWidth * scale) * (posX / 100);
  const offsetY = (containerHeight - naturalHeight * scale) * (posY / 100);
  const rectLeftPx = offsetX + rect.left * naturalWidth * scale;
  const rectTopPx = offsetY + rect.top * naturalHeight * scale;
  const rectRightPx = offsetX + rect.right * naturalWidth * scale;
  const rectBottomPx = offsetY + rect.bottom * naturalHeight * scale;
  const leftPx = Math.max(0, rectLeftPx);
  const topPx = Math.max(0, rectTopPx);
  const rightPx = Math.min(containerWidth, rectRightPx);
  const bottomPx = Math.min(containerHeight, rectBottomPx);
  return {
    left: (leftPx / containerWidth) * 100,
    top: (topPx / containerHeight) * 100,
    width: ((rightPx - leftPx) / containerWidth) * 100,
    height: ((bottomPx - topPx) / containerHeight) * 100,
    originXPx: leftPx,
    originYPx: topPx,
    rectLeftPx, rectTopPx, rectRightPx, rectBottomPx
  };
}

/* 가로 문살 선(atLeft/atRight)을 창문 박스 안 임의의 x(0~100%) 위치에서의 y(%)로
   선형 보간합니다. */
function rowLineYAt(line, xPct) {
  return line.atLeft + (line.atRight - line.atLeft) * (xPct / 100);
}

/* y = row(x), x = col(y)인 두 직선의 교점을 구합니다. 이미지의 원근 때문에
   가로·세로 문살이 모두 기울어져 있으므로 각 유리 칸의 네 모서리마다 필요합니다. */
function intersectWindowLines(row, col) {
  const rowSlope = (row.atRight - row.atLeft) / 100;
  const colSlope = (col.atBottom - col.atTop) / 100;
  const denominator = 1 - rowSlope * colSlope;
  if (Math.abs(denominator) < Number.EPSILON) return null;

  const x = (col.atTop + colSlope * row.atLeft) / denominator;
  const y = rowLineYAt(row, x);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

/* 창문 안 유리 칸(문살로 나뉜 낱장 유리) 하나하나를, 기울어진 문살 선을 반영한
   사다리꼴로 잘라내는 clip-path: path(...) 문자열을 만듭니다.
   - rowLines/colLines: 계절별로 측정한 문살 선 목록. atLeft/atRight(또는 atTop/atBottom)는
     "창문 전체 범위(rect)"의 왼쪽 끝/오른쪽 끝(또는 위쪽 끝/아래쪽 끝)에서 문살의 위치를
     rect 기준 %로 나타낸 값입니다 — 화면에 실제로 그려지는(잘릴 수 있는) 창문 박스가
     아니라 항상 rect 전체를 기준으로 삼아야, 화면 가장자리에서 rect 일부가 잘려나가도
     (아래 rectLeftPx 등이 컨테이너 밖으로 나가는 음수/초과값이 되어도) 안쪽 문살 위치가
     비율이 틀어지지 않고 정확히 유지됩니다.
   - margin: 문살 선 주위로 얼마나 여유 있게 잘라낼지(rect 기준 %).
   - rectLeftPx/rectTopPx/rectRightPx/rectBottomPx: rect(창문 전체 범위)가 컨테이너 안에서
     차지하는 실제 픽셀 좌표(화면 밖으로 나가도 클램프하지 않은 값).
   - originXPx/originYPx: 실제로 화면에 그려지는(클램프된) 창문 박스의 좌상단 컨테이너 픽셀
     좌표 — clip-path는 이 박스 요소 기준 좌표계이므로 여기서 빼서 박스 로컬 좌표로 바꿉니다. */
function buildWindowPaneClipPath(rowLines, colLines, margin, rectLeftPx, rectTopPx, rectRightPx, rectBottomPx, originXPx, originYPx) {
  const rectWidthPx = rectRightPx - rectLeftPx;
  const rectHeightPx = rectBottomPx - rectTopPx;
  // (u%, v%)는 rect 기준 0~100% 좌표입니다. 박스가 화면 가장자리에서 잘려도 rect 자체의
  // 가로세로 비율은 절대 왜곡되지 않으므로, 문살 위치가 항상 정확하게 유지됩니다.
  const toBoxLocalPx = (uPct, vPct) => ({
    x: rectLeftPx + (uPct / 100) * rectWidthPx - originXPx,
    y: rectTopPx + (vPct / 100) * rectHeightPx - originYPx
  });
  // 문살 선 목록 앞뒤에 창문 박스 자체의 위/아래(또는 좌/우) 가장자리를 경계로 추가합니다.
  // 박스 가장자리는 문살이 아니므로 margin을 적용하지 않습니다.
  const rowBoundaries = [
    { line: { atLeft: 0, atRight: 0 }, margin: 0 },
    ...rowLines.map((line) => ({ line, margin: margin.row })),
    { line: { atLeft: 100, atRight: 100 }, margin: 0 }
  ];
  const colBoundaries = [
    { line: { atTop: 0, atBottom: 0 }, margin: 0 },
    ...colLines.map((line) => ({ line, margin: margin.col })),
    { line: { atTop: 100, atBottom: 100 }, margin: 0 }
  ];

  const subpaths = [];
  for (let r = 0; r < rowBoundaries.length - 1; r += 1) {
    const top = rowBoundaries[r];
    const bottom = rowBoundaries[r + 1];
    // 문살 선 쪽으로는 margin만큼 안쪽으로 당겨서(유리 칸을 작게) 창틀에 걸치지 않게 합니다.
    const topLine = { atLeft: top.line.atLeft + top.margin, atRight: top.line.atRight + top.margin };
    const bottomLine = { atLeft: bottom.line.atLeft - bottom.margin, atRight: bottom.line.atRight - bottom.margin };
    if (rowLineYAt(topLine, 0) >= rowLineYAt(bottomLine, 0) && rowLineYAt(topLine, 100) >= rowLineYAt(bottomLine, 100)) continue;

    for (let c = 0; c < colBoundaries.length - 1; c += 1) {
      const left = colBoundaries[c];
      const right = colBoundaries[c + 1];
      const leftLine = { atTop: left.line.atTop + left.margin, atBottom: left.line.atBottom + left.margin };
      const rightLine = { atTop: right.line.atTop - right.margin, atBottom: right.line.atBottom - right.margin };

      const topLeft = intersectWindowLines(topLine, leftLine);
      const topRight = intersectWindowLines(topLine, rightLine);
      const bottomRight = intersectWindowLines(bottomLine, rightLine);
      const bottomLeft = intersectWindowLines(bottomLine, leftLine);
      if (!topLeft || !topRight || !bottomRight || !bottomLeft) continue;
      if (
        topLeft.x >= topRight.x || bottomLeft.x >= bottomRight.x ||
        topLeft.y >= bottomLeft.y || topRight.y >= bottomRight.y
      ) continue;

      const p1 = toBoxLocalPx(topLeft.x, topLeft.y);
      const p2 = toBoxLocalPx(topRight.x, topRight.y);
      const p3 = toBoxLocalPx(bottomRight.x, bottomRight.y);
      const p4 = toBoxLocalPx(bottomLeft.x, bottomLeft.y);
      subpaths.push(
        `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ` +
        `L${p2.x.toFixed(1)} ${p2.y.toFixed(1)} ` +
        `L${p3.x.toFixed(1)} ${p3.y.toFixed(1)} ` +
        `L${p4.x.toFixed(1)} ${p4.y.toFixed(1)} Z`
      );
    }
  }
  return `path('${subpaths.join(' ')}')`;
}

/* 히어로 창문용 계절 효과 공통 컴포넌트 */
class SeasonEffect {
  constructor(root, { enabled = false, asset = '' } = {}) {
    this.root = root;
    this.asset = asset;
    this.timers = new Set();
    this.setEnabled(enabled);
  }

  random(min, max) {
    return Math.random() * (max - min) + min;
  }

  schedule(callback, delay) {
    const timer = window.setTimeout(() => {
      this.timers.delete(timer);
      if (this.enabled) callback();
    }, delay);
    this.timers.add(timer);
  }

  particle(className, styles = {}) {
    const image = document.createElement('img');
    image.className = `season-particle ${className}`;
    image.src = this.asset;
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    Object.entries(styles).forEach(([name, value]) => image.style.setProperty(name, value));
    image.addEventListener('animationend', () => image.remove(), { once: true });
    this.root.append(image);
    return image;
  }

  setEnabled(enabled) {
    if (this.enabled === enabled) return;
    this.enabled = enabled;
    this.timers.forEach(window.clearTimeout);
    this.timers.clear();
    this.root.replaceChildren();
    if (enabled) this.start();
  }
}

class SpringEffect extends SeasonEffect {
  start() {
    /* 화사한 봄 느낌이 나도록 꽃잎을 촘촘히(이전 대비 약 2배) 뿌리되, 시작 지연에 흔들림을
       줘서 한꺼번에 쏟아지는 느낌은 피합니다. */
    [0, 200, 400, 650, 900, 1150, 1400, 1700, 2000, 2300, 2650, 3000,
      3400, 3800, 4200, 4650, 5100, 5600, 6100, 6600, 7100, 7700, 8300, 9000]
      .forEach((delay) => this.spawn(delay + this.random(0, 350)));
  }

  spawn(delay = 0) {
    if (this.root.querySelectorAll('.spring-fall').length >= 32) {
      this.schedule(() => this.spawn(), this.random(500, 1100));
      return;
    }
    const duration = this.random(9, 12);
    const direction = Math.random() < .5 ? -1 : 1;
    const rotationSpread = this.random(10, 22);
    const fall = document.createElement('span');
    fall.className = 'spring-fall';
    const styles = {
      '--size': `${this.random(6, 10)}px`,
      /* .hero-fx는 Hero 전체(.hero-art) 기준이므로 창문이 있는 왼쪽~중앙 영역에서 시작하도록 합니다.
         창틀 밖(벽·실내)으로 흘러간 꽃잎은 위에 얹힌 불투명 foreground가 가려줍니다. */
      '--top': `${this.random(-6, 18)}%`,
      '--left': `${this.random(2, 66)}%`,
      '--duration': `${duration}s`,
      '--delay': `${delay}ms`,
      '--drift': `${this.random(1.5, 4) * direction}vw`,
      '--sway': `${this.random(1.2, 3.2)}vw`,
      '--sway-duration': `${this.random(2.8, 4.8)}s`,
      /* 회전 방향과 폭을 꽃잎마다 다르게 줘서 같은 동작이 반복되지 않도록 합니다. */
      '--rotate-start': `${-rotationSpread / 2 * direction}deg`,
      '--rotate-end': `${rotationSpread * direction}deg`,
    };
    Object.entries(styles).forEach(([name, value]) => fall.style.setProperty(name, value));
    const petal = document.createElement('img');
    petal.className = 'spring-petal';
    petal.src = this.asset;
    petal.alt = '';
    petal.setAttribute('aria-hidden', 'true');
    fall.append(petal);
    fall.addEventListener('animationend', () => fall.remove(), { once: true });
    this.root.append(fall);
    /* 다음 꽃잎을 이전 꽃잎이 다 떨어질 때까지 기다리지 않고 꾸준히 이어서 뿌립니다. */
    this.schedule(() => this.spawn(), this.random(450, 1050));
  }
}

class SummerEffect extends SeasonEffect {
  start() {
    /* 창문에서 테이블로 들어오는 햇빛 경로에만 작은 반짝임을 배치합니다. */
    [
      /* 꽃다발 안쪽 */
      { top: 42, left: 58, size: .8, duration: 7, delay: -.12 },
      { top: 44, left: 64, size: 1.05, duration: 7, delay: .08 },
      { top: 46, left: 70, size: .7, duration: 7, delay: -.26 },
      { top: 49, left: 54, size: 1.15, duration: 7, delay: .18 },
      { top: 51, left: 60, size: .85, duration: 7, delay: -.06 },
      { top: 53, left: 67, size: 1.2, duration: 7, delay: .28 },
      { top: 55, left: 74, size: .7, duration: 7, delay: -.2 },
      { top: 58, left: 50, size: 1, duration: 7, delay: .04 },
      { top: 60, left: 57, size: .8, duration: 7, delay: -.3 },
      { top: 62, left: 63, size: 1.1, duration: 7, delay: .14 },
      { top: 64, left: 69, size: .9, duration: 7, delay: .24 },
      { top: 66, left: 77, size: .65, duration: 7, delay: -.16 },
      { top: 68, left: 53, size: 1.05, duration: 7, delay: .1 },
      { top: 70, left: 60, size: .75, duration: 7, delay: -.28 },
      { top: 72, left: 66, size: .95, duration: 7, delay: .2 },
      { top: 71, left: 73, size: .7, duration: 7, delay: -.08 },
      /* 테이블 위 물건 */
      { top: 78, left: 50, size: .75, duration: 7, delay: -.22 },
      { top: 80, left: 56, size: 1, duration: 7, delay: .12 },
      { top: 82, left: 63, size: .7, duration: 7, delay: -.04 },
      { top: 84, left: 70, size: 1.1, duration: 7, delay: .26 },
      { top: 86, left: 77, size: .8, duration: 7, delay: -.18 },
      { top: 88, left: 84, size: .95, duration: 7, delay: .06 },
      { top: 90, left: 91, size: .65, duration: 7, delay: -.3 },
      { top: 92, left: 46, size: 1.05, duration: 7, delay: .16 },
      { top: 94, left: 55, size: .7, duration: 7, delay: -.1 },
      { top: 96, left: 64, size: .9, duration: 7, delay: .22 },
      { top: 82, left: 74, size: .8, duration: 7, delay: -.26 },
      { top: 85, left: 82, size: 1.15, duration: 7, delay: .02 },
      { top: 88, left: 59, size: .7, duration: 7, delay: -.14 },
      { top: 91, left: 68, size: 1, duration: 7, delay: .3 },
      { top: 94, left: 78, size: .85, duration: 7, delay: -.06 },
      { top: 96, left: 88, size: .7, duration: 7, delay: .1 },
    ].forEach((sparkle) => {
      const point = document.createElement('span');
      point.className = 'summer-sunlight-sparkle';
      const isFlowerSparkle = sparkle.top < 75;
      const sunlightProgress = Math.max(0, Math.min(1, (sparkle.top - 42) / 54));
      const sequenceDelay = -.45 + sunlightProgress * 1.6 + sparkle.delay * .08;
      if (isFlowerSparkle) point.classList.add('summer-flower-sparkle');
      point.dataset.sparkleStage = isFlowerSparkle ? 'flowers' : 'table';
      point.setAttribute('aria-hidden', 'true');
      const styles = {
        '--sparkle-top': `${sparkle.top}%`, '--sparkle-left': `${sparkle.left}%`,
        '--sparkle-size': `${sparkle.size}px`, '--sparkle-duration': `${sparkle.duration}s`,
        '--sparkle-delay': `${sequenceDelay.toFixed(2)}s`,
      };
      Object.entries(styles).forEach(([name, value]) => point.style.setProperty(name, value));
      this.root.append(point);
    });

    /* 꽃잎과 테이블 위 물건의 밝은 면에만 별빛 모양의 하이라이트를 더합니다. */
    [
      /* 꽃다발 안쪽 */
      { top: 43, left: 60, size: 5.2, duration: 7, delay: -.18 },
      { top: 46, left: 68, size: 4.4, duration: 7, delay: .08 },
      { top: 50, left: 55, size: 4, duration: 7, delay: -.3 },
      { top: 53, left: 63, size: 5.6, duration: 7, delay: .2 },
      { top: 56, left: 72, size: 4.6, duration: 7, delay: -.06 },
      { top: 60, left: 50, size: 4.8, duration: 7, delay: .28 },
      { top: 63, left: 58, size: 5.4, duration: 7, delay: -.22 },
      { top: 66, left: 67, size: 4.2, duration: 7, delay: .12 },
      { top: 69, left: 75, size: 5, duration: 7, delay: -.1 },
      { top: 71, left: 62, size: 4.4, duration: 7, delay: .24 },
      /* 테이블 위 물건 */
      { top: 78, left: 54, size: 4.8, duration: 7, delay: -.24 },
      { top: 81, left: 62, size: 5.2, duration: 7, delay: .06 },
      { top: 84, left: 70, size: 4.2, duration: 7, delay: -.14 },
      { top: 87, left: 78, size: 5.6, duration: 7, delay: .22 },
      { top: 90, left: 86, size: 4.4, duration: 7, delay: -.28 },
      { top: 93, left: 92, size: 5, duration: 7, delay: .14 },
      { top: 95, left: 60, size: 4.6, duration: 7, delay: -.04 },
      { top: 82, left: 76, size: 5.4, duration: 7, delay: .3 },
      { top: 89, left: 67, size: 4, duration: 7, delay: -.16 },
      { top: 94, left: 80, size: 4.8, duration: 7, delay: .1 },
    ].forEach((glint) => {
      const highlight = document.createElement('span');
      highlight.className = 'summer-highlight-glint';
      const isFlowerGlint = glint.top < 75;
      const sunlightProgress = Math.max(0, Math.min(1, (glint.top - 43) / 52));
      const sequenceDelay = -.38 + sunlightProgress * 1.5 + glint.delay * .06;
      if (isFlowerGlint) highlight.classList.add('summer-flower-sparkle');
      highlight.dataset.sparkleStage = isFlowerGlint ? 'flowers' : 'table';
      highlight.setAttribute('aria-hidden', 'true');
      const styles = {
        '--glint-top': `${glint.top}%`, '--glint-left': `${glint.left}%`,
        '--glint-size': `${glint.size}px`, '--glint-duration': `${glint.duration}s`,
        '--glint-delay': `${sequenceDelay.toFixed(2)}s`,
      };
      Object.entries(styles).forEach(([name, value]) => highlight.style.setProperty(name, value));
      this.root.append(highlight);
    });
  }
}

class AutumnEffect extends SeasonEffect {
  start() {
    this.zone = Math.floor(this.random(0, 6));
    [0, 1200, 2400, 3600, 4800, 6000].forEach((delay) => this.spawn(delay + this.random(0, 500)));
  }

  spawn(delay = 0) {
    const rotation = this.random(-90, 90);
    const duration = this.random(8, 14);
    const direction = Math.random() < .5 ? -1 : 1;
    const zoneWidth = 100 / 6;
    const left = this.zone * zoneWidth + this.random(2, zoneWidth - 2);
    this.zone = (this.zone + 1) % 6;
    this.particle('autumn-leaf', {
      '--size': `${this.random(10.5, 16.5)}px`,
      '--top': `${this.random(-4, 10)}%`,
      '--left': `${left}%`,
      '--duration': `${duration}s`,
      '--delay': `${delay}ms`,
      /* 벚꽃보다 좌우로 더 흔들리며 떨어지도록 drift 폭을 크게 줍니다. */
      '--drift': `${this.random(3.5, 7) * direction}vw`,
      '--rotate-start': `${-rotation / 2}deg`,
      '--rotate-end': `${rotation}deg`,
    });
    this.schedule(() => this.spawn(), delay + duration * 1000 + this.random(1800, 4200));
  }
}

class WinterEffect extends SeasonEffect {
  start() {
    this.zone = Math.floor(this.random(0, 8));
    [0, 450, 900, 1350, 1800, 2250, 2700, 3150].forEach((delay) => this.schedule(() => this.spawn(), delay + this.random(0, 300)));
  }

  spawn() {
    if (this.root.querySelectorAll('.winter-snowflake').length >= 8) {
      this.schedule(() => this.spawn(), this.random(2000, 5000));
      return;
    }
    const rotation = this.random(-30, 30);
    const zoneWidth = 11;
    const left = this.zone * zoneWidth + this.random(1.5, zoneWidth - 1.5);
    this.zone = (this.zone + 1) % 8;
    this.particle('winter-snowflake', {
      '--size': `${this.random(7.5, 15)}px`,
      '--left': `${left}%`,
      '--duration': `${this.random(13, 18)}s`,
      '--drift': `${this.random(-2, 2)}vw`,
      '--rotate-start': `${-rotation}deg`,
      '--rotate-end': `${rotation}deg`,
    });
    this.schedule(() => this.spawn(), this.random(2000, 5000));
  }
}

function initSeasonEffects() {
  const hero = document.querySelector('.portfolio-hero[data-season]');
  if (!hero) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const validSeasons = ['spring', 'summer', 'autumn', 'winter'];
  const previewSeason = new URLSearchParams(window.location.search).get('season');
  let activeSeason = validSeasons.includes(previewSeason) ? previewSeason : 'spring';
  /* 봄만 '창밖 풍경(창틀 없음)'을 배경으로 깔고, 그 위에 떨어지는 벚꽃(.hero-fx)과
     창틀+실내 foreground(.hero-foreground, 창유리 true 투명)를 레이어로 얹습니다.
     여름/가을/겨울은 완성 이미지를 그대로 사용합니다. */
  const seasonImages = {
    spring: '/images/bellavi-studio-outdoor-spring.webp',
    summer: '/images/bellavi-summer-final-layer-composite.webp',
    autumn: '/images/bellavi-autumn-clean-table-preview.webp',
    winter: '/images/bellavi-winter-three-layers-preview-v3.webp',
  };
  /* WebP를 지원하지 않는 환경 대체본. 봄은 3레이어가 하나로 구워진 완성 GIF를 사용합니다. */
  const seasonImagesFallback = {
    spring: '/images/bellavi-spring-horizontal-mullions-clean.gif',
    summer: '/images/bellavi-summer-final-layer-composite.gif',
    autumn: '/images/bellavi-autumn-clean-table-preview.gif',
    winter: '/images/bellavi-winter-three-layers-preview-v3.gif',
  };
  const firstImage = hero.querySelector('[data-season-image]');
  if (!firstImage) return;

  const secondImage = firstImage.cloneNode();
  secondImage.removeAttribute('data-season-image');
  secondImage.setAttribute('data-season-image-layer', '');
  secondImage.removeAttribute('fetchpriority');
  secondImage.alt = '';
  secondImage.setAttribute('aria-hidden', 'true');
  firstImage.after(secondImage);

  const effects = document.createElement('div');
  effects.className = 'season-effects';
  effects.setAttribute('aria-hidden', 'true');
  const windowArea = document.createElement('div');
  windowArea.className = 'season-window';
  effects.append(windowArea);
  hero.querySelector('.hero-art')?.after(effects);

  // 봄: 창밖 풍경(배경)과 창틀(.hero-foreground) 사이에서 벚꽃이 떨어지는 레이어.
  // .hero-fx는 .hero-art 안 z-index:1이라 불투명한 창틀/실내(.hero-foreground)가 창밖 영역을 뺀
  // 나머지를 덮어, 화면 크기와 무관하게 벚꽃이 창유리 안에서만 보입니다(별도 좌표 보정 불필요).
  // 여름/가을/겨울은 완성 이미지를 그대로 쓰므로 효과 레이어가 없습니다.
  const heroFx = hero.querySelector('.hero-fx');
  const components = heroFx
    ? [new SpringEffect(heroFx, { asset: '/images/season-petal.png' })]
    : [];

  let visibleImage = firstImage;
  let hiddenImage = secondImage;
  let rotationTimer;
  let isChanging = false;
  const seasonDuration = 6000;
  const transitionDuration = 1000;

  const heroArt = hero.querySelector('.hero-art');

  /* 현재 계절 배경 이미지의 실제 크롭 상태를 기준으로 창문(.season-window) 위치를
     다시 계산합니다. 데스크톱/모바일뿐 아니라 창 크기가 바뀔 때마다 다시 불러서,
     object-fit:cover로 이미지가 어떻게 잘리든 창문 영역이 항상 정확히 따라오게 합니다. */
  const updateWindowRect = () => {
    const config = SEASON_WINDOW_CONFIG[activeSeason];
    if (!config || !heroArt) {
      windowArea.style.display = 'none';
      return;
    }
    const containerWidth = heroArt.clientWidth;
    const containerHeight = heroArt.clientHeight;
    const naturalWidth = visibleImage.naturalWidth || 1536;
    const naturalHeight = visibleImage.naturalHeight || 1024;
    if (!containerWidth || !containerHeight || !naturalWidth || !naturalHeight) return;
    const { x: posX, y: posY } = parseObjectPosition(getComputedStyle(visibleImage).objectPosition);
    const box = coverRectToContainerPercent(config.rect, containerWidth, containerHeight, naturalWidth, naturalHeight, posX, posY);
    if (box.width <= 0 || box.height <= 0) {
      windowArea.style.display = 'none';
      return;
    }
    windowArea.style.display = '';
    windowArea.style.left = `${box.left}%`;
    windowArea.style.top = `${box.top}%`;
    windowArea.style.width = `${box.width}%`;
    windowArea.style.height = `${box.height}%`;

    /* 문살 격자는 클램프되지 않은 rect 픽셀 좌표를 기준으로 계산합니다(위 coverRectToContainerPercent
       설명 참고) — 창문이 화면 가장자리에서 잘려도 가로세로 비율이 왜곡되지 않아, 문살 위치가
       항상 정확히 맞습니다. */
    const clipPath = buildWindowPaneClipPath(
      config.rowLines, config.colLines, config.margin,
      box.rectLeftPx, box.rectTopPx, box.rectRightPx, box.rectBottomPx,
      box.originXPx, box.originYPx
    );
    windowArea.style.clipPath = clipPath;
    windowArea.style.webkitClipPath = clipPath;
  };

  let windowRectFrame;
  const scheduleWindowRectUpdate = () => {
    if (windowRectFrame) return;
    windowRectFrame = window.requestAnimationFrame(() => {
      windowRectFrame = null;
      updateWindowRect();
    });
  };
  window.addEventListener('resize', scheduleWindowRectUpdate);
  window.addEventListener('orientationchange', scheduleWindowRectUpdate);

  const setActiveSeason = (season) => {
    activeSeason = season;
    hero.dataset.activeSeason = season;
    updateWindowRect();
    components.forEach((component, index) => {
      component.setEnabled(!reducedMotion.matches && validSeasons[index] === season);
    });
  };

  const loadSeasonImage = async (image, season) => {
    image.classList.remove('season-image-ready');
    /* WebP를 먼저 시도하고, 로드에 실패하면 같은 계절의 GIF로 대체합니다. */
    const sources = [seasonImages[season], seasonImagesFallback[season]].filter(Boolean);
    for (let i = 0; i < sources.length; i += 1) {
      image.src = sources[i];
      const loaded = (image.complete && image.naturalWidth > 1) || await new Promise((resolve) => {
        image.addEventListener('load', () => resolve(true), { once: true });
        image.addEventListener('error', () => resolve(false), { once: true });
      });
      if (loaded) break;
    }
    try {
      await image.decode();
    } catch {
      /* decode를 지원하지 않는 브라우저도 load 후 이미지를 표시할 수 있습니다. */
    }
  };

  const scheduleNextSeason = (delay = seasonDuration) => {
    window.clearTimeout(rotationTimer);
    if (!reducedMotion.matches) rotationTimer = window.setTimeout(showNextSeason, delay);
  };

  const changeSeason = async (offset, isManual = false) => {
    if (isChanging || (!isManual && reducedMotion.matches)) return;
    isChanging = true;
    window.clearTimeout(rotationTimer);
    const nextIndex = (validSeasons.indexOf(activeSeason) + offset + validSeasons.length) % validSeasons.length;
    const nextSeason = validSeasons[nextIndex];
    await loadSeasonImage(hiddenImage, nextSeason);
    setActiveSeason(nextSeason);
    hiddenImage.classList.add('season-image-ready');
    visibleImage.classList.remove('season-image-ready');
    if (!reducedMotion.matches) {
      await new Promise((resolve) => window.setTimeout(resolve, transitionDuration));
    }
    [visibleImage, hiddenImage] = [hiddenImage, visibleImage];
    isChanging = false;
    scheduleNextSeason(isManual ? seasonDuration : seasonDuration - transitionDuration);
  };

  const showNextSeason = () => changeSeason(1);

  const startSeasonRotation = async () => {
    await loadSeasonImage(visibleImage, activeSeason);
    setActiveSeason(activeSeason);
    visibleImage.classList.add('season-image-ready');
    Object.values(seasonImages).forEach((source) => {
      const preload = new Image();
      preload.src = source;
    });
    scheduleNextSeason();
  };

  reducedMotion.addEventListener('change', ({ matches }) => {
    window.clearTimeout(rotationTimer);
    components.forEach((component, index) => component.setEnabled(!matches && validSeasons[index] === activeSeason));
    if (!matches) scheduleNextSeason();
  });

  hero.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, label, [role="button"]')) return;
    const heroBounds = hero.getBoundingClientRect();
    const direction = event.clientX < heroBounds.left + heroBounds.width / 2 ? -1 : 1;
    changeSeason(direction, true);
  });

  startSeasonRotation();
}

initSeasonEffects();

// Contact 페이지 문의 폼: 새로고침 없이 /api/contact로 전송합니다.
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-form-status');

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const formData = new FormData(contactForm);
  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message')
  };

  submitButton.disabled = true;
  contactStatus.removeAttribute('data-state');
  contactStatus.textContent = '전송 중입니다...';

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || '전송에 실패했습니다.');

    contactStatus.dataset.state = 'success';
    contactStatus.textContent = '문의가 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.';
    contactForm.reset();
  } catch (error) {
    contactStatus.dataset.state = 'error';
    contactStatus.textContent = error instanceof Error ? error.message : '전송 중 오류가 발생했습니다.';
  } finally {
    submitButton.disabled = false;
  }
});

// 프로그램 상세 페이지 신청 폼: Resend API 전송 후 프로그램 목록으로 돌아갑니다.
function setProgramInquiryOpen(toggle, form, open, focus = false) {
  form.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  if (open && focus) form.querySelector('input')?.focus({ preventScroll: true });
}

document.querySelectorAll('.program-inquiry-toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const form = toggle.nextElementSibling;
    if (!(form instanceof HTMLFormElement)) return;
    setProgramInquiryOpen(toggle, form, form.hidden, true);
  });
});

// 홈 히어로의 신청 버튼처럼 #program-inquiry 주소로 들어온 경우, 양식을 열고
// 첫 입력란에 바로 작성할 수 있도록 해당 위치로 이동합니다.
const inquiryId = window.location.hash.slice(1);
const linkedInquiryForm = inquiryId ? document.getElementById(inquiryId) : null;
if (linkedInquiryForm instanceof HTMLFormElement && linkedInquiryForm.classList.contains('program-inquiry-form')) {
  const linkedInquiryToggle = linkedInquiryForm.previousElementSibling;
  if (linkedInquiryToggle instanceof HTMLButtonElement && linkedInquiryToggle.classList.contains('program-inquiry-toggle')) {
    setProgramInquiryOpen(linkedInquiryToggle, linkedInquiryForm, true, false);
    window.requestAnimationFrame(() => {
      linkedInquiryForm.scrollIntoView({ block: 'center' });
      linkedInquiryForm.querySelector('input')?.focus({ preventScroll: true });
    });
  }
}

document.querySelectorAll('.program-inquiry-form').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.program-inquiry-status');
    if (!(submitButton instanceof HTMLButtonElement) || !(status instanceof HTMLElement)) return;

    const formData = new FormData(form);
    const program = form.dataset.program || '';
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      program,
      message: `안녕하세요. ${program} 프로그램 신청을 문의드립니다.\n\n이름: ${String(formData.get('name') || '').trim()}\n연락처: ${String(formData.get('phone') || '').trim()}\n희망 시기: ${String(formData.get('preferredTime') || '').trim()}`
    };

    submitButton.disabled = true;
    status.removeAttribute('data-state');
    status.textContent = '전송 중입니다...';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '전송에 실패했습니다.');

      status.dataset.state = 'success';
      status.textContent = '메일이 성공적으로 전송되었습니다.';
      form.reset();
      window.setTimeout(() => window.location.assign('/programs'), 1800);
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error instanceof Error ? error.message : '전송 중 오류가 발생했습니다.';
      submitButton.disabled = false;
    }
  });
});

// Works 페이지 '작업 문의' 폼: 기존 /api/contact(Resend) 엔드포인트를 그대로 재사용합니다.
// program 값을 보내지 않으므로 Supabase(program_inquiries)에는 저장되지 않고 이메일만 발송됩니다.
document.querySelectorAll('.work-inquiry-toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const form = document.getElementById(toggle.getAttribute('aria-controls') || '');
    if (!(form instanceof HTMLFormElement) || !form.classList.contains('work-inquiry-form')) return;
    setProgramInquiryOpen(toggle, form, form.hidden, true);
  });
});

document.querySelectorAll('.work-inquiry-form').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.work-inquiry-status');
    if (!(submitButton instanceof HTMLButtonElement) || !(status instanceof HTMLElement)) return;

    const formData = new FormData(form);
    const get = (key) => String(formData.get(key) || '').trim();
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: [
        '안녕하세요. 작업 문의드립니다.',
        '',
        `작업 종류: ${get('workType')}`,
        `희망 일정: ${get('schedule') || '-'}`,
        `예산: ${get('budget') || '-'}`,
        '',
        '작업 내용:',
        get('message')
      ].join('\n')
    };

    submitButton.disabled = true;
    status.removeAttribute('data-state');
    status.textContent = '전송 중입니다...';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '전송에 실패했습니다.');

      status.dataset.state = 'success';
      status.textContent = '작업 문의가 전달되었습니다.\n확인 후 답변드리겠습니다.';
      form.reset();
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error instanceof Error ? error.message : '전송 중 오류가 발생했습니다.';
    } finally {
      submitButton.disabled = false;
    }
  });
});

// Contact 페이지: Email 주소를 mailto 대신 클립보드 복사로 제공합니다.
document.querySelectorAll('.copy-email').forEach((button) => {
  button.addEventListener('click', async () => {
    const email = button.getAttribute('data-copy-email') || '';
    const hint = button.querySelector('.copy-hint');
    const reset = () => { if (hint) window.setTimeout(() => { hint.textContent = '복사'; }, 1600); };
    try {
      await navigator.clipboard.writeText(email);
      if (hint) hint.textContent = '복사됨';
      reset();
    } catch {
      // 클립보드 API를 못 쓰는 환경에서는 주소를 선택 상태로 노출합니다.
      const range = document.createRange();
      range.selectNodeContents(button.querySelector('small') || button);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      if (hint) { hint.textContent = '직접 복사'; reset(); }
    }
  });
});
