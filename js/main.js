/* España vs Argentina — Final Mundial 2026
   Lógica de: cuenta regresiva, predicción, penaltis, trivia, sorteo y comentarios.
   Persistencia local con localStorage (sin backend). */

'use strict';

const $ = (sel) => document.querySelector(sel);

// GSAP disponible y el usuario permite animaciones
const motionOK = () => typeof window.gsap !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
};

/* ===== Cuenta regresiva ===== */
const FINAL_DATE = new Date('2026-07-19T15:00:00-04:00');

function tickCountdown() {
  const diff = FINAL_DATE - Date.now();
  if (diff <= 0) {
    $('#countdown').innerHTML = '<p class="hero-sub">🏆 ¡Es el día de la final!</p>';
    return;
  }
  const s = Math.floor(diff / 1000);
  $('#cd-days').textContent = Math.floor(s / 86400);
  $('#cd-hours').textContent = String(Math.floor((s % 86400) / 3600)).padStart(2, '0');
  $('#cd-mins').textContent = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  $('#cd-secs').textContent = String(s % 60).padStart(2, '0');
  setTimeout(tickCountdown, 1000);
}
tickCountdown();

/* ===== Predicción de marcador ===== */
const savedPrediction = store.get('prediction', null);
if (savedPrediction) {
  $('#score-esp').value = savedPrediction.esp;
  $('#score-arg').value = savedPrediction.arg;
  $('#predict-feedback').textContent =
    `Tu predicción guardada: España ${savedPrediction.esp} – ${savedPrediction.arg} Argentina`;
}

$('#btn-predict').addEventListener('click', () => {
  const esp = $('#score-esp').value;
  const arg = $('#score-arg').value;
  store.set('prediction', { esp, arg, at: Date.now() });
  $('#predict-feedback').textContent =
    `✅ Predicción guardada: España ${esp} – ${arg} Argentina. ¡Suerte en el sorteo!`;
});

/* ===== Minijuego de penaltis ===== */
const pk = store.get('pk', { goals: 0, streak: 0, best: 0 });
const PK_MESSAGES_GOAL = ['⚽ ¡GOOOL!', '⚽ ¡Golazo por la escuadra!', '⚽ ¡Imparable!'];
const PK_MESSAGES_SAVE = ['🧤 ¡Parada del portero!', '🧤 ¡La ha adivinado!', '🧤 ¡Qué manos!'];

function renderPk() {
  $('#pk-goals').textContent = pk.goals;
  $('#pk-streak').textContent = pk.streak;
  $('#pk-best').textContent = pk.best;
}
renderPk();

document.querySelectorAll('.btn-shoot').forEach((btn) => {
  btn.addEventListener('click', () => {
    const shot = Number(btn.dataset.dir);
    const keeperDir = Math.floor(Math.random() * 3);
    const keeper = $('#keeper');

    keeper.className = `keeper pos-${keeperDir}`;

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const fb = $('#pk-feedback');

    if (shot === keeperDir) {
      pk.streak = 0;
      fb.textContent = pick(PK_MESSAGES_SAVE);
      fb.classList.add('err');
    } else {
      pk.goals += 1;
      pk.streak += 1;
      pk.best = Math.max(pk.best, pk.streak);
      fb.textContent = pick(PK_MESSAGES_GOAL);
      fb.classList.remove('err');
    }
    store.set('pk', pk);
    renderPk();
    if (motionOK()) animateShot(shot, shot === keeperDir);
  });
});

/* Coreografía del penalti: balón volando, portero saltando, red temblando y confeti */
function animateShot(dir, saved) {
  const leftPct = { 0: '18%', 1: '50%', 2: '82%' }[dir];

  gsap.killTweensOf('#pk-ball');
  gsap.set('#pk-ball', { left: '50%', bottom: -8, xPercent: -50, rotation: 0, autoAlpha: 1, scale: 1 });
  gsap.to('#pk-ball', {
    left: leftPct,
    bottom: saved ? 26 : 64,
    rotation: 380,
    scale: .8,
    duration: .38,
    ease: 'power2.in',
  });

  gsap.fromTo('#keeper', { y: 0 }, { y: -26, duration: .2, yoyo: true, repeat: 1, ease: 'power1.out' });

  if (saved) {
    gsap.to('#pk-ball', { autoAlpha: 0, scale: .4, duration: .25, delay: .4 });
  } else {
    gsap.fromTo('#goal', { x: 0 }, { x: 5, duration: .06, yoyo: true, repeat: 5, delay: .36, clearProps: 'x' });
    gsap.to('#pk-ball', { autoAlpha: 0, duration: .3, delay: .8 });
    confettiBurst();
  }
}

function confettiBurst() {
  const goal = $('#goal');
  const colors = ['#c60b1e', '#ffc400', '#6cace4', '#ffffff', '#2ee66b'];
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('span');
    p.className = 'confetti';
    p.style.background = colors[i % colors.length];
    goal.appendChild(p);
    gsap.to(p, {
      x: (Math.random() - .5) * 280,
      y: 40 + Math.random() * 150,
      rotation: Math.random() * 540,
      autoAlpha: 0,
      duration: .9 + Math.random() * .5,
      ease: 'power2.out',
      delay: .35,
      onComplete: () => p.remove(),
    });
  }
}

/* ===== Trivia ===== */
const QUIZ = [
  { q: '¿Cuántos Mundiales ha ganado Argentina antes de 2026?', opts: ['2', '3', '4'], ans: 1 },
  { q: '¿En qué año ganó España su primer Mundial?', opts: ['2008', '2010', '2012'], ans: 1 },
  { q: '¿En qué estadio se juega la final de 2026?', opts: ['MetLife Stadium', 'Azteca', 'Rose Bowl'], ans: 0 },
  { q: '¿Contra quién ganó Argentina la final de Qatar 2022?', opts: ['Brasil', 'Croacia', 'Francia'], ans: 2 },
  { q: '¿Contra quién ganó España la final de 2010?', opts: ['Países Bajos', 'Alemania', 'Italia'], ans: 0 },
  { q: '¿Cuántas selecciones participan en el Mundial 2026?', opts: ['32', '48', '40'], ans: 1 },
  { q: '¿Qué países organizan el Mundial 2026?', opts: ['EE. UU., México y Canadá', 'Solo EE. UU.', 'EE. UU. y México'], ans: 0 },
  { q: '¿Cómo se conoce a la selección española?', opts: ['La Furia Blanca', 'La Roja', 'Los Toros'], ans: 1 },
];

let quizIndex = 0;
let quizScore = 0;
let quizLocked = false;

$('#quiz-total').textContent = QUIZ.length;

function renderQuestion() {
  const item = QUIZ[quizIndex];
  quizLocked = false;
  $('#quiz-question').textContent = item.q;
  $('#quiz-num').textContent = quizIndex + 1;
  $('#quiz-feedback').textContent = '';

  const box = $('#quiz-options');
  box.innerHTML = '';
  item.opts.forEach((opt, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = opt;
    b.addEventListener('click', () => answer(i, b));
    box.appendChild(b);
  });

  if (motionOK()) {
    gsap.from('#quiz-question', { autoAlpha: 0, x: -24, duration: .35, ease: 'power2.out' });
    gsap.from('#quiz-options button', { autoAlpha: 0, y: 16, stagger: .08, duration: .3, ease: 'power2.out' });
  }
}

function answer(i, btn) {
  if (quizLocked) return;
  quizLocked = true;

  const item = QUIZ[quizIndex];
  const buttons = document.querySelectorAll('#quiz-options button');
  buttons[item.ans].classList.add('correct');
  if (motionOK()) {
    gsap.fromTo(buttons[item.ans], { scale: 1 }, { scale: 1.05, duration: .16, yoyo: true, repeat: 1 });
  }

  if (i === item.ans) {
    quizScore += 1;
    $('#quiz-score').textContent = quizScore;
  } else {
    btn.classList.add('wrong');
  }

  setTimeout(() => {
    quizIndex += 1;
    if (quizIndex < QUIZ.length) {
      renderQuestion();
    } else {
      $('#quiz-question').textContent = `🏁 ¡Terminaste! Aciertos: ${quizScore}/${QUIZ.length}`;
      $('#quiz-options').innerHTML = '';
      $('#quiz-feedback').textContent =
        quizScore >= 6 ? '🌟 ¡Nivel crack! Presume de marca en los comentarios.' : '💪 ¡Vuelve a intentarlo y mejora tu marca!';
      $('#quiz-restart').classList.remove('hidden');
      const best = store.get('quizBest', 0);
      if (quizScore > best) store.set('quizBest', quizScore);
    }
  }, 900);
}

$('#quiz-restart').addEventListener('click', () => {
  quizIndex = 0;
  quizScore = 0;
  $('#quiz-score').textContent = '0';
  $('#quiz-restart').classList.add('hidden');
  renderQuestion();
});

renderQuestion();

/* ===== Comentarios (localStorage) ===== */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderComments() {
  const comments = store.get('comments', []);
  $('#comment-list').innerHTML = comments
    .map((c) => `
      <li>
        <span class="c-name">${escapeHtml(c.name)}</span>
        <span class="c-date">${new Date(c.at).toLocaleDateString('es')}</span>
        <p>${escapeHtml(c.text)}</p>
      </li>`)
    .join('');
}
renderComments();

/* ===== Barra de progreso de scroll ===== */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const progressBar = $('#scroll-progress');

let scrollTicking = false;

function updateScrollEffects() {
  scrollTicking = false;
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(updateScrollEffects);
  }
}, { passive: true });

updateScrollEffects();

/* ===== Animaciones de entrada y scroll (GSAP + ScrollTrigger) ===== */
if (motionOK() && typeof window.ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  // --- Intro del hero: el foco es ESPAÑA / ARGENTINA letra a letra + premio ---
  document.querySelectorAll('.hero h1 .team').forEach((el) => {
    el.innerHTML = [...el.textContent].map((ch) => `<span class="ch">${ch}</span>`).join('');
  });

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero-tag', { y: -24, autoAlpha: 0, duration: .5 })
    .from('.h1-flag', { scale: 0, rotation: -12, stagger: .12, duration: .6, ease: 'back.out(1.7)' }, '-=.25')
    .from('.vs-badge', { scale: 0, rotation: 360, duration: .7, ease: 'elastic.out(1, .5)' }, '-=.35')
    .from('.team-esp .ch', {
      y: 90, autoAlpha: 0, rotationX: -90, transformPerspective: 600,
      stagger: .055, duration: .6, ease: 'back.out(1.6)',
    }, '-=.4')
    .from('.hero h1 .vs', { autoAlpha: 0, scale: 2.4, duration: .35 }, '-=.25')
    .from('.team-arg .ch', {
      y: 90, autoAlpha: 0, rotationX: -90, transformPerspective: 600,
      stagger: .05, duration: .6, ease: 'back.out(1.6)',
    }, '-=.25')
    .from('.prize-pill', { scale: .7, autoAlpha: 0, duration: .55, ease: 'back.out(2)' }, '-=.15')
    .from('.cd-box', { y: 30, autoAlpha: 0, scale: .8, stagger: .08, duration: .45, ease: 'back.out(2)' }, '-=.2')
    .from('.hero .btn-cta', { scale: .6, autoAlpha: 0, duration: .45, ease: 'back.out(2)' }, '-=.1')
    .from('.scroll-hint', { autoAlpha: 0, duration: .4 }, '-=.1');

  // Pulso sutil permanente del CTA (llama a la acción sin ser molesto)
  gsap.to('.hero .btn-cta', { scale: 1.045, duration: .9, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 3 });

  // --- Tilt 3D de las tarjetas al mover el ratón (solo escritorio) ---
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('main .card').forEach((card) => {
      const setRX = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power2.out' });
      const setRY = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power2.out' });
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        gsap.set(card, { transformPerspective: 900 });
        setRX(-((e.clientY - r.top) / r.height - .5) * 4);
        setRY(((e.clientX - r.left) / r.width - .5) * 4);
      });
      card.addEventListener('mouseleave', () => { setRX(0); setRY(0); });
    });
  }

  // --- El hero se aleja suavemente al hacer scroll ---
  gsap.to('.hero', {
    autoAlpha: .3,
    yPercent: -8,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'bottom 85%', end: 'bottom 25%', scrub: true },
  });

  // --- Tarjetas y bloques: entrada individual al llegar a ellos ---
  gsap.utils.toArray('main .card, .ad-slot, .mood-banner').forEach((el) => {
    gsap.from(el, {
      y: 48,
      autoAlpha: 0,
      duration: .8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });

  // --- Pasos del sorteo en cascada ---
  gsap.from('#sorteo .steps li', {
    x: -32,
    autoAlpha: 0,
    stagger: .15,
    duration: .5,
    ease: 'power2.out',
    scrollTrigger: { trigger: '#sorteo .steps', start: 'top 85%' },
  });

  // --- Parallax del banner de ambiente ---
  gsap.fromTo('.mood-banner img',
    { scale: 1.18, yPercent: -7 },
    {
      yPercent: 7,
      ease: 'none',
      scrollTrigger: { trigger: '.mood-banner', start: 'top bottom', end: 'bottom top', scrub: true },
    });

  // --- Contador de espectadores del estadio ---
  const counter = document.querySelector('[data-count]');
  if (counter) {
    const target = Number(counter.dataset.count);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: 'power1.out',
      scrollTrigger: { trigger: counter, start: 'top 88%' },
      onUpdate: () => { counter.textContent = Math.round(obj.v).toLocaleString('es-ES'); },
    });
  }
} else if (!reducedMotion && 'IntersectionObserver' in window) {
  // Fallback sin GSAP (p. ej., CDN bloqueado): aparición simple con IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('main .card, .ad-slot').forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

$('#comment-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const comments = store.get('comments', []);
  comments.unshift({
    name: $('#comment-name').value.trim(),
    text: $('#comment-text').value.trim(),
    at: Date.now(),
  });
  store.set('comments', comments.slice(0, 50));
  $('#comment-form').reset();
  renderComments();
  if (motionOK()) {
    gsap.from('#comment-list li:first-child', { autoAlpha: 0, y: -16, duration: .4, ease: 'power2.out' });
  }
});
