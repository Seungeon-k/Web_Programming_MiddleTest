# 케로로 발표 — 코드 해설과 예상 질문

**03번 장표 삭제 후의 13장 순서**에 맞춘 해설입니다. [발표 대본](presentation-script.md)을 연습하다 막히는 부분을 찾아보는 문서입니다. 아래 코드는 실제 프로젝트의 핵심 부분을 발췌했습니다. 함수 안에서만 사용할 수 있는 변수도 있으므로, 각 조각을 따로 복사해서 실행하는 예제는 아닙니다.

## 먼저 이해할 흐름

**클릭 → jQuery가 클래스 변경 → 해당 클래스에 연결된 CSS 실행**

```js
$('body').addClass('is-playing');
```

`$('body')`는 body 요소를 고르고, `.addClass('is-playing')`는 그 요소에 클래스 이름을 추가합니다. `is-playing`은 직접 정한 이름이며, 그 자체에 재생 기능이 있는 것은 아닙니다.

```css
.is-playing .character {
  animation: fly-out var(--flight) linear var(--delay) both;
}
```

이 CSS가 있기 때문에 움직입니다. “is-playing 클래스가 있는 요소 **안의** character 요소에 fly-out 애니메이션을 적용한다”는 뜻입니다. 사이의 공백은 자식뿐 아니라 더 안쪽에 있는 후손 요소도 선택합니다. 5주차의 선택자·클래스 제어를 연결한 부분입니다.

## 01~02. 화면에 보이는 요소

모니터, 캐릭터 다섯 명, 타이틀, 배경 장식, 파티클, 재생 버튼으로 구성되어 있습니다. 캐릭터는 각각 투명 PNG여서 개별 이동과 클릭이 가능합니다. 포스터 한 장을 통째로 움직이는 구조가 아닙니다.

모니터는 등장 위치를 계산하는 기준이면서 다시 재생하는 버튼이기도 합니다. 이미지 제작·복원 과정과 웹에서 이미지를 움직이는 코드는 구분해서 설명하면 됩니다.

## 03. 왜 div, button, img로 나눴나?

```html
<div inert class="character character-keroro">
  <button class="character-hit" type="button" aria-label="케로로와 놀기">
    <img src="./assets/keroro.png" alt="케로로">
  </button>
</div>
```

- 바깥 `div`: 모니터에서 최종 위치로 날아오는 이동.
- 중간 `button`: 클릭 영역과 등장 후 위아래로 떠 있는 동작.
- 안쪽 `img`: 실제 그림, 클릭 반응, 마우스에 따른 작은 이동.

부모를 이동시키면 그 안의 자식도 함께 이동합니다. 여기에 자식 자체의 움직임을 더할 수 있습니다. 같은 요소의 `transform`을 여러 동작이 동시에 바꾸며 충돌하는 상황을 줄이기 위해 역할을 나눴습니다.

부모·자식 관계와 `img`, `class`, `src`는 **수업 개념**입니다. `inert`와 `aria-label`은 **추가 개념**으로, 12장에서 설명합니다.

## 04. 위치와 반응형 크기 읽기

```css
.scene { container-type: size; }
.character { position: absolute; translate: -50% -50%; }
.character-keroro {
  left: 53%; top: 35%;
  width: min(56cqw, 70cqh);
}
```

`position: absolute`와 `left`, `top`은 **수업 개념**입니다. 이 프로젝트에서는 위치 기준이 되는 장면 안에서 케로로를 배치합니다.

`left: 53%`는 장면 너비의 53%, `top: 35%`는 장면 높이의 35% 지점입니다. 여기까지만 쓰면 이미지 상자의 왼쪽 위가 그 지점에 옵니다. `translate: -50% -50%`로 **자기 상자 크기의 절반씩** 왼쪽·위로 옮겨 중심이 그 지점에 오도록 합니다. 앞의 퍼센트와 뒤의 퍼센트는 기준이 다릅니다. 수업의 이동 변형을 응용했으며, 독립 `translate` 속성 표기는 추가 문법입니다.

`container-type`, `cqw`, `cqh`, `min()`은 **추가 개념**입니다.

- 이 코드에서 `1cqw`는 장면 너비의 1%, `1cqh`는 장면 높이의 1%입니다. 브라우저 전체 크기를 뜻하는 `vw`, `vh`와 구분합니다.
- 장면이 800×600px이면 `56cqw`는 448px, `70cqh`는 420px입니다.
- `min()`은 둘 중 작은 값을 선택하므로 이 경우 너비는 420px입니다.

슬라이드의 `@media (max-width: 900px) and (orientation: portrait)`는 “브라우저 화면 너비가 900px 이하이고 세로 방향이면 아래 CSS 적용”이라는 **추가 개념**입니다. 세로 화면의 중심은 `left: 55%`로 잡았습니다. 450px 이하에서는 다른 캐릭터와 크기를 맞추고 타마마와 거리를 두도록 너비를 `min(76cqw, 56cqh)`, 높이 위치를 `top: 16.5%`로 한 번 더 조정합니다.

## 05. 등장 시간과 CSS 변수

```css
:root { --flight: 1250ms; --title-delay: 4580ms; --duration: 6100ms; }
.character-giroro { --delay: 900ms; }
.character-tamama { --delay: 1450ms; }
```

**수업 개념:** 애니메이션 이름, 지속 시간, 지연 시간, 타이밍 함수, 채우기 모드.

**추가 개념:** `--flight`처럼 `--`로 시작하는 CSS 사용자 정의 속성입니다. 자주 쓰는 값을 이름 붙여 저장하고 `var(--flight)`로 꺼내 씁니다. JS의 `var state`와는 다른 기능입니다.

`animation: fly-out var(--flight) linear var(--delay) both`를 풀면 다음과 같습니다.

| 부분 | 뜻 |
| --- | --- |
| `fly-out` | 실행할 `@keyframes` 이름 |
| `var(--flight)` | 한 캐릭터의 비행 시간, 1.25초 |
| `linear` | 기본 속도 곡선을 일정하게 설정 |
| `var(--delay)` | 캐릭터별 출발 전 대기 시간 |
| `both` | 대기 중에는 시작 키프레임, 끝난 뒤에는 마지막 키프레임의 스타일 유지 |

실제 `fly-out` 안에는 일부 구간에 별도의 `animation-timing-function`을 지정해 가속과 감속을 줬습니다. 따라서 전체 비행이 처음부터 끝까지 같은 속도로 움직인다는 뜻은 아닙니다.

| 대상 | 출발 | 해당 동작 종료 |
| --- | ---: | ---: |
| 기로로 | 0.90초 | 2.15초 |
| 타마마 | 1.45초 | 2.70초 |
| 쿠루루 | 2.00초 | 3.25초 |
| 도로로 | 2.55초 | 3.80초 |
| 케로로 | 3.10초 | 4.35초 |
| 타이틀 | 4.58초 | 5.58초 |

전체 재생 상태는 6.1초에 완료로 바뀝니다. 각 동작을 하나씩 끝내고 다음 동작을 실행하는 방식이 아니라, 지연 시간을 다르게 주어 일부 구간이 겹치도록 했습니다. 진행 막대의 CSS 애니메이션이 끝나는 이벤트로 완료를 처리합니다. 등장 순서를 JS 타이머 여러 개로 예약한 구조는 아닙니다.

## 06. 모니터에서 출발하는 좌표 계산

```js
var origin = center($('.monitor-screen'));
var x = parseFloat($character.css('left'));
var y = parseFloat($character.css('top'));
$character.css({
  '--start-x': (origin.x - x) + 'px',
  '--start-y': (origin.y - y) + 'px'
});
```

`origin`은 모니터 중심이고 `x`, `y`는 캐릭터의 최종 자리입니다. 둘 다 장면 안에서의 좌표로 맞춥니다.

예를 들어 모니터가 `(200, 500)`, 캐릭터의 최종 자리가 `(600, 200)`이면 차이는 `(-400, 300)`입니다. 최종 자리에서 왼쪽으로 400px, 아래로 300px 옮기면 모니터 위치가 됩니다. 이 이동량을 시작값으로 쓰고, 마지막에는 이동량을 0으로 돌립니다.

좌표와 이미지 크기 계산, `.css()`는 **수업 개념을 응용**한 부분입니다. 아래 도구는 **추가 개념**입니다.

- `getBoundingClientRect()`: 화면에 표시된 요소 상자의 위치와 크기를 읽습니다. 장면의 위치를 빼서 장면 내부 좌표로 바꿉니다.
- `parseFloat('600px')`: 앞의 숫자 부분을 읽어 계산 가능한 `600`으로 만듭니다.
- `.each()`: 선택한 캐릭터 각각에 같은 계산을 적용합니다.
- `.css({ '--start-x': ... })`: 계산한 값을 CSS 사용자 정의 속성에 전달합니다.
- `resize` 이벤트: 창 크기가 달라질 때 이 값을 다시 계산합니다.

실제 코드에는 화면 앞쪽으로 확대되는 중간 지점의 좌표 보정도 있습니다. 슬라이드의 짧은 코드는 **출발 위치 계산만 발췌**한 것입니다.

## 07. 앞으로 튀어나오는 효과

```css
/* fly-out의 56% 구간 */
transform: perspective(900px)
  translate3d(var(--camera-x), var(--camera-y), 320px)
  rotateX(-8deg) rotateY(calc(var(--twist) * .18))
  rotateZ(calc(var(--twist) * -.15)) scale(1.22);
```

수업의 `@keyframes`로 중간 모습을 지정하고, `transform`으로 이동·회전·확대하는 원리를 사용합니다.

**추가 개념인 3D 변형**은 이렇게 이해하면 됩니다.

- `perspective(900px)`: 가까운 물체가 더 크게 보이도록 원근감을 줍니다.
- `translate3d(x, y, 320px)`: 좌우·위아래 이동에 더해, Z축으로 화면 앞쪽에 오게 합니다.
- `rotateX`, `rotateY`: 평면 이미지를 앞뒤·좌우로 기울입니다.
- `calc()`: CSS 안에서 수식을 계산합니다. 캐릭터마다 정한 회전값을 조금씩 조절합니다.

출발할 때는 `scale(.025)`, 즉 원래 가로·세로의 2.5%로 작아집니다. 중간에는 `scale(1.22)`에 원근 확대까지 더해지므로, 실제 화면에서 보이는 크기는 단순히 1.22배라고만 설명하면 부정확합니다.

`56%`는 **한 캐릭터의 1.25초 비행 중 56% 시점**, 약 0.7초입니다. 전체 6.1초의 56%나 투명도 56%를 뜻하지 않습니다. 100%에서는 최종 위치와 크기로 돌아옵니다.

## 08. 정지, 계속 재생, 다시 재생의 차이

```js
$('#pause').on('click', function () {
  if (state === 'paused') setState(previousState);
  else pause();
});
```

`.on('click', ...)`은 “클릭이 발생하면 실행할 일”을 등록합니다. `state === 'paused'`는 현재 상태가 정지인지 비교합니다. 같으면 정지 전 상태로 돌아가고, 아니라면 `pause()`를 실행합니다.

이벤트, 변수, 함수, `if/else`는 **수업 개념**입니다. `===`, `!==`는 자료의 `==`, `!=`에서 더 나아간 엄격 비교 표기입니다. 값뿐 아니라 자료형도 구분합니다.

**추가 개념인 CSS 정지 기능:**

```css
.is-paused *, .is-paused *::before, .is-paused *::after {
  animation-play-state: paused !important;
}
```

`*`는 해당 범위의 모든 요소이며, 장식으로 만든 `::before`, `::after`도 함께 선택합니다. `animation-play-state: paused`는 애니메이션을 현재 진행 위치에서 멈춥니다. 정지 클래스를 제거하면 이어서 진행합니다. JS도 정지 상태에서 클릭 반응과 마우스 갱신을 제한합니다.

반면 **다시 재생**은 다음 함수를 사용합니다.

```js
function restartClass($element, className) {
  $element.removeClass(className);
  void $element[0].offsetWidth;
  $element.addClass(className);
}
```

클래스를 빼고 다시 붙일 때, 브라우저가 중간의 제거 상태를 건너뛰면 같은 애니메이션이 다시 시작하지 않을 수 있습니다. `offsetWidth`를 읽어 레이아웃을 반영하게 한 뒤 클래스를 붙입니다. `[0]`은 jQuery 목록에서 실제 HTML 요소를 꺼내고, `void`는 읽은 값 자체는 쓰지 않는다는 뜻입니다. 이 재시작 처리는 **추가 개념**입니다.

`$('#replay, #monitor').on('click', start)`에서 `start`는 클릭 때 호출할 함수를 전달합니다. 여기에 `start()`라고 쓰면 등록하는 순간 함수를 실행하게 되어 의도가 달라집니다.

## 09. 캐릭터마다 다른 클릭 반응

```js
if (state !== 'complete') return;
restartClass($(this).find('img'), 'is-reacting');
```

첫 줄은 “등장이 완료되지 않았다면 여기서 그만한다”는 뜻입니다. 두 번째 줄에서 `this`는 클릭한 버튼, `.find('img')`는 그 안의 이미지입니다. 그 이미지에 `is-reacting` 클래스를 다시 붙여 반응을 시작합니다.

```css
.character-tamama { --reaction: jump; }
.is-reacting {
  animation: var(--reaction) 680ms cubic-bezier(.22,.7,.36,1);
}
```

타마마 안의 이미지는 부모 쪽에서 지정한 CSS 변수 `--reaction`을 받아 `jump` 애니메이션을 실행합니다. 다른 캐릭터에는 `recoil`, `wobble`, `dash`, `salute`를 지정했습니다. 클릭 처리 함수는 공유하고 CSS에서 동작을 고르는 방식입니다.

**수업 응용:** 클릭, 조건문, 클래스, 키프레임. **추가 개념:** `.find()`, `.closest()` 같은 요소 탐색, CSS 변수의 상속과 동작 선택, `cubic-bezier()`로 정한 속도 곡선. `cubic-bezier()`는 시간에 따라 움직임이 빨라지고 느려지는 정도를 조절합니다.

## 10. 파티클을 만들고 지우는 과정

```js
for (var i = 0; i < count; i++) {
  var angle = Math.random() * Math.PI * 2;
  var distance = 60 + Math.random() * 180;
  $('<span class="particle"></span>')
    .addClass(['star', 'dot', 'confetti'][i % 3])
    .css({
      '--dx': Math.cos(angle) * distance + 'px',
      '--dy': Math.sin(angle) * distance - 70 + 'px'
    }).appendTo($burst);
}
```

HTML 요소와 CSS 애니메이션, 배열은 수업 내용입니다. **반복문으로 요소를 생성하고 난수로 이동량을 정하는 조합은 추가 개념**입니다.

1. `for`는 `count`만큼 같은 작업을 반복합니다.
2. `$('<span ...>')`는 기존 요소를 고르는 대신 새 요소를 만듭니다.
3. `i % 3`은 3으로 나눈 나머지인 0, 1, 2를 반복합니다. 배열에서 별·원·색종이를 번갈아 고르는 용도입니다.
4. `Math.random()`은 0 이상 1 미만의 값을 뽑습니다. 매번 조금 다른 각도와 거리를 만들 때 씁니다.
5. `cos`, `sin`은 방향과 거리를 가로 이동량과 세로 이동량으로 나눕니다. 발표에서는 “원 주변으로 퍼질 방향을 가로·세로 값으로 바꾼다”고 설명하면 충분합니다.
6. `.appendTo($burst)`는 만든 요소를 파티클 묶음 안에 넣습니다. 실제 움직임은 CSS의 `scatter`가 담당합니다.

별 모양을 깎는 `clip-path: polygon()`도 추가 개념입니다. 원은 수업에서 사용한 `border-radius`로 만듭니다.

`animationend`는 애니메이션이 끝났다는 **추가 이벤트**입니다. 1.8초짜리 묶음 수명이 끝나면 `.remove()`로 지웁니다. 최대 여섯 개라는 제한은 **파티클 여섯 조각이 아니라 여섯 묶음**입니다. 장면 너비가 600px 미만이면 개수를 65%로 줄이고 올림합니다. 예를 들어 30개는 20개가 됩니다.

## 11. 마우스 위치를 작은 움직임으로 바꾸기

```js
var offset = $scene.offset();
$scene.css({
  '--px': ((event.pageX - offset.left) / $scene.width() - .5) * 25 + 'px',
  '--py': ((event.pageY - offset.top) / $scene.height() - .5) * 20 + 'px'
});
```

`event.pageX`, `event.pageY`, `.width()`, `.height()`, `.css()`는 **7주차 예제에서 확인한 수업 개념**입니다. 마우스에 따라 이미지를 움직이는 발상도 수업 예제에 있습니다.

이 프로젝트에서 **추가한 계산**은 큰 좌표를 작은 이동량으로 바꾸는 부분입니다.

- `pageX - offset.left`: 문서 전체 좌표를 장면 안의 좌표로 바꿉니다. `.offset()`은 추가 사용한 메서드입니다.
- 장면 너비로 나누기: 왼쪽부터 오른쪽까지를 대략 0~1로 바꿉니다.
- `-.5`: 중앙을 0으로, 왼쪽을 음수로, 오른쪽을 양수로 만듭니다.
- `*25`: 이동 범위를 대략 -12.5~12.5px로 제한합니다. 세로는 같은 방식으로 -10~10px입니다.

CSS에서는 이 값에 캐릭터별 `--depth`를 곱합니다. 같은 마우스 움직임에도 이동량이 달라져 앞뒤 층이 있는 것처럼 보입니다. 이를 시차 효과라고 설명할 수 있습니다.

수업의 `mousemove` 대신 **추가 개념인 `pointermove`**를 사용하고, `pointerType`이 `mouse`인지 확인합니다. 등장 완료 상태에서만 반응하며, 정지 중이나 동작 줄이기 설정에서는 갱신하지 않습니다.

**효과음은 어디까지 수업 내용인가?**

2주차 태그 표에 `<audio>`가 있습니다. 다만 아래의 재생 제어는 추가 개념입니다.

```js
audio.currentTime = 0;
audio.play().catch(function (error) {
  if (error.name === 'AbortError') return;
  soundEnabled = false;
  updateSoundButton();
});
```

`currentTime = 0`은 재생 위치를 처음으로 돌립니다. `play()`는 재생을 요청합니다. 성공 여부가 나중에 정해지는 결과를 반환하므로 `.catch()`로 실패를 처리합니다. 이 코드에서는 중단 오류는 건너뛰고, 다른 실패라면 효과음을 끈 상태로 버튼을 갱신합니다. 슬라이드의 `catch(...)`는 생략 표기이며 그대로 실행하는 코드가 아닙니다.

효과음은 처음에 꺼져 있고 사용자가 켠 뒤 재생합니다. 일시정지에서는 오디오도 멈추지만, 계속 재생 버튼이 이미 멈춘 효과음까지 다시 이어 재생하지는 않습니다.

## 12. 환경 대응과 접근성

이 장의 핵심 API는 **추가 개념**입니다. 발표에서는 이름을 모두 읽기보다 어떤 불편을 줄이는지 설명하면 됩니다.

| 코드 | 쉽게 설명하면 | 실제 동작의 범위 |
| --- | --- | --- |
| `prefers-reduced-motion`, `matchMedia()` | 기기의 ‘동작 줄이기’ 설정 확인 | 등장 효과를 생략하고 완성 화면 표시 |
| 이미지 `load`, `error`, 10초 제한 | 이미지 준비를 기다리되 끝없이 기다리지 않기 | 실패한 이미지를 복원하는 기능은 아님. 누락 시 안내 문구 표시 |
| `inert` | 아직 조작하면 안 되는 영역의 입력 차단 | 등장 중 캐릭터·타이틀에 적용 |
| `aria-label`, `aria-pressed` | 보조 기술에 버튼 이름과 상태 전달 | 화면에 보이는 글자와 별개로 의미 제공 |
| `:focus-visible` | 키보드로 선택한 버튼을 눈에 보이게 표시 | Tab 키로 이동할 때 현재 위치 확인 |
| `visibilitychange` | 문서가 보이지 않게 된 상황 감지 | 다른 탭으로 가면 정지. 돌아왔다고 자동으로 재생하지는 않음 |

자료의 `:focus`와 여기의 `:focus-visible`은 같은 이름이 아닙니다. 수업에서 초점 상태를 배웠더라도, 이번에 추가한 선택자와 속성은 구분해 설명합니다.

## 13. 시연과 예상 질문


| 수정하고 싶은 것 | 파일 | 역할 |
| --- | --- | --- |
| 이미지, 버튼, 텍스트 등의 구성 | `index.html` | 무엇을 화면에 넣을지 정함 |
| 캐릭터 위치, 크기, 색상, 화면별 배치 | `styles.css` | 어디에 어떤 크기로 보일지 정함 |
| 등장 순서, 비행, 흔들림, 클릭 동작 | `animations.css` | 어떻게 움직일지 정함 |
| 클릭, 정지, 좌표 계산, 소리 | `src/main.js` | 언제 어떤 반응을 실행할지 정함 |

HTML·CSS·JS 파일 연결은 수업 개념입니다. CSS를 배치와 애니메이션 두 파일로 나눈 것은 이 프로젝트의 정리 방식입니다.

`$(function () { ... })`는 HTML 요소를 사용할 준비가 되면 안의 코드를 실행합니다. 수업의 `$(document).ready(function () { ... })`와 같은 목적으로 쓰는 짧은 표현입니다. 변수 이름 앞의 `$`는 “jQuery로 선택한 요소를 담았다”는 표시로 붙였으며, 변수 이름에 반드시 필요한 문법은 아닙니다.


**“자바스크립트 대신 jQuery로 만들었다는 건가요?”**

“jQuery도 자바스크립트 라이브러리입니다. 요소 선택과 클릭 처리는 jQuery 문법을 중심으로 작성하고, 화면의 움직임은 CSS 키프레임이 담당하도록 했습니다.”

**“수업에서 배운 것을 어디에 썼나요?”**

“position으로 캐릭터를 배치하고, keyframes와 delay로 등장 순서를 만들었습니다. jQuery의 on, addClass, removeClass와 조건문으로 버튼과 클릭을 제어했습니다. 마우스 반응은 7주차 좌표 예제를 응용했습니다.”

**“추가로 사용한 기능 중 중요한 것은 무엇인가요?”**

“CSS 변수로 시간과 좌표를 전달하고, 3D 변형으로 캐릭터가 화면 앞으로 나오는 효과를 냈습니다. 화면 비율에 따라 배치를 바꾸는 반응형 처리도 추가했습니다.”

**“왜 애니메이션을 jQuery에서 직접 만들지 않았나요?”**

“이 프로젝트에서는 이동과 확대의 중간 모습을 keyframes로 적어 두는 방식이 읽기 편했습니다. jQuery는 재생할 조건을 정하고 CSS는 움직이는 역할을 맡도록 나눴습니다.”

**“타마마 크기나 등장 순서를 바꾸려면요?”**

“크기는 styles.css의 character-tamama 규칙에서 바꿉니다. 세로 화면 규칙도 함께 확인합니다. 등장 순서는 animations.css에서 캐릭터별 delay 값을 바꿉니다.”

**“파티클 때문에 요소가 계속 쌓이지 않나요?”**

“애니메이션이 끝나면 묶음을 삭제합니다. 연속 클릭으로 한 번에 많이 만들어져도 최대 여섯 묶음까지만 유지합니다.”

## 수업 자료와 구분 기준

확인 기준은 [사용자가 제공한 웹프로그래밍 Notion 자료](https://gray-wallet-f01.notion.site/2026-2-3a714ae8a30380de9021f405d399f7b1)의 강의 슬라이드, 첨부 주차별 예제 ZIP, 페이지 안의 비 내리는 애니메이션 예제입니다. 예제 코드는 읽어서 확인했으며 실행하지 않았습니다.

| 자료 | 확인한 내용 | 이 발표와 연결되는 장 |
| --- | --- | --- |
| [2주차 — HTML](https://docs.google.com/presentation/d/1_4q5-nCjdZoD11mf_77sfmUAP8UGDSMfVwnlrp5VmmE/edit?usp=sharing) | 태그, 문서 구조, 이미지, 부모·자식 관계, 기본 audio 태그 | 2~3, 11 |
| [3주차 — CSS 배치](https://docs.google.com/presentation/d/1Lg48HjSj9bXLPjM4m0JGbi0ckFeyRSFG_G0TeIr3sXI/edit?usp=sharing) | 클래스·외부 CSS 연결, 박스 모델, 적용 순서, position. 특히 22~27쪽 위치 속성 | 3~4 |
| [4주차 — CSS 애니메이션](https://docs.google.com/presentation/d/1deb7Zaf_2ICEavORJ0eqkqp_c2HnJQ3SjxurOLsI19g/edit?usp=sharing) | 23~34쪽 상태 선택자, transition, keyframes, delay, fill-mode, transform | 5, 7, 9~10 |
| [5주차 — jQuery 기초](https://docs.google.com/presentation/d/1NPggcP7LQzMwNxf3H-YxxjoYl2yjDDtNZgjr0sSlwBs/edit?usp=sharing) | 10~24쪽 파일 구조, jQuery 연결, 준비 이벤트, 선택자, on·css·addClass, 함수·변수·자료형. ZIP에는 toggleClass도 있음 | 6, 8~10 |
| [6주차 — 이벤트와 조건문](https://docs.google.com/presentation/d/13b17uao1ZdkGoMyM32qf4hcftBdmeHDePdlvVatSmvU/edit?usp=sharing) | 6·12~20쪽 및 ZIP의 클래스 추가·제거·토글, attr, 마우스 진입·이탈, 변수에 따른 조건 분기 | 8~9 |
| [7주차 — 마우스 좌표와 GitHub](https://docs.google.com/presentation/d/1-TzcG5BcPOK3gHjbpZnS3VoVEm0GxoS2EtQrgwg9bHc/edit?usp=sharing) | 3쪽 마우스 좌표, 4~5쪽 이미지 맞춤, 14쪽 필터·겹침·입력 관련 CSS. ZIP에서 pageX·pageY·width·height·css 확인 | 4, 6, 11, 13 |
| [8주차 — SVG와 발표 안내](https://docs.google.com/presentation/d/17NlgoGlz-oclV2-SrPXYIJfZsSes6g2Fs5IkcLm1tZA/edit?usp=sharing) | SVG 기본, 선과 필터. 16~17쪽 코드 이해·설명 및 최대 5분 발표 안내 | 배경·아이콘의 기반, 발표 구성 |

추가 개념 표시는 위 자료에서 확인한 범위를 기준으로 합니다. 특히 다음 항목은 혼동하지 않도록 구분했습니다.

- `animation-delay`, `animation-fill-mode`, 마우스 좌표, `.width()`와 `.height()`는 **수업 개념**입니다.
- CSS 사용자 정의 속성, 컨테이너 단위·미디어 쿼리, 3D 원근 변형은 **추가 개념**입니다.
- `<audio>`는 수업에 있지만 `play()`, `currentTime`, Promise의 `.catch()`는 **추가 개념**으로 설명했습니다.
- 변수와 조건문으로 상태를 나누는 원리는 수업 응용입니다. 재생·정지·완료라는 상태 이름은 프로젝트에서 정한 것이며, 수업에서 이 구조 그대로 배웠다는 뜻은 아닙니다.
- SVG와 CSS 애니메이션 예제가 있다고 해서 난수·삼각함수·DOM 생성까지 수업에서 다뤘다고 분류하지 않았습니다.

프로젝트 원본: [index.html](../index.html), [styles.css](../styles.css), [animations.css](../animations.css), [src/main.js](../src/main.js). 기존 기능별 정리는 [features.md](features.md)에서 볼 수 있습니다.
