# 길건너기 🚗

three.js를 **만들면서 배우기**.
Crossy Road 류의 길건너기 게임을 브라우저에서 끝까지 돌아가게 만드는 것이 목표.

방향키로 한 칸씩 이동하며 차를 피해 앞으로 나아간다. 앞으로 갈수록 점수가 오르고,
차에 치이면 끝. 최고 점수는 `localStorage`에 남는다.

---

## 조작

| 키 | 동작 |
| --- | --- |
| ↑ | 한 칸 전진 (점수 +1) |
| ↓ | 한 칸 후진 (출발선 뒤로는 못 감) |
| ← / → | 좌우 이동 (레인 폭 -5 ~ 5 안에서) |

막혀서 못 움직이는 방향이라도 캐릭터가 바라보는 방향은 바뀐다.

> 모바일 터치/스와이프 조작은 아직 없다. 지금은 키보드 전용.

---

## 실행 방법

```bash
pnpm install
pnpm dev        # → http://localhost:5173
```

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 (저장하면 자동 새로고침) |
| `pnpm build` | 배포용 빌드 → `dist/` |
| `pnpm preview` | 빌드 결과 미리보기 |
| `pnpm lint` | 코드 검사 (oxlint) |
| `pnpm typecheck` | 타입 검사 (`tsc --noEmit`) |

---

## 기술 스택

- **three.js** + **@react-three/fiber** / **drei** — 3D 렌더링
- **React 19** (React Compiler) + **TypeScript**
- **TanStack Router** — 파일 기반 라우팅 (`src/routes`)
- **Tailwind CSS v4** + **shadcn/ui**
- **Vite** — 번들러 / 개발 서버
- **leva** — 개발용 파라미터 조절 패널

---

## 폴더 구조

```
src/
├─ routes/
│  ├─ __root.tsx        레이아웃 + 404
│  ├─ index.tsx         타이틀 화면 (레트로 스캔라인)
│  └─ play-game.tsx     게임 본체 — 입력·점수·게임오버
├─ components/
│  ├─ game/
│  │  ├─ player.tsx             캐릭터 이동/점프/사망 연출
│  │  ├─ car.tsx                차 주행 + 충돌 판정
│  │  ├─ lane.tsx               한 줄(잔디/도로/횡단보도) 그리기
│  │  └─ camera-controller.tsx  카메라 추적
│  ├─ scenes/                   게임오버 씬
│  └─ ui/                       shadcn 컴포넌트
└─ utils/
   ├─ constants.ts     타일·레인·카메라·충돌 치수
   ├─ lanes.ts         무한 맵 생성기 + 난이도 곡선
   └─ cars.ts          Kenney 차량 모델 목록 (속도/길이)

public/models/         .glb 모델 (캐릭터, 차량 12종)
```

---

## 게임이 굴러가는 방식

**무한 맵** — `createLaneStream()`이 20줄씩 잘라서 만들어 붙인다. 플레이어가
앞쪽 여유(`LANE.ahead`)를 다 쓰기 전에 다음 덩어리를 이어 붙이고, 화면 밖
(`behind` ~ `ahead` 범위 밖) 레인과 차는 아예 만들지 않는다.

**난이도** — 진행도 `t`를 60줄에 걸쳐 0 → 1로 올리고, 속도·차 간격·차종
가중치를 그 사이에서 보간한다. 빨라지는 만큼 지나갈 틈도 같이 넓어져서
어려워지되 깰 수는 있게 맞춰 놨다. 도로가 3줄 이상 연달아 붙지 않고,
안전지대는 최소 2줄씩 깔리고, 출발 2줄은 무조건 안전지대다.

**충돌** — 판정은 보이는 것보다 조금 작게 잡는다(`PLAYER.hitWidth`). 스치듯
지나갈 때 억울하게 죽지 않게 하려는 것. 플레이어 위치는 매 프레임 바뀌므로
state가 아니라 ref로 차 쪽에 넘긴다.

**점수** — 지금까지 도달한 가장 먼 칸. 뒤로 물러났다 와도 깎이지 않는다.

---

## 에셋

캐릭터·차량 모델은 [Kenney](https://kenney.nl) (CC0).
라이선스 원문은 `public/models/KENNEY-LICENSE.txt`.
