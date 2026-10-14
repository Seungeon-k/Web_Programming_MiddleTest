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
| `tamama.png` | 시계 방향으로 기울어진 큰 머리, 몸 앞에서 아래로 내려간 양손, 오른쪽으로 향한 발. 두 팔을 벌리는 점프 금지 |
| `dororo.png` | 오른쪽 뺨 옆 닌자 수인, 왼쪽으로 뻗은 반대 팔, 아래로 향하는 긴 다리와 두건 방향 유지 |
| `kururu.png` | 시계 방향으로 기울어진 머리, 나선 안경, 왼쪽의 올린 손, 몸 앞의 접힌 팔과 아래로 흐르는 목도리. 넓은 도약 자세 금지 |

## 일본어 타이틀

사용자는 한국어 타이틀 대신 **포스터의 일본어 타이틀 유지**를 선택했다. `title.png`의 제작 프롬프트는 포스터 중앙의 `ケロロ軍曹 超共鳴展 であります！`만 분리해 재구성하되, 노랑/파랑의 ケロロ, 빨강 軍曹, 금색 超 도장, 파랑 共鳴, 초록 展, 흰색과 남색 테두리를 유지하고 투명 배경으로 만드는 것이다.

모니터와 단순 장식은 CSS/SVG로 제작했다. 이미지 생성 출력은 원본 포스터의 픽셀을 직접 복사한 파일이 아니라 복원된 에셋이며, 생성되지 않은 원본 포스터 자체는 수정하지 않았다.
