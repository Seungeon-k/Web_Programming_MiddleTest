import { CAST } from './scene.js';
import { Particles } from './particles.js';
import { Sound } from './audio.js';
import { Invasion } from './animation.js';

const scene = document.querySelector('#scene');
const sound = new Sound();
const particles = new Particles(document.querySelector('#particles'));
const invasion = new Invasion(scene, particles, sound);
const pause = document.querySelector('#pause');
const replay = document.querySelector('#replay');
const skip = document.querySelector('#skip');
const status = document.querySelector('.status-text');
const soundButton = document.querySelector('.sound-button');
let parallaxFrame = null;
let pointer = { x: 0, y: 0 };

function resetParallax() {
  cancelAnimationFrame(parallaxFrame);
  parallaxFrame = null;
  scene.style.setProperty('--px', '0px');
  scene.style.setProperty('--py', '0px');
}

scene.addEventListener('statechange', ({ detail: { state, reduced } }) => {
  const labels = { loading: '소대 연결 중', playing: '지구 침략 작전 진행 중', paused: '잠깐, 작전 회의 중', complete: '전원 집합! 캐릭터를 톡 눌러 보세요.' };
  status.textContent = labels[state];
  pause.disabled = reduced || state === 'loading';
  pause.setAttribute('aria-label', state === 'paused' ? '애니메이션 계속 재생' : '애니메이션 일시정지');
  pause.querySelector('use').setAttribute('href', state === 'paused' ? '#icon-play' : '#icon-pause');
  skip.disabled = state === 'complete' || state === 'loading' || (state === 'paused' && invasion.previousState === 'complete');
  replay.disabled = state === 'loading';
  if (!['complete', 'paused'].includes(state) || reduced) resetParallax();
});

pause.addEventListener('click', () => invasion.togglePause());
skip.addEventListener('click', () => invasion.finish());
replay.addEventListener('click', () => invasion.start());
document.querySelector('#monitor').addEventListener('click', () => { if (invasion.state !== 'loading') invasion.start(); });

soundButton.addEventListener('click', async () => {
  const enabled = await sound.toggle();
  soundButton.setAttribute('aria-pressed', String(enabled));
  soundButton.setAttribute('aria-label', enabled ? '효과음 끄기' : '효과음 켜기');
  soundButton.querySelector('span').textContent = enabled ? '효과음 켜짐' : '효과음 꺼짐';
  soundButton.querySelector('use').setAttribute('href', enabled ? '#icon-sound' : '#icon-mute');
});

scene.querySelectorAll('[data-character]').forEach(element => {
  element.querySelector('button').addEventListener('click', () => {
    const character = CAST.find(character => character.id === element.dataset.character);
    status.textContent = `${character.name}, 출동!`;
    invasion.react(element, character);
  });
});

scene.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || invasion.state !== 'complete' || invasion.reduced.matches) return;
  const bounds = scene.getBoundingClientRect();
  pointer = { x: (event.clientX - bounds.left - bounds.width / 2) / bounds.width * 25, y: (event.clientY - bounds.top - bounds.height / 2) / bounds.height * 20 };
  if (parallaxFrame) return;
  parallaxFrame = requestAnimationFrame(() => {
    scene.style.setProperty('--px', `${pointer.x}px`);
    scene.style.setProperty('--py', `${pointer.y}px`);
    parallaxFrame = null;
  });
});
scene.addEventListener('pointerleave', () => { if (invasion.state !== 'paused') resetParallax(); });
scene.addEventListener('click', event => {
  if (event.target.closest('button') || invasion.state !== 'complete' || invasion.reduced.matches) return;
  const bounds = scene.getBoundingClientRect();
  invasion.burstAt(event.clientX - bounds.left, event.clientY - bounds.top);
});

async function waitForImages() {
  const images = [...scene.querySelectorAll('img')];
  const tasks = images.map(img => img.decode().catch(() => false));
  let timeout;
  await Promise.race([Promise.allSettled(tasks), new Promise(resolve => { timeout = setTimeout(resolve, 10000); })]);
  clearTimeout(timeout);
  if (images.some(image => image.complete && !image.naturalWidth)) {
    const note = document.createElement('p');
    note.className = 'error-note';
    note.textContent = '일부 이미지가 로드되지 않았습니다. 새로고침해 주세요.';
    scene.append(note);
  }
}

await waitForImages();
invasion.start();
