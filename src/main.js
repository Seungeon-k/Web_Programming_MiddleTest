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

const displayOrder = ['keroro', 'tamama', 'giroro', 'kururu', 'dororo'];
const cardColors = { keroro: '#e4ebd3', tamama: '#e3eaf0', giroro: '#efdedb', kururu: '#f3ebca', dororo: '#e1e7ed' };
document.querySelector('#crew-grid').innerHTML = displayOrder.map((id, index) => {
  const character = CAST.find(character => character.id === id);
  return `<button type="button" class="crew-card" data-profile="${id}" style="--card-bg:${cardColors[id]};--card-color:${character.color}" aria-label="${character.korean} 소개 보기">
    <div class="crew-card-image"><span class="crew-card-number">NO. 0${index + 1}</span><span class="crew-card-symbol" aria-hidden="true">${character.symbol}</span><img src="./assets/${id}.png" alt="${character.korean}" width="1280" height="1280" loading="lazy"></div>
    <div class="crew-card-meta"><h3 lang="ja">${character.name}</h3><span aria-hidden="true">↗</span></div>
    <p class="crew-card-subtitle"><b>${character.korean}</b> ${character.role}</p></button>`;
}).join('');

scene.addEventListener('statechange', ({ detail: { state, reduced } }) => {
  const labels = { loading: '소대 연결 중', playing: '지구 침략 작전 진행 중', paused: '잠깐, 작전 회의 중', complete: '케로로 소대, 전원 집합!' };
  status.textContent = labels[state];
  pause.disabled = reduced || state === 'loading';
  pause.setAttribute('aria-label', state === 'paused' ? '애니메이션 계속 재생' : '애니메이션 일시정지');
  pause.querySelector('use').setAttribute('href', state === 'paused' ? '#icon-play' : '#icon-pause');
  skip.disabled = state === 'complete' || state === 'loading' || (state === 'paused' && invasion.previousState === 'complete');
  replay.disabled = state === 'loading';
});

pause.addEventListener('click', () => invasion.togglePause());
skip.addEventListener('click', () => invasion.finish());
replay.addEventListener('click', () => invasion.start());
document.querySelector('#monitor').addEventListener('click', () => { if (invasion.state !== 'loading') invasion.start(); });

soundButton.addEventListener('click', async () => {
  const enabled = await sound.toggle();
  soundButton.setAttribute('aria-pressed', String(enabled));
  soundButton.setAttribute('aria-label', enabled ? '효과음 끄기' : '효과음 켜기');
  soundButton.querySelector('span').textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
  soundButton.querySelector('use').setAttribute('href', enabled ? '#icon-sound' : '#icon-mute');
});

const profile = document.querySelector('#profile-dialog');
document.querySelectorAll('[data-profile]').forEach(button => {
  button.addEventListener('click', () => {
    const character = CAST.find(character => character.id === button.dataset.profile);
    document.querySelector('#profile-image').src = `./assets/${character.id}.png`;
    document.querySelector('#profile-image').alt = character.korean;
    document.querySelector('#profile-name').textContent = character.name;
    document.querySelector('#profile-rank').textContent = `KERORO PLATOON / ${character.rank}`;
    document.querySelector('.profile-korean').textContent = `${character.korean} · ${character.role}`;
    document.querySelector('#profile-quote').textContent = `“${character.quote}”`;
    document.querySelector('#profile-description').textContent = character.description;
    document.querySelector('.profile-symbol').textContent = character.symbol;
    profile.style.setProperty('--profile-color', cardColors[character.id]);
    sound.pop(CAST.indexOf(character));
    invasion.celebrate(button, character.color);
    profile.showModal();
  });
});

document.querySelector('.nav-about').addEventListener('click', () => document.querySelector('#about-dialog').showModal());
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('.dialog-close, .dialog-dismiss').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});

document.querySelector('.back-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: invasion.reduced.matches ? 'instant' : 'smooth' }));

async function waitForImages() {
  const images = [...scene.querySelectorAll('img')];
  const tasks = images.map(img => img.decode().catch(() => false));
  let timeout;
  await Promise.race([Promise.allSettled(tasks), new Promise(resolve => { timeout = setTimeout(resolve, 10000); })]);
  clearTimeout(timeout);
  if (images.some(image => image.complete && !image.naturalWidth)) {
    const note = document.createElement('p');
    note.className = 'error-note';
    note.textContent = '일부 이미지가 로드되지 않았습니다. 페이지를 새로고침해 주세요.';
    scene.append(note);
  }
}

await waitForImages();
invasion.start();

// Expose only readable scene state to browser diagnostics through data attributes.
// All animation instances, timers and audio state remain private to the modules.
