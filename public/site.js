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

  /* 원래 합성 애니메이션(1536×1024 원본 기준)과 같은 크기로 보이도록, 배경 사진이
     object-fit:cover로 확대·축소되는 배율을 그대로 곱해 줍니다. */
  coverScale() {
    return Math.max(this.root.clientWidth / 1536, this.root.clientHeight / 1024) || 1;
  }

  particle(className, styles = {}, asset = this.asset) {
    const image = document.createElement('img');
    image.className = `season-particle ${className}`;
    image.src = asset;
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
  /* 꽃잎을 창문 유리 전체(왼쪽 끝 ~ 오른쪽 끝)에 고르게 뿌리기 위해, site.js가 매번 다시 계산해
     Hero에 적어두는 창문 영역(%)을 읽어옵니다. 화면 크기에 따라 창문의 위치·너비가 달라지므로
     고정값 대신 이 값을 써야 오른쪽 유리에도 똑같이 꽃잎이 내립니다. */
  windowBox() {
    const hero = this.root.closest('.portfolio-hero') || document.documentElement;
    const style = getComputedStyle(hero);
    const read = (name, fallback) => {
      const value = parseFloat(style.getPropertyValue(name));
      return Number.isFinite(value) ? value : fallback;
    };
    return {
      left: read('--season-window-left', 2),
      top: read('--season-window-top', 0),
      width: read('--season-window-width', 64),
      height: read('--season-window-height', 58)
    };
  }

  start() {
    /* 계절은 6초만 보입니다. 지연을 두고 뿌리면 처음 2초 동안 화면이 비어 보여서, 벚꽃만
       다른 계절보다 짧게 내리는 것처럼 느껴집니다. 그래서 첫 묶음은 지연을 음수로 줘서
       (= 이미 떨어지는 중인 상태로 시작) 봄이 나타나는 순간부터 창문이 꽉 차 보이게 하고,
       그 뒤로는 평소처럼 이어서 뿌립니다. */
    for (let i = 0; i < 34; i += 1) {
      this.spawn(-this.random(300, 8200));
    }
    for (let i = 0; i < 10; i += 1) {
      this.spawn(i * 90 + this.random(0, 80));
    }
  }

  spawn(delay = 0) {
    if (this.root.querySelectorAll('.spring-fall').length >= 70) {
      this.schedule(() => this.spawn(), this.random(200, 480));
      return;
    }
    /* 가벼운 꽃잎처럼 보이도록 낙하 속도를 늦추고, 좌우 흔들림을 더 크게 줍니다. */
    const duration = this.random(12, 16);
    const direction = Math.random() < .5 ? -1 : 1;
    const rotationSpread = this.random(10, 22);
    const area = this.windowBox();
    const fall = document.createElement('span');
    fall.className = 'spring-fall';
    const styles = {
      /* 풍선처럼 둥글고 커 보이지 않도록 크기를 이전의 3분의 2로 줄이고, 꽃잎을 정면이 아니라
         살짝 눕혀 본 것처럼 세로로 눌러(--petal-flat) 납작한 타원으로 보이게 합니다. */
      '--size': `${this.random(4, 6.7)}px`,
      '--petal-flat': `${this.random(.42, .66)}`,
      /* .hero-fx는 Hero 전체(.hero-art) 기준이므로, 창문 유리의 실제 좌우 범위 안에서 시작 위치를
         고릅니다 — 창문 왼쪽 끝부터 오른쪽 끝까지 고르게 내립니다.
         창틀 밖(벽·실내)으로 흘러간 꽃잎은 위에 얹힌 불투명 foreground가 가려줍니다. */
      '--top': `${this.random(area.top - 8, area.top + area.height * .35)}%`,
      '--left': `${this.random(area.left + .5, area.left + area.width - 2)}%`,
      '--duration': `${duration}s`,
      '--delay': `${delay}ms`,
      '--drift': `${this.random(1.5, 4) * direction}vw`,
      '--sway': `${this.random(2.2, 4.4)}vw`,
      '--sway-duration': `${this.random(3.2, 5.2)}s`,
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
    this.schedule(() => this.spawn(), this.random(180, 420));
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

/* 수정 전 가을 애니메이션에서 그대로 추출한 낙엽들(원본 1536px 기준 가로 크기와 함께). */
const AUTUMN_LEAVES = [
  ['01', 21], ['02', 21], ['03', 20], ['04', 17], ['05', 15], ['06', 25],
  ['07', 26], ['09', 18], ['10', 18], ['11', 16], ['12', 18],
].map(([id, width]) => ({ src: `/images/season-leaf-original-${id}.png`, width }));

class AutumnEffect extends SeasonEffect {
  start() {
    /* 낙엽 양은 수정 전(한 화면에 약 12장)의 3배: 가로 영역을 18구간으로 나눠 거의 동시에
       시작하고 끊김 없이 보충합니다. 계절은 6초만 보이므로 처음 1~2초 안에 밀도가 차오르게 합니다. */
    /* 가을이 보이는 첫 순간부터 창 전체에 낙엽이 떨어지고 있도록, 처음 30장은 낙하 도중의
       위치(음수 지연)에서 시작합니다. 그 뒤로는 위에서 계속 새 낙엽이 이어집니다. */
    this.zone = 0;
    for (let i = 0; i < 30; i += 1) this.spawn(true);
    this.schedule(() => this.spawn(), this.random(300, 700));
  }

  spawn(prefill = false) {
    if (this.root.querySelectorAll('.autumn-leaf').length >= 36) {
      this.schedule(() => this.spawn(), this.random(300, 700));
      return;
    }
    const leaf = AUTUMN_LEAVES[Math.floor(Math.random() * AUTUMN_LEAVES.length)];
    const rotation = this.random(-90, 90);
    const duration = this.random(10.5, 13.5);
    const direction = Math.random() < .5 ? -1 : 1;
    const zoneWidth = 100 / 18;
    const left = this.zone * zoneWidth + this.random(1, zoneWidth - 1);
    this.zone = (this.zone + 1) % 18;
    this.particle('autumn-leaf', {
      '--size': `${leaf.width * (2 / 3) * this.coverScale() * this.random(.92, 1.08)}px`,
      '--top': `${this.random(-4, 10)}%`,
      '--left': `${left}%`,
      '--duration': `${duration}s`,
      '--delay': prefill ? `${-this.random(0, duration * .85)}s` : '0ms',
      /* 벚꽃보다 좌우로 더 흔들리며 떨어지도록 drift 폭을 크게 줍니다. */
      '--drift': `${this.random(3.5, 7) * direction}vw`,
      '--rotate-start': `${-rotation / 2}deg`,
      '--rotate-end': `${rotation}deg`,
    }, leaf.src);
    if (!prefill) this.schedule(() => this.spawn(), this.random(300, 700));
  }
}

class WinterEffect extends SeasonEffect {
  /* 겨울은 네 계절 중 눈이 가장 많이 내리는 폭설 장면: 데스크톱 기준 한 화면에 최대 760개.
     눈송이가 이렇게 많으면 하나하나를 화면 요소로 움직일 때 끊겨 보이므로, 겨울만
     캔버스 한 장에 직접 그립니다. 모양·크기·속도·흔들림·회전·나타나고 사라지는 투명도는
     기존 눈송이(낙하 10~13초 동안 창 위 -7%에서 67vh 아래까지)와 같습니다. */
  setEnabled(enabled) {
    if (this.enabled !== enabled && this.frame) {
      window.cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    super.setEnabled(enabled);
  }

  start() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'winter-canvas';
    this.root.append(this.canvas);
    this.context = this.canvas.getContext('2d');
    this.sprites = [1, 2, 3, 4, 5, 6].map((index) => {
      const image = new Image();
      image.src = `/images/season-snow-0${index}.png`;
      return image;
    });
    this.resize();
    this.zone = 0;
    /* 화면(히어로) 넓이에 비례해 개수를 정해, 작은 모바일 화면에서도 같은 밀도의 폭설로
       보이면서 기기 부담은 줄입니다. */
    const area = this.width * this.height;
    this.density = Math.min(1, Math.max(.4, area / (1440 * 820)));
    this.maxFlakes = Math.round(760 * this.density);
    this.spawnPerSecond = 92 * this.density;
    this.spawnCredit = 0;
    /* 겨울이 보이는 첫 순간부터 창 전체에 눈이 내리고 있도록, 처음 600개(데스크톱 기준)는
       낙하 도중의 위치에서 시작합니다. 그 뒤로는 위에서 계속 새 눈이 이어집니다. */
    this.flakes = [];
    for (let i = 0; i < Math.round(600 * this.density); i += 1) this.flakes.push(this.createFlake(true));
    this.lastTime = performance.now();
    this.frame = window.requestAnimationFrame((time) => this.tick(time));
  }

  resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.width = this.root.clientWidth;
    this.height = this.root.clientHeight;
    this.canvas.width = Math.round(this.width * ratio);
    this.canvas.height = Math.round(this.height * ratio);
    this.ratio = ratio;
  }

  createFlake(prefill = false) {
    const zoneWidth = 5;
    const left = this.zone * zoneWidth + this.random(1, zoneWidth - 1);
    this.zone = (this.zone + 1) % 20;
    /* 실제 눈처럼 모양이 제각각인 부드러운 눈송이(6종). 대부분은 작은 눈(원본 기준 지름
       3.5~5.5px)이고, 약 5개 중 1개는 벚꽃·낙엽만 한 큰 함박눈(지름 7~10px)이 섞입니다.
       스프라이트 여백을 감안해 1.6배로 지정합니다. */
    const isLarge = Math.random() < .2;
    const duration = this.random(8, 13);
    const rotation = this.random(-60, 60) * Math.PI / 180;
    return {
      sprite: this.sprites[Math.floor(Math.random() * this.sprites.length)],
      size: (isLarge ? this.random(7, 10) : this.random(3.5, 5.5)) * 1.6 * this.coverScale(),
      left: left / 100,
      duration,
      age: prefill ? this.random(0, duration * .85) : 0,
      drift: this.random(-2, 2) / 100 * window.innerWidth,
      fall: .67 * window.innerHeight + 6,
      rotateStart: -rotation,
      rotateEnd: rotation,
    };
  }

  /* 기존 CSS 키프레임과 같은 투명도 곡선: 0% → 12% .95 → 85% .9 → 100% 0 */
  opacityAt(progress) {
    if (progress < .12) return .95 * progress / .12;
    if (progress < .85) return .95 - .05 * (progress - .12) / .73;
    return .9 * (1 - (progress - .85) / .15);
  }

  tick(time) {
    if (!this.enabled) return;
    const elapsed = Math.min((time - this.lastTime) / 1000, .1);
    this.lastTime = time;
    if (this.root.clientWidth !== this.width || this.root.clientHeight !== this.height) this.resize();

    this.spawnCredit += elapsed * this.spawnPerSecond;
    while (this.spawnCredit >= 1) {
      this.spawnCredit -= 1;
      if (this.flakes.length < this.maxFlakes) this.flakes.push(this.createFlake());
    }

    const { context, ratio } = this;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const top = -.07 * this.height - 6;
    this.flakes = this.flakes.filter((flake) => {
      flake.age += elapsed;
      const progress = flake.age / flake.duration;
      if (progress >= 1) return false;
      if (!flake.sprite.complete) return true;
      const half = flake.size / 2;
      const x = flake.left * this.width + flake.drift * progress + half;
      const y = top + flake.fall * progress + half;
      const angle = flake.rotateStart + (flake.rotateEnd - flake.rotateStart) * progress;
      const cos = Math.cos(angle) * ratio;
      const sin = Math.sin(angle) * ratio;
      context.setTransform(cos, sin, -sin, cos, x * ratio, y * ratio);
      context.globalAlpha = this.opacityAt(progress);
      context.drawImage(flake.sprite, -half, -half, flake.size, flake.size);
      return true;
    });
    context.globalAlpha = 1;
    this.frame = window.requestAnimationFrame((next) => this.tick(next));
  }
}

function initSeasonEffects() {
  const hero = document.querySelector('.portfolio-hero[data-season]');
  if (!hero) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const validSeasons = ['spring', 'summer', 'autumn', 'winter'];
  const previewSeason = new URLSearchParams(window.location.search).get('season');
  let activeSeason = validSeasons.includes(previewSeason) ? previewSeason : 'spring';
  /* 봄·가을·겨울: '창밖 풍경(창틀 없음)' 배경 + 계절 애니메이션(.hero-fx) +
     창틀+실내 foreground(.hero-foreground, 창유리 true 투명) 레이어.
     여름: 새와 반짝임이 함께 구워진 원래 완성 이미지를 그대로 쓰되, 파일의 반복 횟수를 1로
     바꿔 가을로 바뀌기 전까지 한 번만 재생됩니다. */
  const seasonImages = {
    spring: '/images/bellavi-studio-outdoor-spring.webp',
    summer: '/images/bellavi-summer-final-layer-composite.webp',
    autumn: '/images/bellavi-autumn-outdoor.webp',
    winter: '/images/bellavi-winter-outdoor.webp',
  };
  /* WebP를 지원하지 않는 환경 대체본. 봄은 3레이어가 하나로 구워진 완성 GIF를 사용합니다. */
  const seasonImagesFallback = {
    spring: '/images/bellavi-spring-horizontal-mullions-clean.gif',
    summer: '/images/bellavi-summer-final-layer-composite.gif',
  };

  /* 한 번만 재생되는 여름 이미지는 같은 주소를 다시 쓰면 이미 끝난 마지막 장면에 멈춰
     있으므로, 여름이 돌아올 때마다 새 blob 주소를 만들어 처음부터 한 번 재생합니다. */
  let summerBlob;
  let summerObjectUrl;
  const freshSummerSource = async () => {
    try {
      summerBlob ??= await (await fetch(seasonImages.summer)).blob();
      if (summerObjectUrl) URL.revokeObjectURL(summerObjectUrl);
      summerObjectUrl = URL.createObjectURL(summerBlob);
      return summerObjectUrl;
    } catch {
      return seasonImages.summer;
    }
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

  // 창밖 풍경(배경)과 창틀(.hero-foreground) 사이, 계절마다 따로 있는 .hero-fx 레이어에서
  // 애니메이션이 움직입니다. z-index:1이라 불투명한 창틀/실내(.hero-foreground)가 창밖 영역을
  // 뺀 나머지를 덮어, 화면 크기와 무관하게 애니메이션이 창유리 안에서만 보입니다(별도 좌표
  // 보정 불필요). 계절별로 컨테이너가 분리돼 있어 서로의 타이머·DOM을 건드리지 않습니다.
  // 여름은 완성 이미지 자체에 애니메이션이 들어 있어 효과 레이어가 없습니다.
  const effectFactories = {
    spring: (root) => new SpringEffect(root, { asset: '/images/season-petal.png' }),
    autumn: (root) => new AutumnEffect(root),
    winter: (root) => new WinterEffect(root),
  };
  const components = validSeasons.map((season) => {
    const root = hero.querySelector(`.hero-fx[data-fx="${season}"]`);
    return root && effectFactories[season] ? effectFactories[season](root) : null;
  });

  let visibleImage = firstImage;
  let hiddenImage = secondImage;
  let rotationTimer;
  let isChanging = false;
  const seasonDuration = 6000;
  const transitionDuration = 1000;
  /* 여름 GIF는 반복 없이 한 번만 재생되고, 흰 새가 창틀 뒤로 사라지면서 약 3.5초에 끝납니다
     (프레임을 0.2초 간격으로 비교해 확인). 그 뒤로는 마지막 장면이 멈춘 채 남으므로,
     새가 사라지는 순간 바로 가을 전환이 시작되도록 맞춥니다. GIF를 다시 만들어 길이가
     달라지면 이 값도 같이 바꿔주세요. */
  const durationFor = (season) => (season === 'summer' ? 3600 : seasonDuration);

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
    /* 창문 유리의 실제 범위를 Hero에 적어두면, 봄 꽃잎 효과가 이 값을 읽어 창문 전체에
       고르게 꽃잎을 뿌릴 수 있습니다(SpringEffect.windowBox 참고). */
    hero.style.setProperty('--season-window-left', `${box.left}`);
    hero.style.setProperty('--season-window-top', `${box.top}`);
    hero.style.setProperty('--season-window-width', `${box.width}`);
    hero.style.setProperty('--season-window-height', `${box.height}`);
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
      component?.setEnabled(!reducedMotion.matches && validSeasons[index] === season);
    });
  };

  const loadSeasonImage = async (image, season) => {
    image.classList.remove('season-image-ready');
    /* WebP를 먼저 시도하고, 로드에 실패하면 같은 계절의 GIF로 대체합니다. */
    const primary = season === 'summer' ? await freshSummerSource() : seasonImages[season];
    const sources = [primary, seasonImagesFallback[season]].filter(Boolean);
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

  const scheduleNextSeason = (delay = durationFor(activeSeason)) => {
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
    scheduleNextSeason(isManual ? durationFor(nextSeason) : durationFor(nextSeason) - transitionDuration);
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
    components.forEach((component, index) => component?.setEnabled(!matches && validSeasons[index] === activeSeason));
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
  /* 문의 양식이 여러 항목으로 나뉘어 있으므로, data-summary-label이 붙은 입력란 중
     실제로 채워진 것만 "항목: 내용" 형태로 모아 하나의 문의 내용으로 만들어 보냅니다
     (/api/contact는 name·email·message만 받습니다). */
  const details = [];
  contactForm.querySelectorAll('[data-summary-label]').forEach((field) => {
    const value = String(field.value || '').trim();
    if (!value) return;
    const label = field.dataset.summaryLabel;
    details.push(value.includes('\n') ? `${label}:\n${value}` : `${label}: ${value}`);
  });
  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: details.join('\n\n')
  };

  contactStatus.removeAttribute('data-state');

  if (!payload.message) {
    contactStatus.dataset.state = 'error';
    contactStatus.textContent = '문의 종류를 고르시거나, 문의 내용을 한 가지 이상 적어주세요.';
    return;
  }

  submitButton.disabled = true;
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

// Shop: 엽서 상품 이미지 갤러리 — 인스타그램 여러 장 첨부처럼 "1/2" 표시를 누르면 다음 이미지로 넘어갑니다.
document.querySelectorAll('.postcard-gallery').forEach((gallery) => {
  const images = Array.from(gallery.querySelectorAll('[data-postcard-image]'));
  const counter = gallery.querySelector('[data-postcard-counter]');
  const currentOutput = gallery.querySelector('[data-postcard-current]');
  if (!counter || !images.length) return;
  let index = 0;
  counter.addEventListener('click', () => {
    index = (index + 1) % images.length;
    images.forEach((image, position) => image.classList.toggle('is-active', position === index));
    if (currentOutput) currentOutput.textContent = String(index + 1);
  });
});

// Shop: 장바구니 담기 / 바로 구매 버튼 — 엽서 디자인 옵션 패널을 열고 닫습니다.
document.querySelectorAll('[data-shop-toggle]').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const panel = document.getElementById(toggle.getAttribute('aria-controls') || '');
    if (!panel) return;
    const open = panel.hidden;
    panel.hidden = !open;
    document.querySelectorAll(`[aria-controls="${panel.id}"]`).forEach((button) => button.setAttribute('aria-expanded', String(open)));
  });
});

// Shop: 옵션 패널에서 선택한 디자인 개수만큼 총 금액을 계산합니다.
document.querySelectorAll('.shop-options').forEach((panel) => {
  const checkboxes = panel.querySelectorAll('input[type="checkbox"]');
  const totalOutput = panel.querySelector('[data-shop-total]');
  const updateTotal = () => {
    const total = Array.from(checkboxes)
      .filter((checkbox) => checkbox.checked)
      .reduce((sum, checkbox) => sum + Number(checkbox.dataset.price || 0), 0);
    if (totalOutput) totalOutput.textContent = `${total.toLocaleString('ko-KR')}원`;
  };
  checkboxes.forEach((checkbox) => checkbox.addEventListener('change', updateTotal));
  updateTotal();
});
