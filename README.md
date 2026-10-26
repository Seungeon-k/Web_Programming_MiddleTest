# 개구리 중사 케로로 — 소대 출동!

왼쪽 아래 모니터에서 다섯 캐릭터가 튀어나오고 한국어 타이틀이 마지막에 나타나는 반응형 인터랙티브 포스터입니다. 캐릭터 소개 없이 한 화면의 연출에 집중했습니다.

**현재 구현: HTML + CSS 애니메이션 + jQuery 3.7.1.**

[사용한 기능과 코드 예시](docs/features.md)에 이벤트, 클래스 제어, 등장 순서, 파티클, 반응형 코드를 정리했습니다. `src/main.js`의 한국어 주석과 `animations.css`를 함께 읽으면 됩니다.

## 실행

Node.js 20 이상에서 별도 패키지 설치 없이 실행합니다. jQuery는 `src/vendor/`에 포함되어 있습니다.

```sh
npm run dev
```

`http://127.0.0.1:4173/`에서 확인합니다. 다른 포트는 `npm run dev -- --port 5173`으로 지정합니다.

```sh
npm run build   # 정적 배포용 dist/ 생성
npm run preview # dist/ 미리보기
```

`dist/`를 정적 호스팅에 업로드할 수 있습니다. 상대 경로를 사용하므로 하위 경로에서도 동작합니다. Google Fonts 연결이 없으면 기기의 기본 한국어 글꼴을 사용합니다.

## 구조

| 파일 | 역할 |
| --- | --- |
| `index.html` | 캐릭터·모니터·버튼·오디오 요소 |
| `styles.css` | 포스터의 크기·위치·반응형 배치 |
| `animations.css` | CSS 키프레임, 등장 순서, 클릭 반응, 파티클 |
| `src/main.js` | jQuery 이벤트·클래스·CSS 변수 제어 |
| `src/vendor/jquery-3.7.1.min.js` | 공식 jQuery 배포본, MIT 라이선스 헤더 포함 |
| `assets/` | 캐릭터 PNG, 한국어 로고, 효과음 WAV 등 |
| `docs/features.md` | 기능별 설명과 실제 코드 발췌 |
| `scripts/` | 로컬 서버와 정적 빌드 도구 |

기존의 `scene.js`, `animation.js`, `particles.js`, `audio.js`는 단순화하면서 제거했습니다. 브라우저 동작은 `main.js` 한 파일과 CSS에서 확인할 수 있습니다.

## 제공 기능

- 기로로 → 타마마 → 쿠루루 → 도로로 → 케로로 → 한국어 타이틀
- 모니터 점등, 원근 확대, 반동, 카메라 흔들림과 집중선
- CSS로 흩날리는 별·원·색종이, 원형 충격파
- 일시정지/계속, 건너뛰기, 다시 출동, 모니터 클릭
- 캐릭터별 클릭 반응, 마우스 이동 효과, 배경 클릭 파티클
- 기본 음소거, 사용자가 켠 경우에만 로컬 WAV 효과음 재생
- 동작 줄이기 설정, 키보드 조작, 이미지 로드 실패 처리
- 확대된 타마마와 케로로·쿠루루 간격을 유지하는 반응형 배치

등장과 클릭 움직임은 CSS가 처리합니다. JavaScript에는 jQuery 제어와 좌표 계산, 오디오 재생, 미디어 설정 확인만 남겼습니다. jQuery 자체도 JavaScript 라이브러리이므로 JavaScript 활성화가 필요합니다.

## 검증

로컬 서버를 켜고 Playwright 및 Chrome이 있는 환경에서 실행합니다.

```sh
npm test
```

Playwright가 별도 경로에 있다면 다음처럼 지정합니다.

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs npm test
```

`PLAYWRIGHT_CHANNEL`로 브라우저 채널을, `QA_OUTPUT`으로 스크린샷 저장 위치를 바꿀 수 있습니다. 기본값은 `chrome`, `/tmp/keroro-qa`입니다.

실제 CSS 등장 순서, 카메라 돌진, 파티클, 재생·정지·반복 시작, 클릭 반응, 반응형 배치, 효과음, 동작 줄이기, 이미지 실패를 브라우저에서 검증합니다.

## Git과 에셋

- 원격: `https://github.com/Seungeon-k/Web_Programming.git`
- 브랜치: `codex/keroro-invasion`
- 커밋 메시지: 한국어
- 에셋 제작 기록: [docs/assets.md](docs/assets.md)

비공식 팬 제작 프로젝트입니다. 캐릭터와 원작의 권리는 각 권리자에게 있으며, 실제 전시 안내 및 공식 홈페이지가 아닙니다.
