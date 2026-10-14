# Keroro Invasion Implementation Plan

> Execution: native implementation in the current session.

**Goal:** 다섯 캐릭터가 모니터에서 튀어나온 후 일본어 로고가 등장하는 반응형 웹페이지.
**Architecture:** 의존성 없는 정적 ES modules, Web Animations API, Canvas 2D.
**Spec:** `docs/design.md`

## Global Constraints

- 사용자 제공 포스터 기반, 일본어 타이틀 유지.
- 다섯 캐릭터 전원 등장한 뒤 중앙 타이틀 표시.
- 반응형, 재생 제어, reduced-motion, 키보드 접근성.
- GitHub: Seungeon-k/Web_Programming.

## Review Focus

1. 재생 중 연속 재시작 시 이전 애니메이션/타이머가 남지 않아야 한다.
2. 모바일 화면에서 캐릭터/버튼의 가로 넘침이 없어야 한다.
3. 이미지 실패 시 페이지가 영구 로딩 상태에 머물지 않아야 한다.
4. 일시정지 시 타이틀, 캐릭터, 파티클이 함께 멈춰야 한다.
5. reduced-motion에서는 완성 화면이 즉시 보여야 한다.

## Tasks

- [x] 1. 투명 캐릭터 5종과 로고 생성/복사, scene 타이밍 및 좌표 테스트를 먼저 작성하고 실패를 확인한다.
- [x] 2. `index.html`, `styles.css`, `src/scene.js`로 포스터와 소대 소개, 반응형 배치를 구현한다. Node 테스트 통과.
- [x] 3. `src/animation.js`, `src/particles.js`, `src/audio.js`, `src/main.js`로 등장 시퀀스와 모든 UI 제어를 구현한다.
- [x] 4. `scripts/dev.mjs`, `scripts/build.mjs`, README를 작성하고 브라우저 데스크톱/모바일/접근성 검증을 수행한다.
- [ ] 5. 독립 리뷰에서 중요한 문제를 수정하고, 검증 후 한국어 커밋과 원격 동기화를 수행한다.
