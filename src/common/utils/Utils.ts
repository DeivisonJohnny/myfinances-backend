export default class Utils {
  static generateIdCategoryExpenses(text: string) {
    if (!text) return null;

    return text.replace(/\s/g, '').toLowerCase();
  }
}
