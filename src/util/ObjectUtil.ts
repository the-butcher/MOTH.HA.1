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
}
