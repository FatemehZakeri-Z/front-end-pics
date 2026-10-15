const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Converts Persian/Arabic digits to ASCII digits so validation works on either keyboard. */
export function normalizeDigits(value = '') {
  return String(value)
    .split('')
    .map((char) => {
      const fa = PERSIAN_DIGITS.indexOf(char);
      if (fa > -1) return String(fa);
      const ar = ARABIC_DIGITS.indexOf(char);
      if (ar > -1) return String(ar);
      return char;
    })
    .join('');
}

export function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(normalizeDigits(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const DELIVERY_FEE = 35000;
export const FREE_DELIVERY_OVER = 500000;

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'delivering',
  'delivered',
  'cancelled',
];

export const ORDER_STATUS_LABELS = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأیید شده',
  preparing: 'در حال آماده‌سازی',
  delivering: 'در حال ارسال',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده',
};

export const PAYMENT_METHODS = ['cash', 'online'];
