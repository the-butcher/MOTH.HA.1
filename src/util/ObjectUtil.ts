export class ObjectUtil {
  /**
   * create a unique 6-digit id
   * @returns
   */
  static createId(): string {
    return Math.round(Math.random() * 100000000)
      .toString(16)
      .substring(0, 5);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static arrayEquals(a: any, b: any): boolean {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }

}
