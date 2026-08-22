# RESCENE Game

three.js를 기초부터 직접 배우면서 만드는 리센느 팬 게임.

## 실행

```bash
npm run dev
```

## 구조

```
src/
  game/        ← 순수 three.js. React를 몰라야 한다.
    Game.js    ← 게임 본체. constructor / start / dispose 만 밖으로 노출
  components/  ← React
    GameCanvas.jsx  ← Game을 붙였다 떼는 다리. 게임 로직 금지.
  storage.js   ← 기록 저장 (localStorage)
  App.jsx      ← 캔버스 + HUD 오버레이
```

## AI와 함께 공부하기

`AI-TEACHER.md` — VSCode AI에게 주는 지침. 코드를 대신 짜주지 않고 가르치게 만드는 프롬프트.
`PROGRESS.md` — 어디까지 배웠는지 기록. 새 대화를 시작하면 AI가 먼저 이걸 읽는다.
