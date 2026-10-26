# 이미지 에셋 제작 기록

사용자 제공 케로로 포스터를 편집 대상으로 내장 image_gen 도구를 사용했다. CLI/API fallback은 사용하지 않았다. 최종 프로젝트 에셋은 `assets/` 내부에 저장했다.

## 반영한 수정 요청

초기 시안은 가려진 부위 복원 과정에서 팔과 다리의 자세를 바꿨다. 사용자 피드백에 따라 초기 캐릭터 5종을 교체했다. 수정 방향은 **원본의 보이는 자세와 표정은 유지하고, 타이틀 등에 가려진 부분만 그 자세에 이어지도록 복원**하는 것이다. 원본 이미지를 단순 자르는 것으로 대체하지 않는다.

## 공통 프롬프트

Strict image extraction and local inpainting, not a new illustration. The poster is the edit target. Preserve the original pose, head-to-body proportions, face geometry, expression, hand gestures, limb angles, foreshortening and orientation. Treat visible artwork as locked. Only remove objects outside the character and reconstruct areas occluded by the title or other foreground objects. Hidden anatomy must continue the visible joints and line trajectories. Match original cel colors and printed black linework. Return a single full character with true alpha transparency and padding, without lettering or decorations.

| 파일 | 캐릭터별 자세 제약 |
| --- | --- |
| `keroro.png` | 한 손 경례, 반대 손 V, 오른쪽 눈 윙크, 대각선으로 뻗은 팔과 기존 몸 기울기 유지 |
| `giroro.png` | 화면 왼쪽에 든 총, 뒤로 접힌 반대 팔, 아래로 뻗은 좁은 실루엣. 달리는 자세나 넓게 벌린 다리 금지 |
| `tamama.png` | 시계 방향으로 기울어진 큰 머리와 몸 앞에서 내려간 양손 유지. 최신 요청에 따라 양발을 좌우로 넓게 벌린 자세 |
| `dororo.png` | 오른쪽 뺨 옆 닌자 수인, 왼쪽으로 뻗은 반대 팔, 아래로 향하는 긴 다리와 두건 방향 유지 |
| `kururu.png` | 시계 방향으로 기울어진 머리, 나선 안경, 왼쪽의 올린 손, 몸 앞의 접힌 팔과 아래로 흐르는 목도리. 넓은 도약 자세 금지 |

## 타이틀

최신 요청에 따라 현재 페이지는 **한국어 타이틀** `title-ko.png`를 사용한다. 기존 일본어 로고를 스타일 참조로 제공하고, 작은 윗줄에 `개구리 중사`, 큰 아랫줄에 `케로로`만 표현하도록 내장 이미지 생성 도구로 제작했다. 노랑 글자와 하늘색·남색·흰색 테두리, 빨강/주황의 윗줄, 별 장식을 사용한 투명 PNG다. 캐릭터 에셋은 이번 변경에서 그대로 유지했다.

`title.png`는 최초 요청 당시 제작한 일본어 버전으로 보관하며, 현재 페이지에서는 참조하거나 로드하지 않는다.

모니터와 단순 장식은 CSS/SVG로 제작했다. 이미지 생성 출력은 원본 포스터의 픽셀을 직접 복사한 파일이 아니라 복원된 에셋이며, 생성되지 않은 원본 포스터 자체는 수정하지 않았다.

## 기로로·타마마 다리 복원

2026-10-14 추가 수정. 웹 배치의 잘림이 아니라 두 PNG 자체에서 두 번째 다리가 누락된 것이 원인이었다. 내장 image_gen 편집 도구에 현재 PNG를 편집 대상으로, 원본 포스터를 자세 참조로 전달했다. 기존 얼굴·팔·소품·보이는 다리는 유지하고, 골반 뒤에 접힌 두 번째 다리와 둥근 발을 추가했다. 수정본으로 `assets/giroro.png`, `assets/tamama.png`를 교체했다.

프롬프트의 핵심 제약: “Make a surgical local anatomy repair, not a redesign. Restore only the missing second leg and complete rounded foot. Preserve the existing head, expression, proportions, both arms, existing leg, pose, colors, linework, scale and framing. Keep the rear leg tucked close to the body. Exactly two arms and two legs, both feet visible. True alpha transparency, no background or decorations.”

기로로는 기존 길게 내려간 다리를 유지하고 몸 오른쪽 뒤에 짧게 접힌 다리를 복원했다. 타마마는 앞으로 내려간 두 손과 오른쪽으로 뻗은 다리를 유지하고 손 뒤에서 보이는 짧은 다리를 복원했다. 복원한 발을 포함한 모든 부위가 이미지 캔버스 안에 들어간 것을 시각적으로 확인했다.

완성 화면에서 타마마의 하체가 쿠루루에, 기로로의 긴 다리 끝이 모니터에 가려지는 겹침도 확인했다. 타마마는 쿠루루 앞에, 기로로는 모니터 앞에 그리도록 레이어 순서를 조정했다. 캐릭터 크기와 위치, 등장 연출은 유지했다.

## 타마마의 넓게 벌린 양발과 위치 조정

사용자의 후속 요청에 따라 타마마의 짧게 접힌 다리를 좌측으로 길게 뻗은 다리로 바꾸어, 양발을 넓게 벌린 자세로 수정했다. 내장 image_gen 도구에 현재 PNG를 편집 대상으로, 원본 포스터를 자세 참조로 제공했다. 수정 PNG는 `assets/tamama.png`에 저장했다.

편집 프롬프트: “Change only Tamama's legs into a wide straddle like the poster. Preserve the long right-extending leg; replace the tucked leg with a similarly long leg extending left and slightly down, about 110–130 degrees apart, both rounded feet visible. Keep the head tilt, expression, hat, badge, body, both hanging arms and hands, colors, linework, scale and framing unchanged. Exactly two arms and two legs. True alpha transparency.”

쿠루루와 간격을 두기 위해 타마마의 중심 위치를 데스크톱에서는 장면 높이의 43%에서 26%로, 세로 화면에서는 45%에서 37%로 올렸다. 부유 동작 중에도 손끝이 쿠루루 모자와 겹치지 않도록 여유를 두었다. 얼굴을 가리게 된 말풍선도 왼쪽 위 빈 공간으로 옮겼다. 캐릭터 크기와 등장 연출은 유지했다.
## 로컬 효과음 (2026-10-26)

`pop.wav`와 `finale.wav`는 외부 음원을 가져오지 않고 사인파 주파수 변화와 감쇠를 이용해 직접 만든 짧은 효과음이다. 각각 0.24초, 0.68초이며 22,050Hz/16bit/mono WAV다. jQuery 버튼 제어 후 HTML `<audio>`로 재생한다. 이전 브라우저 실시간 합성을 정적 음원 재생으로 교체했다.
