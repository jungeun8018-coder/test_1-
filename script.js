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
    [0, 1300, 2700, 4200, 5900].forEach((delay) => this.spawn(delay));
  }

  spawn(delay = 0) {
    if (this.root.querySelectorAll('.spring-fall').length >= 6) {
      this.schedule(() => this.spawn(), this.random(1800, 3200));
      return;
    }
    const duration = this.random(9, 12);
    const direction = Math.random() < .5 ? -1 : 1;
    const fall = document.createElement('span');
    fall.className = 'spring-fall';
    const styles = {
      '--size': `${this.random(6, 10)}px`,
      '--top': `${this.random(5, 24)}%`,
      '--left': `${this.random(45, 90)}%`,
      '--duration': `${duration}s`,
      '--delay': `${delay}ms`,
      '--drift': `${this.random(1.5, 4) * direction}vw`,
      '--sway': `${this.random(1.2, 3.2)}vw`,
      '--sway-duration': `${this.random(2.8, 4.8)}s`,
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
    this.schedule(() => this.spawn(), delay + duration * 1000 + this.random(1200, 2600));
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
      point.setAttribute('aria-hidden', 'true');
      const styles = {
        '--sparkle-top': `${sparkle.top}%`, '--sparkle-left': `${sparkle.left}%`,
        '--sparkle-size': `${sparkle.size}px`, '--sparkle-duration': `${sparkle.duration}s`,
        '--sparkle-delay': `${sparkle.delay}s`,
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
      highlight.setAttribute('aria-hidden', 'true');
      const styles = {
        '--glint-top': `${glint.top}%`, '--glint-left': `${glint.left}%`,
        '--glint-size': `${glint.size}px`, '--glint-duration': `${glint.duration}s`,
        '--glint-delay': `${glint.delay}s`,
      };
      Object.entries(styles).forEach(([name, value]) => highlight.style.setProperty(name, value));
      this.root.append(highlight);
    });
  }
}

class AutumnEffect extends SeasonEffect {
  start() {
    [0, 2400, 5100].forEach((delay) => this.spawn(delay));
  }

  spawn(delay = 0) {
    const rotation = this.random(-90, 90);
    const duration = this.random(8, 14);
    this.particle('autumn-leaf', {
      '--size': `${this.random(7, 11)}px`,
      '--top': `${this.random(2, 20)}%`,
      '--left': `${this.random(8, 54)}%`,
      '--duration': `${duration}s`,
      '--delay': `${delay}ms`,
      '--rotate-start': `${-rotation / 2}deg`,
      '--rotate-end': `${rotation}deg`,
    });
    this.schedule(() => this.spawn(), delay + duration * 1000 + this.random(1800, 4200));
  }
}

class WinterEffect extends SeasonEffect {
  start() {
    this.zone = Math.floor(this.random(0, 4));
    [0, 900, 1800, 2700].forEach((delay) => this.schedule(() => this.spawn(), delay));
  }

  spawn() {
    if (this.root.querySelectorAll('.winter-snowflake').length >= 4) {
      this.schedule(() => this.spawn(), this.random(2000, 5000));
      return;
    }
    const rotation = this.random(-30, 30);
    const zoneWidth = 21;
    const left = 5 + this.zone * zoneWidth + this.random(2, zoneWidth - 3);
    this.zone = (this.zone + 1) % 4;
    this.particle('winter-snowflake', {
      '--size': `${this.random(5, 10)}px`,
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
  const seasonImages = {
    spring: 'images/hero-bellavi-spring.png',
    summer: 'images/hero-bellavi-summer-luminous-wildflowers.png',
    autumn: 'images/hero-bellavi-autumn.png',
    winter: 'images/hero-bellavi-winter.png',
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

  const layer = (season, parent = windowArea) => {
    const effectLayer = document.createElement('div');
    effectLayer.className = `season-effect-layer ${season}-effect-layer`;
    parent.append(effectLayer);
    return effectLayer;
  };
  const components = [
    new SpringEffect(layer('spring'), { asset: 'images/season-petal.png' }),
    new SummerEffect(layer('summer', effects)),
    new AutumnEffect(layer('autumn'), { asset: 'images/season-leaf.png' }),
    new WinterEffect(layer('winter'), { asset: 'images/season-snowflake.png' }),
  ];

  let visibleImage = firstImage;
  let hiddenImage = secondImage;
  let rotationTimer;
  let isChanging = false;
  const seasonDuration = 8000;
  const transitionDuration = 1000;

  const setActiveSeason = (season) => {
    activeSeason = season;
    hero.dataset.activeSeason = season;
    components.forEach((component, index) => {
      component.setEnabled(!reducedMotion.matches && validSeasons[index] === season);
    });
  };

  const loadSeasonImage = async (image, season) => {
    image.classList.remove('season-image-ready');
    image.src = seasonImages[season];
    if (!image.complete || image.naturalWidth <= 1) {
      await new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
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

  const showNextSeason = async () => {
    if (isChanging || reducedMotion.matches) return;
    isChanging = true;
    const nextIndex = (validSeasons.indexOf(activeSeason) + 1) % validSeasons.length;
    const nextSeason = validSeasons[nextIndex];
    await loadSeasonImage(hiddenImage, nextSeason);
    setActiveSeason(nextSeason);
    hiddenImage.classList.add('season-image-ready');
    visibleImage.classList.remove('season-image-ready');
    await new Promise((resolve) => window.setTimeout(resolve, transitionDuration));
    [visibleImage, hiddenImage] = [hiddenImage, visibleImage];
    isChanging = false;
    scheduleNextSeason(seasonDuration - transitionDuration);
  };

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
    if (event.target instanceof Element && event.target.closest('.hero-content')) return;
    showNextSeason();
  });

  startSeasonRotation();
}

initSeasonEffects();
