export class Score {
  constructor(private score: number = 0) {}

  get value(): number {
    return this.score;
  }

  add(point: number): void {
    this.score += point;
  }

  reset(): void {
    this.score = 0;
  }
}
