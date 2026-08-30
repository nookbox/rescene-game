// UI 게임 상태
export interface GameState {
  score: number;
  life: number;
}

export interface GameOptions {
  onChange?: (state: GameState) => void;
  onGameOver?: (payload: { score: number }) => void;
  key?: number;
}
