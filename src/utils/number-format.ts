interface Props {
  isRTL: boolean;
}

export function numberFormat(value: number, options: Props) {
  return Intl.NumberFormat(options.isRTL ? "fa-IR" : "en-GB", {
    minimumFractionDigits: options.isRTL ? 0 : 2,
    maximumFractionDigits: options.isRTL ? 0 : 2,
  }).format(value);
}

export function convertEnglishNumberToPersian(input: string) {
  return input.replace(/\d/g, (digit) => {
    return new Intl.NumberFormat("fa-IR").format(Number(digit));
  });
}

const ONES = [
  "",
  "یک",
  "دو",
  "سه",
  "چهار",
  "پنج",
  "شش",
  "هفت",
  "هشت",
  "نه",
] as const;

const TEENS = [
  "ده",
  "یازده",
  "دوازده",
  "سیزده",
  "چهارده",
  "پانزده",
  "شانزده",
  "هفده",
  "هجده",
  "نوزده",
] as const;

const TENS = [
  "",
  "",
  "بیست",
  "سی",
  "چهل",
  "پنجاه",
  "شصت",
  "هفتاد",
  "هشتاد",
  "نود",
] as const;

const HUNDREDS = [
  "",
  "یکصد",
  "دویست",
  "سیصد",
  "چهارصد",
  "پانصد",
  "ششصد",
  "هفتصد",
  "هشتصد",
  "نهصد",
] as const;

const UNITS = [
  "",
  "هزار",
  "میلیون",
  "میلیارد",
  "تریلیون",
  "کوادریلیون",
] as const;

function convertThreeDigits(value: number): string {
  const words: string[] = [];

  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;

  if (hundreds > 0) {
    words.push(HUNDREDS[hundreds]);
  }

  if (remainder >= 10 && remainder < 20) {
    words.push(TEENS[remainder - 10]);
  } else {
    const tens = Math.floor(remainder / 10);
    const ones = remainder % 10;

    if (tens > 0) {
      words.push(TENS[tens]);
    }

    if (ones > 0) {
      words.push(ONES[ones]);
    }
  }

  return words.join(" و ");
}

export function numberToPersianWord(value: number): string {
  if (!Number.isFinite(value)) {
    return "";
  }

  if (!Number.isInteger(value)) {
    return "";
  }

  if (value === 0) {
    return "صفر";
  }

  const negative = value < 0;
  let remaining = Math.abs(value);

  if (remaining >= 1e18) {
    return "مبلغ بیش از اندازه بزرگ است!";
  }

  const parts: string[] = [];
  let unitIndex = 0;

  while (remaining > 0) {
    const chunk = remaining % 1000;

    if (chunk > 0) {
      const word = convertThreeDigits(chunk);
      const unit = UNITS[unitIndex];

      parts.unshift(unit ? `${word} ${unit}` : word);
    }

    remaining = Math.floor(remaining / 1000);
    unitIndex++;
  }

  return (negative ? "منفی " : "") + parts.join(" و ");
}
