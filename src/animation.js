import { CAST, TIMING, launchTransform } from './scene.js';

export class Invasion {
  constructor(scene, particles, sound) {
    this.scene = scene;
    this.particles = particles;
    this.sound = sound;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.animations = [];
    this.elapsed = 0;
    this.state = 'loading';
    this.frameId = null;
    this.lastTick = 0;
    this.fired = new Set();
    this.reactions = new Map();
    this.characters = [...scene.querySelectorAll('.character')];
    this.title = scene.querySelector('.title-lockup');
    this.characters.forEach(element => { element.inert = true; });
    this.title.inert = true;
    this.bubble = scene.querySelector('.speech-bubble');
    this.monitor = scene.querySelector('.monitor');
    this.progress = document.querySelector('.progress-track');
    this.screenStatus = scene.querySelector('.screen-status');
    this.tick = this.tick.bind(this);
    this.reduced.addEventListener('change', () => {
      if (this.reduced.matches) this.finish();
      else if (this.state === 'complete') this.complete();
      else this.setState(this.state);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && (this.state === 'playing' || this.state === 'complete')) this.pause();
    });
    this.resizeObserver = new ResizeObserver(() => {
      this.particles.resize();
      if (this.state === 'playing' || this.state === 'paused') {
        this.build();
        this.seek(this.elapsed);
      }
    });
    this.resizeObserver.observe(scene);
  }

  setState(state) {
    this.state = state;
    this.scene.dataset.state = state;
    document.body.classList.toggle('motion-paused', state === 'paused');
    const active = state === 'complete' || (state === 'paused' && this.previousState === 'complete');
    this.characters.forEach(element => { element.inert = !active; });
    this.title.inert = !active;
    this.scene.dispatchEvent(new CustomEvent('statechange', { detail: { state, elapsed: this.elapsed, reduced: this.reduced.matches } }));
  }

  center(element) {
    const rect = element.getBoundingClientRect();
    const scene = this.scene.getBoundingClientRect();
    return { x: rect.left + rect.width / 2 - scene.left, y: rect.top + rect.height / 2 - scene.top };
  }

  add(element, frames, options) {
    const animation = element.animate(frames, { fill: 'both', ...options });
    animation.pause();
    animation.currentTime = this.elapsed;
    this.animations.push(animation);
    return animation;
  }

  build() {
    this.reactions.forEach(animation => animation.cancel());
    this.reactions.clear();
    this.animations.forEach(animation => animation.cancel());
    this.animations = [];
    this.characters.forEach(element => { element.querySelector('button').style.animation = 'none'; });
    this.origin = this.center(this.scene.querySelector('.monitor-screen'));
    this.camera = { x: this.scene.clientWidth * .5, y: this.scene.clientHeight * .45 };
    for (const [index, character] of CAST.entries()) {
      const element = this.scene.querySelector(`[data-character="${character.id}"]`);
      const target = this.center(element);
      const { x, y } = launchTransform(this.origin, target);
      const perspectiveCorrection = (900 - 320) / 900;
      const towardCamera = { x: (this.camera.x - target.x) * perspectiveCorrection, y: (this.camera.y - target.y) * perspectiveCorrection };
      const twist = index % 2 ? 34 : -38;
      const restingLayer = getComputedStyle(element).zIndex;
      const foreground = 40 + index;
      // Start at the monitor, rush toward the lens, then recoil into the poster.
      // Perspective is local so the launch origin stays exact at z = 0.
      this.add(element, [
        { opacity: 0, zIndex: foreground, transform: `perspective(900px) translate3d(${x}px, ${y}px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(${twist}deg) scale(.025)`, offset: 0 },
        { opacity: 1, zIndex: foreground, transform: `perspective(900px) translate3d(${x * .94}px, ${y * .92}px, 0px) rotateX(25deg) rotateY(${-twist}deg) rotateZ(${twist}deg) scale(.11)`, offset: .14, easing: 'cubic-bezier(.7,0,.9,.4)' },
        { opacity: 1, zIndex: foreground, transform: `perspective(900px) translate3d(${x * .45}px, ${y * .35 - 70}px, 110px) rotateX(15deg) rotateY(${-twist * .5}deg) rotateZ(${-twist * .3}deg) scale(.45)`, offset: .36, easing: 'cubic-bezier(.15,.6,.25,1)' },
        { opacity: 1, zIndex: foreground, transform: `perspective(900px) translate3d(${towardCamera.x}px, ${towardCamera.y}px, 320px) rotateX(-8deg) rotateY(${twist * .18}deg) rotateZ(${-twist * .15}deg) scale(1.22)`, offset: TIMING.punch },
        { opacity: 1, zIndex: foreground, transform: `perspective(900px) translate3d(${towardCamera.x * .85}px, ${towardCamera.y * .85}px, 280px) rotateX(-5deg) rotateY(0deg) rotateZ(3deg) scale(1.14)`, offset: .64, easing: 'cubic-bezier(.25,.7,.25,1)' },
        { opacity: 1, zIndex: foreground, transform: 'perspective(900px) translate3d(0px, 10px, -35px) rotateX(0deg) rotateY(0deg) rotateZ(-3deg) scale(.95)', offset: .86, easing: 'ease-out' },
        { opacity: 1, zIndex: restingLayer, transform: 'perspective(900px) translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)', offset: 1 },
      ], { duration: TIMING.flight, delay: character.delay, easing: 'linear' });
    }
    const shake = [{ transform: 'translate3d(0px, 0px, 0px)', offset: 0 }];
    const strength = this.scene.clientWidth < 600 ? 4 : 7;
    for (const character of CAST) {
      const impact = character.delay + TIMING.flight * TIMING.punch;
      [[-1, 0, 0], [22, -1, .6], [65, .8, -.5], [110, -.4, .25], [175, 0, 0]].forEach(([time, x, y]) => {
        shake.push({ transform: `translate3d(${x * strength}px, ${y * strength}px, 0px)`, offset: (impact + time) / TIMING.total });
      });
    }
    shake.push({ transform: 'translate3d(0px, 0px, 0px)', offset: 1 });
    this.add(this.scene, shake, { duration: TIMING.total });
    this.add(this.title, [
      { opacity: 0, transform: 'scale(.1) rotate(-10deg)', offset: 0 },
      { opacity: 1, transform: 'scale(1.13) rotate(3deg)', offset: .52 },
      { opacity: 1, transform: 'scale(.97) rotate(-1deg)', offset: .78 },
      { opacity: 1, transform: 'scale(1) rotate(0deg)', offset: 1 },
    ], { duration: TIMING.titleDuration, delay: TIMING.title, easing: 'cubic-bezier(.19,.7,.3,1)' });
    this.add(this.bubble, [{ opacity: 0, scale: .1 }, { opacity: 1, scale: 1.1, offset: .7 }, { opacity: 1, scale: 1 }], { duration: 420, delay: TIMING.title + 650 });
    this.add(this.scene.querySelector('.impact-lines'), [
      { opacity: 0, transform: 'scale(.8)' }, { opacity: .35, transform: 'scale(1)', offset: .2 }, { opacity: 0, transform: 'scale(1.25)' },
    ], { duration: 1100, delay: TIMING.title });
    this.add(this.scene.querySelector('.screen-flash'), [
      { opacity: 0 }, { opacity: .9, offset: .25 }, { opacity: .1, offset: .6 }, { opacity: .65, offset: .8 }, { opacity: 0 },
    ], { duration: 750, delay: 220 });
    this.add(this.monitor, [
      { transform: 'rotate(-10deg) scale(1)' }, { transform: 'rotate(-13deg) scale(1.04)', offset: .15 },
      { transform: 'rotate(-8deg) scale(1)', offset: .3 }, { transform: 'rotate(-12deg) scale(1.03)', offset: .5 },
      { transform: 'rotate(-9deg) scale(1)', offset: .7 }, { transform: 'rotate(-10deg) scale(1)' },
    ], { duration: 3200, delay: 500 });
  }

  seek(elapsed) {
    this.animations.forEach(animation => { animation.currentTime = elapsed; });
    const value = Math.min(100, elapsed / TIMING.total * 100);
    this.progress.querySelector('span').style.transform = `scaleX(${value / 100})`;
    this.progress.setAttribute('aria-valuenow', String(Math.round(value)));
  }

  start() {
    cancelAnimationFrame(this.frameId);
    this.elapsed = 0; this.fired.clear(); this.particles.clear();
    this.build();
    if (this.reduced.matches) { this.finish(); return; }
    this.screenStatus.textContent = '출동 준비';
    this.setState('playing');
    this.sound.boot();
    this.lastTick = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  tick(now) {
    const delta = Math.min(now - this.lastTick, 64);
    this.lastTick = now;
    if (this.state === 'playing') {
      this.elapsed = Math.min(this.elapsed + delta, TIMING.total);
      this.seek(this.elapsed);
      CAST.forEach((character, index) => {
        if (this.elapsed >= character.delay && !this.fired.has(character.id)) {
          this.fired.add(character.id);
          this.particles.burst(this.origin.x, this.origin.y, 40, 2, character.color);
          const element = this.scene.querySelector(`[data-character="${character.id}"]`);
          // Layout coordinates are independent of the current flight transform.
          const destination = { x: element.offsetLeft, y: element.offsetTop };
          this.particles.swoosh(this.origin, destination, character.color);
          this.sound.pop(index);
        }
        if (this.elapsed >= character.delay + TIMING.flight * TIMING.punch && !this.fired.has(`${character.id}-impact`)) {
          this.fired.add(`${character.id}-impact`);
          this.particles.warp(this.camera.x, this.camera.y, character.color);
          this.particles.burst(this.camera.x, this.camera.y, 22, 2.2, character.color);
        }
      });
      if (this.elapsed >= TIMING.title && !this.fired.has('title')) {
        this.fired.add('title');
        const center = this.center(this.title);
        this.particles.burst(center.x, center.y - 40, 110, 2.5);
        this.sound.finale();
      }
      if (this.elapsed >= TIMING.total) this.complete();
    }
    this.particles.frame(delta);
    if (this.state === 'playing' || (this.state === 'complete' && this.particles.items.length)) {
      this.frameId = requestAnimationFrame(this.tick);
    } else this.frameId = null;
  }

  complete() {
    this.screenStatus.textContent = '전원 집합!';
    this.setState('complete');
    if (!this.reduced.matches) {
      this.characters.forEach((element, index) => {
        element.querySelector('button').style.animation = `float ${3.2 + index * .4}s ease-in-out ${-index * .6}s infinite`;
      });
    }
  }

  finish() {
    this.reactions.forEach(animation => animation.cancel());
    this.reactions.clear();
    cancelAnimationFrame(this.frameId); this.frameId = null;
    this.elapsed = TIMING.total;
    this.seek(this.elapsed);
    this.particles.clear();
    if (this.reduced.matches) this.characters.forEach(element => { element.querySelector('button').style.animation = 'none'; });
    this.complete();
  }

  pause() {
    if (!['playing', 'complete'].includes(this.state)) return;
    this.previousState = this.state;
    this.reactions.forEach(animation => animation.pause());
    cancelAnimationFrame(this.frameId); this.frameId = null;
    this.setState('paused');
  }

  resume() {
    if (this.state !== 'paused') return;
    if (this.previousState === 'complete') this.complete();
    else this.setState(this.previousState || 'playing');
    this.reactions.forEach(animation => animation.play());
    this.lastTick = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  togglePause() { this.state === 'paused' ? this.resume() : this.pause(); }

  wakeParticles() {
    if (!this.frameId && this.state === 'complete') {
      this.lastTick = performance.now();
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  burstAt(x, y, color, count = 28) {
    if (this.reduced.matches || this.state !== 'complete') return;
    this.particles.burst(x, y, count, 1.5, color);
    this.wakeParticles();
  }

  react(element, character) {
    if (this.reduced.matches || this.state !== 'complete') return;
    const poses = {
      recoil: ['translateX(0) rotate(0)', 'translateX(-22px) rotate(-12deg)', 'translateX(8px) rotate(4deg)', 'translateX(0) rotate(0)'],
      jump: ['translateY(0) scale(1)', 'translateY(7px) scale(1.05,.9)', 'translateY(-42px) scale(.95,1.08)', 'translateY(0) scale(1)'],
      wobble: ['rotate(0) scale(1)', 'rotate(20deg) scale(1.08)', 'rotate(-14deg) scale(1.04)', 'rotate(0) scale(1)'],
      dash: ['translateX(0) skewX(0)', 'translateX(35px) skewX(-12deg)', 'translateX(-25px) skewX(8deg)', 'translateX(0) skewX(0)'],
      salute: ['rotate(0) scale(1)', 'rotate(-10deg) scale(1.13)', 'rotate(7deg) scale(.98)', 'rotate(0) scale(1)'],
    };
    const image = element.querySelector('img');
    this.reactions.get(image)?.cancel();
    const reaction = image.animate(poses[character.reaction].map(transform => ({ transform })), { duration: 680, easing: 'cubic-bezier(.22,.7,.36,1)' });
    this.reactions.set(image, reaction);
    reaction.onfinish = () => { if (this.reactions.get(image) === reaction) this.reactions.delete(image); };
    const target = this.center(element);
    this.burstAt(target.x, target.y, character.color, 45);
    this.sound.pop(CAST.indexOf(character));
  }
}
