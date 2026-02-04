// Converts English digits in a string or number to Persian digits
export function toPersianDigits(input: string | number): string {
  const enToFa: Record<string, string> = {
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
    '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
  };
  return String(input).replace(/[0-9]/g, d => enToFa[d] ?? d);
}
