/**
 * A simple seeded random number generator (LCG).
 * Useful for deterministic point placement.
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  // Returns a float between 0 and 1
  public next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Returns float between min and max
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  // Returns random point on a unit sphere (for direction)
  public onSphere(out: { x: number, y: number, z: number }): void {
    const u = this.next();
    const v = this.next();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(this.next());
    const sinPhi = Math.sin(phi);

    out.x = r * sinPhi * Math.cos(theta);
    out.y = r * sinPhi * Math.sin(theta);
    out.z = r * Math.cos(phi);
  }
}
