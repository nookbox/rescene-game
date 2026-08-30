export class Life {
  private life: number;
  private readonly initial: number;

  constructor(life: number) {
    this.life = life;
    this.initial = life;
  }

  get value(): number {
    return this.life;
  }

  get isDead(): boolean {
    return this.life <= 0;
  }

  decrease(): void {
    if (this.isDead) return;
    this.life--;
  }

  reset(): void {
    this.life = this.initial;
  }
}
