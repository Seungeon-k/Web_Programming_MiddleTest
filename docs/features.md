# 사용한 기능 — jQuery와 CSS 코드 정리

현재 프로젝트는 **HTML로 요소를 만들고, CSS로 모양과 움직임을 정하고, jQuery로 이벤트와 클래스를 제어**합니다. 캐릭터 이미지와 배치는 유지했습니다.

jQuery 자체는 JavaScript 라이브러리입니다. 직접 작성하는 코드는 `$(선택자)`, `.on()`, `.addClass()`, `.removeClass()`, `.css()` 같은 문법을 중심으로 구성했습니다. 별도 클래스, ES 모듈, Canvas, Web Animations API, 프레임마다 실행하는 `requestAnimationFrame` 코드는 사용하지 않습니다.

## 먼저 읽을 파일

| 파일 | 확인할 내용 |
| --- | --- |
| [`../index.html`](../index.html) | 캐릭터, 모니터, 버튼, 음원과 스크립트 연결 |
| [`../styles.css`](../styles.css) | 색상, 크기, 위치, 반응형 배치 |
| [`../animations.css`](../animations.css) | 등장 순서, 확대, 흔들림, 클릭 반응, 파티클 |
| [`../src/main.js`](../src/main.js) | 번호가 붙은 8개 구역의 jQuery 제어 코드 |
| `../src/vendor/jquery-3.7.1.min.js` | 공식 jQuery 배포본. 직접 수정할 필요 없음 |

아래 예시는 실제 구현에서 핵심 부분을 발췌한 것입니다. 전체 기능에는 이미지 준비, 상태 확인, 접근성 처리도 함께 들어 있습니다.

## 1. jQuery 연결과 시작

`index.html`에서 jQuery를 먼저 불러온 뒤 직접 작성한 코드를 불러옵니다. 로컬 파일을 사용하므로 CDN에 접속하지 못해도 제어 코드가 실행됩니다.

```html
<link rel="stylesheet" href="./styles.css">
<link rel="stylesheet" href="./animations.css">
<script defer src="./src/vendor/jquery-3.7.1.min.js"></script>
<script defer src="./src/main.js"></script>
```

```js
$(function () {
  var $scene = $('#scene');       // id가 scene인 요소 선택
  var $characters = $('.character'); // character 클래스 전체 선택
  // HTML이 준비된 뒤 실행할 코드
});
```

`defer`는 HTML을 읽은 뒤 작성된 순서대로 스크립트를 실행합니다. `$()`는 요소 선택, `$(function () { ... })`는 DOM 준비 후 실행에 사용합니다.

## 2. 클릭 이벤트와 클래스 제어

`src/main.js`의 `start()`, `finish()`, `pause()`가 재생 상태를 바꿉니다.

```js
$('#replay, #monitor').on('click', start);
$('#skip').on('click', finish);
$('#pause').on('click', function () {
  if (state === 'paused') setState(previousState);
  else pause();
});
```

```js
// start() 내부: 등장 클래스 추가
restartClass($('body'), 'is-playing');

// finish() 내부: 등장 클래스를 지우고 완성 상태로 전환
$('body').removeClass('is-playing is-paused').addClass('is-complete');
```

| 클래스 | 역할 |
| --- | --- |
| `is-playing` | 순차 등장, 모니터 점등, 카메라 흔들림, 진행 막대 재생 |
| `is-complete` | 완성 배치 표시, 캐릭터 부유, 클릭과 마우스 반응 허용 |
| `is-paused` | 현재 애니메이션 프레임 정지 |
| `is-reacting` | 클릭한 캐릭터의 개별 반응 실행 |

같은 클래스를 다시 추가하는 것만으로는 애니메이션이 재시작되지 않습니다. 아래 함수로 먼저 제거한 상태를 브라우저에 반영합니다.

```js
function restartClass($element, className) {
  $element.removeClass(className);
  void $element[0].offsetWidth;
  $element.addClass(className);
}
```

## 3. 캐릭터의 순차 등장

등장 순서는 `animations.css`의 `--delay`로 정합니다. 단위는 밀리초입니다.

```css
:root {
  --flight: 1250ms;
  --title-delay: 4580ms;
  --duration: 6100ms;
}
.character-giroro { --delay: 900ms; }
.character-tamama { --delay: 1450ms; }
.character-kururu { --delay: 2000ms; }
.character-dororo { --delay: 2550ms; }
.character-keroro { --delay: 3100ms; }

.is-playing .character {
  animation: fly-out var(--flight) linear var(--delay) both;
}
```

`animation`의 순서는 **이름 → 시간 → 속도 함수 → 지연 → 유지 방식**입니다. `both`는 지연 중 첫 프레임을 적용하고 종료 후 마지막 프레임을 유지합니다. 마지막 케로로는 `3100 + 1250 = 4350ms`에 도착하고, 타이틀은 `4580ms`에 시작합니다.

## 4. 모니터에서 화면 앞으로 튀어나오기

jQuery는 출발점까지의 거리만 계산하고 CSS 변수로 넘깁니다. `setFlightPaths()`를 보면 전체 계산을 확인할 수 있습니다.

```js
$character.css({
  '--start-x': (origin.x - x) + 'px',
  '--start-y': (origin.y - y) + 'px'
});
```

실제 `fly-out` 키프레임의 주요 구간은 다음과 같습니다. 중간의 추가 프레임은 `animations.css`에 있습니다.

```css
@keyframes fly-out {
  0% {
    opacity: 0;
    transform: perspective(900px)
      translate3d(var(--start-x), var(--start-y), 0)
      rotateZ(var(--twist)) scale(.025);
  }
  56% {
    transform: perspective(900px)
      translate3d(var(--camera-x), var(--camera-y), 320px)
      rotateX(-8deg) rotateY(calc(var(--twist) * .18))
      rotateZ(calc(var(--twist) * -.15)) scale(1.22);
  }
  100% {
    opacity: 1;
    transform: perspective(900px) translate3d(0, 0, 0)
      rotateZ(0deg) scale(1);
  }
}
```

- `translate3d()`는 위치와 앞뒤 거리를 바꿉니다.
- `perspective()`와 양수 Z 좌표는 화면 앞쪽으로 커지는 느낌을 줍니다.
- `scale()`은 크기, `rotate()`는 기울기, `opacity`는 투명도를 바꿉니다.
- 비행 중에는 `z-index`를 높여 다른 캐릭터 앞에 표시하고, 도착하면 원래 순서로 돌립니다.

## 5. 타이틀과 화면 흔들림

```css
.is-playing .title-lockup {
  animation: title-pop 1000ms cubic-bezier(.19,.7,.3,1)
    var(--title-delay) both;
}
@keyframes title-pop {
  0% { opacity: 0; transform: scale(.1) rotate(-10deg); }
  52% { opacity: 1; transform: scale(1.13) rotate(3deg); }
  78% { transform: scale(.97) rotate(-1deg); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
}

.is-playing .scene {
  animation: camera-shake 550ms linear 1600ms 5;
}
```

타이틀은 크게 튀어 오른 다음 제자리 크기로 돌아옵니다. 카메라 흔들림은 각 캐릭터가 화면 앞으로 오는 간격인 `550ms`마다 총 5회 반복합니다. 모니터 점등은 `screen-flash`, 집중선은 `speed-flash` 키프레임을 사용합니다.

## 6. 일시정지, 계속 재생, 진행 막대

```js
// setState() 내부
$('body').toggleClass('is-paused', state === 'paused');
```

```css
.is-paused *, .is-paused *::before, .is-paused *::after {
  animation-play-state: paused !important;
}
.is-playing .progress-track>span {
  animation: mission-progress var(--duration) linear both;
}
@keyframes mission-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

```js
$progress.find('span').on('animationend', function (event) {
  if (event.originalEvent.animationName === 'mission-progress') finish();
});
```

별도의 재생 타이머 없이 CSS가 시간을 관리합니다. 진행 막대가 끝나면 `animationend` 이벤트로 완성 상태를 표시합니다. 파티클과 부유 동작도 함께 멈추며, 마우스 좌표는 정지 중 갱신하지 않습니다. 진행 막대의 시각적 변화는 연속적이고, 보조 기술용 `aria-valuenow`는 캐릭터 도착과 전체 완료 시 갱신합니다.

## 7. 캐릭터별 클릭 반응

```js
// .character-hit의 클릭 처리 안에서 실행
restartClass($(this).find('img'), 'is-reacting');

// 움직임이 끝나면 클래스 정리
$('.character img').on('animationend', function () {
  $(this).removeClass('is-reacting');
});
```

```css
.character-tamama { --reaction: jump; }
.is-reacting {
  animation: var(--reaction) 680ms cubic-bezier(.22,.7,.36,1);
}
@keyframes jump {
  0%, 100% { transform: translateY(0) scale(1); }
  25% { transform: translateY(7px) scale(1.05,.9); }
  55% { transform: translateY(-42px) scale(.95,1.08); }
}
```

기로로는 `recoil`, 타마마는 `jump`, 쿠루루는 `wobble`, 도로로는 `dash`, 케로로는 `salute`를 사용합니다.

## 8. 별·색종이·원형 파티클

`burst()`가 `div`와 `span`을 생성합니다. `for` 반복문으로 여러 개를 만들고 `Math.random()`으로 방향과 거리를 조금씩 바꿉니다.

```js
$('<span class="particle"></span>')
  .addClass(['star', 'dot', 'confetti'][i % 3])
  .css({
    '--dx': Math.cos(angle) * distance + 'px',
    '--dy': Math.sin(angle) * distance - 70 + 'px',
    '--turn': (Math.random() * 720 - 360) + 'deg',
    '--life': (1 + Math.random() * .7) + 's'
  }).appendTo($burst);
```

```css
.particle { animation: scatter var(--life) ease-out both; }
.particle.dot { border-radius: 50%; }
.particle.confetti { width: 6px; height: 13px; }
@keyframes scatter {
  0% { opacity: 1; transform: translate(0, 0) rotate(0) scale(.4); }
  20% { opacity: 1; }
  100% {
    opacity: 0;
    transform: translate(var(--dx), calc(var(--dy) + 100px))
      rotate(var(--turn)) scale(1);
  }
}
```

별은 `clip-path: polygon(...)`, 원형 충격파는 `.burst::after`의 테두리와 `scale()`로 만듭니다. 파티클 묶음은 1.8초 후 `animationend`에서 제거하고, 연속 클릭 시 최대 6묶음까지만 유지합니다.

## 9. 마우스를 따라 움직이는 효과

```js
$scene.on('pointermove', function (event) {
  if (event.originalEvent.pointerType !== 'mouse' || state !== 'complete' || reducedMotion.matches) return;
  var offset = $scene.offset();
  $scene.css({
    '--px': ((event.pageX - offset.left) / $scene.width() - .5) * 25 + 'px',
    '--py': ((event.pageY - offset.top) / $scene.height() - .5) * 20 + 'px'
  });
});
```

```css
.character-hit img {
  translate: calc(var(--px) * var(--depth, 1))
    calc(var(--py) * var(--depth, 1));
}
```

캐릭터마다 `--depth`를 다르게 주면 가까운 캐릭터가 더 많이 움직입니다. `.offset()`은 페이지 기준 위치, `.width()`와 `.height()`는 장면 크기를 구합니다. `pointerType`을 확인해 휴대폰 터치는 마우스 이동으로 처리하지 않습니다.

## 10. 반응형 크기와 위치

```css
.scene { container-type: size; }
.character-tamama {
  left: 89%; top: 30%; width: min(46cqw, 68cqh);
}
@media (max-width: 900px) and (orientation: portrait) {
  .character-tamama {
    left: 85%; top: 43%; width: min(70cqw, 50cqh);
  }
}
```

`1cqw`는 장면 너비의 1%, `1cqh`는 장면 높이의 1%입니다. `min()`으로 너비와 높이 중 작은 쪽의 제한을 적용하고, `@media`로 휴대폰·태블릿·가로 화면 배치를 조정합니다. 더 좁은 화면의 추가 규칙도 `styles.css`에 있습니다.

## 11. 효과음과 접근성

```html
<audio id="pop-sound" src="./assets/pop.wav" preload="auto"></audio>
```

```js
// playSound()의 핵심. 실제 함수에서는 효과음 설정과 재생 실패도 확인합니다.
var audio = $('#' + id)[0];
audio.currentTime = 0;
audio.play();
```

효과음은 사용자가 켰을 때만 재생합니다. `play()`는 브라우저 기본 오디오 API이며, 실제 코드에는 실패를 처리하는 `.catch()`가 있습니다. 음원은 직접 만든 짧은 WAV 파일입니다.

```js
var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (reducedMotion.matches) { finish(); return; }
```

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }
  #particles { display: none; }
}
```

이미지 대체 텍스트, 키보드 버튼 조작, 포커스 표시, 로딩 중 `inert`, 오류 안내도 포함되어 있습니다. 이미지 준비 확인에는 jQuery의 `load`/`error` 이벤트를 사용하고, 응답이 없을 때만 10초 제한 타이머를 둡니다.

## 수정할 때 찾을 곳

| 바꾸고 싶은 것 | 수정 위치 |
| --- | --- |
| 캐릭터 크기·위치 | `styles.css`의 `.character-이름`, 화면별 `@media` |
| 등장 간격 | `animations.css`의 캐릭터별 `--delay` |
| 화면 앞으로 나오는 강도 | `fly-out`의 56%, 64% 구간 |
| 타이틀 등장 시간 | `--title-delay` |
| 전체 재생 시간 | `--duration` — 타이틀 종료보다 길어야 함 |
| 부유 속도 | 캐릭터별 `--float-time` |
| 클릭 반응 | `--reaction`과 해당 `@keyframes` |
| 파티클 개수·색상 | `main.js`의 `burst()` 호출과 `colors` |
| 버튼 문구 | `index.html`, `main.js`의 `labels` |

공식 참고: [jQuery 배포본](https://releases.jquery.com/jquery/), [이벤트 `.on()`](https://api.jquery.com/on/), [스타일 `.css()`](https://api.jquery.com/css/), [클래스 `.addClass()`](https://api.jquery.com/addClass/).
